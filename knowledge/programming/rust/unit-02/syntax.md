# Rust — Unit 2: Структуры и перечисления

struct, enum, Option/Result, match, impl, методы, коллекции (Vec, HashMap, HashSet), derive, generics.

---

## Структуры (struct)

### Named-структуры

```rust
struct User {
    name: String,
    age: u8,
    active: bool,
}

fn main() {
    let mut u = User {
        name: String::from("Alice"),
        age: 30,
        active: true,
    };
    u.age = 31;

    let u2 = User {
        name: String::from("Bob"),
        ..u                    // остальные поля скопированы из u (move)
    };
    println!("{} {} {}", u2.name, u2.age, u2.active);
}
```

### Tuple-структуры

```rust
// Tuple-структура — поля без имён, доступ по индексу
struct Point(i32, i32);
struct Color(u8, u8, u8);
struct Pair<T, U>(T, U);   // обобщённая tuple-структура

fn main() {
    let origin = Point(0, 0);
    println!("{} {}", origin.0, origin.1);  // 0 0

    let red = Color(255, 0, 0);
    println!("{:?}", red);  // ❌ без Debug — нужен #[derive(Debug)]

    // Tuple-структуры с derive
    #[derive(Debug)]
    struct Color(u8, u8, u8);
    let red = Color(255, 0, 0);
    println!("{:?}", red);  // Color(255, 0, 0)
}
```

### Unit-структуры

```rust
// Unit-структура — без полей, как «пустой тип»
struct Unit;

// Используется как маркер, флаг, или для реализации трейтов
impl Unit {
    fn describe(&self) -> &'static str {
        "это unit-структура"
    }
}

fn main() {
    let u = Unit;
    println!("{}", u.describe());
}
```

### Производные трейты (derive)

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 1, y: 2 };
    println!("{p:?}");                // Debug: Point { x: 1, y: 2 }
    let q = p.clone();                // Clone
    assert_eq!(p, q);                 // PartialEq
    let mut set = std::collections::HashSet::new();
    set.insert(p);                    // Hash
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

### Структуры с lifetime

```rust
struct Book<'a> {
    title: &'a str,
    pages: usize,
}

fn make_book<'a>(t: &'a str) -> Book<'a> {
    Book { title: t, pages: 100 }
}

fn main() {
    let title = String::from("Rust Programming");
    let book = make_book(&title);
    println!("{} — {} страниц", book.title, book.pages);
}
```

---

## Перечисления (enum)

### Базовые enum

```rust
enum Status {
    Active,
    Inactive,
}

enum Shape {
    Circle(f64),                     // вариант с данными (tuple variant)
    Rectangle { width: f64, height: f64 },  // именованные поля (struct variant)
    Line,                            // без данных (unit variant)
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * *r * *r,
        Shape::Rectangle { width, height } => *width * *height,
        Shape::Line => 0.0,
    }
}
```

### Enum с derive

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
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

fn main() {
    let d = Direction::North;
    println!("{:?}", d.opposite());  // South
    println!("{:?}", d.turn_right()); // East
}
```

### Enum как дерево (AST)

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
    // 2 + 3 * 4 = 14
    let expr = Expr::Add(
        Box::new(Expr::Num(2.0)),
        Box::new(Expr::Mul(
            Box::new(Expr::Num(3.0)),
            Box::new(Expr::Num(4.0)),
        )),
    );
    println!("{}", expr.eval());  // 14
}
```

### Enum с данными и методами

```rust
#[derive(Debug)]
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

impl Message {
    fn call(&self) {
        match self {
            Message::Quit => println!("Quit"),
            Message::Move { x, y } => println!("Move to ({x}, {y})"),
            Message::Write(text) => println!("Write: {text}"),
            Message::ChangeColor(r, g, b) => println!("Color: ({r}, {g}, {b})"),
        }
    }
}

fn main() {
    let msg = Message::Move { x: 10, y: 20 };
    msg.call();
}
```

---

## Option и Result в деталях

### Option — все методы

