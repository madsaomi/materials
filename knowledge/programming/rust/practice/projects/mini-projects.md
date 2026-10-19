# Rust — Разбор реальных мини-проектов с кодом

Здесь — полноценные мини-проекты с законченным кодом: парсер, файловый менеджер, HTTP-клиент/сервер на `TcpListener`, обработка ошибок через `anyhow`/`thiserror`, конкурентный пул на `tokio`/`rayon`. Каждый проект можно скопировать в `src/main.rs` (или `src/lib.rs`) и запустить `cargo run` / `cargo test`.

---

## Мини-проект A: Парсер арифметических выражений (рекурсивный спуск)

Полный код с lexer, AST, parser и eval. Один файл для простоты.

```rust
// src/lib.rs
#[derive(Debug, Clone, PartialEq)]
enum Token {
    Number(f64),
    Plus, Minus, Star, Slash,
    LParen, RParen,
}

enum Expr {
    Num(f64),
    Neg(Box<Expr>),
    BinOp { op: Token, l: Box<Expr>, r: Box<Expr> },
}

struct Lexer {
    chars: Vec<char>,
    pos: usize,
}

impl Lexer {
    fn new(s: &str) -> Self {
        Self { chars: s.chars().collect(), pos: 0 }
    }

    fn peek(&self) -> Option<&char> { self.chars.get(self.pos) }

    fn next_token(&mut self) -> Option<Token> {
        while let Some(&c) = self.peek() {
            if c.is_whitespace() { self.pos += 1; } else { break; }
        }
        let &c = self.peek()?;
        self.pos += 1;
        match c {
            '+' => Some(Token::Plus),
            '-' => Some(Token::Minus),
            '*' => Some(Token::Star),
            '/' => Some(Token::Slash),
            '(' => Some(Token::LParen),
            ')' => Some(Token::RParen),
            c if c.is_ascii_digit() || c == '.' => {
                let mut num = String::new();
                num.push(c);
                while let Some(&n) = self.peek() {
                    if n.is_ascii_digit() || n == '.' { num.push(n); self.pos += 1; } else { break; }
                }
                num.parse::<f64>().ok().map(Token::Number)
            }
            _ => None,
        }
    }
}

pub fn parse(src: &str) -> Result<f64, String> {
    let mut lx = Lexer::new(src);
    let mut tokens = Vec::new();
    while let Some(t) = lx.next_token() { tokens.push(t); }
    let mut p = Parser { tokens, pos: 0 };
    let expr = p.parse_expr()?;
    Ok(eval(&expr))
}

struct Parser { tokens: Vec<Token>, pos: usize }

impl Parser {
    fn peek(&self) -> Option<&Token> { self.tokens.get(self.pos) }

    fn advance(&mut self) -> Option<Token> {
        let t = self.tokens.get(self.pos).cloned();
        self.pos += 1;
        t
    }

    // expr -> term (('+'|'-') term)*
    fn parse_expr(&mut self) -> Result<Expr, String> {
        let mut left = self.parse_term()?;
        while let Some(Token::Plus | Token::Minus) = self.peek() {
            let op = self.advance().unwrap();
            let right = self.parse_term()?;
            left = Expr::BinOp { op, l: Box::new(left), r: Box::new(right) };
        }
        Ok(left)
    }

    // term -> factor (('*'|'/') factor)*
    fn parse_term(&mut self) -> Result<Expr, String> {
        let mut left = self.parse_factor()?;
        while let Some(Token::Star | Token::Slash) = self.peek() {
            let op = self.advance().unwrap();
            let right = self.parse_factor()?;
            left = Expr::BinOp { op, l: Box::new(left), r: Box::new(right) };
        }
        Ok(left)
    }

    // factor -> ('-') factor | '(' expr ')' | number
    fn parse_factor(&mut self) -> Result<Expr, String> {
        match self.advance() {
            Some(Token::Minus) => Ok(Expr::Neg(Box::new(self.parse_factor()?))),
            Some(Token::LParen) => {
                let e = self.parse_expr()?;
                match self.advance() {
                    Some(Token::RParen) => Ok(e),
                    _ => Err("ожидалась ')'".into()),
                }
            }
            Some(Token::Number(n)) => Ok(Expr::Num(n)),
            _ => Err("неожиданный токен".into()),
        }
    }
}

fn eval(e: &Expr) -> f64 {
    match e {
        Expr::Num(n) => *n,
        Expr::Neg(x) => -eval(x),
        Expr::BinOp { op, l, r } => {
            let (a, b) = (eval(l), eval(r));
            match op {
                Token::Plus => a + b,
                Token::Minus => a - b,
                Token::Star => a * b,
                Token::Slash => a / b,
                _ => unreachable!(),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn priority() { assert_eq!(parse("2 + 3 * 4").unwrap(), 14.0); }
    #[test]
    fn parens() { assert_eq!(parse("(2 + 3) * 4").unwrap(), 20.0); }
    #[test]
    fn unary() { assert_eq!(parse("-5 + 3").unwrap(), -2.0); }
    #[test]
    fn error_on_bad() { assert!(parse("2 ++ 3").is_err()); }
}
```

