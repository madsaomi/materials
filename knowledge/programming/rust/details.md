# Rust — Детали

Продвинутые темы: времена жизни, trait objects, макросы, unsafe, std::mem, Pin и async/await в глубину.

---

## 1. Времена жизни (Lifetimes) подробнее

### 1.1 Зачем они нужны

Каждая ссылка `&T` имеет время жизни — период, в течение которого ссылка гарантированно указывает на живые данные. Компилятор обычно выводит его автоматически (lifetime elision). Аннотации нужны, когда связь между входными и выходными ссылками неочевидна.

```rust
// 'a связывает оба параметра и результат
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let string1 = String::from("abcd");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(&string1, &string2);  // ✅ string2 живёт достаточно
    }
    // println!("{result}");  // ❌ string2 уничтожен, result ссылается на него
}
```

### 1.2 Элизия (elision) — неявные времена жизни

Правила вывода, применяемые автоматически:

```rust
// 1. Каждый параметр-ссылка получает своё время жизни: 'a, 'b, ...
fn first<'a>(x: &'a str) -> &'a str { x }    // вход → выход

// 2. Если есть ровно один входной параметр-ссылка, его 'a — время жизни результата
fn len<'a>(s: &'a str) -> usize { s.len() }   // usize не содержит ссылок — не важно

// 3. Для &self: результат получает время жизни self
struct Foo;
impl Foo {
    fn get(&self) -> &str { "data" }    // элизировано
}
```

Поэтому большинство функций пишутся без аннотаций.

### 1.3 В структурах

Структура, хранящая ссылки, обязана объявить время жизни:

```rust
struct Book<'a> {
    title: &'a str,        // ссылка должна жить, пока жив Book
    pages: usize,
}

fn make<'a>(t: &'a str) -> Book<'a> {
    Book { title: t, pages: 100 }
}

fn main() {
    let title = String::from("Rust Programming");
    let book = make(&title);
    println!("{} — {} страниц", book.title, book.pages);
    // title живёт до конца main, book тоже — всё корректно
}
```

### 1.4 Статическое время жизни `'static`

`'static` — ссылка, живущая всю программу.

```rust
let s: &'static str = "строковый литерал";   // литералы — 'static

// Ошибка: нельзя вернуть ссылку на локальные данные
// fn bad<'a>() -> &'a str {
//     let s = String::from("temp");
//     &s        // ❌ временная строка уничтожится при выходе
// }
```

`'static` в bounds (например, `T: 'static`) означает: `T` не содержит не-'static ссылок. Это требование потоков: `thread::spawn` требует `'static`, поэтому замыкания должны владеть данными (или использовать `Arc`).

```rust
use std::thread;

let v = vec![1, 2, 3];
thread::spawn(move || {        // move — перенос владения в поток
    println!("{v:?}");
});
```

### 1.5 Вложенные и связанные lifetimes

Когда структура содержит несколько ссылок с разными временами жизни:

```rust
struct Parser<'a, 'b> {
    input: &'a str,
    output: &'b str,
}

// Ограничение: 'b не может жить дольше 'a
struct Parser2<'a, 'b: 'a> {
    input: &'a str,
    output: &'b str,    // 'b: 'a означает, что &'b str живёт не меньше, чем &'a str
}
```

### 1.6 Lifetime elision в методах impl

```rust
struct Container<'a> {
    items: &'a [i32],
}

impl<'a> Container<'a> {
    // Элизия: &self → &'a self, т.к. Container<'a> содержит &'a
    fn len(&self) -> usize {
        self.items.len()
    }

    // Явная аннотация: результат живёт не дольше self
    fn first(&self) -> Option<&'a i32> {
        self.items.first()
    }
}
```

### 1.7 Практический пример: парсер с lifetime

```rust
struct Token<'a> {
    kind: &'a str,
    value: &'a str,
}

struct Lexer<'a> {
    input: &'a str,
    pos: usize,
}

impl<'a> Lexer<'a> {
    fn new(input: &'a str) -> Lexer<'a> {
        Lexer { input, pos: 0 }
    }

    fn next_token(&mut self) -> Option<Token<'a>> {
        if self.pos >= self.input.len() {
            return None;
        }
        let start = self.pos;
        while self.pos < self.input.len() && !self.input.as_bytes()[self.pos].is_ascii_whitespace() {
            self.pos += 1;
        }
        let value = &self.input[start..self.pos];
        Some(Token { kind: "word", value })
    }
}

