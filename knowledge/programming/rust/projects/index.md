# Rust — Проекты

4 практических проекта: от CLI-утилиты до парсера и консольной игры. Каждый — с описанием, шагами и тем, что вы изучаете.

---

## Проект 1: CLI-утилита «grepsh» (поиск в тексте)

**Уровень:** Начинающий  
**Стек:** clap, std::fs, std::env  
**Время:** 2-3 часа

### Описание

Утилита поиска строки в файле — аналог `grep`. Поддерживает флаги: чувствительность к регистру, номера строк, подсчёт совпадений.

```bash
cargo new grepsh
cd grepsh
cargo add clap --features derive
```

```rust
use clap::Parser;

#[derive(Parser, Debug)]
#[command(name = "grepsh", version, about = "Поиск строки в файле")]
struct Args {
    /// Искомая строка
    query: String,

    /// Файл для поиска
    path: String,

    /// Игнорировать регистр
    #[arg(short, long)]
    ignore_case: bool,

    /// Печатать номера строк
    #[arg(short = 'n', long)]
    line_number: bool,

    /// Только подсчёт совпадений
    #[arg(short, long)]
    count: bool,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let content = std::fs::read_to_string(&args.path)?;

    let query = if args.ignore_case {
        args.query.to_lowercase()
    } else {
        args.query.clone()
    };

    let mut matches = 0;
    for (idx, line) in content.lines().enumerate() {
        let haystack = if args.ignore_case {
            line.to_lowercase()
        } else {
            line.to_string()
        };
        if haystack.contains(&query) {
            matches += 1;
            if !args.count {
                if args.line_number {
                    println!("{}: {}", idx + 1, line);
                } else {
                    println!("{line}");
                }
            }
        }
    }

    if args.count {
        println!("{matches}");
    }
    Ok(())
}
```

### Шаги

1. Изучите `clap` derive API (структура `Args`, атрибуты `#[arg]`);
2. Реализуйте поиск без регистра и с номерами строк;
3. Добавьте флаг `--count`;
4. Проверьте: `cargo run -- "rust" Cargo.toml --ignore-case -n`;
5. Дополнительно: добавьте `--color` для подсветки совпадений.

### Что изучается

CLI-фреймворки (`clap`), работа с файлами (`fs::read_to_string`), итераторы, строки (`to_lowercase`, `lines`, `contains`), обработка ошибок через `?` и `Box<dyn Error>`.

---

## Проект 2: HTTP-сервер «todo-api» на axum

**Уровень:** Средний  
**Стек:** axum, tokio, serde  
**Время:** 4-6 часов

### Описание

REST API для задач (to-do): `GET /todos`, `POST /todos`, `DELETE /todos/:id`. Хранение в памяти (затем — в БД).

```bash
cargo new todo-api
cd todo-api
cargo add axum tokio --features tokio/full
cargo add serde --features derive
```

```rust
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone, Serialize, Deserialize)]
struct Todo {
    id: u64,
    title: String,
    done: bool,
}

#[derive(Deserialize)]
struct NewTodo {
    title: String,
}

type Db = Arc<Mutex<HashMap<u64, Todo>>>;

async fn list_todos(State(db): State<Db>) -> Json<Vec<Todo>> {
    let db = db.lock().unwrap();
    let mut todos: Vec<Todo> = db.values().cloned().collect();
    todos.sort_by_key(|t| t.id);
    Json(todos)
}

async fn create_todo(
    State(db): State<Db>,
    Json(input): Json<NewTodo>,
) -> impl IntoResponse {
    let mut db = db.lock().unwrap();
    let id = db.len() as u64 + 1;
    let todo = Todo {
        id,
        title: input.title,
        done: false,
    };
    db.insert(id, todo.clone());
    (StatusCode::CREATED, Json(todo))
}

async fn delete_todo(State(db): State<Db>, Path(id): Path<u64>) -> StatusCode {
    let mut db = db.lock().unwrap();
    if db.remove(&id).is_some() {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}

#[tokio::main]
async fn main() {
    let db: Db = Arc::new(Mutex::new(HashMap::new()));

    let app = Router::new()
        .route("/todos", get(list_todos).post(create_todo))
        .route("/todos/{id}", delete(delete_todo))
        .with_state(db);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    println!("сервер на http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
```

