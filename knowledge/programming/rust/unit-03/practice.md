# Rust — Unit 3: Задачи

## Уровень 1: Лёгкие

```rust
// 1. Квадратный корень с проверкой
fn sqrt_checked(x: f64) -> Result<f64, String> {
    if x < 0.0 {
        Err(format!("отрицательное число: {x}"))
    } else {
        Ok(x.sqrt())
    }
}

// 2. Трейт Area
trait Area {
    fn area(&self) -> f64;
}

struct Circle {
    radius: f64,
}

struct Square {
    side: f64,
}

impl Area for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

impl Area for Square {
    fn area(&self) -> f64 {
        self.side * self.side
    }
}

struct Triangle {
    a: f64,
    b: f64,
    c: f64,
}

impl Area for Triangle {
    fn area(&self) -> f64 {
        let s = (self.a + self.b + self.c) / 2.0;
        (s * (s - self.a) * (s - self.b) * (s - self.c)).sqrt()
    }
}

fn total_area(shapes: &[&dyn Area]) -> f64 {
    shapes.iter().map(|s| s.area()).sum()
}
```

## Уровень 2: Средние

```rust
use std::collections::HashMap;

// 3. Обобщённый максимум
fn max_of<T: PartialOrd + Copy>(a: T, b: T) -> T {
    if a > b { a } else { b }
}

// 4. Producer/Consumer через канал
use std::sync::mpsc;
use std::thread;

fn producer_consumer() -> i64 {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for i in 1..=10 {
            tx.send(i).unwrap();
        }
    });

    rx.iter().map(|x: i32| x as i64).sum()   // 55
}

// 5. Числа Фибоначчи с тестом
fn fib(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}

#[cfg(test)]
mod fib_tests {
    use super::*;

    #[test]
    fn test_fib_base() {
        assert_eq!(fib(0), 0);
        assert_eq!(fib(1), 1);
    }

    #[test]
    fn test_fib_small() {
        assert_eq!(fib(10), 55);
    }
}

// 6. Параллельная сумма через каналы
fn parallel_sum(data: &[u64], num_threads: usize) -> u64 {
    let chunk_size = (data.len() + num_threads - 1) / num_threads;
    let chunks: Vec<_> = data.chunks(chunk_size).map(|c| c.to_vec()).collect();

    let (tx, rx) = mpsc::channel();
    let mut handles = vec![];

    for chunk in chunks {
        let tx = tx.clone();
        handles.push(thread::spawn(move || {
            tx.send(chunk.iter().sum::<u64>()).unwrap();
        }));
    }
    drop(tx);

    rx.iter().sum()
}

// 7. Logger trait
trait Logger {
    fn log(&self, msg: &str);
}

struct StdoutLogger;
struct FileLogger {
    filename: String,
}
struct SilentLogger;

impl Logger for StdoutLogger {
    fn log(&self, msg: &str) {
        println!("[LOG] {msg}");
    }
}

impl Logger for FileLogger {
    fn log(&self, msg: &str) {
        // В реальности: запись в файл
        println!("[LOG to {}] {msg}", self.filename);
    }
}

impl Logger for SilentLogger {
    fn log(&self, _msg: &str) {
        // Ничего не делаем
    }
}

fn use_logger(logger: &dyn Logger) {
    logger.log("событие произошло");
}
```

## Уровень 3: Конкурентность

```rust
// 8. Счётчик из 10 потоков по 100 инкрементов
use std::sync::{Arc, Mutex};
use std::thread;

fn concurrent_counter() -> u64 {
    let counter = Arc::new(Mutex::new(0u64));
    let mut handles = Vec::new();

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

    let final_count = *counter.lock().unwrap();
    final_count      // 1000
}

// 9. Parallel sum с Arc<Mutex>
use std::sync::Arc;
use std::sync::Mutex;

fn parallel_sum_mutex(data: &[u64], num_threads: usize) -> u64 {
    let result = Arc::new(Mutex::new(0u64));
    let chunk_size = (data.len() + num_threads - 1) / num_threads;
    let mut handles = vec![];

    for chunk in data.chunks(chunk_size) {
        let result = Arc::clone(&result);
        let chunk = chunk.to_vec();
        handles.push(thread::spawn(move || {
            let sum: u64 = chunk.iter().sum();
            let mut total = result.lock().unwrap();
            *total += sum;
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    *result.lock().unwrap()
}

// 10. Параллельный поиск в векторе
fn parallel_find(data: &[i32], target: i32, num_threads: usize) -> Option<usize> {
    let found = Arc::new(Mutex::new(None));
    let chunk_size = (data.len() + num_threads - 1) / num_threads;
    let mut handles = vec![];

    for (chunk_idx, chunk) in data.chunks(chunk_size).enumerate() {
        let found = Arc::clone(&found);
        let chunk = chunk.to_vec();
        let offset = chunk_idx * chunk_size;
        handles.push(thread::spawn(move || {
            for (i, &val) in chunk.iter().enumerate() {
                if val == target {
                    let mut result = found.lock().unwrap();
                    *result = Some(offset + i);
                    return;
                }
            }
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    *found.lock().unwrap()
}
```

## Уровень 4: Ошибки и трейты