fn main() {
    let input = "let x = 42";
    let mut lexer = Lexer::new(input);
    while let Some(token) = lexer.next_token() {
        println!("{}: {}", token.kind, token.value);
    }
}
```

---

## 2. Trait objects и dyn

### 2.1 Статическая vs динамическая диспетчеризация

```rust
trait Draw {
    fn draw(&self);
}

struct Circle { radius: f64 }
struct Square { side: f64 }

impl Draw for Circle {
    fn draw(&self) { println!("круг r={}", self.radius); }
}
impl Draw for Square {
    fn draw(&self) { println!("квадрат s={}", self.side); }
}

// Статическая диспетчеризация — мономорфизация, отдельный код для каждого T
fn draw_static<T: Draw>(item: &T) {
    item.draw();
}

// Динамическая диспетчеризация — через таблицу виртуальных методов (vtable)
fn draw_dynamic(item: &dyn Draw) {
    item.draw();
}

fn main() {
    let c = Circle { radius: 2.0 };
    let s = Square { side: 3.0 };
    draw_static(&c);
    draw_dynamic(&s);

    // Коллекция разнородных типов — только через dyn (Box<dyn>)
    let shapes: Vec<Box<dyn Draw>> = vec![
        Box::new(Circle { radius: 1.0 }),
        Box::new(Square { side: 2.0 }),
    ];
    for s in &shapes {
        s.draw();
    }
}
```

### 2.2 dyn + Sized

`dyn Trait` — это unsized (нет известного размера на этапе компиляции), поэтому хранится за указателем: `&dyn Trait`, `Box<dyn Trait>`, `Arc<dyn Trait>`.

`Trait + Send + Sync` — объединённые bound'ы:

```rust
use std::sync::Arc;
use std::thread;

trait Draw {
    fn draw(&self);
}

fn spawn_with_object(t: Arc<dyn Draw + Send + Sync>) {
    thread::spawn(move || t.draw());
}
```

### 2.3 Когда что выбирать

- `impl Trait` / generics — статическая диспетчеризация: быстрее, но больше кода (копируется на каждый тип);
- `dyn Trait` — один код, медленнее на один косвенный вызов; нужен для гетерогенных коллекций и трейт-объектов как публичного API.

Трейт-объект-совместимы только трейты без обобщённых методов и без `Sized`-супертрейтов.

### 2.4 Trait object и trait bounds — подробнее

```rust
// Трейт-объект — динамическая диспетчеризация через vtable
trait Animal {
    fn name(&self) -> String;
    fn speak(&self) -> String;
}

struct Dog { name: String }
struct Cat { name: String }

impl Animal for Dog {
    fn name(&self) -> String { format!("Собака {}", self.name) }
    fn speak(&self) -> String { "Гав!".to_string() }
}

impl Animal for Cat {
    fn name(&self) -> String { format!("Кот {}", self.name) }
    fn speak(&self) -> String { "Мяу!".to_string() }
}

// Вектор разных типов, реализующих Animal
fn animal_sounds(animals: &[Box<dyn Animal>]) {
    for animal in animals {
        println!("{} говорит: {}", animal.name(), animal.speak());
    }
}

// Функция, принимающая любой тип, реализующий Animal (статическая диспетчеризация)
fn make_sound<T: Animal>(animal: &T) {
    println!("{}", animal.speak());
}
```

### 2.5 Object Safety

Трейт не является object-safe, если содержит:
- Методы, возвращающие `Self` (разный размер для разных типов)
- Методы с обобщёнными типовыми параметрами
- Методы, требующие `Self: Sized`

```rust
// ❌ Не object-safe: возвращает Self
trait Factory {
    fn create(&self) -> Self;
}

// ✅ Object-safe: возвращает Box<dyn Trait>
trait FactorySafe {
    fn create(&self) -> Box<dyn FactorySafe>;
}

// ❌ Не object-safe: обобщённый метод
trait Processor {
    fn process<T>(&self, item: T) -> T;
}

// ✅ Object-safe: конкретный тип
trait ProcessorSafe {
    fn process(&self, item: i32) -> i32;
}
```

---

## 3. Макросы

### 3.1 Виды макросов

- **Декларативные** (`macro_rules!`) — сопоставление с образцом по токенам;
- **Процедурные** (`#[derive]`, атрибутные, функциональные) — работают с AST через `proc-macro` крейты.

### 3.2 macro_rules!

