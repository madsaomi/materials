# Rust — Полный конспект

## Введение

Rust — системный язык программирования, разработанный Mozilla (2015), затем перешедший в независимый проект Rust Foundation. Главные принципы: безопасность памяти без сборщика мусора, производительность уровня C/C++, надёжность на этапе компиляции.

**Ключевые особенности:**
- **Система владения (ownership)** — компилятор проверяет память без GC, ошибки памяти ловятся на этапе компиляции
- Нулевая стоимость абстракций (zero-cost abstractions)
- Статическая типизация с мощным выводом типов
- `enum` с данными (algebraic data types) и сопоставление с образцом (`match`)
- Трейты (traits) — аналог интерфейсов, но с композицией и generics
- Встроенные инструменты: `cargo`, `rustfmt`, `clippy`, `rustdoc`
- Нет наследования, нет исключений, нет сборщика мусора

**Кому нужен:** системное программирование (ОС, драйверы), embedded, высоконагруженный бэкенд, WebAssembly, блокчейн (Solana, Parity/Substrate), инструменты CLI, game engines, ML-инфраструктура.

**Области применения:**
- Системное программирование: curl, ripgrep, fd, bat (многие Unix-утилиты переписаны на Rust)
- Веб: axum, actix-web, Rocket; фронтенд через WASM (Yew, Leptos)
- Блокчейн: Solana, Substrate, Near — ядра на Rust
- Инструменты: cargo, rustup, eslint/deno (Node-альтернатива), uv (Python-пакетный менеджер), Polars
- Embedded: Embassy, RTIC; Raspberry Pi Pico, ESP32

**Уникальность Rust** — система владения: каждое значение имеет ровно одного владельца; при передаче владение перемещается (move); заимствование возможно только по правилам компилятора. Итог: потоки без data races, безопасное освобождение памяти, отсутствие use-after-free и null-pointer — всё проверяется до запуска программы.

---

## 1. Установка

```bash
# Установка через rustup (рекомендуется)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Добавить в PATH (rustup делает это сам, но на всякий случай)
source "$HOME/.cargo/env"

# Проверка версий
rustc --version     # компилятор
cargo --version     # менеджер пакетов и сборка
rustup --version    # менеджер toolchain'ов

# Альтернатива: пакетный менеджер (Ubuntu/Debian)
sudo apt install rustc cargo

# Обновление toolchain
rustup update stable

# Набор компонентов: clippy (линтер), rustfmt (форматтер), rust-docs
rustup component add clippy rustfmt rust-docs
```

### Создание нового проекта

```bash
cargo new hello_world       # бинарный проект (bin)
cd hello_world
cargo build                 # сборка в debug-режиме
cargo run                   # сборка + запуск
cargo run --release         # сборка в release (оптимизации)
```

---

## 2. Основы синтаксиса

### 2.1 Hello World

```rust
fn main() {
    println!("Hello, world!");
}
```

`println!` — макрос (наличие `!`). `main` — точка входа. Каждая инструкция завершается точкой с запятой, но *выражения* её не требуют.

### 2.2 Переменные

```rust
let x = 5;          // неизменяемая переменная (immutable по умолчанию)
let mut y = 10;     // изменяемая
y += 1;

let a = 5;
let a = a + 1;      // shadowing: переопределение переменной
let a = "строка";   // можно даже менять тип

const MAX_SIZE: u32 = 1024;   // константа: тип обязателен, UPPER_CASE
const PI: f64 = 3.14159;
```

Ключевые отличия `let` + shadowing от `mut`:
- `mut` — изменение значения той же переменной;
- shadowing — создание новой переменной с тем же именем (можно менять тип).

### 2.3 Типы данных

**Целые числа:**

| Тип | Разрядность | Диапазон |
|-----|------------|----------|
| `i8`/`u8` | 8 | −128..127 / 0..255 |
| `i16`/`u16` | 16 | ±32 768 / 65 535 |
| `i32`/`u32` | 32 | ±2,1 млрд / 4,3 млрд |
| `i64`/`u64` | 64 | ±9,2×10¹⁸ |
| `i128`/`u128` | 128 | огромные |
| `isize`/`usize` | 32/64 | зависит от платформы |

