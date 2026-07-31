# Rust — Unit 3: Ошибки, трейты, конкурентность

Обработка ошибок, трейты и обобщения, модули, потоки/каналы/Arc\<Mutex>, тестирование.

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

### Result, unwrap, expect

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

`?` работает с `Result` и `Option`; тип ошибки должен конвертироваться в тип возвращаемой ошибки.

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

fn announce(item: &impl Speak) {
    println!("{}", item.speak());
}

fn announce_generic<T: Speak>(item: &T) {
    println!("{}", item.speak());
}

fn both(a: &impl Speak, b: &impl Speak) -> String {
    format!("{} | {}", a.speak(), b.speak())
}

// возвращаемый трейт — разные типы через Box<dyn Trait>
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
    println!("{:?}", p);           // Debug
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

// метод только для Pair<i32, i32>
impl Pair<i32, i32> {
    fn sum(&self) -> i32 {
        self.first + self.second
    }
}

fn main() {
    let p = Pair::new(3, 4);
    println!("{}", p.sum());
    let q: Pair<String, i32> = Pair::new(String::from("x"), 1);
    // q.sum();   // ❌ метод sum существует только для Pair<i32, i32>
}
```

---

## Модули

```rust
mod shapes {
    pub struct Square {
        pub side: f64,
    }

    impl Square {
        pub fn new(side: f64) -> Square {
            Square { side }
        }

        pub fn area(&self) -> f64 {
            self.side * self.side
        }
    }
}

use shapes::Square;

fn main() {
    let s = Square::new(4.0);
    println!("{}", s.area());
}
```

Правила видимости:
- по умолчанию всё **приватно** (видно внутри модуля и его детей);
- `pub` — видно снаружи;
- `pub(crate)` — только внутри крейта;
- `use` сокращает пути; `use shapes::Square as Sq;` — псевдоним.

Модули в отдельных файлах: `mod shapes;` подключает `shapes.rs` или `shapes/mod.rs`.

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

// несколько отправителей
fn main3() {
    let (tx, rx) = mpsc::channel();
    let tx2 = tx.clone();

    thread::spawn(move || { tx.send(1).unwrap(); });
    thread::spawn(move || { tx2.send(2).unwrap(); });

    let values: Vec<i32> = rx.iter().collect();
    println!("{values:?}");     // [1, 2] (порядок не гарантирован)
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

- `Arc` — атомарный подсчёт ссылок, разделяет владение между потоками;
- `Mutex` — блокировка; `lock()` возвращает `MutexGuard`, который реализует `Deref` к данным;
- данные в `Mutex` должны быть `Send` — защита от data races на этапе компиляции.

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

---

## Тестирование

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

```bash
cargo test                 # запуск
cargo test test_add        # по имени
cargo test -- --nocapture  # показать вывод
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

## Задачи

1. Напишите функцию `sqrt_checked(x: f64) -> Result<f64, String>`, возвращающую ошибку для отрицательных.
2. Реализуйте трейт `Area` с методом `area(&self) -> f64` для `Circle` и `Square`.
3. Напишите обобщённую функцию `max_of<T: PartialOrd + Copy>(a: T, b: T) -> T`.
4. Реализуйте producer/consumer: поток-производитель шлёт числа, главный поток суммирует.
5. Напишите тесты для функции `fib(n) -> u64`.
6. Реализуйте `Counter` (Arc<Mutex<u64>>), увеличиваемый из 10 потоков по 100 раз.

Ответы — в `practice.md`.