```rust
macro_rules! say_hello {
    () => {
        println!("Привет!")
    };
}

macro_rules! vec_of {
    ($($x:expr),*) => {
        {
            let mut tmp = Vec::new();
            $(tmp.push($x);)*
            tmp
        }
    };
}

macro_rules! min_of {
    ($x:expr, $($rest:expr),+ $(,)?) => {
        {
            let mut m = $x;
            $(if $rest < m { m = $rest; })*
            m
        }
    };
}

// Макрос с повторением через разделитель
macro_rules! create_functions {
    ($($name:ident) *) => {
        $(
            fn $name() {
                println!("Функция {}", stringify!($name));
            }
        )*
    };
}

fn main() {
    say_hello!();
    let v = vec_of![1, 2, 3];
    println!("{:?}", v);      // [1, 2, 3]
    let m = min_of![5, 3, 9, 1];
    println!("{m}");          // 1

    create_functions!(foo bar baz);
    foo();   // Функция foo
    bar();   // Функция bar
    baz();   // Функция baz
}
```

Шаблоны: `$x:expr` — выражение, `$($y),*` — повторение (ноль и более), `$($y),+` — одно и более, `$(,)?` — необязательная запятая. `stringify!($name)` — превращает идентификатор в строку.

### 3.3 Процедурные макросы — пример derive

```
# Cargo.toml (крейт my-macros)
[lib]
proc-macro = true
```

```rust
// src/lib.rs
use proc_macro::TokenStream;

#[proc_macro_derive(Hello)]
pub fn hello_derive(input: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(input as syn::DeriveInput);
    let name = input.ident;
    let expanded = quote::quote! {
        impl #name {
            fn hello(&self) {
                println!("hello from {}", stringify!(#name));
            }
        }
    };
    expanded.into()
}
```

Использование в другом крейте:

```rust
#[derive(Hello)]
struct Foo;

fn main() {
    Foo.hello();   // hello from Foo
}
```

`syn` — парсинг Rust-кода в AST, `quote` — генерация кода.

### 3.4 Атрибутные макросы

```rust
// Процедурный атрибутный макрос: #[my_attribute]
use proc_macro::TokenStream;

#[proc_macro_attribute]
pub fn my_attribute(attr: TokenStream, item: TokenStream) -> TokenStream {
    // attr — содержимое внутри скобок: #[my_attribute(foo, bar)]
    // item — структуры/функции, к которым применён атрибут
    let input = syn::parse_macro_input!(item as syn::ItemFn);
    let name = &input.sig.ident;
    let expanded = quote::quote! {
        fn #name() {
            println!("до вызова {}", stringify!(#name));
            // оригинальное тело функции
            #input
            println!("после вызова {}", stringify!(#name));
        }
    };
    expanded.into()
}
```

Использование:

```rust
#[my_attribute]
fn my_function() {
    println!("работа");
}
```

### 3.5 Функциональные процедурные макросы

```rust
// #[proc_macro] — макрос, вызываемый как функция: my_macro!(...)
use proc_macro::TokenStream;

#[proc_macro]
pub fn create_struct(input: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(input as syn::Expr);
    // Генерация кода на основе входного выражения
    // ...
    TokenStream::new()
}
```

### 3.6 declarative vs procedural — сравнение

| Аспект | macro_rules! | proc-macro |
|--------|-------------|------------|
| Сложность | Простая | Средняя/высокая |
| Доступ к AST | Только токены | Полный AST через syn |
| Типы | Нет | Да (через syn) |
| Скорость компиляции | Быстрее | Медленнее |
| Использование | Внутри одного крейта | В отдельном proc-macro крейте |
| Ошибки | Ограниченные | Полный контроль |

---

## 4. unsafe

### 4.1 Что можно делать в unsafe

```rust
unsafe fn dangerous() {}

fn main() {
    // 5 суперсил unsafe:
    unsafe {
        // 1. Разыменование сырого указателя
        let mut num = 5;
        let r1 = &num as *const i32;
        let r2 = &mut num as *mut i32;
        println!("{}", *r1);
        *r2 = 10;
        println!("{num}");          // 10

        // 2. Вызов unsafe-функций
        dangerous();
    }

    // 3. Доступ к static mut (вне unsafe — нельзя)
    static mut COUNTER: u32 = 0;
    unsafe {
        COUNTER += 1;
        println!("{}", COUNTER);
    }

    // 4. Реализация unsafe-трейта (Send, Sync, ...)
    unsafe impl Send for MyType {}

    // 5. Доступ к union-полям
    let u = MyUnion { f1: 42 };
    unsafe {
        println!("{}", u.f1);
    }
}

struct MyType;

union MyUnion {
    f1: i32,
    f2: f64,
}
```