```rust
let a: i8 = -128;
let b: u128 = 340_282_366_920_938_463_463_374_607_431_768_211_455;
let c: usize = 10;      // размер индекса массива
let hex = 0xFF;         // 255
let bin = 0b1010;       // 10
let oct = 0o17;         // 15
let underscores = 1_000_000;  // читаемость
```

**Другие базовые типы:**

```rust
let x: f64 = 3.14;      // float64 — по умолчанию
let y: f32 = 2.5;       // float32
let is_ok: bool = true;
let ch: char = 'я';     // Unicode-символ, 4 байта
let unit = ();          // пустой кортеж, тип "ничего"
```

**Кортежи (tuple):**

```rust
let point: (i32, f64, bool) = (10, 2.5, true);
let (x, y, z) = point;       // деструктуризация
println!("{x}");             // 10
println!("{}", point.1);     // 2.5 — доступ по индексу через точку
```

**Массивы (array) — фиксированная длина:**

```rust
let arr: [i32; 5] = [1, 2, 3, 4, 5];
let zeros = [0; 100];        // [0, 0, ..., 0] — 100 элементов
println!("{}", arr[0]);      // 1
```

### 2.4 Функции

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b                    // последнее выражение — возвращаемое значение (без ; и return)
}

fn greet(name: &str) -> String {
    format!("Привет, {name}!")
}

fn div(a: f64, b: f64) -> Option<f64> {
    if b == 0.0 {
        None
    } else {
        Some(a / b)
    }
}

fn main() {
    println!("{}", add(3, 5));              // 8
    println!("{}", greet("Мир"));           // Привет, Мир!
    println!("{:?}", div(10.0, 4.0));       // Some(2.5)
}
```

Параметры функции — immutable; чтобы менять, нужно `mut x: i32`. Возвращается только одно значение — для нескольких используйте кортеж.

---

## 3. Владение (Ownership), заимствование, срезы

### 3.1 Правила владения

1. У каждого значения в Rust ровно **один владелец**.
2. Когда владелец выходит из области видимости, значение освобождается (`drop`).
3. Владельца можно **переместить** (move) — тогда старое имя становится недоступным.

```rust
let s1 = String::from("hello");
let s2 = s1;                 // s1 перемещено (moved) в s2
// println!("{s1}");         // ❌ ошибка компиляции: s1 перемещена

let a = 42;
let b = a;                   // i32 реализует Copy — значение скопировано
println!("{a} {b}");         // ✅ ок

let s3 = s2.clone();         // глубокое копирование, обе доступны
println!("{s2} {s3}");       // ✅
```

Типы с `Copy`: все числа, `bool`, `char`, кортежи и массивы из Copy-типов. Типы в куче (`String`, `Vec`, `Box`) — только move.

Перемещение в функцию — передача владения:

```rust
fn take(s: String) -> usize {
    s.len()                  // s уничтожится здесь
}

fn main() {
    let text = String::from("привет");
    let n = take(text);      // владение перешло в take
    // println!("{text}");   // ❌
    println!("{n}");
}
```

### 3.2 Заимствование (Borrowing)

Ссылки (`&`) позволяют использовать значение, не забирая владение.

```rust
fn length(s: &String) -> usize {
    s.len()                  // s — ссылка, читает без перемещения
}

fn add_hello(s: &mut String) {
    s.push_str(", hello!");  // изменяемое заимствование
}

fn main() {
    let mut text = String::from("Rust");
    let len = length(&text);      // & — неизменяемая ссылка
    add_hello(&mut text);         // &mut — изменяемая
    println!("{len} {text}");
}
```

**Правила заимствования (проверяются компилятором):**
- В один момент времени либо **сколько угодно** неизменяемых `&`, либо **одна** изменяемая `&mut`;
- Ссылка всегда действительна — никогда не висит (dangling).

```rust
let mut s = String::from("x");
let r1 = &s;
let r2 = &s;                 // ✅ несколько неизменяемых
// let r3 = &mut s;          // ❌ пока живы r1, r2 — нельзя
println!("{r1} {r2}");
```

### 3.3 Срезы (Slices)

Срез — ссылка на непрерывную часть данных, без владения.

```rust
let s = String::from("hello world");
let hello = &s[0..5];        // "hello" (по байтам!)
let world = &s[6..11];       // "world"
let whole = &s[..];          // вся строка

