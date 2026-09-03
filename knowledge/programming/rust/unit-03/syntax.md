# Rust — Unit 3: Ошибки, трейты, конкурентность

Обработка ошибок, трейты и обобщения, модули и видимость, потоки/каналы/Arc\<Mutex>/RwLock, async/await, тестирование, thiserror, anyhow.

---

## Обработка ошибок

### panic — аварийная остановка

```rust
fn main() {
    let v = vec![1, 2, 3];
    // v[10];              // ❌ panic: index out of bounds
    panic!("непредвиденная ситуация");
}
```

`panic!` — для unrecoverable ошибок (неисправимых). Можно настроить поведение при panic в `Cargo.toml`:

```toml
[profile.release]
panic = "abort"   # меньше кода, меньше overhead, нет unwinding
```

По умолчанию `panic = "unwind"` — пытается распаковать стек (позволяет использовать `catch_unwind`).

### Result, unwrap, expect — быстрый способ

```rust
fn main() {
    let x: i32 = "42".parse().unwrap();            // 42
    // let y: i32 = "abc".parse().unwrap();        // ❌ panic

    let n: i32 = "42".parse().expect("это не число");

    let opt = Some(7);
    let a = opt.unwrap_or(0);                      // 7
    let b: Option<i32> = None;
    let c = b.unwrap_or(42);                       // 42

    // безопасные варианты
    let r: Result<i32, _> = "7".parse();
    let v = r.unwrap_or_default();                 // 7
    let err: Result<i32, _> = "x".parse();
    let v = err.unwrap_or_else(|_| -1);            // -1
}
```

### Оператор `?`

Пробрасывает ошибку наверх, не разворачивая вручную:

```rust
use std::fs;
use std::io;

fn read_first_line(path: &str) -> Result<String, io::Error> {
    let content = fs::read_to_string(path)?;       // проброс ошибки наверх
    Ok(content.lines().next().unwrap_or("").to_string())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let line = read_first_line("hello.txt")?;
    println!("{line}");
    Ok(())
}
```

`?` работает с `Result` и `Option`. Для `Option` можно использовать `.ok_or()` или `.ok_or_else()` для преобразования в `Result`.

### Собственный тип ошибки

```rust
use std::fmt;

#[derive(Debug)]
enum ConfigError {
    MissingKey(String),
    InvalidValue { key: String, value: String },
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ConfigError::MissingKey(k) => write!(f, "отсутствует ключ: {k}"),
            ConfigError::InvalidValue { key, value } => {
                write!(f, "некорректное значение для {key}: {value}")
            }
        }
    }
}

impl std::error::Error for ConfigError {}

fn get_config(key: &str, config: &[(&str, &str)]) -> Result<String, ConfigError> {
    config
        .iter()
        .find(|(k, _)| *k == key)
        .map(|(_, v)| v.to_string())
        .ok_or_else(|| ConfigError::MissingKey(key.to_string()))
}
```

### anyhow — для приложений

```rust
use anyhow::{Context, Result};

fn read_config(path: &str) -> Result<String> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("не удалось прочитать файл {path}"))?;
    Ok(content)
}

fn parse_config(content: &str) -> Result<serde_json::Value> {
    let value: serde_json::Value = serde_json::from_str(content)
        .context("невалидный JSON в конфиге")?;
    Ok(value)
}

fn main() -> Result<()> {
    let config = read_config("config.json")?;
    let parsed = parse_config(&config)?;
    println!("{parsed:?}");
    Ok(())
}
```

### thiserror — для библиотек

```rust
use thiserror::Error;

#[derive(Error, Debug)]
enum AppError {
    #[error("не найдено: {0}")]
    NotFound(String),
    #[error("сетевой сбой")]
    Network,
    #[error("ошибка ввода-вывода")]
    Io(#[from] std::io::Error),   // автоматический From<io::Error>
    #[error("ошибка парсинга")]
    Parse(#[from] std::num::ParseIntError),
}
```

### Сравнение anyhow и thiserror