### 4.2 Когда unsafe оправдан

- FFI (вызов C): `extern "C" { fn printf(...); }`;
- Реализация безопасных абстракций поверх сырых указателей (Vec, String, HashMap внутри используют unsafe);
- Крайняя оптимизация (SIMD, ручное управление памятью);
- Реализация трейтов `Send`/`Sync` для типов, которые гарантированно безопасны для передачи между потоками.

**Правило:** инкапсулируйте unsafe в безопасный API и документируйте инварианты с `# Safety`-комментарием. unsafe не отключает проверки владения — это обещание программиста.

### 4.3 FFI-пример

```rust
extern "C" {
    fn abs(x: i32) -> i32;
}

fn main() {
    unsafe {
        println!("{}", abs(-42));   // 42
    }
}
```

### 4.4 Unsafe и указатели — подробнее

```rust
fn main() {
    let mut x = 42;

    // Создание сырых указателей (безопасно)
    let raw_ptr: *mut i32 = &mut x;
    let const_ptr: *const i32 = &x;

    // Разыменование сырых указателей (небезопасно)
    unsafe {
        println!("{}", *raw_ptr);   // 42
        println!("{}", *const_ptr); // 42
    }

    // Сырые указатели можно преобразовывать между типами
    let float_ptr = raw_ptr as *mut f64;

    // Сырые указатели можно сравнивать
    let another_ptr: *const i32 = &x;
    let equal = raw_ptr == another_ptr as *mut i32;
    println!("{}", equal);  // true
}
```

### 4.5 Unsafe и Send/Sync

```rust
// Send — тип можно безопасно передать в другой поток
// Sync — тип можно безопасно разделить между потоками (&T: Send)

// По умолчанию:
// - Типы, содержащие *mut, не являются Send и Sync
// - Типы, содержащие &mut, не являются Send
// - Типы, содержащие &T, Send если T: Sync

// Пример: Rc не Send/Sync (не атомарный счётчик ссылок)
use std::rc::Rc;
// let rc = Rc::new(42);
// thread::spawn(move || { println!("{}", rc); }); // ❌ Rc не Send

// Arc — Send + Sync (атомарный счётчик)
use std::sync::Arc;
let arc = Arc::new(42);
// thread::spawn(move || { println!("{}", arc); }); // ✅ Arc: Send + Sync
```

### 4.6 Опасные паттерны и как их избежать

```rust
// ❌ Паттерн 1: Use-after-free через raw pointer
// let s = String::from("hello");
// let ptr = s.as_ptr();
// drop(s);
// unsafe { println!("{}", *ptr); }  // ❌ use-after-free

// ✅ Паттерн 2: Безопасная абстракция поверх unsafe
struct SafeBuffer {
    data: Vec<u8>,
}

impl SafeBuffer {
    fn new(size: usize) -> Self {
        SafeBuffer { data: vec![0; size] }
    }

    fn as_ptr(&self) -> *const u8 {
        self.data.as_ptr()
    }

    fn as_mut_ptr(&mut self) -> *mut u8 {
        self.data.as_mut_ptr()
    }

    fn len(&self) -> usize {
        self.data.len()
    }
}
// Внешний код не может создать use-after-free — Vec управляет памятью
```

---

## 5. std::mem

Управление памятью на низком уровне.

```rust
use std::mem;

let x = 42u64;

mem::size_of_val(&x);      // 8
mem::size_of::<f64>();       // 8
mem::align_of::<u32>();    // 4

// swap — обменять значения двух мутабельных переменных
let mut a = 1;
let mut b = 2;
mem::swap(&mut a, &mut b);   // a=2, b=1

// take — заменить значение на Default, вернуть старое
let mut s = String::from("hello");
let old = mem::take(&mut s);   // old="hello", s=""
assert_eq!(s, String::new());

// replace — заменить и вернуть старое
let mut s = String::from("a");
let old = mem::replace(&mut s, String::from("b"));
assert_eq!(old, "a");
assert_eq!(s, "b");

// drop — явное освобождение до конца области видимости
let s = String::from("temp");
mem::drop(s);
// println!("{s}");   // ❌ s уже удалена

// transmute — произвольное преобразование типов (ОПАСНО!)
let bytes: [u8; 4] = unsafe { mem::transmute(1u32) };   // [1, 0, 0, 0] на LE

// forget — предотвратить вызов Drop (нужно осторожно!)
let boxed = Box::new(42);
let leaked: &mut i32 = Box::leak(boxed);  // 'static ссылка, память не освобождена
```