### Шаги

1. Разберитесь с `Router`, маршрутами и `with_state`;
2. Реализуйте `GET` и `POST`;
3. Добавьте `DELETE` и проверку существования;
4. Протестируйте: `curl -X POST localhost:3000/todos -d '{"title":"учиться"}' -H 'Content-Type: application/json'`;
5. Дополнительно: подключите SQLite через `rusqlite` или PostgreSQL через `sqlx`.

### Что изучается

Асинхронный runtime (`tokio`), веб-фреймворк (`axum`), сериализация (`serde`), разделяемое состояние (`Arc<Mutex>`), экстракторы и HTTP-статусы.

---

## Проект 3: Парсер арифметических выражений

**Уровень:** Средний  
**Стек:** только std, рекурсивный спуск  
**Время:** 3-5 часов

### Описание

Калькулятор выражений с приоритетом операций, скобками и унарным минусом: `2 + 3 * (4 - 1)` → `11`. Реализация рекурсивного спуска (парсер выражений).

```rust
#[derive(Debug, Clone, PartialEq)]
enum Expr {
    Num(f64),
    Add(Box<Expr>, Box<Expr>),
    Sub(Box<Expr>, Box<Expr>),
    Mul(Box<Expr>, Box<Expr>),
    Div(Box<Expr>, Box<Expr>),
    Neg(Box<Expr>),
}

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Num(f64),
    Plus,
    Minus,
    Star,
    Slash,
    LParen,
    RParen,
}

impl Parser {
    fn new(input: &str) -> Parser {
        let tokens = tokenize(input);
        Parser { tokens, pos: 0 }
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    fn next(&mut self) -> Option<Token> {
        let t = self.tokens.get(self.pos).cloned();
        self.pos += 1;
        t
    }

    fn parse(&mut self) -> Expr {
        self.parse_expr()
    }

    // expr := term (('+' | '-') term)*
    fn parse_expr(&mut self) -> Expr {
        let mut left = self.parse_term();
        loop {
            match self.peek() {
                Some(Token::Plus) => {
                    self.next();
                    let right = self.parse_term();
                    left = Expr::Add(Box::new(left), Box::new(right));
                }
                Some(Token::Minus) => {
                    self.next();
                    let right = self.parse_term();
                    left = Expr::Sub(Box::new(left), Box::new(right));
                }
                _ => return left,
            }
        }
    }

    // term := factor (('*' | '/') factor)*
    fn parse_term(&mut self) -> Expr {
        let mut left = self.parse_factor();
        loop {
            match self.peek() {
                Some(Token::Star) => {
                    self.next();
                    let right = self.parse_factor();
                    left = Expr::Mul(Box::new(left), Box::new(right));
                }
                Some(Token::Slash) => {
                    self.next();
                    let right = self.parse_factor();
                    left = Expr::Div(Box::new(left), Box::new(right));
                }
                _ => return left,
            }
        }
    }

    // factor := '-' factor | '(' expr ')' | num
    fn parse_factor(&mut self) -> Expr {
        match self.peek() {
            Some(Token::Minus) => {
                self.next();
                let inner = self.parse_factor();
                Expr::Neg(Box::new(inner))
            }
            Some(Token::LParen) => {
                self.next();
                let e = self.parse_expr();
                assert_eq!(self.next(), Some(Token::RParen), "ожидалась ')'");
                e
            }
            Some(Token::Num(n)) => {
                let n = *n;
                self.next();
                Expr::Num(n)
            }
            _ => panic!("неожиданный токен"),
        }
    }
}

fn tokenize(input: &str) -> Vec<Token> {
    let mut tokens = Vec::new();
    let chars: Vec<char> = input.chars().filter(|c| !c.is_whitespace()).collect();
    let mut i = 0;
    while i < chars.len() {
        match chars[i] {
            '+' => { tokens.push(Token::Plus); i += 1; }
            '-' => { tokens.push(Token::Minus); i += 1; }
            '*' => { tokens.push(Token::Star); i += 1; }
            '/' => { tokens.push(Token::Slash); i += 1; }
            '(' => { tokens.push(Token::LParen); i += 1; }
            ')' => { tokens.push(Token::RParen); i += 1; }
            c if c.is_ascii_digit() => {
                let start = i;
                while i < chars.len() && chars[i].is_ascii_digit() {
                    i += 1;
                }
                let num: f64 = chars[start..i].iter().collect::<String>().parse().unwrap();
                tokens.push(Token::Num(num));
            }
            _ => panic!("неизвестный символ: {}", chars[i]),
        }
    }
    tokens
}

impl Expr {
    fn eval(&self) -> f64 {
        match self {
            Expr::Num(n) => *n,
            Expr::Add(a, b) => a.eval() + b.eval(),
            Expr::Sub(a, b) => a.eval() - b.eval(),
            Expr::Mul(a, b) => a.eval() * b.eval(),
            Expr::Div(a, b) => a.eval() / b.eval(),
            Expr::Neg(a) => -a.eval(),
        }
    }
}

fn main() {
    let expr = "2 + 3 * (4 - 1)";
    let result = Parser::new(expr).parse().eval();
    println!("{expr} = {result}");      // 2 + 3 * (4 - 1) = 11
}
```