let arr = [1, 2, 3, 4, 5];
let mid = &arr[1..4];        // [2, 3, 4]
```

Безопасное получение первого слова (пример из The Rust Book):

```rust
fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}
```

### 3.4 Время жизни (Lifetimes) — кратко

Компилятор отслеживает, как долго действительны ссылки. Обычно работает автоматически (elision), но в функциях с несколькими ссылками нужно писать аннотации:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

`'a` означает: результат живёт не дольше, чем короткая из входных ссылок. Подробнее — в `details.md`.

---

## 4. Структуры и перечисления

### 4.1 Структуры (struct)

```rust
struct User {
    name: String,
    age: u8,
    active: bool,
}

fn main() {
    let u1 = User {
        name: String::from("Alice"),
        age: 30,
        active: true,
    };
    let u2 = User {
        name: String::from("Bob"),
        ..u1                       // оставшиеся поля из u1
    };
    println!("{} {} {}", u1.name, u1.age, u1.active);
    println!("{} {}", u2.name, u2.age);
}
```

Tuple-структуры и unit-структуры:

```rust
struct Point(i32, i32);        // поля без имён
struct Color(u8, u8, u8);
struct Unit;                   // структура без полей

let origin = Point(0, 0);
println!("{}", origin.0);
```

### 4.2 Перечисления (enum)

```rust
enum Shape {
    Circle(f64),                     // вариант с данными
    Rectangle { width: f64, height: f64 },   // именованные поля
    Line,                            // без данных
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * *r * *r,
        Shape::Rectangle { width, height } => *width * *height,
        Shape::Line => 0.0,
    }
}
```

**Option\<T>** — замена null из других языков:

```rust
let some: Option<i32> = Some(5);
let none: Option<i32> = None;

fn divide(n: i32, d: i32) -> Option<i32> {
    if d == 0 { None } else { Some(n / d) }
}
```

**Result\<T, E>** — операция, которая может завершиться ошибкой:

```rust
fn parse_int(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse()
}

fn main() {
    let ok: Result<i32, _> = parse_int("42");
    let err: Result<i32, _> = parse_int("abc");
}
```

### 4.3 Методы (impl)

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {          // метод: первый параметр &self
        self.width * self.height
    }

    fn scale(&mut self, k: f64) {
        self.width *= k;
        self.height *= k;
    }

    fn square(side: f64) -> Rectangle {   // ассоциированная функция (без self)
        Rectangle { width: side, height: side }
    }
}

fn main() {
    let mut r = Rectangle { width: 3.0, height: 4.0 };
    println!("{}", r.area());         // 12
    r.scale(2.0);
    println!("{}", r.area());         // 48
    let sq = Rectangle::square(5.0);  // вызов через ::
    println!("{}", sq.area());        // 25
}
```

---

## 5. Управляющие конструкции

```rust
// if / else if / else — выражение
let x = 10;
if x > 0 {
    println!("положительное");
} else if x == 0 {
    println!("ноль");
} else {
    println!("отрицательное");
}

let result = if x % 2 == 0 { "чётное" } else { "нечётное" };

// loop — бесконечный цикл (можно выйти с результатом)
let mut n = 0;
let done = loop {
    n += 1;
    if n == 10 {
        break n * 2;        // loop возвращает значение
    }
};
println!("{done}");          // 20

// while
let mut n = 3;
while n > 0 {
    println!("{n}");
    n -= 1;
}

// for по диапазону и коллекции
for i in 0..5 {              // 0,1,2,3,4 (не включает 5)
    print!("{i}");
}
for i in 0..=5 {             // включает 5
    print!("{i}");
}
for (idx, ch) in "abc".chars().enumerate() {
    println!("{idx}: {ch}");
}

// break / continue
for i in 1..=10 {
    if i % 2 == 0 {
        continue;
    }
    if i > 7 {
        break;
    }
    print!("{i}");           // 1 3 5 7
}
```

### match — сопоставление с образцом

```rust
enum Command {
    Help,
    Version,
    Run(String),
    Exit,
}