```rust
let some: Option<i32> = Some(42);
let none: Option<i32> = None;

// Основные методы
some.unwrap();                    // 42
some.unwrap_or(0);               // 42
some.unwrap_or_else(|| 0);       // 42
none.unwrap_or(0);               // 0
none.unwrap_or_else(|| 42);      // 42

// map — применить функцию к содержимому (если Some)
let doubled = some.map(|x| x * 2);     // Some(84)
let none_doubled = none.map(|x| x * 2); // None

// map_or — вернуть значение по умолчанию или преобразованное
let val = some.map_or(0, |x| x * 2);   // 84
let none_val = none.map_or(0, |x| x * 2); // 0

// map_or_else — вычислить дефолт через замыкание
let val = none.map_or_else(|| 42, |x| x * 2); // 42

// and — если Some, применить функцию, возвращающую Option
let result = Some(42).and(Some(100));   // Some(100)
let result = Some(42).and(None::<i32); // None

// and_then — flatMap: если Some, применить функцию, возвращающую Option
let result = Some(42).and_then(|x| Some(x * 2));  // Some(84)
let result = Some(42).and_then(|_| None::<i32>);  // None

// or — если None, вернуть другой Option
let result = none.or(Some(10));       // Some(10)
let result = some.or(Some(100));      // Some(42)

// or_else — если None, вычислить через замыкание
let result = none.or_else(|| Some(42));  // Some(42)
let result = some.or_else(|| Some(100)); // Some(42)

// filter — оставить только если предикат истинен
let result = Some(42).filter(|&x| x > 10);  // Some(42)
let result = Some(5).filter(|&x| x > 10);   // None
let result = none.filter(|&x| x > 10);       // None

// is_some / is_none
assert!(some.is_some());
assert!(none.is_none());

// unwrap_or_default — вернуть дефолт (для типов с Default)
let val: Option<String> = None;
let s = val.unwrap_or_default();  // "" (пустая строка)
```

### Result — все методы

```rust
fn parse_int(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse()
}

// unwrap / expect
let x: i32 = parse_int("42").unwrap();       // 42
let x: i32 = parse_int("abc").expect("не число");  // panic с сообщением

// unwrap_or / unwrap_or_else
let val = parse_int("abc").unwrap_or(0);            // 0
let val = parse_int("abc").unwrap_or_else(|e| {
    println!("ошибка: {e}");
    -1
});  // -1

// map — применить к Ok-значению
let doubled = parse_int("42").map(|x| x * 2);  // Ok(84)
let err = parse_int("abc").map(|x| x * 2);     // Err(...)

// map_err — применить к Err-значению
let result = parse_int("abc").map_err(|e| format!("parse error: {e}"));

// and — если Ok, выполнить следующую операцию
let result = parse_int("42").and(parse_int("10"));  // Ok(10)
let result = parse_int("abc").and(parse_int("10")); // Err(...)

// and_then — flatMap для Result
let result = parse_int("42").and_then(|x| parse_int(&x.to_string()));  // Ok(42)

// or — если Err, попробовать другой
let result = parse_int("abc").or(parse_int("10"));  // Ok(10)

// or_else — если Err, вычислить через замыкание
let result = parse_int("abc").or_else(|_| parse_int("10"));  // Ok(10)

// is_ok / is_err
assert!(parse_int("42").is_ok());
assert!(parse_int("abc").is_err());

// ? оператор — проброс ошибки наверх
fn read_and_parse(path: &str) -> Result<i32, std::num::ParseIntError> {
    let content = std::fs::read_to_string(path)?;  // ? пробрасывает io::Error
    content.trim().parse()
}
```

### Преобразование между Option и Result

```rust
// Option → Result
let opt: Option<i32> = Some(42);
let res: Result<i32, &str> = opt.ok_or("не найдено");  // Ok(42)
let none: Option<i32> = None;
let res = none.ok_or("не найдено");  // Err("не найдено")

// Result → Option
let res: Result<i32, &str> = Ok(42);
let opt = res.ok();   // Some(42)
let res: Result<i32, &str> = Err("ошибка");
let opt = res.ok();   // None

// unwrap_or_else с Option
let opt: Option<&str> = None;
let s = opt.unwrap_or_else(|| "default");  // "default"
```

### Паттерн `?` с пользовательскими ошибками