**Разбор.** Грамматика `expr → term → factor` кодирует приоритет операций: `*`/`/` связываются раньше `+`/`-`. `Box<Expr>` нужен, потому что `enum Expr` не может содержать себя напрямую (бесконечный размер). Всюду, где вход невалиден, возвращается `Result`, а не паника.

---

## Мини-проект B: Файловый менеджер «ls» с сортировкой и размерами

Компактная версия утилиты со структурой, `clap`-подобным вручную и обработкой ошибок.

```rust
// src/main.rs
use std::fs;
use std::path::Path;

#[derive(Debug)]
enum Item { File(String, u64), Dir(String) }

fn list_dir(path: &Path) -> Result<Vec<Item>, String> {
    let mut items = Vec::new();
    for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().into_owned();
        let md = entry.metadata().map_err(|e| e.to_string())?;
        if md.is_dir() {
            items.push(Item::Dir(name));
        } else {
            items.push(Item::File(name, md.len()));
        }
    }
    Ok(items)
}

fn print_items(items: &[Item]) {
    let mut items: Vec<&Item> = items.iter().collect();
    items.sort_by_key(|i| match i {
        Item::Dir(_) => (0, String::new()),
        Item::File(n, _) => (1, n.clone()),
    });
    for it in items {
        match it {
            Item::Dir(n) => println!("[dir]  {n}"),
            Item::File(n, size) => println!("       {n:<30} {size:>10} B"),
        }
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let dir = std::env::args().nth(1).unwrap_or_else(|| ".".to_string());
    let path = Path::new(&dir);
    if !path.is_dir() {
        eprintln!("ошибка: '{dir}' не директория");
        std::process::exit(2);
    }
    let items = list_dir(path)?;
    print_items(&items);
    Ok(())
}
```

**Разбор.** Функция `list_dir` возвращает `Result<Vec<Item>, String>` — ошибки не роняют программу паникой, а всплывают до `main`, который возвращает `Result<(), Box<dyn Error>>`. Сортировка через `sort_by_key` со «служебным» ключом `(0, _)` / `(1, _)` ставит директории первыми.

---

## Мини-проект C: HTTP-сервер на TcpListener

Многопоточный сервер, отдающий `index.html` или 404. Минимум кода, максимум понимания протокола.

