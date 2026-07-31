# Rust — Unit 1: Основы

Переменные, типы, функции, владение и заимствование, срезы, управляющие конструкции.

---

## Переменные

```rust
let x = 5;           // неизменяемая (по умолчанию)
let mut y = 10;      // изменяемая
y += 5;

// shadowing — переопределение имени
let n = 1;
let n = n + 1;       // n = 2
let n = "строка";    // можно менять тип

// константы
const MAX: u32 = 1000;
```

## Типы данных

```rust
// Целые: i8..i128, u8..u128, isize, usize
let a: i32 = -42;
let b: u64 = 4_000_000_000;
let c: u8 = 255;

// Числа с плавающей точкой
let pi: f64 = 3.14159;   // f64 — по умолчанию
let f: f32 = 1.5;

// bool, char
let flag: bool = true;
let letter: char = 'я';  // Unicode, 4 байта

// Кортежи
let point: (i32, i32) = (3, 4);
let (x, y) = point;          // деструктуризация
println!("{x} {y} {}", point.1);

// Массивы (фиксированный размер)
let arr = [1, 2, 3, 4, 5];
let zeros = [0; 3];          // [0, 0, 0]
println!("{}", arr[0]);
```

## Функции

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b            // последнее выражение — результат, без return
}

fn describe(n: i32) -> String {
    if n > 0 {
        format!("{n} положительное")
    } else {
        format!("{n} не положительное")
    }
}

fn main() {
    println!("{}", add(2, 3));       // 5
    println!("{}", describe(-7));
}
```

## Владение (Ownership)

Правила:
1. У каждого значения один владелец.
2. При выходе из области видимости владелец освобождает память.
3. Передача владения = move.

```rust
let s1 = String::from("hello");
let s2 = s1;            // s1 moved → больше недоступна
// println!("{s1}");    // ❌ ошибка компиляции

let a = 42;
let b = a;              // i32: Copy → копия, обе доступны
println!("{a} {b}");    // ✅

let s3 = s2.clone();    // явное глубокое копирование
println!("{s2} {s3}");
```

Передача в функцию:

```rust
fn take(s: String) -> usize {
    s.len()
}

fn main() {
    let text = String::from("abc");
    let n = take(text);    // владение ушло в take
    println!("{n}");
}
```

## Заимствование (Borrowing)

Ссылка `&` позволяет читать данные без перемещения; `&mut` — изменять.

```rust
fn length(s: &String) -> usize {
    s.len()
}

fn push_ex(s: &mut String) {
    s.push_str("!");
}

fn main() {
    let mut text = String::from("Rust");
    let len = length(&text);
    push_ex(&mut text);
    println!("{len} {text}");
}
```

Правила заимствования:
- одновременно либо много `&`, либо одна `&mut`;
- ссылки не могут пережить данные.

```rust
let mut s = String::from("x");
let r1 = &s;
let r2 = &s;
// let r3 = &mut s;    // ❌ пока живы r1, r2
println!("{r1} {r2}");

let r3 = &mut s;       // ✅ после последнего использования r1, r2
r3.push_str("yz");
println!("{r3}");
```

## Срезы (Slices)

```rust
fn main() {
    let s = String::from("hello world");
    let hello = &s[..5];        // "hello"
    let world = &s[6..];        // "world"

    let arr = [10, 20, 30, 40];
    let mid = &arr[1..3];       // [20, 30]

    println!("{hello} {world} {mid:?}");
}

// Функция, возвращающая первое слово
fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}

fn main2() {
    println!("{}", first_word("привет мир"));   // привет
}
```

## Управляющие конструкции

```rust
// if — выражение
let x = 7;
let kind = if x % 2 == 0 { "чётное" } else { "нечётное" };
println!("{kind}");

// loop с break-значением
let mut i = 0;
let sum = loop {
    i += 1;
    if i == 5 {
        break i * 2;        // 10
    }
};

// while
let mut n = 3;
while n > 0 {
    n -= 1;
}

// for по диапазону
for i in 0..3 {              // 0, 1, 2
    println!("{i}");
}
for i in 0..=3 {             // 0, 1, 2, 3
    println!("{i}");
}

// for по коллекции с индексом
let names = ["Аня", "Боря", "Витя"];
for (idx, name) in names.iter().enumerate() {
    println!("{idx}: {name}");
}

// break / continue
for i in 1..=10 {
    if i % 3 == 0 {
        continue;
    }
    if i > 8 {
        break;
    }
    print!("{i} ");          // 1 2 4 5 7 8
}

// match
let v = 5;
match v {
    0 => println!("ноль"),
    1..=3 => println!("мало"),
    4..=9 => println!("средне"),
    _ => println!("много"),
}
```

## Комбинированный пример

```rust
fn main() {
    let nums = vec![1, 2, 3, 4, 5, 6];
    let sum: i32 = nums
        .iter()
        .filter(|x| *x % 2 == 0)
        .map(|x| x * 10)
        .sum();
    println!("{sum}");       // 200 (2+4+6 → 20+40+60)
}
```

## Задачи

1. Напишите функцию `is_even`, проверяющую чётность.
2. Напишите функцию `factorial(n)` через цикл.
3. Реализуйте `swap` двух чисел через `std::mem::swap`.
4. Напишите программу FizzBuzz.
5. Реализуйте `first_word` без match — через `split_whitespace`.
6. Напишите функцию, возвращающую максимальный элемент `&[i32]` без коллекций стандартной библиотеки (через iter().max() нельзя — через цикл).

Ответы — в `practice.md`.