`mem::discriminant` — идентификатор варианта enum без данных:

```rust
use std::mem::discriminant;

#[derive(Debug)]
enum Foo { A, B(u32) }

let a = Foo::A;
let b = Foo::B(10);
assert_eq!(discriminant(&a), discriminant(&Foo::A));
assert_ne!(discriminant(&a), discriminant(&b));
```

### 5.1 size_of и align_of — детально

```rust
// Размер типов
assert_eq!(mem::size_of::<u8>(), 1);
assert_eq!(mem::size_of::<u32>(), 4);
assert_eq!(mem::size_of::<u64>(), 8);
assert_eq!(mem::size_of::<bool>(), 1);
assert_eq!(mem::size_of::<char>(), 4);

// Выравнивание
assert_eq!(mem::align_of::<u8>(), 1);
assert_eq!(mem::align_of::<u32>(), 4);
assert_eq!(mem::align_of::<u64>(), 8);

// Enum с данными — размер = max(размер вариантов) + тег
enum Small { A, B(u32) }
assert_eq!(mem::size_of::<Small>(), 8);  // max(1, 4+tag)

// Zero-sized типы (ZST)
struct ZST;
assert_eq!(mem::size_of::<ZST>(), 0);
// Vec<ZST> может хранить произвольное количество элементов без расхода памяти
```

---

## 6. Pin — закрепление в памяти

### 6.1 Зачем нужен Pin

Некоторые типы (в первую очередь `Future`) не должны перемещаться в памяти после создания: их внутренние ссылки на себя (self-referential) стали бы висячими. `Pin<Ptr>` гарантирует, что значение не будет перемещено.

```rust
use std::pin::Pin;

// Вы не можете безопасно получить &mut у закреплённого значения
// (если тип не реализует Unpin)
let boxed = Box::new(42);
let pinned: Pin<Box<i32>> = Box::into_pin(boxed);
let value: &i32 = pinned.as_ref().get_ref();   // ✅ чтение можно
// let mut_ref = pinned.get_mut();               // ❌ i32: Unpin? на самом деле i32 — Unpin
```

Большинство типов — `Unpin` (можно перемещать). `Pin` важен для:
- `Future` (в `async` блоков хранятся self-referential структуры);
- самоссылающихся структур;
- гарантий для библиотек (например, `tokio`).

### 6.2 Пример самоссылающейся структуры (безопасная версия через unsafe)

```rust
struct SelfReferential<'a> {
    data: String,
    reference: Option<&'a str>,   // указывает внутрь self.data
}
```

Построить такую структуру в Rust безопасно нельзя, поэтому нужен unsafe. `Pin` + `unsafe` используются в `VecDeque`, `HashMap`, `tokio::Task` и т.д. Обычно вы не пишете `Pin`-код сами — это нужно для реализации собственных async-примитивов.

### 6.3 Pin в практике

```rust
// Объект трейта: async-код возвращает Pin<Box<dyn Future>>
use std::future::Future;
use std::pin::Pin;

fn make_future() -> Pin<Box<dyn Future<Output = i32>>> {
    Box::pin(async { 42 })
}

fn main() {
    let fut = make_future();
    let rt = tokio::runtime::Runtime::new().unwrap();
    println!("{}", rt.block_on(fut));   // 42
}
```

### 6.4 Unpin и Pin<Box<T>>

```rust
// Типы, реализующие Unpin, можно свободно перемещать даже внутри Pin
fn print_unpin<T: Unpin>(mut val: Pin<Box<T>>) {
    let reference = val.as_mut().get_mut();  // ✅ Unpin: можно получить &mut
    println!("{}", reference);
}

// Для не-Unpin типов нужен Pin::new_cyclic или unsafe
struct SelfRef {
    data: String,
    ptr: *const String,
}

impl SelfRef {
    fn new(s: String) -> Pin<Box<SelfRef>> {
        let mut sr = Box::new(SelfRef {
            data: s,
            ptr: std::ptr::null(),
        });
        sr.ptr = &sr.data as *const String;
        sr
    }
}
```

---

## 7. async/await в глубину

### 7.1 Что происходит под капотом