| Аспект | anyhow | thiserror |
|--------|--------|-----------|
| Назначение | Приложения, бинари | Библиотеки |
| Типы ошибок | Единый `Error` trait | Перечисление с derive |
| Контекст | `.with_context()` | `#[error("...")]` |
| Конверсия | Автоматическая через `?` | `#[from]` |
| Использование | `Result<T, anyhow::Error>` | `Result<T, MyError>` |

---

## Трейты (traits) и обобщения

### Определение и реализация

```rust
trait Speak {
    fn speak(&self) -> String;
    fn name(&self) -> String {
        String::from("неизвестное существо")   // реализация по умолчанию
    }
}

struct Dog {
    name: String,
}

struct Cat {
    name: String,
}

impl Speak for Dog {
    fn speak(&self) -> String {
        format!("{}: Гав!", self.name)
    }
}

impl Speak for Cat {
    fn speak(&self) -> String {
        format!("{}: Мяу!", self.name)
    }
}
```

### Трейт как параметр

```rust
trait Speak {
    fn speak(&self) -> String;
}

struct Dog { name: String }
struct Cat { name: String }

impl Speak for Dog {
    fn speak(&self) -> String { format!("{}: Гав!", self.name) }
}

impl Speak for Cat {
    fn speak(&self) -> String { format!("{}: Мяу!", self.name) }
}

// impl Trait — синтаксис для трейт-объектов (динамическая диспетчеризация)
fn announce(item: &impl Speak) {
    println!("{}", item.speak());
}

// Трейт-объект — динамическая диспетчеризация через vtable
fn announce_dyn(item: &dyn Speak) {
    println!("{}", item.speak());
}

// Generic bound — статическая диспетчеризация (мономорфизация)
fn announce_generic<T: Speak>(item: &T) {
    println!("{}", item.speak());
}

fn both(a: &impl Speak, b: &impl Speak) -> String {
    format!("{} | {}", a.speak(), b.speak())
}

// Возвращаемый трейт — разные типы через Box<dyn Trait>
fn make_animal(kind: &str) -> Box<dyn Speak> {
    if kind == "dog" {
        Box::new(Dog { name: String::from("Рекс") })
    } else {
        Box::new(Cat { name: String::from("Барсик") })
    }
}

fn main() {
    let dog = Dog { name: String::from("Рекс") };
    let cat = Cat { name: String::from("Барсик") };
    announce(&dog);
    announce(&cat);
    println!("{}", both(&dog, &cat));
    println!("{}", make_animal("dog").speak());
}
```

### Вывод Debug, Clone, PartialEq — derive

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 1, y: 2 };
    let q = p;                     // Copy
    println!("{:?}", p);           // Debug: Point { x: 1, y: 2 }
    println!("{}", p == q);        // PartialEq
}
```

### Обобщённые структуры

```rust
struct Pair<T, U> {
    first: T,
    second: U,
}

impl<T, U> Pair<T, U> {
    fn new(first: T, second: U) -> Pair<T, U> {
        Pair { first, second }
    }
}

// Метод только для Pair<i32, i32>
impl Pair<i32, i32> {
    fn sum(&self) -> i32 {
        self.first + self.second
    }
}

// Метод с ограничением на T
impl<T: std::fmt::Display> Pair<T, T> {
    fn display(&self) {
        println!("({}, {})", self.first, self.second);
    }
}

fn main() {
    let p = Pair::new(3, 4);
    println!("{}", p.sum());          // 7
    p.display();                      // (3, 4)

    let q: Pair<String, i32> = Pair::new(String::from("x"), 1);
    // q.sum();   // ❌ метод sum существует только для Pair<i32, i32>
}
```

### Супертрейты (Supertraits)

Супертрейт ограничивает трейт, требуя реализации другого трейта:

```rust
trait Read {
    fn read(&self) -> String;
}

trait ReadWrite: Read {    // ReadWrite требует Read
    fn write(&self, data: &str);
}

struct File { name: String }

impl Read for File {
    fn read(&self) -> String {
        format!("содержимое {}", self.name)
    }
}