```rust
// 11. Custom error с thiserror (псевдокод — нужен thiserror крейт)
// Cargo.toml: thiserror = "1"
//
// #[derive(Error, Debug)]
// enum AppError {
//     #[error("файл не найден: {0}")]
//     FileNotFound(String),
//     #[error("ошибка парсинга")]
//     Parse(#[from] std::num::ParseIntError),
//     #[error("ошибка ввода-вывода")]
//     Io(#[from] std::io::Error),
// }
//
// fn process_file(path: &str) -> Result<String, AppError> {
//     let content = std::fs::read_to_string(path)?;
//     let num: i32 = content.trim().parse()?;
//     Ok(format!("число: {num}"))
// }

// 13. Read + Write трейты
trait Read {
    fn read(&self) -> String;
}

trait Write {
    fn write(&mut self, data: &str);
}

trait ReadWrite: Read + Write {
    fn read_write(&mut self) -> String {
        let data = self.read();
        self.write(&data);
        data
    }
}

struct Buffer {
    content: String,
}

impl Read for Buffer {
    fn read(&self) -> String {
        self.content.clone()
    }
}

impl Write for Buffer {
    fn write(&mut self, data: &str) {
        self.content = data.to_string();
    }
}

impl ReadWrite for Buffer {}

// 14. Группировка по первой букве
fn group_by_first_letter(words: &[&str]) -> HashMap<char, Vec<String>> {
    let mut groups: HashMap<char, Vec<String>> = HashMap::new();
    for w in words {
        if let Some(first) = w.chars().next() {
            groups
                .entry(first)
                .or_default()
                .push(w.to_string());
        }
    }
    groups
}
```

## Уровень 5: Мини-проекты

### Мини-проект 1: Thread pool с результатами

```rust
use std::sync::mpsc;
use std::thread;

struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

struct Worker {
    id: u32,
    thread: thread::JoinHandle<()>,
}

impl ThreadPool {
    fn new(size: usize) -> ThreadPool {
        assert!(size > 0);
        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);
        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.send(job).unwrap();
    }
}

impl Worker {
    fn new(id: u32, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let job = receiver.lock().unwrap().recv().unwrap();
            println!("Worker {id} выполняет задачу");
            job();
        });
        Worker { id, thread }
    }
}

fn main() {
    let pool = ThreadPool::new(4);

    for i in 0..8 {
        pool.execute(move || {
            println!("Задача {i} выполнена");
        });
    }
}
```

### Мини-проект 2: Async HTTP клиент с reqwest

```rust
// Cargo.toml: reqwest = { version = "0.11", features = ["json"] }
//             tokio = { version = "1", features = ["full"] }

use reqwest;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct IpInfo {
    ip: String,
    city: String,
    country: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let response = reqwest::get("https://ipapi.co/json/")
        .await?
        .json::<IpInfo>()
        .await?;

    println!("IP: {}", response.ip);
    println!("Город: {}", response.city);
    println!("Страна: {}", response.country);
    Ok(())
}
```

### Мини-проект 3: Система логирования с уровнями

```rust
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

trait Logger: Send + Sync {
    fn log(&self, level: LogLevel, msg: &str);
}

struct StdoutLogger;
struct FilteredLogger {
    min_level: LogLevel,
    inner: StdoutLogger,
}

impl Logger for StdoutLogger {
    fn log(&self, level: LogLevel, msg: &str) {
        println!("[{:?}] {msg}", level);
    }
}

impl Logger for FilteredLogger {
    fn log(&self, level: LogLevel, msg: &str) {
        if level >= self.min_level {
            self.inner.log(level, msg);
        }
    }
}

fn main() {
    let logger: Arc<dyn Logger> = Arc::new(FilteredLogger {
        min_level: LogLevel::Warn,
        inner: StdoutLogger,
    });

    let logger_clone = Arc::clone(&logger);
    logger.log(LogLevel::Info, "это не покажется");
    logger_clone.log(LogLevel::Warn, "это покажется");
    logger.log(LogLevel::Error, "это тоже покажется");
}
```

### Мини-проект 4: Параллельная обработка файлов

```rust
use std::fs;
use std::sync::mpsc;
use std::thread;
use std::path::Path;

fn process_files(paths: Vec<&str>) -> Vec<(String, usize)> {
    let (tx, rx) = mpsc::channel();

    for path in paths {
        let tx = tx.clone();
        thread::spawn(move || {
            let content = fs::read_to_string(path).unwrap_or_default();
            let word_count = content.split_whitespace().count();
            tx.send((path.to_string(), word_count)).unwrap();
        });
    }

    drop(tx);

    rx.iter().collect()
}

fn main() {
    let results = process_files(vec!["Cargo.toml", "README.md"]);
    for (path, count) in results {
        println!("{path}: {count} слов");
    }
}
```

## Ответы

1. Проверка `x < 0.0` → `Err`, иначе `Ok(x.sqrt())`
2. `impl Area for Circle { fn area(&self) -> f64 { PI * r * r } }`; сумма через `&[&dyn Area]`
3. `if a > b { a } else { b }` с bound'ом `T: PartialOrd + Copy`
4. Продюсер шлёт `1..=10`, `rx.iter().sum()` — канал сам доставляет все значения
5. Рекурсия с базовыми случаями `0` и `1`; тест `assert_eq!(fib(10), 55)`
6. `Arc<Mutex<u64>>` + 10 потоков × 100 инкрементов = 1000
7. `trait Logger` с тремя реализациями, `use_logger` принимает `&dyn Logger`
8. `thiserror` derive + `#[from]` для автоматической конверсии
9. `parallel_sum` через `mpsc::channel` + `thread::spawn` + `drop(tx)` + `rx.iter().sum()`
10. `read_lines` через `fs::read_to_string(path)?` + `lines().map().collect()`
11. `trait Shape` с `area()`, три реализации, `total_area(shapes: &[&dyn Shape]) -> f64`
12. Папка `tests/`, файл `integration_test.rs`, `use my_lib::...` + `#[test]`