`async fn` компилируется в state machine — структуру, реализующую `Future`. Каждый `.await` — точка, где future приостанавливается и отдаёт управление runtime.

```rust
async fn download(url: &str) -> Result<String, std::io::Error> {
    tokio::time::sleep(std::time::Duration::from_millis(10)).await;
    Ok(format!("данные: {url}"))
}

// Эквивалентный трейт-объект:
// fn download<'a>(url: &'a str) -> Pin<Box<dyn Future<Output=Result<String, io::Error>> + 'a>>
```

Компилятор превращает `async fn` в конечный автомат с состояниями:
- State 0: до первого `.await`
- State 1: после первого `.await`, до возврата
- State 2: завершено

### 7.2 Future трейт

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

struct MyFuture;

impl Future for MyFuture {
    type Output = i32;

    fn poll(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<i32> {
        Poll::Ready(42)     // или Poll::Pending + wake, чтобы переполлить позже
    }
}
```

`Poll<T>` — это `Poll::Ready(T)` (готово) или `Poll::Pending` (нужно ждать, вызвать waker позже).

### 7.3 Внутреннее устройство async/await

```rust
// async fn download(url: &str) -> String {
//     tokio::time::sleep(Duration::from_millis(10)).await;
//     format!("данные: {url}")
// }

// Эквивалентная state machine (упрощённо):
enum DownloadFuture<'a> {
    State0 { url: &'a str },          // начальное состояние
    State1 { url: &'a str, sleep: Pin<Box<SleepFuture>> },  // ждём sleep
    State2 { result: String },        // завершено
}

impl Future for DownloadFuture<'_> {
    type Output = String;

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<String> {
        loop {
            match *self {
                DownloadFuture::State0 { url } => {
                    // Создаём sleep future, переходим в State1
                    let sleep = tokio::time::sleep(Duration::from_millis(10));
                    *self = DownloadFuture::State1 { url, sleep: Box::pin(sleep) };
                }
                DownloadFuture::State1 { url, ref mut sleep } => {
                    // Поллим sleep
                    match sleep.as_mut().poll(cx) {
                        Poll::Pending => return Poll::Pending,
                        Poll::Ready(()) => {
                            *self = DownloadFuture::State2 {
                                result: format!("данные: {url}"),
                            };
                        }
                    }
                }
                DownloadFuture::State2 { ref result } => {
                    return Poll::Ready(result.clone());
                }
            }
        }
    }
}
```

### 7.4 Executor и планирование

```rust
// #[tokio::main] разворачивается примерно в:
// fn main() {
//     tokio::runtime::Runtime::new().unwrap().block_on(async { ... });
// }

use tokio::task;

#[tokio::main]
async fn main() {
    let a = task::spawn(async { 1 + 1 });
    let b = task::spawn(async { 2 + 2 });

    let result = tokio::join!(a, b);     // ждёт обе
    println!("{:?}", result);            // (Ok(2), Ok(4))
}
```

### 7.5 select! — гонка между futures

```rust
use std::time::Duration;

#[tokio::main]
async fn main() {
    tokio::select! {
        v = async { tokio::time::sleep(Duration::from_millis(50)).await; "slow" } => {
            println!("завершилось первым: {v}");
        }
        v = async { "fast" } => {
            println!("завершилось первым: {v}");
        }
    }
}
```

### 7.6 Send/Sync и потоки

- `tokio::spawn` требует `Future: Send + 'static`;
- держите `Mutex` (std) между `.await` только через `tokio::sync::Mutex` или `Arc<tokio::sync::Mutex>` — иначе заблокируется весь поток;
- `std::sync::Mutex` в async-коде — антипаттерн на время ожидания, но допустим для кратких критических секций.

```rust
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let state = Arc::new(tokio::sync::Mutex::new(0u32));
    let mut handles = vec![];

    for _ in 0..10 {
        let state = Arc::clone(&state);
        handles.push(tokio::spawn(async move {
            let mut guard = state.lock().await;
            *guard += 1;
        }));
    }

    for h in handles {
        h.await.unwrap();
    }
    println!("итог: {}", *state.lock().await);   // 10
}
```

### 7.7 Streams

Асинхронные последовательности (аналог Iterator для async):

```rust
use tokio_stream::StreamExt;

#[tokio::main]
async fn main() {
    let stream = tokio_stream::iter(vec![1, 2, 3, 4, 5]);

    // map — преобразование
    let doubled = stream.map(|x| x * 2);

    // filter — фильтрация
    let evens = tokio_stream::iter(vec![1, 2, 3, 4, 5])
        .filter(|x| std::future::ready(x % 2 == 0));

    // for_each — потребление
    tokio_stream::iter(vec![1, 2, 3])
        .for_each(|x| async move {
            println!("{x}");
        })
        .await;

    // collect — сборка в Vec
    let v: Vec<i32> = tokio_stream::iter(vec![1, 2, 3]).collect().await;
    println!("{v:?}");  // [1, 2, 3]
}
```

### 7.8 Channels для async

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel::<String>(32);  // буфер на 32 сообщения