impl ReadWrite for File {
    fn write(&self, data: &str) {
        println!("записано в {}: {}", self.name, data);
    }
}
```

### Объединение трейтов (Trait Bounds)

```rust
fn process<T: std::fmt::Display + std::fmt::Debug>(item: T) {
    println!("Display: {}", item);
    println!("Debug: {:?}", item);
}

// Синтаксис через +:
fn process2(item: &(impl std::fmt::Display + std::fmt::Debug)) {
    println!("{}", item);
}

// Где (where clause) — более читаемый вариант для сложных bound'ов
fn process3<T>(item: T)
where
    T: std::fmt::Display + std::fmt::Debug,
{
    println!("{}", item);
}
```

### Трейт-объекты и dyn — подробнее

```rust
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

// Коллекция разнородных типов — только через dyn
fn animal_sounds(animals: &[Box<dyn Animal>]) {
    for animal in animals {
        println!("{} говорит: {}", animal.name(), animal.speak());
    }
}

// Трейт-объект с Send + Sync (для многопоточности)
fn spawn_animal(t: std::sync::Arc<dyn Animal + Send + Sync>) {
    std::thread::spawn(move || {
        println!("{}", t.speak());
    });
}
```

### Object Safety

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

## Модули и видимость

### Модули внутри файла

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

### Правила видимости

- по умолчанию всё **приватно** (видно внутри модуля и его детей);
- `pub` — видно снаружи;
- `pub(crate)` — только внутри крейта;
- `pub(super)` — видно в родительском модуле;
- `use` подтягивает в область видимости;
- `use shapes::Square as Sq;` — псевдоним;
- `pub use` — re-export (публичный re-export).

### Модули в отдельных файлах

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

### Re-export и публичный API

```rust
// src/lib.rs
mod internal {
    pub struct Helper;
    impl Helper {
        pub fn do_stuff() { println!("help"); }
    }
}

// Публикуем Helper наружу, скрывая internal
pub use internal::Helper;

// Теперь пользователи могут: use my_crate::Helper;
```

### Модули и приватность в деталях

```rust
mod outer {
    pub struct PublicStruct {
        pub pub_field: i32,
        pub(crate) crate_field: i32,   // видим внутри крейта
        private_field: i32,            // видим только внутри outer
    }

    pub fn public_fn() {}
    fn private_fn() {}

    pub mod inner {
        // pub — видно снаружи outer
        // но доступ к private_field outer невозможен
        pub fn access_outer(parent: &super::PublicStruct) {
            let _ = parent.pub_field;     // ✅
            let _ = parent.crate_field;   // ✅ (внутри крейта)
            // let _ = parent.private_field; // ❌
        }
    }
}
```

---

## Конкурентность

### Потоки

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

    handle.join().unwrap();     // дождаться завершения
}

// move — захват владения
fn main2() {
    let data = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("{data:?}");
    });
    handle.join().unwrap();
}
```

### Scoped Threads (Rust 1.63+)

```rust
use std::thread;

fn main() {
    let mut v = vec![1, 2, 3];

    // scoped threads — не нужен Arc/Mutex, т.к. компилятор гарантирует
    // что все потоки завершатся до выхода из области видимости
    thread::scope(|s| {
        s.spawn(|| {
            println!("вектор: {:?}", v);  // ✅ можно читать v
        });
        s.spawn(|| {
            v.push(4);  // ✅ можно изменять v
        });
    });
    // v доступен здесь — все потоки завершены
    println!("{v:?}");  // [1, 2, 3, 4]
}
```

### Каналы (mpsc)

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for i in 0..3 {
            tx.send(i).unwrap();
        }
    });

    for received in rx {
        println!("получено: {received}");
    }
}

// Несколько отправителей
fn multi_producer() {
    let (tx, rx) = mpsc::channel();
    let tx2 = tx.clone();

    thread::spawn(move || { tx.send(1).unwrap(); });
    thread::spawn(move || { tx2.send(2).unwrap(); });

    let values: Vec<i32> = rx.iter().take(2).collect();
    println!("{values:?}");     // [1, 2] (порядок не гарантирован)
}
```

### Другие каналы

```rust
// mpsc — multiple producer, single consumer (std)
// Также есть:
// - std::sync::mpsc::sync_channel — синхронный канал с буфером
// - tokio::sync::mpsc — async-канал
// - tokio::sync::oneshot — одноразовый канал (одно сообщение)
// - tokio::sync::broadcast — broadcast (много потребителей)
// - tokio::sync::watch — watch (последнее значение)

