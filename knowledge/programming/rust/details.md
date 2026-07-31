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

fn main() {
    say_hello!();
    let v = vec_of![1, 2, 3];
    println!("{:?}", v);      // [1, 2, 3]
    let m = min_of![5, 3, 9, 1];
    println!("{m}");          // 1
}
```

Шаблоны: `$x:expr` — выражение, `$($y),*` — повторение (ноль и более), `$($y),+` — одно и более, `$(,)?` — необязательная запятая.

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

    // 4. Реализация unsafe-трейта (Send, Sync, ...)
    unsafe impl Send for MyType {}

    // 5. Доступ к union-полям
}

struct MyType;
```

### 4.2 Когда unsafe оправдан

- FFI (вызов C): `extern "C" { fn printf(...); }`;
- Реализация безопасных абстракций поверх сырых указателей (Vec, String, HashMap внутри используют unsafe);
- Крайняя оптимизация.

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

---

## 5. std::mem

Управление памятью на низком уровне.

```rust
use std::mem;

let x = 42u64;

mem::size_of_val(&x);      // 8
mem::size_of::<f64>();     // 8
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
// let mut_ref = pinned.get_mut();             // ❌ i32: Unpin? на самом деле i32 — Unpin
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

Runtime (`tokio`) вызывает `poll` на futures; когда `Pending` — поток освобождается для других задач.

### 7.3 Executor и планирование

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

### 7.4 select! — гонка между futures

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

### 7.5 Send/Sync и потоки

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

### 7.6 Заключение

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

---
*Детали Rust. Продолжение конспекта — `index.md`.*