```rust
use std::fmt;

#[derive(Debug)]
enum AppError {
    Io(std::io::Error),
    Parse(std::num::ParseIntError),
    Custom(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Io(e) => write!(f, "IO error: {e}"),
            AppError::Parse(e) => write!(f, "Parse error: {e}"),
            AppError::Custom(s) => write!(f, "Custom error: {s}"),
        }
    }
}

impl std::error::Error for AppError {}

// Реализуем From для автоматического преобразования через ?
impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e)
    }
}

impl From<std::num::ParseIntError> for AppError {
    fn from(e: std::num::ParseIntError) -> Self {
        AppError::Parse(e)
    }
}

fn read_number(path: &str) -> Result<i32, AppError> {
    let content = std::fs::read_to_string(path)?;  // io::Error → AppError::Io
    content.trim().parse::<i32>()?;                // ParseIntError → AppError::Parse
    Ok(0)
}
```

---

## match — сопоставление с образцом в глубину

### Все виды паттернов

```rust
// Литералы
match n {
    0 => "ноль",
    1 => "один",
    _ => "другое",
}

// Диапазоны
match n {
    0..=9 => "однозначное",
    10..=99 => "двузначное",
    _ => "много",
}

// OR-паттерн (|)
match n {
    1 | 2 | 3 => "маленькое",
    _ => "большое",
}

// Переменные (привязка)
match opt {
    Some(value) => println!("значение: {value}"),
    None => println!("нет значения"),
}

// Деструктуризация структур
match point {
    Point { x, y } => println!("x={x}, y={y}"),
}

// Деструктуризация с игнорированием (..)
match point {
    Point { x, .. } => println!("x={x}"),
}

// Ссылки в паттернах
match &value {
    Some(v) => println!("{v}"),
    None => println!("нет"),
}

// @-привязка (привязать значение к имени)
match s {
    "" => println!("пустая строка"),
    other @ "quit" | other @ "exit" => println!("команда: {other}"),
    other => println!("текст: {other}"),
}

// if-let guard
match n {
    x if x < 0 => println!("отрицательное"),
    0 => println!("ноль"),
    x if x % 2 == 0 => println!("чётное"),
    _ => println!("нечётное"),
}

// Деструктуризация enum с данными
match msg {
    Message::Quit => println!("Quit"),
    Message::Move { x, y } => println!("Move to ({x}, {y})"),
    Message::Write(text) => println!("Write: {text}"),
    Message::ChangeColor(r, g, b) => println!("Color: ({r}, {g}, {b})"),
}

// match как выражение (возвращает значение)
let description = match n {
    0 => "ноль",
    1..=9 => "однозначное",
    10..=99 => "двузначное",
    _ => "большое",
};
```

### match с Option и Result

```rust
// match с Option
let opt: Option<i32> = Some(42);
match opt {
    Some(v) => println!("значение: {v}"),
    None => println!("нет значения"),
}

// match с Result
match parse_int("42") {
    Ok(v) => println!("число: {v}"),
    Err(e) => println!("ошибка: {e}"),
}

// Вложенный match
let opt_result: Result<Option<i32>, &str> = Ok(Some(42));
match opt_result {
    Ok(Some(v)) => println!("OK с значением: {v}"),
    Ok(None) => println!("OK, но None"),
    Err(e) => println!("Ошибка: {e}"),
}
```

---

## Методы (impl)

### Базовые методы

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    // Метод — первый аргумент &self (неизменяемое заимствование)
    fn area(&self) -> f64 {
        self.width * self.height
    }

    // Метод с &mut self (изменяемое заимствование)
    fn scale(&mut self, k: f64) {
        self.width *= k;
        self.height *= k;
    }

    // Метод с self (перемещение)
    fn consume(self) -> String {
        format!("Rectangle({}, {})", self.width, self.height)
    }

    // Ассоциированная функция (конструктор) — без self
    fn square(side: f64) -> Rectangle {
        Rectangle { width: side, height: side }
    }

    // Ассоциированная функция с обобщением
    fn zero<T: Default>() -> Rectangle
    where
        T: Into<f64>,
    {
        Rectangle {
            width: T::default().into(),
            height: T::default().into(),
        }
    }

    // Связанный метод — доступен только для конкретного типа
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width >= other.width && self.height >= other.height
    }
}

fn main() {
    let mut r = Rectangle { width: 3.0, height: 4.0 };
    println!("{}", r.area());            // 12
    r.scale(2.0);
    println!("{}", r.area());            // 48

    let sq = Rectangle::square(5.0);     // конструктор через ::
    println!("{}", sq.area());           // 25

    println!("{}", r.can_hold(&sq));     // false
}
```

### Несколько impl-блоков

```rust
struct Point {
    x: f64,
    y: f64,
}