use std::sync::mpsc::sync_channel;

fn bounded_channel() {
    let (tx, rx) = sync_channel::<i32>(2);  // буфер на 2 сообщения
    tx.send(1).unwrap();
    tx.send(2).unwrap();
    // tx.send(3).unwrap();  // ❌ блокируется, если буфер полон
    println!("{:?}", rx.recv());  // Some(1)
}
```

### Общее состояние: Arc\<Mutex\<T>>

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut guard = counter.lock().unwrap();
            *guard += 1;
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    println!("итог: {}", *counter.lock().unwrap());   // 10
}
```

### Arc\<RwLock\<T>> — параллельное чтение

```rust
use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    let data = Arc::new(RwLock::new(vec![1, 2, 3]));

    let data_read = Arc::clone(&data);
    let reader = thread::spawn(move || {
        let read_guard = data_read.read().unwrap();
        println!("чтение: {:?}", *read_guard);
    });

    let data_write = Arc::clone(&data);
    let writer = thread::spawn(move || {
        let mut write_guard = data_write.write().unwrap();
        write_guard.push(4);
    });

    reader.join().unwrap();
    writer.join().unwrap();
    println!("итог: {:?}", *data.read().unwrap());
}
```

### Идиома «шаблон на разделяемое состояние»

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;

type SharedMap = Arc<Mutex<HashMap<String, u32>>>;

fn writer(id: u32, map: SharedMap) -> thread::JoinHandle<()> {
    thread::spawn(move || {
        let mut map = map.lock().unwrap();
        let entry = map.entry(format!("key-{id}")).or_insert(0);
        *entry += 1;
    })
}

fn main() {
    let map: SharedMap = Arc::new(Mutex::new(HashMap::new()));
    let mut handles = Vec::new();
    for id in 0..5 {
        handles.push(writer(id, Arc::clone(&map)));
    }
    for h in handles {
        h.join().unwrap();
    }
    println!("{map:?}");
}
```

### parking_lot — более производительные блокировки

```rust
// В Cargo.toml: parking_lot = "0.12"
use parking_lot::{Mutex, RwLock};

fn main() {
    let mutex = Mutex::new(0);
    let rwlock = RwLock::new(vec![1, 2, 3]);

    // parking_lot Mutex быстрее std::sync::Mutex
    // parking_lot RwLock быстрее std::sync::RwLock
    // Также есть: MutexGuard, RwLockReadGuard, RwLockWriteGuard
    // — те же интерфейсы, что и в std, но быстрее
}
```

---

## async/await

### Основы

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

### select! — гонка между futures

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

### async каналы

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel::<String>(32);

    tokio::spawn(async move {
        for i in 0..5 {
            tx.send(format!("сообщение {i}")).await.unwrap();
        }
    });

    while let Some(msg) = rx.recv().await {
        println!("{msg}");
    }
}
```

### async Mutex (tokio)

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

### Параллельные запросы

```rust
use tokio::task;

#[tokio::main]
async fn main() {
    let a = task::spawn(async { 1 + 1 });
    let b = task::spawn(async { 2 + 2 });

    let result = tokio::join!(a, b);
    println!("{:?}", result);  // (Ok(2), Ok(4))
}
```

---

## Тестирование

### Unit-тесты

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

pub fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("деление на ноль".to_string())
    } else {
        Ok(a / b)
    }
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
    fn test_divide_ok() {
        assert_eq!(divide(10.0, 2.0), Ok(5.0));
    }

    #[test]
    fn test_divide_by_zero() {
        assert!(divide(1.0, 0.0).is_err());
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
            Err("неверно".to_string())
        }
    }

    #[test]
    #[ignore]
    fn slow_test() {}
}
```

### Doc-тесты

```rust
/// Складывает два числа
///
/// # Примеры
///
/// ```
/// let result = my_crate::add(2, 3);
/// assert_eq!(result, 5);
/// ```
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

