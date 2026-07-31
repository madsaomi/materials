# Rust — Unit 2: Структуры и перечисления

struct, enum, Option/Result, match, impl, методы, коллекции (Vec, HashMap, HashSet).

---

## Структуры (struct)

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
        ..u                    // остальные поля скопированы из u
    };
    println!("{} {} {}", u2.name, u2.age, u2.active);
}
```

Tuple-структуры:

```rust
struct Point(i32, i32);

fn main() {
    let p = Point(3, 4);
    println!("{} {}", p.0, p.1);
}
```

## Перечисления (enum)

```rust
enum Status {
    Active,
    Inactive,
}

enum Shape {
    Circle(f64),
    Rectangle { width: f64, height: f64 },
    Line,
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * *r * *r,
        Shape::Rectangle { width, height } => *width * *height,
        Shape::Line => 0.0,
    }
}
```

## Option и Result

```rust
fn divide(n: f64, d: f64) -> Option<f64> {
    if d == 0.0 {
        None
    } else {
        Some(n / d)
    }
}

fn parse_int(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse()
}

fn main() {
    let a = divide(10.0, 2.0);        // Some(5.0)
    let b = divide(1.0, 0.0);         // None

    // Удобные методы Option/Result
    println!("{}", a.unwrap_or(0.0));          // 5
    println!("{}", b.unwrap_or(0.0));          // 0

    let n: i32 = "42".parse().unwrap();        // 42
    let ok = n.checked_add(10);                // Some(52)
    let overflow = i32::MAX.checked_add(1);    // None (без panic)

    // Обработка через match
    match parse_int("abc") {
        Ok(v) => println!("число: {v}"),
        Err(e) => println!("ошибка: {e}"),
    }
}
```

## match — сопоставление с образцом

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}

// match — выражение, must be exhaustive
fn describe(n: i32) -> &'static str {
    match n {
        0 => "ноль",
        1..=9 => "однозначное",
        10..=99 => "двузначное",
        _ if n < 0 => "отрицательное",
        _ => "большое",
    }
}
```

Паттерны: литералы, диапазоны `1..=9`, `|` (или), `_` (любое), переменные, `ref`, `if`-guard, деструктуризация.

## Методы (impl)

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    // метод — первый аргумент self (в любом виде)
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        2.0 * (self.width + self.height)
    }

    fn scale(&mut self, k: f64) {
        self.width *= k;
        self.height *= k;
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width >= other.width && self.height >= other.height
    }

    // ассоциированная функция (конструктор) — без self
    fn square(side: f64) -> Rectangle {
        Rectangle { width: side, height: side }
    }
}

fn main() {
    let mut rect = Rectangle { width: 3.0, height: 4.0 };
    println!("{}", rect.area());            // 12
    rect.scale(2.0);
    println!("{}", rect.perimeter());       // 28

    let sq = Rectangle::square(5.0);        // конструктор через ::
    println!("{}", rect.can_hold(&sq));     // false
}
```

## Коллекции

### Vec\<T>

```rust
fn main() {
    let mut v = Vec::new();
    v.push(1);
    v.push(2);
    v.push(3);

    let v2 = vec![10, 20, 30];     // макрос

    println!("{}", v2[0]);         // 10 — паникует при выходе за границы
    println!("{:?}", v2.get(5));   // None — безопасно

    v2.first();                    // Option<&i32>
    v2.last();
    v2.iter().rev();               // обратная итерация
    v2.len();
    v2.is_empty();

    let mut nums = vec![3, 1, 2];
    nums.sort();
    nums.dedup();                  // убрать дубликаты (после sort)
    nums.retain(|x| x % 2 == 1);   // оставить нечётные

    // Итерация
    for x in &v2 {
        println!("{x}");
    }
    for x in &mut v {
        *x *= 2;
    }
    // for x in v { } — с перемещением, v больше недоступен

    // Отображение
    let doubled: Vec<i32> = v2.iter().map(|x| x * 2).collect();
}
```

### HashMap\<K, V>

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert("Alice".to_string(), 10);
    scores.insert("Bob".to_string(), 25);

    // entry API — «вставить, если отсутствует»
    scores.entry("Carol".to_string()).or_insert(0);
    scores.entry("Bob".to_string()).or_insert(100);   // не перезапишет: 25 остаётся

    for (name, score) in &scores {
        println!("{name}: {score}");
    }

    // Подсчёт символов
    let text = "apple banana apple";
    let mut counts: HashMap<&str, u32> = HashMap::new();
    for word in text.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }
    println!("{:?}", counts);   // {"apple": 2, "banana": 1}
}
```

### HashSet\<T>

```rust
use std::collections::HashSet;

fn main() {
    let mut seen = HashSet::new();
    seen.insert(1);
    seen.insert(2);
    seen.insert(1);              // уже есть — игнор

    println!("{}", seen.contains(&2));   // true

    let a: HashSet<_> = [1, 2, 3].into_iter().collect();
    let b: HashSet<_> = [2, 3, 4].into_iter().collect();

    let union: HashSet<_> = a.union(&b).copied().collect();         // {1,2,3,4}
    let intersection: HashSet<_> = a.intersection(&b).copied().collect(); // {2,3}
    let difference: HashSet<_> = a.difference(&b).copied().collect();     // {1}
}
```

## Комбинированный пример

```rust
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
enum Role {
    Admin,
    User,
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
    ];

    for p in &people {
        println!("{}: {}", p.name, if p.is_adult() { "взрослый" } else { "несовершеннолетний" });
    }

    people[0].promote();
    println!("{:?}", people[0].role);

    // Группировка по ролям через HashMap
    let mut by_role: HashMap<Role, Vec<String>> = HashMap::new();
    for p in &people {
        by_role.entry(p.role.clone()).or_default().push(p.name.clone());
    }
    println!("{by_role:?}");
}
```

## Задачи

1. Определите `enum Direction { North, East, South, West }` и функцию, возвращающую противоположное направление.
2. Реализуйте `struct Temperature` с методами `to_fahrenheit` и `to_celsius`.
3. Напишите функцию, возвращающую среднее арифметическое `Vec<f64>` как `Option<f64>` (None для пустого).
4. Реализуйте `enum Operation { Add, Sub, Mul, Div }` и функцию `apply(op, a, b) -> Option<f64>` (None при делении на 0).
5. Напишите функцию, возвращающую `HashMap<char, u32>` — частоты символов строки.
6. Реализуйте `fn unique(vec: Vec<i32>) -> Vec<i32>` через HashSet, сохраняя порядок появления.

Ответы — в `practice.md`.