// Общие методы
impl Point {
    fn origin() -> Point {
        Point { x: 0.0, y: 0.0 }
    }

    fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
}

// Методы только для Point с f64 координатами
impl Point {
    fn quadrant(&self) -> Option<u32> {
        match (self.x.signum(), self.y.signum()) {
            (1.0, 1.0) => Some(1),
            (-1.0, 1.0) => Some(2),
            (-1.0, -1.0) => Some(3),
            (1.0, -1.0) => Some(4),
            _ => None,  // на оси
        }
    }
}
```

### Обобщённые impl-блоки

```rust
struct Container<T> {
    items: Vec<T>,
}

impl<T> Container<T> {
    fn new() -> Self {
        Container { items: Vec::new() }
    }

    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    fn len(&self) -> usize {
        self.items.len()
    }
}

// Специализация для T: Display
impl<T: std::fmt::Display> Container<T> {
    fn print_all(&self) {
        for item in &self.items {
            println!("{item}");
        }
    }
}

// Специализация для T: Default
impl<T: Default> Container<T> {
    fn with_default(size: usize) -> Self {
        Container {
            items: vec![T::default(); size],
        }
    }
}
```

---

## Коллекции

### Vec<T> — расширенный обзор

```rust
fn main() {
    let mut v: Vec<i32> = Vec::new();
    v.push(1);
    v.push(2);
    v.push(3);

    let v2 = vec![10, 20, 30];     // макрос

    // Безопасный доступ
    println!("{}", v2[0]);             // 10 — паникует при выходе за границы
    println!("{:?}", v2.get(5));       // None — безопасный доступ
    println!("{}", v2.first().unwrap()); // 10
    println!("{}", v2.last().unwrap());  // 30

    // Итерация
    for x in &v2 {                    // по ссылкам
        println!("{x}");
    }
    for x in &mut v {                 // по изменяемым ссылкам
        *x *= 2;
    }
    // for x in v { } — с перемещением, v больше недоступен

    // Модификация
    v2.sort();                        // сортировка на месте
    v2.sort_by(|a, b| b.cmp(a));     // по убыванию
    v2.sort_by_key(|x| x.abs());     // по ключу
    v2.dedup();                       // убрать дубликаты (после sort)
    v2.retain(|x| x % 2 == 0);      // оставить чётные
    v2.reverse();                     // разворот
    v2.clear();                       // очистить

    // Вставка и удаление
    v2.insert(0, 100);               // вставить по индексу
    let removed = v2.remove(0);      // убрать по индексу
    let popped = v2.pop();           // убрать последний

    // Преобразования
    let doubled: Vec<i32> = v2.iter().map(|x| x * 2).collect();
    let sum: i32 = v2.iter().sum();
    let filtered: Vec<i32> = v2.into_iter().filter(|x| *x > 2).collect();

    // Разбиение
    let (left, right) = v2.split_at(2);  // (&[10, 20], &[30])

    // Слияние
    let mut a = vec![1, 2, 3];
    let b = vec![4, 5, 6];
    a.extend(b);
    // a = [1, 2, 3, 4, 5, 6]

    // Извлечение части
    let slice = &v2[1..3];  // &[20, 30]
}
```

### HashMap<K, V> — расширенный обзор

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert(String::from("Alice"), 10);
    scores.insert(String::from("Bob"), 25);

    // Вставка (возвращает предыдущее значение, если было)
    let old = scores.insert(String::from("Alice"), 100);
    assert_eq!(old, Some(10));  // Alice была 10, теперь 100

    // entry API — «вставить, если отсутствует»
    scores.entry(String::from("Carol")).or_insert(0);
    scores.entry(String::from("Alice")).or_insert(50);  // не перезапишет: 100 остаётся

    // or_insert_with — ленивое вычисление дефолта
    scores.entry(String::from("Dave")).or_insert_with(|| {
        42  // вычисляется только если ключ отсутствует
    });

    // Получение
    scores.get("Alice");                       // Some(&100)
    scores.get("Mallory");                     // None
    scores.contains_key("Bob");                // true
    scores.remove("Bob");                      // Some(25)

    // Итерация
    for (name, score) in &scores {
        println!("{name}: {score}");
    }

    // Подсчёт слов
    let text = "a b a c a b";
    let mut counts: HashMap<&str, u32> = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }
    println!("{counts:?}");   // {"a": 3, "b": 2, "c": 1}

    // Объединение двух HashMap
    let mut a = HashMap::new();
    a.insert("x", 1);
    let mut b = HashMap::new();
    b.insert("y", 2);
    a.extend(b);
    // a = {"x": 1, "y": 2}
}
```

