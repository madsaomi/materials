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

fn total_area(shapes: &[&dyn Area]) -> f64 {
    shapes.iter().map(|s| s.area()).sum()
}
```

## Уровень 2: Средние

```rust
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
mod tests {
    use super::*;

    #[test]
    fn test_fib() {
        assert_eq!(fib(0), 0);
        assert_eq!(fib(1), 1);
        assert_eq!(fib(10), 55);
    }
}
```

## Уровень 3: Конкурентность

```rust
// 6. Счётчик из 10 потоков по 100 инкрементов
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
```

## Мини-проект: параллельное вычисление суммы

```rust
use std::sync::mpsc;
use std::thread;

fn parallel_sum(chunk_size: usize) -> u64 {
    let data: Vec<u64> = (1..=1_000_000u64).collect();
    let chunks: Vec<Vec<u64>> = data.chunks(chunk_size).map(|c| c.to_vec()).collect();

    let (tx, rx) = mpsc::channel();
    let mut handles = Vec::new();

    for chunk in chunks {
        let tx = tx.clone();
        handles.push(thread::spawn(move || {
            tx.send(chunk.iter().sum::<u64>()).unwrap();
        }));
    }
    drop(tx);

    let total: u64 = rx.iter().sum();
    for h in handles {
        h.join().unwrap();
    }
    total     // 500000500000
}

fn main() {
    println!("{}", parallel_sum(100_000));
}
```

## Ответы

1. Проверка `x < 0.0` → `Err`, иначе `Ok(x.sqrt())`
2. `impl Area for Circle { fn area(&self) -> f64 { PI * r * r } }`; сумма через `&[&dyn Area]`
3. `if a > b { a } else { b }` с bound'ом `T: PartialOrd + Copy`
4. Продюсер шлёт `1..=10`, `rx.iter().sum()` — канал сам доставляет все значения
5. Рекурсия с базовыми случаями `0` и `1`; тест `assert_eq!(fib(10), 55)`
6. `Arc<Mutex<u64>>` + 10 потоков × 100 инкрементов = 1000