```rust
// src/main.rs
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};

fn handle(mut stream: TcpStream) {
    let mut reader = BufReader::new(stream.try_clone().unwrap());
    let mut request_line = String::new();
    if reader.read_line(&mut request_line).is_err() { return; }

    let mut parts = request_line.split_whitespace();
    let method = parts.next().unwrap_or("");
    let path = parts.next().unwrap_or("/").to_string();

    // Защита от path traversal: допускаем только "/" и имена без ".."
    if !(path.starts_with("/") && !path.split('/').any(|p| p == "..")) {
        let _ = write!(stream, "HTTP/1.1 400 Bad Request\r\nContent-Length: 0\r\n\r\n");
        return;
    }

    let filename = if path == "/" { "index.html" } else { path.trim_start_matches('/') };

    match std::fs::read(filename) {
        Ok(body) => {
            let len = body.len();
            let _ = write!(stream,
                "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: {len}\r\n\r\n");
            let _ = stream.write_all(&body);
        }
        Err(_) => {
            let body = b"<h1>404 Not Found</h1>";
            let _ = write!(stream,
                "HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\nContent-Length: {}\r\n\r\n",
                body.len());
            let _ = stream.write_all(body);
        }
    }
}

fn main() -> std::io::Result<()> {
    let listener = TcpListener::bind("127.0.0.1:7878")?;
    println!("сервер слушает 127.0.0.1:7878");
    for stream in listener.incoming() {
        let stream = stream?;
        std::thread::spawn(move || handle(stream));
    }
    Ok(())
}
```

**Разбор.** `BufReader` позволяет читать запрос построчно; `try_clone` даёт отдельный читающий поток для того же сокета. Каждое соединение обрабатывается в отдельном потоке — сервер не блокирует следующий клиент. Защита от `..` в пути — обязательная практика безопасности для любого сервера.

---

## Мини-проект D: HTTP-клиент через reqwest + обработка ошибок

Клиент с нормальной обработкой сетевых ошибок и парсингом ответа.

```rust
// src/main.rs
use std::time::Duration;

fn main() -> anyhow::Result<()> {
    // anyhow::Result даёт гибкий тип ошибки наверху
    let url = std::env::args().nth(1).unwrap_or_else(|| "https://httpbin.org/json".into());

    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()?;

    let resp = client
        .get(&url)
        .header("User-Agent", "my-miniq/0.1")
        .send()
        .with_context(|| format!("не удалось выполнить GET {url}"))?;

    let status = resp.status();
    println!("статус: {status} ({})", status.as_u16());

    let body = resp.text().with_context(|| "не удалось прочитать тело")?;
    match serde_json::from_str::<serde_json::Value>(&body) {
        Ok(v) => println!("{}", serde_json::to_string_pretty(&v)?),
        Err(_) => println!("{body}"),
    }
    Ok(())
}
```

```toml
# Cargo.toml
[dependencies]
reqwest = { version = "0.12", features = ["blocking", "json"] }
anyhow = "1"
serde_json = "1"
```

**Разбор.** Набор: `.build()?` — ошибка создания клиента; `.send().with_context(...)?` — ошибка сети с контекстом. `anyhow` в бинарнике позволяет не указывать конкретный тип ошибки — он собирает все через `?`. Парсинг JSON пробуется, а при неудаче выводится сырой текст (graceful degradation).

---

## Мини-проект E: Обработка ошибок — thiserror + anyhow

Правильная связка: библиотека объявляет **точный** тип ошибки (`thiserror`), приложение — **гибкий** (`anyhow`).

```rust
// библиотека: src/lib.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("файл конфигурации не найден: {path}")]
    NotFound { path: String },
    #[error("невалидный TOML в {path}: {source}")]
    InvalidToml {
        path: String,
        #[source]
        source: toml::de::Error,
    },
    #[error("не хватает поля: {0}")]
    MissingField(String),
}

pub fn load_config(path: &str) -> Result<Config, ConfigError> {
    let content = std::fs::read_to_string(path)
        .map_err(|_| ConfigError::NotFound { path: path.into() })?;
    let cfg: Config = toml::from_str(&content)
        .map_err(|source| ConfigError::InvalidToml { path: path.into(), source })?;
    Ok(cfg)
}

pub struct Config { pub host: String, pub port: u16 }
```

