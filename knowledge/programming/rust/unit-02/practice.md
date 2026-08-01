# Rust — Unit 2: Задачи

## Уровень 1: Лёгкие

```rust
use std::collections::HashMap;

// 1. Противоположное направление
enum Direction {
    North,
    East,
    South,
    West,
}

impl Direction {
    fn opposite(&self) -> Direction {
        match self {
            Direction::North => Direction::South,
            Direction::East => Direction::West,
            Direction::South => Direction::North,
            Direction::West => Direction::East,
        }
    }

    fn turn_right(&self) -> Direction {
        match self {
            Direction::North => Direction::East,
            Direction::East => Direction::South,
            Direction::South => Direction::West,
            Direction::West => Direction::North,
        }
    }
}

// 2. Температура
struct Temperature {
    celsius: f64,
}

impl Temperature {
    fn new(celsius: f64) -> Temperature {
        Temperature { celsius }
    }

    fn to_fahrenheit(&self) -> f64 {
        self.celsius * 9.0 / 5.0 + 32.0
    }

    fn to_celsius(&self) -> f64 {
        self.celsius
    }

    fn from_fahrenheit(f: f64) -> Temperature {
        Temperature {
            celsius: (f - 32.0) * 5.0 / 9.0,
        }
    }
}

// 3. Point с методом расстояния
#[derive(Debug, Clone, Copy)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn origin() -> Point {
        Point { x: 0.0, y: 0.0 }
    }

    fn distance_to(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
}
```

## Уровень 2: Средние

```rust
use std::collections::HashMap;

// 4. Среднее арифметическое как Option
fn average(v: &[f64]) -> Option<f64> {
    if v.is_empty() {
        return None;
    }
    Some(v.iter().sum::<f64>() / v.len() as f64)
}

// 5. Калькулятор через enum
enum Operation {
    Add,
    Sub,
    Mul,
    Div,
}

fn apply(op: Operation, a: f64, b: f64) -> Option<f64> {
    match op {
        Operation::Add => Some(a + b),
        Operation::Sub => Some(a - b),
        Operation::Mul => Some(a * b),
        Operation::Div => {
            if b == 0.0 {
                None
            } else {
                Some(a / b)
            }
        }
    }
}

// 6. Частоты символов
fn char_frequencies(s: &str) -> HashMap<char, u32> {
    let mut freq = HashMap::new();
    for c in s.chars() {
        *freq.entry(c).or_insert(0) += 1;
    }
    freq
}

// 7. Обобщённый максимум
fn max_of<T: PartialOrd>(a: T, b: T) -> T {
    if a > b { a } else { b }
}

// 8. Парсинг команды
#[derive(Debug, PartialEq)]
enum Command {
    Move { x: i32, y: i32 },
    Say(String),
    Quit,
}

fn parse_command(input: &str) -> Option<Command> {
    let parts: Vec<&str> = input.splitn(3, ' ').collect();
    match parts.as_slice() {
        ["move", x, y] => Some(Command::Move {
            x: x.parse().ok()?,
            y: y.parse().ok()?,
        }),
        ["say", rest @ ..] => Some(Command::Say(rest.join(" "))),
        ["quit"] => Some(Command::Quit),
        _ => None,
    }
}
```

## Уровень 3: Структуры и enum

```rust
// 9. Shape с area()
#[derive(Debug)]
enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
    Triangle(f64, f64, f64),  // стороны (Heron's formula)
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r) => std::f64::consts::PI * r * r,
            Shape::Rectangle(w, h) => w * h,
            Shape::Triangle(a, b, c) => {
                let s = (a + b + c) / 2.0;
                (s * (s - a) * (s - b) * (s - c)).sqrt()
            }
        }
    }

    fn perimeter(&self) -> f64 {
        match self {
            Shape::Circle(r) => 2.0 * std::f64::consts::PI * r,
            Shape::Rectangle(w, h) => 2.0 * (w + h),
            Shape::Triangle(a, b, c) => a + b + c,
        }
    }
}

// 10. Matrix
#[derive(Debug, Clone, PartialEq)]
struct Matrix {
    data: Vec<Vec<i32>>,
    rows: usize,
    cols: usize,
}

impl Matrix {
    fn new(data: Vec<Vec<i32>>) -> Option<Matrix> {
        if data.is_empty() || data[0].is_empty() {
            return None;
        }
        let rows = data.len();
        let cols = data[0].len();
        // Проверка прямоугольности
        if !data.iter().all(|row| row.len() == cols) {
            return None;
        }
        Some(Matrix { data, rows, cols })
    }

    fn add(&self, other: &Matrix) -> Option<Matrix> {
        if self.rows != other.rows || self.cols != other.cols {
            return None;
        }
        let data = self.data.iter().zip(&other.data).map(|(a, b)| {
            a.iter().zip(b.iter()).map(|(x, y)| x + y).collect()
        }).collect();
        Some(Matrix { data, rows: self.rows, cols: self.cols })
    }

    fn transpose(&self) -> Matrix {
        let mut data = vec![vec![0; self.rows]; self.cols];
        for i in 0..self.rows {
            for j in 0..self.cols {
                data[j][i] = self.data[i][j];
            }
        }
        Matrix { data, rows: self.cols, cols: self.rows }
    }
}

// 11. Группировка по ключу
fn group_by<T, F>(items: Vec<T>, key_fn: F) -> HashMap<String, Vec<T>>
where
    F: Fn(&T) -> String,
{
    let mut groups: HashMap<String, Vec<T>> = HashMap::new();
    for item in items {
        let key = key_fn(&item);
        groups.entry(key).or_default().push(item);
    }
    groups
}
```

