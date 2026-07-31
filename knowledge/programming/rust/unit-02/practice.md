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
}
```

## Уровень 2: Средние

```rust
use std::collections::HashMap;

// 3. Среднее арифметическое как Option
fn average(v: &[f64]) -> Option<f64> {
    if v.is_empty() {
        return None;
    }
    Some(v.iter().sum::<f64>() / v.len() as f64)
}

// 4. Калькулятор через enum
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

// 5. Частоты символов
fn char_frequencies(s: &str) -> HashMap<char, u32> {
    let mut freq = HashMap::new();
    for c in s.chars() {
        *freq.entry(c).or_insert(0) += 1;
    }
    freq
}
```

## Уровень 3: С коллекциями

```rust
use std::collections::{HashMap, HashSet};

// 6. Уникальные значения с сохранением порядка
fn unique(v: Vec<i32>) -> Vec<i32> {
    let mut seen = HashSet::new();
    v.into_iter()
        .filter(|x| seen.insert(*x))
        .collect()
}

// 7. Группировка по первой букве
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

## Мини-проект: управление банковским счётом

```rust
#[derive(Debug, PartialEq)]
enum Transaction {
    Deposit(f64),
    Withdraw(f64),
}

struct Account {
    owner: String,
    balance: f64,
    history: Vec<Transaction>,
}

impl Account {
    fn new(owner: &str) -> Account {
        Account {
            owner: owner.to_string(),
            balance: 0.0,
            history: Vec::new(),
        }
    }

    fn deposit(&mut self, amount: f64) -> Result<(), String> {
        if amount <= 0.0 {
            return Err("сумма должна быть положительной".to_string());
        }
        self.balance += amount;
        self.history.push(Transaction::Deposit(amount));
        Ok(())
    }

    fn withdraw(&mut self, amount: f64) -> Result<(), String> {
        if amount <= 0.0 {
            return Err("сумма должна быть положительной".to_string());
        }
        if amount > self.balance {
            return Err("недостаточно средств".to_string());
        }
        self.balance -= amount;
        self.history.push(Transaction::Withdraw(amount));
        Ok(())
    }

    fn statement(&self) -> String {
        format!(
            "Владелец: {}\nБаланс: {:.2}\nОпераций: {}",
            self.owner,
            self.balance,
            self.history.len()
        )
    }
}

fn main() {
    let mut acc = Account::new("Алиса");
    acc.deposit(1000.0).unwrap();
    acc.withdraw(250.0).unwrap();
    assert_eq!(acc.withdraw(9999.0), Err("недостаточно средств".to_string()));
    println!("{}", acc.statement());
}
```

## Ответы

1. `match self { ... }` с возвратом противоположного варианта (см. код)
2. `to_fahrenheit: self.celsius * 9.0 / 5.0 + 32.0`
3. Проверка `is_empty()` → `None`, иначе `sum() / len() as f64`
4. `match op { Div => if b == 0.0 { None } else { Some(a/b) }, ... }`
5. `*freq.entry(c).or_insert(0) += 1`
6. `filter(|x| seen.insert(*x)).collect()` — HashSet «запоминает» первые вхождения
7. `entry(first).or_default().push(...)` через `if let Some(first) = w.chars().next()`