    // Продюсер
    tokio::spawn(async move {
        for i in 0..5 {
            tx.send(format!("сообщение {i}")).await.unwrap();
        }
    });

    // Консьюмер
    while let Some(msg) = rx.recv().await {
        println!("{msg}");
    }
}
```

### 7.9 Заключение

- **Потоки** — для CPU-bound параллелизма (rayon, std::thread);
- **async** — для I/O-bound конкурентности (сети, диски), тысячи подключений на одном потоке;
- Не смешивайте блокирующие вызовы (`std::thread::sleep`, `reqwest::blocking`) внутри async — блокируется весь воркер.

---

## 8. Прочие продвинутые темы

### 8.1 Box, Rc, RefCell — умные указатели

```rust
use std::cell::RefCell;
use std::rc::Rc;

// Box — единственный владелец, данные в куче
let b: Box<i32> = Box::new(42);

// Rc — разделяемое владение (один поток)
let x = Rc::new(5);
let y = Rc::clone(&x);
println!("{}", Rc::strong_count(&x));   // 2

// RefCell — внутренняя изменяемость с проверкой в рантайме
let c = RefCell::new(5);
*c.borrow_mut() += 1;                   // паникует, если уже borrow_mut
println!("{}", c.borrow());             // 6

// Комбинация: Rc<RefCell<T>> — разделяемая изменяемая структура
struct Node {
    value: i32,
    next: Option<Rc<RefCell<Node>>>,
}
```

### 8.1.1 Arc vs Rc — когда что использовать

```rust
use std::rc::Rc;
use std::sync::Arc;

// Rc — только для одного потока, легче (нет атомарных операций)
let rc = Rc::new(vec![1, 2, 3]);
// thread::spawn(move || { println!("{:?}", rc); }); // ❌ Rc не Send

// Arc — для многопоточности, чуть тяжелее (атомарный счётчик)
let arc = Arc::new(vec![1, 2, 3]);
// thread::spawn(move || { println!("{:?}", arc); }); // ✅ Arc: Send + Sync
```

### 8.1.2 Cell<T> — внутренняя изменяемость для Copy-типов

```rust
use std::cell::Cell;

let cell = Cell::new(5);
cell.set(10);
let val = cell.get();  // 10

// Cell<T> работает только с Copy-типами
let c = Cell::new(42i32);
c.set(c.get() + 1);

// Для не-Copy типов — RefCell
```

### 8.1.3 OnceCell и LazyCell — ленивая инициализация

```rust
use std::sync::OnceLock;

static CONFIG: OnceLock<String> = OnceLock::new();

fn get_config() -> &String {
    CONFIG.get_or_init(|| {
        // Вычисляется один раз, при первом обращении
        "default_config".to_string()
    })
}

// LazyCell (стабиль с Rust 1.80)
use std::cell::LazyCell;

static LAZY: LazyCell<Vec<i32>> = LazyCell::new(|| {
    (1..=100).collect()
});
```

### 8.2 Идиомы

```rust
// Builder
struct Config { threads: usize }
impl Config {
    fn new() -> Self { Config { threads: 1 } }
    fn threads(mut self, n: usize) -> Self { self.threads = n; self }
}
let c = Config::new().threads(4);

// From/Into — конверсии
impl From<&str> for Config {
    fn from(s: &str) -> Self {
        Config { threads: s.len() }
    }
}
let c: Config = "ab".into();   // через From

// Newtype — обёртка для строгой типизации
struct UserId(u64);
struct UserName(String);

// Default
#[derive(Default)]
struct Options { verbose: bool, level: u8 }
let opts = Options::default();
```

### 8.3 Производительность

```rust
// Итераторы — zero-cost
let sum: i32 = (1..=1_000_000).filter(|x| x % 2 == 0).sum();