## Уровень 4: Обобщения и трейты

```rust
// 12. Обобщённый стек
struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Stack { items: Vec::new() }
    }

    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }

    fn peek(&self) -> Option<&T> {
        self.items.last()
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    fn len(&self) -> usize {
        self.items.len()
    }
}

// 13. Обобщённая пара с методами
struct Pair<T> {
    first: T,
    second: T,
}

impl<T> Pair<T> {
    fn new(first: T, second: T) -> Self {
        Pair { first, second }
    }

    fn swap(self) -> Pair<T> {
        Pair {
            first: self.second,
            second: self.first,
        }
    }
}

impl<T: std::fmt::Display> Pair<T> {
    fn display(&self) {
        println!("({}, {})", self.first, self.second);
    }
}

// 14. Обобщённая функция поиска
fn find<T: PartialEq>(slice: &[T], target: &T) -> Option<usize> {
    for (i, item) in slice.iter().enumerate() {
        if item == target {
            return Some(i);
        }
    }
    None
}
```

## Уровень 5: Мини-проекты

### Мини-проект 1: Система учёта задач (Task Manager)

```rust
#[derive(Debug, Clone)]
enum Status {
    Todo,
    InProgress,
    Done,
}

struct Task {
    id: u32,
    title: String,
    status: Status,
}

struct TaskManager {
    tasks: Vec<Task>,
    next_id: u32,
}

impl TaskManager {
    fn new() -> Self {
        TaskManager {
            tasks: Vec::new(),
            next_id: 1,
        }
    }

    fn add(&mut self, title: &str) -> u32 {
        let id = self.next_id;
        self.tasks.push(Task {
            id,
            title: title.to_string(),
            status: Status::Todo,
        });
        self.next_id += 1;
        id
    }

    fn set_status(&mut self, id: u32, status: Status) -> Result<(), String> {
        if let Some(task) = self.tasks.iter_mut().find(|t| t.id == id) {
            task.status = status;
            Ok(())
        } else {
            Err(format!("задача {id} не найдена"))
        }
    }

    fn list_by_status(&self, status: &Status) -> Vec<&Task> {
        self.tasks.iter().filter(|t| t.status == *status).collect()
    }

    fn remove(&mut self, id: u32) -> Result<Task, String> {
        if let Some(pos) = self.tasks.iter().position(|t| t.id == id) {
            Ok(self.tasks.remove(pos))
        } else {
            Err(format!("задача {id} не найдена"))
        }
    }
}

fn main() {
    let mut tm = TaskManager::new();
    let id1 = tm.add("Написать документацию");
    let id2 = tm.add("Реализовать API");
    tm.set_status(id1, Status::InProgress).unwrap();
    tm.set_status(id2, Status::Done).unwrap();

    println!("В работе:");
    for t in tm.list_by_status(&Status::InProgress) {
        println!("  [{}] {}", t.id, t.title);
    }

    println!("Завершённые:");
    for t in tm.list_by_status(&Status::Done) {
        println!("  [{}] {}", t.id, t.title);
    }
}
```

### Мини-проект 2: Калькулятор выражений (парсер)