fn main() {
    let cmd = Command::Run(String::from("server"));

    match cmd {
        Command::Help => println!("справка"),
        Command::Version => println!("v1.0"),
        Command::Run(name) => println!("запуск: {name}"),
        Command::Exit => println!("выход"),
    }

    // match должен быть исчерпывающим; для чисел — паттерны
    let n = 7;
    let word = match n {
        1 => "один",
        2 | 3 => "два или три",
        4..=10 => "от четырёх до десяти",
        _ => "другое",            // fallback
    };
    println!("{word}");
}
```

---

## 6. Строки

Два основных типа: `String` (владеющая, изменяемая, в куче) и `&str` (срез строки, заимствованная).

```rust
let mut s = String::new();
s.push('a');
s.push_str("bc");                 // "abc"

let from_literal = "hello";       // &'static str
let owned: String = from_literal.to_string();
let owned2 = String::from("world");
let combined = format!("{} {}", from_literal, owned2);  // "hello world"
```

**Методы:**

```rust
let s = String::from("  Hello, Rust!  ");

s.len();                          // длина в БАЙТАХ (16)
s.is_empty();                     // false
s.trim();                         // "Hello, Rust!"
s.to_lowercase();                 // "  hello, rust!  "
s.to_uppercase();
s.contains("Rust");               // true
s.starts_with('H');               // true (после trim)
s.ends_with("!");
s.replace("Rust", "C++");         // "  Hello, C++!  "
s.split(',').collect::<Vec<_>>(); // ["  Hello", " Rust!  "]
s.chars().count();                // число Unicode-символов
s.chars().nth(2);                 // Some('H')

// Итерация по символам
for ch in s.trim().chars() {
    print!("{ch}");
}
```

**Важно:** индексация `s[0]` не работает — строки — это UTF-8 байты, индекс может попасть внутрь символа. Используйте `s.chars()`, срезы `&s[..n]` только по границам символов, или `.bytes()`.

---

## 7. Обработка ошибок

### 7.1 panic — аварийная остановка

```rust
fn main() {
    let v = vec![1, 2, 3];
    // v[10];                    // ❌ panic: index out of bounds
    panic!("всё сломалось");
}
```

`panic!` — для unrecoverable ошибок (неисправимых).

### 7.2 unwrap / expect — быстрый способ для Result/Option

```rust
fn main() {
    let x: i32 = "42".parse().unwrap();       // 42
    // let y: i32 = "abc".parse().unwrap();   // ❌ panic
    let y: i32 = "42".parse().expect("не число");  // с сообщением

    let opt = Some(7);
    let v = opt.unwrap_or(0);      // 7 — безопасная альтернатива
    let n: Option<i32> = None;
    let v = n.unwrap_or(42);       // 42
}
```

### 7.3 Оператор `?`

Пробрасывает ошибку наверх, не разворачивая вручную:

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;        // ? возвращает ошибку из функции
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// Более короткий вариант:
fn read_username2(path: &str) -> Result<String, io::Error> {
    std::fs::read_to_string(path)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let name = read_username("user.txt")?;
    println!("{name}");
    Ok(())
}
```

### 7.4 Собственный тип ошибки

```rust
use std::fmt;

#[derive(Debug)]
enum MyError {
    NotFound(String),
    InvalidNumber(String),
}

impl fmt::Display for MyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MyError::NotFound(name) => write!(f, "не найдено: {name}"),
            MyError::InvalidNumber(s) => write!(f, "не число: {s}"),
        }
    }
}

impl std::error::Error for MyError {}

fn find_user(id: u32) -> Result<String, MyError> {
    if id == 0 {
        Err(MyError::NotFound(format!("id={id}")))
    } else {
        Ok(format!("User-{id}"))
    }
}
```

---

## 8. Обобщения и трейты

### 8.1 Обобщённые функции и структуры

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}

struct Pair<T> {
    first: T,
    second: T,
}

impl<T> Pair<T> {
    fn new(first: T, second: T) -> Pair<T> {
        Pair { first, second }
    }
}

fn main() {
    println!("{}", largest(&[3, 7, 1, 9]));    // 9
    println!("{}", largest(&['a', 'z', 'm'])); // 'z'
    let p = Pair::new(1, 2);
}
```

### 8.2 Трейты (traits)

```rust
trait Summary {
    fn summarize(&self) -> String;
    fn default_summary(&self) -> String {      // реализация по умолчанию
        String::from("(нет описания)")
    }
}