```rust
// приложение: src/main.rs
use config_lib::load_config;
use anyhow::Context;

fn main() -> anyhow::Result<()> {
    let path = std::env::args().nth(1).unwrap_or_else(|| "config.toml".into());
    let cfg = load_config(&path)
        .with_context(|| format!("не удалось загрузить конфигурацию из {path}"))?;
    if cfg.host.is_empty() {
        anyhow::bail!("host не может быть пустым");
    }
    println!("стартую сервер на {}:{}", cfg.host, cfg.port);
    Ok(())
}
```

**Разбор.** `thiserror` генерирует реализацию `Display` и `Error` из атрибутов — без ручного `impl`. `#[source]` помечает поле, которое станет «причиной» ошибки (для цепочки). В приложении `anyhow` добавляет контекст и даёт аккуратную печать через `{:#}` в выводе ошибки. Правило: **библиотеки — `thiserror`, бинарники — `anyhow`**.

---

## Мини-проект F: Конкурентный пул задач — rayon и tokio

### Вариант 1: rayon (data parallelism)

```rust
// src/main.rs
use rayon::prelude::*;

fn heavy(n: u32) -> u64 {
    (1..=n).map(|x| x as u64).sum()  // упрощённый «счёт»
}

fn main() {
    let inputs: Vec<u32> = (1..=1_000_000).collect();

    // Последовательно
    let seq = inputs.iter().map(|&x| heavy(x)).sum::<u64>();

    // Параллельно — почти одна и та же запись
    let par = inputs.par_iter().map(|&x| heavy(x)).sum::<u64>();

    assert_eq!(seq, par);
    println!("готово: {par}");
}
```

`par_iter()` — параллельный аналог `iter()`: контейнер разбивается на части, каждая обрабатывается в своём потоке. Результат гарантированно совпадает с последовательным (если операции не зависят от порядка).

### Вариант 2: tokio (async, для I/O-задач)

```rust
// src/main.rs — Cargo.toml: tokio = { version = "1", features = ["full"] }
use tokio::task;

async fn fetch_title(kind: &str) -> String {
    // имитация сетевого вызова; в реальности — reqwest
    task::yield_now().await;
    format!("{kind}-итог")
}

#[tokio::main]
async fn main() {
    let kinds = vec!["a", "b", "c"];
    let mut handles = Vec::new();
    for k in kinds {
        handles.push(task::spawn(async move { fetch_title(k).await }));
    }
    for h in handles {
        println!("{}", h.await.unwrap());
    }
}
```

**Разбор.** rayon — для CPU-bound параллелизма (массовое вычисление над данными); tokio `spawn` — для конкурентных I/O-задач (сеть, диск), где потоки простаивали бы. Выбор: **большой расчёт → rayon, много I/O → tokio**.

---

## Сравнительная таблица подходов к конкурентности

| Подход | Когда | Плюсы | Минусы |
|--------|-------|-------|--------|
| `std::thread` | Несколько явных потоков | Просто, предсказуемо | Ручное управление, оверхед на поток |
| `rayon` | массовый CPU-расчёт | Одна строка `par_iter`, автобаланс | Не для I/O-блокировок |
| `tokio` + `spawn` | много async-I/O | Масштабируется на тысячи задач | Изучение async/await |
| `async-std` / `smol` | альтернативы tokio | Легче, иногда проще | Меньше экосистема |

---

## Как разбирать чужой код (приём для обучения)

1. **Сначала сигнатуры**, потом тела: прочитайте типы функций, потом `main`, потом детали.
2. **Ищите границы владения**: где происходит move (передача `String`), где borrow (`&str`), зачем там `clone`.
3. **Следите за `Result`**: каждая `?` — точка, где ошибка всплывает; подумайте, что случится при сбое.
4. **Задавайте вопрос «что за трейт»**: `Iterator`, `Read`, `Write`, `Error` — большинство Rust-кода держится на небольшом наборе трейтов.
5. **Перепишите сами**: закрыв решение, воспроизведите его по памяти — это фиксирует понимание.