// String vs &str в сигнатурах: предпочитайте &str (без аллокаций)
fn takes_slice(s: &str) -> usize { s.len() }

// Vec с зарезервированной ёмкостью
let mut v: Vec<i32> = Vec::with_capacity(1000);

// Box<dyn Error> в приложениях, thiserror в библиотеках
```

### 8.4 Ошибки: anyhow vs thiserror

```rust
// anyhow — для приложений и бинарей
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let data = std::fs::read_to_string("config.toml")
        .with_context(|| "не удалось прочитать конфиг")?;
    println!("{data}");
    Ok(())
}
```

```rust
// thiserror — для библиотек: описываем типы ошибок через derive
use thiserror::Error;

#[derive(Error, Debug)]
enum AppError {
    #[error("не найдено: {0}")]
    NotFound(String),
    #[error("сетевой сбой")]
    Network,
    #[error("ошибка ввода-вывода")]
    Io(#[from] std::io::Error),   // автоматический From<io::Error>
}
```

### 8.5 Процедурные макросы для валидации

```rust
// Крейт validator — валидация структур через derive
use validator::Validate;

#[derive(Debug, Validate)]
struct SignUpRequest {
    #[validate(email)]
    email: String,

    #[validate(length(min = 8, message = "пароль слишком короткий"))]
    password: String,

    #[validate(range(min = 18, max = 120))]
    age: u8,
}

fn main() {
    let req = SignUpRequest {
        email: "not-an-email".to_string(),
        password: "short".to_string(),
        age: 15,
    };
    let result = req.validate();
    // result содержит ошибки валидации
}
```

### 8.6 Строчные типы: String vs &str vs Cow

```rust
use std::borrow::Cow;

// &str — заимствованная ссылка на строку
// String — владеющая, изменяемая строка в куче
// Cow — Copy-on-Write: &str если возможно, String если нужно изменить

fn process(input: &str) -> Cow<str> {
    if input.contains(' ') {
        Cow::Owned(input.replace(' ', "_"))  // аллокация, т.к. нужно изменить
    } else {
        Cow::Borrowed(input)                  // без аллокации
    }
}
```

---

## 9. Продвинутые паттерны

### 9.1 Мемоизация с lazy_static / OnceLock

```rust
use std::collections::HashMap;
use std::sync::OnceLock;

fn expensive_computation() -> HashMap<String, i32> {
    // Симуляция дорогого вычисления
    let mut map = HashMap::new();
    map.insert("key1".to_string(), 42);
    map.insert("key2".to_string(), 100);
    map
}

static CACHE: OnceLock<HashMap<String, i32>> = OnceLock::new();

fn get_cached(key: &str) -> Option<&i32> {
    let cache = CACHE.get_or_init(expensive_computation);
    cache.get(key)
}
```

### 9.2 Типажный паттерн (Type State Pattern)

```rust
// Позволяет перемещать состояние через типы на уровне компиляции
struct Connection<State> {
    data: String,
    _state: std::marker::PhantomData<State>,
}

struct Open;
struct Closed;

impl Connection<Closed> {
    fn new() -> Self {
        Connection { data: String::new(), _state: std::marker::PhantomData }
    }

    fn open(self) -> Connection<Open> {
        Connection { data: self.data, _state: std::marker::PhantomData }
    }
}

impl Connection<Open> {
    fn send(&mut self, msg: &str) {
        self.data.push_str(msg);
    }

    fn close(self) -> Connection<Closed> {
        Connection { data: self.data, _state: std::marker::PhantomData }
    }
}

fn main() {
    let conn = Connection::<Closed>::new();
    let mut conn = conn.open();
    conn.send("hello");
    let conn = conn.close();
    // conn.send("world"); // ❌ Connection<Closed> не имеет метода send
}
```

### 9.3 Трейт-объекты и иерархии

```rust
trait Shape {
    fn area(&self) -> f64;
    fn describe(&self) -> String;
}

trait Printable {
    fn print(&self);
}

// Два трейта, реализуемых одним типом
struct Circle { radius: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
    fn describe(&self) -> String { format!("Круг с радиусом {}", self.radius) }
}

impl Printable for Circle {
    fn print(&self) {
        println!("{} (площадь: {})", self.describe(), self.area());
    }
}

// Функция, принимающая любой Shape
fn print_area(shape: &dyn Shape) {
    println!("Площадь: {}", shape.area());
}
```

---

*Детали Rust. Продолжение конспекта — `index.md`.*