struct Article {
    title: String,
    author: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("«{}» — {}", self.title, self.author)
    }
}

// Трейт как ограничение (bound)
fn notify<T: Summary>(item: &T) {
    println!("{}", item.summarize());
}

// То же через "trait bounds" синтаксис
fn notify2(item: &impl Summary) {
    println!("{}", item.summarize());
}

fn main() {
    let a = Article { title: String::from("Rust"), author: String::from("Alice") };
    notify(&a);           // «Rust» — Alice
    println!("{}", a.default_summary());
}
```

### 8.3 derive — автоматическая реализация трейтов

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 1, y: 2 };
    println!("{p:?}");                // Debug: Point { x: 1, y: 2 }
    let q = p.clone();                // Clone
    assert_eq!(p, q);                 // PartialEq
}
```

**Общие трейты:** `Debug` (вывод `{:?}`), `Clone`/`Copy` (копирование), `PartialEq`/`Eq` (сравнение), `PartialOrd`/`Ord` (сортировка), `Hash` (для HashMap), `Default` (значения по умолчанию), `Serialize`/`Deserialize` (serde).

---

## 9. Модули и пакеты

### 9.1 Модули внутри файла

```rust
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    fn secret() { /* приватная */ }

    pub mod constants {
        pub const PI: f64 = 3.14159;
    }
}

use math::constants::PI;
use math::add;

fn main() {
    println!("{}", add(2, 3));
    println!("{PI}");
}
```

По умолчанию всё приватно; `pub` — публичный. `use` подтягивает в область видимости.

### 9.2 Модули в файлах

```
my_project/
├── src/
│   ├── main.rs
│   ├── lib.rs            # для библиотеки
│   ├── utils.rs
│   └── models/
│       ├── mod.rs
│       └── user.rs
└── Cargo.toml
```

`mod utils;` в `main.rs` подключает `src/utils.rs`, `mod models;` — `src/models/mod.rs`. Вложенные модули — через `models::user::User`.

```rust
mod utils {
    pub fn greet() {
        println!("привет из utils");
    }
}

mod models {
    pub mod user {
        pub struct User {
            pub name: String,
        }

        impl User {
            pub fn new(name: &str) -> User {
                User { name: name.to_string() }
            }
        }
    }
}

fn main() {
    utils::greet();
    let u = models::user::User::new("Alice");
    println!("{}", u.name);
}
```

### 9.3 Cargo.toml — манифест проекта

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]       # только для тестов/примеров
pretty_assertions = "1"

[profile.release]
opt-level = 3
```

```bash
cargo add serde          # добавить зависимость (с 1.62)
cargo build              # собрать
cargo run                # запустить
```

### 9.4 Публикация в crates.io

```bash
cargo publish --dry-run      # проверка
cargo publish                # публикация (нужен токен)
```

`cargo publish` требует: публичный репозиторий с лицензией в `Cargo.toml`, `README.md`, версию, которой нет на crates.io.

---

## 10. Коллекции

### 10.1 Vec\<T> — динамический массив

```rust
let mut v: Vec<i32> = Vec::new();
v.push(1);
v.push(2);
v.push(3);

let v2 = vec![4, 5, 6];          // макрос

println!("{}", v[0]);            // 1 — паникует при выходе за границы
v.get(10);                       // None — безопасный доступ

v.pop();                         // Some(3) — убрать последний
v.len();                         // 2
v.contains(&2);                  // true
v.remove(0);                     // убрать по индексу
v.sort();                        // сортировка на месте

for x in &v {                    // итерация по ссылкам
    println!("{x}");
}

for x in v {                     // итерация с перемещением
    println!("{x}");
}
```

### 10.2 HashMap\<K, V> — словарь

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Alice"), 10);
scores.insert(String::from("Bob"), 25);

scores.get("Alice");                       // Some(&10)
scores.get("Mallory");                     // None
scores.contains_key("Bob");                // true

scores.entry(String::from("Alice")).or_insert(0);   // вставить, если нет

for (name, score) in &scores {
    println!("{name}: {score}");
}

// Подсчёт слов
let text = "a b a c a b";
let mut counts: HashMap<&str, u32> = HashMap::new();
for word in text.split(' ') {
    *counts.entry(word).or_insert(0) += 1;
}
// {"a": 3, "b": 2, "c": 1}
```