### HashSet<T> — расширенный обзор

```rust
use std::collections::HashSet;

fn main() {
    let mut seen = HashSet::new();
    seen.insert(1);
    seen.insert(2);
    seen.insert(1);              // не добавится (уже есть)

    seen.contains(&2);           // true
    seen.len();                  // 2

    let a: HashSet<_> = [1, 2, 3].into_iter().collect();
    let b: HashSet<_> = [2, 3, 4].into_iter().collect();

    // Множественные операции
    let union: HashSet<_> = a.union(&b).copied().collect();         // {1,2,3,4}
    let inter: HashSet<_> = a.intersection(&b).copied().collect();  // {2,3}
    let diff: HashSet<_> = a.difference(&b).copied().collect();     // {1}
    let sym_diff: HashSet<_> = a.symmetric_difference(&b).copied().collect(); // {1,4}

    // Проверка подмножества
    let sub: HashSet<_> = [1, 2].into_iter().collect();
    println!("{}", a.is_superset(&sub));  // true
}
```

---

## Комбинированный пример

```rust
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
enum Role {
    Admin,
    User,
    Guest,
}

#[derive(Debug)]
struct Person {
    name: String,
    age: u8,
    role: Role,
}

impl Person {
    fn new(name: &str, age: u8, role: Role) -> Person {
        Person {
            name: name.to_string(),
            age,
            role,
        }
    }

    fn is_adult(&self) -> bool {
        self.age >= 18
    }

    fn promote(&mut self) {
        self.role = Role::Admin;
    }
}

fn main() {
    let mut people = vec![
        Person::new("Аня", 20, Role::User),
        Person::new("Боря", 16, Role::User),
        Person::new("Витя", 30, Role::Guest),
    ];

    for p in &people {
        println!("{}: {}", p.name, if p.is_adult() { "взрослый" } else { "несовершеннолетний" });
    }

    people[0].promote();
    println!("{:?}", people[0].role);  // Admin

    // Группировка по ролям через HashMap
    let mut by_role: HashMap<Role, Vec<String>> = HashMap::new();
    for p in &people {
        by_role.entry(p.role.clone()).or_default().push(p.name.clone());
    }
    println!("{by_role:?}");
}
```

---

## Задачи

1. Определите `enum Direction { North, East, South, West }` и функцию, возвращающую противоположное направление.
2. Реализуйте `struct Temperature` с методами `to_fahrenheit` и `to_celsius`.
3. Напишите функцию, возвращающую среднее арифметическое `Vec<f64>` как `Option<f64>` (None для пустого).
4. Реализуйте `enum Operation { Add, Sub, Mul, Div }` и функцию `apply(op, a, b) -> Option<f64>` (None при делении на 0).
5. Напишите функцию, возвращающую `HashMap<char, u32>` — частоты символов строки.
6. Реализуйте `fn unique(vec: Vec<i32>) -> Vec<i32>` через HashSet, сохраняя порядок появления.
7. Определите `enum Shape { Circle(f64), Rectangle(f64, f64), Triangle(f64, f64, f64) }` и реализуйте метод `area()` через `impl Shape`.
8. Реализуйте `struct Point` с методом `distance_to(&self, other: &Point) -> f64`.
9. Напишите обобщённую функцию `max_of<T: PartialOrd>(a: T, b: T) -> T`.
10. Реализуйте `fn parse_command(input: &str) -> Option<Command>`, где `Command` — ваш enum.
11. Создайте `struct Matrix(Vec<Vec<i32>>)` с методами `add`, `transpose`, `multiply`.
12. Реализуйте `fn group_by<T, F>(items: Vec<T>, key_fn: F) -> HashMap<String, Vec<T>>`, где `F: Fn(&T) -> String`.

Ответы — в `practice.md`.