### Интеграционные тесты

Папка `tests/` — каждый файл — отдельный интеграционный тест:

```
my_project/
├── src/
│   └── lib.rs
└── tests/
    ├── integration_test.rs
    └── another_test.rs
```

```rust
// tests/integration_test.rs
use my_lib::add;

#[test]
fn test_add_from_lib() {
    assert_eq!(add(2, 3), 5);
}
```

### Команды для тестов

```bash
cargo test                    # все тесты
cargo test test_add           # фильтр по имени
cargo test -- --nocapture   # показать println!
cargo test -- --ignored       # только ignored
cargo test --release          # тесты в release
cargo test --doc               # doc-тесты
cargo test --test integration_test  # конкретный интеграционный тест
```

### Тестирование с пропагацией ошибок

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_file() -> Result<(), std::io::Error> {
        let content = std::fs::read_to_string("test.txt")?;
        assert!(!content.is_empty());
        Ok(())
    }
}
```

### Тестирование конкурентности

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::{Arc, Mutex};
    use std::thread;

    #[test]
    fn test_concurrent_counter() {
        let counter = Arc::new(Mutex::new(0u64));
        let mut handles = vec![];

        for _ in 0..10 {
            let counter = Arc::clone(&counter);
            handles.push(thread::spawn(move || {
                for _ in 0..100 {
                    let mut guard = counter.lock().unwrap();
                    *guard += 1;
                }
            }));
        }

        for h in handles {
            h.join().unwrap();
        }

        assert_eq!(*counter.lock().unwrap(), 1000);
    }
}
```

---

## Комбинированный пример: многопоточный поиск

```rust
use std::sync::mpsc;
use std::thread;

fn worker(id: u32, nums: Vec<u32>, tx: mpsc::Sender<(u32, u32)>) {
    let mut sum = 0;
    for n in nums {
        if n % 2 == 0 {
            sum += n;
        }
    }
    tx.send((id, sum)).unwrap();
}

fn main() {
    let data: Vec<Vec<u32>> = (0..4).map(|i| (1..=10).map(|x| x + i * 10).collect()).collect();
    let (tx, rx) = mpsc::channel();

    let mut handles = Vec::new();
    for (i, chunk) in data.into_iter().enumerate() {
        let tx = tx.clone();
        handles.push(thread::spawn(move || worker(i as u32, chunk, tx)));
    }
    drop(tx);

    for (id, sum) in rx.iter() {
        println!("воркер {id}: сумма чётных = {sum}");
    }

    for h in handles {
        h.join().unwrap();
    }
}
```

---

## Задачи

1. Напишите функцию `sqrt_checked(x: f64) -> Result<f64, String>`, возвращающую ошибку для отрицательных.
2. Реализуйте трейт `Area` с методом `area(&self) -> f64` для `Circle` и `Square`.
3. Напишите обобщённую функцию `max_of<T: PartialOrd + Copy>(a: T, b: T) -> T`.
4. Реализуйте producer/consumer: поток-производитель шлёт числа, главный поток суммирует.
5. Напишите тесты для функции `fib(n) -> u64`.
6. Реализуйте `Counter` (Arc<Mutex<u64>>), увеличиваемый из 10 потоков по 100 раз.
7. Реализуйте трейт `Logger` с методом `log(&self, msg: &str)` и тремя реализациями: `StdoutLogger`, `FileLogger`, `SilentLogger`.
8. Создайте enum `NetworkError` с thiserror и обработайте ошибки через `?`.
9. Напишите функцию `parallel_sum(data: &[u64], threads: usize) -> u64`, использующую каналы.
10. Реализуйте `fn read_lines(path: &str) -> Result<Vec<String>, std::io::Error>` с использованием `?`.
11. Создайте трейт `Shape` с методом `area()` и реализуйте его для 3+ типов. Напишите функцию `total_area(shapes: &[&dyn Shape]) -> f64`.
12. Напишите интеграционный тест в `tests/` для функции из библиотеки.

Ответы — в `practice.md`.