### 10.3 HashSet\<T> — множество

```rust
use std::collections::HashSet;

let mut seen = HashSet::new();
seen.insert(1);
seen.insert(2);
seen.insert(1);                 // не добавится (уже есть)

seen.contains(&2);              // true
seen.len();                     // 2

let a: HashSet<_> = [1, 2, 3].into_iter().collect();
let b: HashSet<_> = [3, 4, 5].into_iter().collect();
let union: HashSet<_> = a.union(&b).collect();        // {1,2,3,4,5}
let inter: HashSet<_> = a.intersection(&b).collect(); // {3}
```

---

## 11. Конкурентность

### 11.1 Потоки (threads)

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..=3 {
            println!("поток: {i}");
            thread::sleep(Duration::from_millis(10));
        }
    });

    for i in 1..=3 {
        println!("главный: {i}");
        thread::sleep(Duration::from_millis(10));
    }

    handle.join().unwrap();      // дождаться завершения
}

// move-замыкание захватывает владение
fn main2() {
    let v = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("{:?}", v);     // v перемещён в поток
    });
    handle.join().unwrap();
}
```

### 11.2 Каналы (mpsc — multiple producer, single consumer)

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        tx.send(String::from("hello")).unwrap();
        tx.send(String::from("world")).unwrap();
    });

    for received in rx {         // итерация по сообщениям
        println!("получено: {received}");
    }
}
```

### 11.3 Общее состояние: Arc\<Mutex\<T>>

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    println!("итог: {}", *counter.lock().unwrap());   // 10
}
```

- `Arc` — атомарный подсчёт ссылок (разделяемая собственность между потоками);
- `Mutex` — взаимоисключающий доступ (один поток за раз).

### 11.4 async/await — кратко

Асинхронный код работает на `tokio` (не в std). Подходит для I/O-bound задач (HTTP, БД).

```rust
// Cargo.toml: tokio = { version = "1", features = ["full"] }

use std::time::Duration;

async fn fetch_user(id: u32) -> String {
    tokio::time::sleep(Duration::from_millis(50)).await;
    format!("User-{id}")
}

#[tokio::main]
async fn main() {
    let (a, b) = tokio::join!(
        fetch_user(1),
        fetch_user(2)
    );
    println!("{a} {b}");
}
```

`async fn` возвращает `Future`; выполняется в runtime (`#[tokio::main]`). `await` — точка ожидания, не блокирует поток.

---

## 12. Тестирование