```rust
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
            c if c.is_ascii_digit() || c == '.' => {
                let start = i;
                while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '.') {
                    i += 1;
                }
                let num: f64 = chars[start..i].iter().collect::<String>().parse().unwrap();
                tokens.push(Token::Num(num));
            }
            c => panic!("неизвестный символ: {c}"),
        }
    }
    tokens
}

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    fn new(input: &str) -> Parser {
        Parser { tokens: tokenize(input), pos: 0 }
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    fn next(&mut self) -> Option<Token> {
        let t = self.tokens.get(self.pos).cloned();
        self.pos += 1;
        t
    }

    // expr := term (('+' | '-') term)*
    fn parse_expr(&mut self) -> f64 {
        let mut left = self.parse_term();
        loop {
            match self.peek() {
                Some(Token::Plus) => {
                    self.next();
                    left += self.parse_term();
                }
                Some(Token::Minus) => {
                    self.next();
                    left -= self.parse_term();
                }
                _ => return left,
            }
        }
    }

    // term := factor (('*' | '/') factor)*
    fn parse_term(&mut self) -> f64 {
        let mut left = self.parse_factor();
        loop {
            match self.peek() {
                Some(Token::Star) => {
                    self.next();
                    left *= self.parse_factor();
                }
                Some(Token::Slash) => {
                    self.next();
                    let right = self.parse_factor();
                    if right == 0.0 {
                        panic!("деление на ноль");
                    }
                    left /= right;
                }
                _ => return left,
            }
        }
    }

    // factor := '(' expr ')' | num
    fn parse_factor(&mut self) -> f64 {
        match self.peek() {
            Some(Token::LParen) => {
                self.next();
                let result = self.parse_expr();
                assert!(matches!(self.next(), Some(Token::RParen)), "ожидалась ')'");
                result
            }
            Some(Token::Num(n)) => {
                self.next();
                *n
            }
            _ => panic!("неожиданный токен"),
        }
    }
}

fn eval(expr: &str) -> f64 {
    Parser::new(expr).parse_expr()
}

fn main() {
    assert_eq!(eval("2 + 3"), 5.0);
    assert_eq!(eval("2 + 3 * 4"), 14.0);
    assert_eq!(eval("(2 + 3) * 4"), 20.0);
    assert_eq!(eval("10 / 2"), 5.0);
    println!("Все тесты пройдены!");
}
```

### Мини-проект 3: Группировка и сортировка

```rust
#[derive(Debug, Clone)]
struct Student {
    name: String,
    grade: u8,
    score: f64,
}

fn main() {
    let students = vec![
        Student { name: "Аня".to_string(), grade: 10, score: 95.5 },
        Student { name: "Боря".to_string(), grade: 9, score: 88.0 },
        Student { name: "Витя".to_string(), grade: 10, score: 72.0 },
        Student { name: "Галя".to_string(), grade: 9, score: 91.5 },
        Student { name: "Дима".to_string(), grade: 10, score: 85.0 },
    ];

    // Группировка по классу
    let by_grade: std::collections::HashMap<u8, Vec<&Student>> = {
        let mut map = std::collections::HashMap::new();
        for s in &students {
            map.entry(s.grade).or_default().push(s);
        }
        map
    };

    for (grade, group) in &by_grade {
        println!("Класс {grade}:");
        let mut sorted: Vec<&&Student> = group.iter().collect();
        sorted.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        for s in sorted {
            println!("  {} — {:.1}", s.name, s.score);
        }
    }

    // Средний балл по классам
    for (grade, group) in &by_grade {
        let avg = group.iter().map(|s| s.score).sum::<f64>() / group.len() as f64;
        println!("Средний балл класса {grade}: {avg:.2}");
    }
}
```

## Ответы

1. `match self { North => South, East => West, ... }` — см. код выше
2. `to_fahrenheit: self.celsius * 9.0 / 5.0 + 32.0`, `from_fahrenheit: (f - 32.0) * 5.0 / 9.0`
3. `fn origin() -> Point { Point { x: 0.0, y: 0.0 } }`, `distance_to` через формулу расстояния
4. Проверка `is_empty()` → `None`, иначе `sum() / len() as f64`
5. `match op { Div => if b == 0.0 { None } else { Some(a/b) }, ... }`
6. `*freq.entry(c).or_insert(0) += 1`
7. `if a > b { a } else { b }` с bound'ом `T: PartialOrd`
8. `splitn(3, ' ')` + match по слайсу, `ok()?` для парсинга
9. `enum Shape` с `Circle`, `Rectangle`, `Triangle` + `area()` через match и формулу Герона
10. `Matrix` с `new` (валидация), `add`, `transpose` — см. код выше
11. `group_by` через `HashMap::entry().or_default()`
12. `Stack<T>` с `Vec<T>` внутри, обобщённые методы `push`, `pop`, `peek`
13. `Pair<T>` с `swap()`, `display()` с bound'ом `T: Display`
14. `find` через `enumerate()` + `PartialEq`