### Шаги

1. Реализуйте токенизатор (числа, операторы, скобки);
2. Напишите грамматику: `expr → term`, `term → factor`, `factor → ...`;
3. Добавьте приоритет операторов (сначала `* /`, потом `+ -`);
4. Добавьте скобки и унарный минус;
5. Напишите юнит-тесты для приоритета, скобок и ошибок.

### Что изучается

Рекурсия, `enum` как дерево (AST), `Box`, итерация по токенам, деление грамматики по приоритетам, тестирование.

---

## Проект 4: Консольная игра «Угадай число»

**Уровень:** Начинающий  
**Стек:** std + rand  
**Время:** 1-2 часа

### Описание

Классическая игра из The Rust Book: программа загадывает число, игрок угадывает с подсказками «больше/меньше». Счётчик попыток и режим «реванша».

```bash
cargo new guess-game
cd guess-game
cargo add rand
```

```rust
use rand::Rng;
use std::cmp::Ordering;
use std::io;

fn main() {
    println!("Угадай число от 1 до 100!");

    loop {
        let secret = rand::thread_rng().gen_range(1..=100);
        let mut attempts = 0;

        loop {
            print!("Твой вариант: ");
            io::Write::flush(&mut io::stdout()).unwrap();

            let mut guess = String::new();
            io::stdin().read_line(&mut guess).unwrap();

            let guess: u32 = match guess.trim().parse() {
                Ok(n) => n,
                Err(_) => {
                    println!("Введи число!");
                    continue;
                }
            };

            attempts += 1;

            match guess.cmp(&secret) {
                Ordering::Less => println!("Больше"),
                Ordering::Greater => println!("Меньше"),
                Ordering::Equal => {
                    println!("Точно! Попыток: {attempts}");
                    break;
                }
            }
        }

        print!("Ещё раз? (y/n): ");
        io::Write::flush(&mut io::stdout()).unwrap();
        let mut again = String::new();
        io::stdin().read_line(&mut again).unwrap();
        if !again.trim().eq_ignore_ascii_case("y") {
            break;
        }
    }
}
```

### Шаги

1. Реализуйте загадывание числа через `rand`;
2. Добавьте цикл ввода, парсинг и подсказки через `cmp`;
3. Добавьте проверку ввода (не-числа не паникуют);
4. Добавьте счётчик попыток и режим «реванша»;
5. Дополнительно: максимум 7 попыток, подсказки «горячо/холодно», статистика игр.

### Что изучается

Ввод-вывод (`stdin`, `read_line`), циклы и `match`, `enum Ordering`, генерация случайных чисел (`rand`), обработка ошибок парсинга без `panic`.

---

## Порядок выполнения

1. Проект 1 и 4 — после Unit 1 (основы, строки, циклы);
2. Проект 3 — после Unit 2 (enum, Box, match) или Unit 3 (тесты);
3. Проект 2 — после Unit 3 (трейты, Arc/Mutex, async/await).

---
*Больше идей: https://github.com/practical-tutorials/project-based-learning#rust, https://github.com/kirillzhosul/awesome-rust-apps*