Тесты пишутся в `#[cfg(test)]`-модуле или в отдельной папке `tests/`.

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 2), 4);
        assert_ne!(add(2, 2), 5);
    }

    #[test]
    fn test_failing() {
        assert!(false, "этот тест упадёт");
    }

    #[test]
    #[should_panic(expected = "boom")]
    fn test_panics() {
        panic!("boom");
    }

    #[test]
    fn test_result_type() -> Result<(), String> {
        if add(1, 1) == 2 {
            Ok(())
        } else {
            Err(String::from("неверная сумма"))
        }
    }

    #[test]
    #[ignore]                     // пропуск по умолчанию
    fn slow_test() {}
}
```

```bash
cargo test                    # все тесты
cargo test test_add           # фильтр по имени
cargo test -- --nocapture     # показать println!
cargo test -- --ignored       # только ignored
cargo test --release          # тесты в release
```

Интеграционные тесты — в `tests/`, могут использовать библиотечный крейт через `use my_lib::...`.

---

## 13. Популярные крейты

| Крейт | Назначение |
|-------|-----------|
| [serde](https://docs.rs/serde) | Сериализация/десериализация (JSON, YAML, BSON, ...) |
| [tokio](https://docs.rs/tokio) | Асинхронный runtime, сети, таймеры, ввод-вывод |
| [axum](https://docs.rs/axum) | Веб-фреймворк от команды tokio (HTTP-серверы, API) |
| [actix-web](https://docs.rs/actix-web) | Альтернативный высокопроизводительный веб-фреймворк |
| [rayon](https://docs.rs/rayon) | Параллельные итераторы (data parallelism) |
| [clap](https://docs.rs/clap) | Парсинг аргументов командной строки (CLI) |
| [thiserror](https://docs.rs/thiserror) | Удобные типы ошибок через derive |
| [anyhow](https://docs.rs/anyhow) | Простая обработка ошибок в приложениях |
| [reqwest](https://docs.rs/reqwest) | HTTP-клиент (sync и async) |
| [chrono](https://docs.rs/chrono) | Дата и время |
| [rand](https://docs.rs/rand) | Генерация случайных чисел |
| [log](https://docs.rs/log) + [env_logger](https://docs.rs/env_logger) | Логирование |
| [tracing](https://docs.rs/tracing) | Структурированное логирование/трассировка |
| [sqlx](https://docs.rs/sqlx) | Асинхронная работа с БД (компилируемые запросы) |
| [diesel](https://docs.rs/diesel) | ORM |
| [tui-rs](https://docs.rs/tui) / [ratatui](https://docs.rs/ratatui) | TUI-приложения |

---

## 14. Полезные команды

```bash
cargo new project_name        # новый проект
cargo init                    # инициализация в текущей папке
cargo build                   # сборка (debug)
cargo build --release         # сборка с оптимизациями
cargo run                     # сборка + запуск
cargo run --release
cargo check                   # быстрая проверка без кодогенерации
cargo test                    # тесты
cargo test -- --nocapture
cargo clippy                  # линтер (ловит неидиоматичный код)
cargo clippy -- -D warnings   # предупреждения как ошибки
cargo fmt                     # форматирование по rustfmt
cargo fmt --check             # проверить форматирование (для CI)
cargo add <crate>             # добавить зависимость
cargo remove <crate>
cargo doc                     # сборка документации
cargo doc --open
cargo publish                 # публикация в crates.io
cargo expand                  # разворачивание макросов (cargo-expand)
cargo audit                   # проверка зависимостей на уязвимости
```

Файлы: `Cargo.toml` (манифест), `Cargo.lock` (зафиксированные версии, в git для бинарников). Проект хранится в `src/`.

---

## 15. Ресурсы

- **[The Rust Book](https://doc.rust-lang.org/book/)** — официальная книга (есть русский перевод)
- **[Rust by Example](https://doc.rust-lang.org/rust-by-example/)** — язык через примеры
- **[Exercism Rust Track](https://exercism.org/tracks/rust)** — практика с менторами
- **[Rustlings](https://github.com/rust-lang/rustlings)** — маленькие упражнения в терминале
- **[Rust Playground](https://play.rust-lang.org/)** — код в браузере
- **[docs.rs](https://docs.rs)** — документация всех крейтов
- **[crates.io](https://crates.io)** — реестр пакетов
- **[Tour of Rust](https://tourofrust.com)** — короткий интерактивный курс
- **[Rust Design Patterns](https://rust-unofficial.github.io/patterns/)** — паттерны проектирования
- **[r/rust](https://www.reddit.com/r/rust/)** и **This Week in Rust** — новости сообщества

---

## 🎓 Курс

| Unit | Тема | Содержание |
|------|------|-----------|
| [Unit 1](unit-01/syntax.md) | Основы | Переменные, типы, функции, владение, заимствование, срезы, управляющие конструкции |
| [Unit 2](unit-02/syntax.md) | Структуры и перечисления | struct, enum, Option/Result, match, impl, методы, коллекции (Vec, HashMap, HashSet) |
| [Unit 3](unit-03/syntax.md) | Ошибки, трейты, конкурентность | Обработка ошибок, трейты, обобщения, модули, потоки, каналы, Arc/Mutex, тестирование |

Каждый unit включает: теорию, задачи, разбор.

- [Unit 1: задачи](unit-01/practice.md) | [Unit 2: задачи](unit-02/practice.md) | [Unit 3: задачи](unit-03/practice.md)

Дополнительно:
- [Детали: lifetimes, unsafe, макросы, async/await](details.md)
- [Практические проекты](projects/index.md)

---
*Полный конспект Rust. Регулярно дополняется.*
