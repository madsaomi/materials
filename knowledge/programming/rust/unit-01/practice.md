# Rust — Unit 1: Задачи

## Уровень 1: Лёгкие

```rust
// 1. Чётность
fn is_even(n: i32) -> bool {
    n % 2 == 0
}

// 2. Факториал (через цикл)
fn factorial(n: u64) -> u64 {
    let mut result = 1;
    for i in 2..=n {
        result *= i;
    }
    result
}

// 3. Сумма квадратов от 1 до n
fn sum_of_squares(n: i32) -> i32 {
    (1..=n).map(|x| x * x).sum()
}
```

## Уровень 2: Средние

```rust
// 4. FizzBuzz
fn fizzbuzz() {
    for i in 1..=100 {
        match (i % 3, i % 5) {
            (0, 0) => println!("FizzBuzz"),
            (0, _) => println!("Fizz"),
            (_, 0) => println!("Buzz"),
            _ => println!("{i}"),
        }
    }
}

// 5. Первое слово без match (через split_whitespace)
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or(s)
}

// 6. Максимум в срезе (без библиотечных методов)
fn max_of(slice: &[i32]) -> Option<i32> {
    let mut iter = slice.iter();
    let first = iter.next()?;
    let mut max = *first;
    for &x in iter {
        if x > max {
            max = x;
        }
    }
    Some(max)
}
```

## Уровень 3: Владение и заимствование

```rust
// 7. Возврат владения
fn take_and_return(s: String) -> String {
    s
}

// 8. Изменение через &mut
fn append_suffix(s: &mut String, suffix: &str) {
    s.push_str(suffix);
}

// 9. Реверс среза (заимствование)
fn reverse_slice(slice: &mut [i32]) {
    let mut i = 0;
    let mut j = slice.len() - 1;
    while i < j {
        slice.swap(i, j);
        i += 1;
        j -= 1;
    }
}
```

## Мини-проект: таблица умножения

```rust
fn main() {
    for i in 1..=9 {
        let row: Vec<String> = (1..=9).map(|j| format!("{:3}", i * j)).collect();
        println!("{}", row.join(" "));
    }
}
```

## Ответы

1. `fn is_even(n: i32) -> bool { n % 2 == 0 }`
2. Цикл от 2 до n с умножением (см. код выше)
3. `(1..=n).map(|x| x * x).sum()`
4. `match (i % 3, i % 5) { (0,0) => "FizzBuzz", (0,_) => "Fizz", (_,0) => "Buzz", _ => i }`
5. `s.split_whitespace().next().unwrap_or(s)`
6. Итерация с запоминанием максимума через `?` для `Option`
7. `fn take_and_return(s: String) -> String { s }`
8. `fn append_suffix(s: &mut String, suffix: &str) { s.push_str(suffix); }`
9. `while i < j { slice.swap(i, j); i += 1; j -= 1; }`
