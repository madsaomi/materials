# Rust — Unit 1: Основы

Переменные, типы, функции, владение и заимствование, срезы, управляющие конструкции, замыкания.

---

## Переменные

```rust
let x = 5;           // неизменяемая (immutable по умолчанию)
let mut y = 10;    // изменяемая
y += 5;

// shadowing — переопределение имени
let n = 1;
let n = n + 1;       // n = 2 (новая переменная)
let n = "строка";    // можно менять тип (shadowing)

// константы
const MAX: u32 = 1000;
const PI: f64 = 3.14159;

// static — глобальная переменная с временем жизни 'static
static GREETING: &str = "Hello, world!";
static mut COUNTER: u32 = 0;  // мутабельная статическая — только в unsafe
```

Ключевые отличия `let` + shadowing от `mut`:

- `mut` — изменение значения той же переменной в памяти;
- shadowing — создание новой переменной с тем же именем (можно менять тип, преобразовывать значение).

Shadowing полезен для преобразования типов:

```rust
let spaces = "   ";
let spaces = spaces.len();  // теперь spaces — usize, а не &str
```

---

## Типы данных

### Целые числа

| Тип | Разрядность | Диапазон |
|-----|------------|----------|
| `i8`/`u8` | 8 | −128..127 / 0..255 |
| `i16`/`u16` | 16 | ±32 768 / 65 535 |
| `i32`/`u32` | 32 | ±2,1 млрд / 4,3 млрд |
| `i64`/`u64` | 64 | ±9,2×10¹⁸ |
| `i128`/`u128` | 128 | огромные |
| `isize`/`usize` | 32/64 | зависит от платформы |

```rust
let a: i8 = -128;
let b: u128 = 340_282_366_920_938_463_463_374_607_431_768_211_455;
let c: usize = 10;        // размер индекса массива
let hex = 0xFF;             // 255
let bin = 0b1010;           // 10
let oct = 0o17;             // 15
let underscores = 1_000_000; // читаемость
```

### Числа с плавающей точкой

```rust
let pi: f64 = 3.14159;    // f64 — по умолчанию (64 бита)
let f: f32 = 2.5;          // f32 (32 бита)

// Специальные значения
let infinity = f64::INFINITY;
let neg_infinity = f64::NEG_INFINITY;
let nan = f64::NAN;              // Not a Number
let max_f64 = f64::MAX;          // 1.7976931348623157e+308
let min_f64 = f64::MIN;          // 2.2250738585072014e-308

// Операции
let sum = 1.5 + 2.3;
let diff = 5.0 - 1.2;
let prod = 3.0 * 4.0;
let quot = 10.0 / 3.0;       // 3.333...
let rem = 10.0 % 3.0;        // 1.0 (остаток)

// Порядок операций как в математике
let result = 2.0 + 3.0 * 4.0;  // 14.0 (умножение раньше)
let result2 = (2.0 + 3.0) * 4.0; // 20.0
```

### bool и char

```rust
let flag: bool = true;
let letter: char = 'я';    // Unicode-символ, 4 байта (UTF-32)
let emoji: char = '😀';    // тоже char, 4 байта

// bool — только true/false
let is_active = !flag;     // false
let both_true = flag && is_active;  // false
let either = flag || is_active;     // true

// Сравнение возвращает bool
let eq = 5 == 5;      // true
let neq = 5 != 3;     // true
let gt = 5 > 3;       // true
let lt = 5 < 3;       // false
let gte = 5 >= 5;     // true
let lte = 3 <= 5;     // true
```

### Кортежи (tuple)

```rust
// Кортеж — фиксированная коллекция значений разного типа
let point: (i32, f64, bool) = (10, 2.5, true);

// Деструктуризация — разбор кортежа на отдельные переменные
let (x, y, z) = point;
println!("{x} {y} {z}");    // 10 2.5 true

// Доступ по индексу через точку
println!("{}", point.0);      // 10
println!("{}", point.1);      // 2.5
println!("{}", point.2);      // true

// Частичная деструктуризация с игнорированием
let (a, ..) = point;          // a = 10, остальное игнорируется
let (.., z) = point;          // z = true, остальное игнорируется

// Пустой кортеж — тип ()
let unit = ();
println!("{:?}", unit);       // ()

// Кортеж можно использовать как возвращаемое значение
fn min_max(a: i32, b: i32) -> (i32, i32) {
    if a < b { (a, b) } else { (b, a) }
}
let (lo, hi) = min_max(5, 3); // lo=3, hi=5
```

### Массивы (array) — фиксированная длина

```rust
// Массив — фиксированная длина, все элементы одного типа
let arr: [i32; 5] = [1, 2, 3, 4, 5];
let zeros = [0; 100];          // [0, 0, ..., 0] — 100 элементов

// Доступ по индексу (0-based)
println!("{}", arr[0]);         // 1
println!("{}", arr[4]);         // 5

// Методы
println!("{}", arr.len());      // 5
println!("{}", arr.is_empty()); // false

// Итерация
for (i, val) in arr.iter().enumerate() {
    println!("arr[{i}] = {val}");
}

// Изменение элементов (массив должен быть mut)
let mut arr2 = [1, 2, 3];
arr2[1] = 20;
println!("{:?}", arr2);  // [1, 20, 3]

// Срез массива
let slice = &arr[1..3];  // &[2, 3]
```

### Типы вывода и аннотации

```rust
// Rust выводит типы автоматически (type inference)
let x = 42;          // i32 (по умолчанию для целых)
let y = 3.14;        // f64 (по умолчанию для чисел с плавающей точкой)
let name = "hello";  // &str

// Явная аннотация типа
let x: u64 = 42;
let y: f32 = 3.14;
let name: String = String::from("hello");

// Аннотация типа обязательна, если Rust не может определить тип
let v: Vec<i32> = Vec::new();  // без аннотации — ошибка!

// Type inference с ограничениями
let a = 5;        // i32
let b = a + 1;    // i32 (вывод из a)
let c = b as f64; // приведение типов
```

---

## Функции

### Основы

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b                    // последнее выражение — результат, без return
}

fn greet(name: &str) -> String {
    format!("Привет, {name}!")
}

fn div(a: f64, b: f64) -> Option<f64> {
    if b == 0.0 {
        None
    } else {
        Some(a / b)
    }
}

fn main() {
    println!("{}", add(3, 5));              // 8
    println!("{}", greet("Мир"));             // Привет, Мир!
    println!("{:?}", div(10.0, 4.0));        // Some(2.5)
    println!("{:?}", div(10.0, 0.0));        // None
}
```

Параметры функции — immutable по умолчанию; чтобы менять, нужно `mut x: i32`. Возвращается только одно значение — для нескольких используйте кортеж. Функции могут быть `pub` (публичными), `const` (константными), `async`.

### Параметры по умолчанию и множественные возвращаемые значения

```rust
// Множественные возвращаемые значения через кортеж
fn min_max(numbers: &[i32]) -> Option<(i32, i32)> {
    if numbers.is_empty() {
        return None;
    }
    let mut min = numbers[0];
    let mut max = numbers[0];
    for &n in numbers {
        if n < min { min = n; }
        if n > max { max = n; }
    }
    Some((min, max))
}

fn main() {
    let result = min_max(&[3, 1, 4, 1, 5, 9]);
    match result {
        Some((min, max)) => println!("min={min}, max={max}"),
        None => println!("пустой массив"),
    }
}
```

### Функции с `println!` и форматирование

```rust
fn format_person(name: &str, age: u32) -> String {
    // Базовое форматирование
    format!("Имя: {}, Возраст: {}", name, age)

    // Именованные аргументы:
    // format!("Имя: {name}, Возраст: {age}")

    // Позиционные аргументы:
    // format!("{0} {1} {0}", name, age)

    // Отладочный вывод:
    // format!("{:?}", value)

    // Форматирование чисел:
    // format!("{:#b}", 42)    // двоичное: 0b101010
    // format!("{:#x}", 255)   // шестнадцатеричное: 0xff
    // format!("{:.2}", 3.14159) // 3.14
    // format!("{:0>10}", 42)  // 0000000042 (дополнение нулями)
}
```

### Рекурсивные функции

```rust
// Факториал
fn factorial(n: u64) -> u64 {
    if n <= 1 { 1 } else { n * factorial(n - 1) }
}

// Числа Фибоначчи (рекурсивно, неоптимально)
fn fib(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}

// Хорошая рекурсия с хвостовой оптимизацией (аккумулятор)
fn fib_tail(n: u64) -> u64 {
    fn helper(n: u64, a: u64, b: u64) -> u64 {
        match n {
            0 => a,
            _ => helper(n - 1, b, a + b),
        }
    }
    helper(n, 0, 1)
}

fn main() {
    println!("5! = {}", factorial(5));       // 120
    println!("fib(10) = {}", fib(10));       // 55
    println!("fib_tail(10) = {}", fib_tail(10)); // 55
}
```

---

## Замыкания (Closures)

Замыкания — анонимные функции, которые могут захватывать переменные из окружающей среды.

### Основы

```rust
let multiplier = 3;
let times_three = |x: i32| x * multiplier;   // захватывает multiplier по ссылке
println!("{}", times_three(5));                    // 15

// Замыкание с изменяемым захватом
let mut offset = 0;
let mut add_offset = |x: i32| {
    offset += 1;
    x + offset
};
println!("{}", add_offset(10));   // 11
println!("{}", add_offset(10));   // 12 (offset изменился)
```

### move — захват владения

```rust
let v = vec![1, 2, 3];
let consume = move || {
    println!("{v:?}");
    v.len()
};
// println!("{v:?}");  // ❌ v перемещён в замыкание
println!("{}", consume());  // 3
```

### Замыкания как параметры функций

```rust
fn apply<F>(f: F, val: i32) -> i32
where
    F: Fn(i32) -> i32,
{
    f(val)
}

fn apply_mut<F: FnMut(i32) -> i32>(mut f: F, val: i32) -> i32 {
    f(val)
}

fn apply_once<F: FnOnce(i32) -> i32>(f: F, val: i32) -> i32 {
    f(val)
}

fn main() {
    let add_ten = |x: i32| x + 10;
    println!("{}", apply(add_ten, 5));      // 15

    let mut counter = 0;
    let increment = |x: i32| {
        counter += 1;
        x + counter
    };
    println!("{}", apply_mut(increment, 5)); // 6

    let consume = |x: i32| x * 2;
    println!("{}", apply_once(consume, 5));  // 10
}
```

### Трейты Fn, FnMut, FnOnce

```rust
// Fn — замыкание только читает захваченные переменные
// FnMut — замыкание может изменять захваченные переменные
// FnOnce — замыкание может потреблять захваченные переменные (move)

// Каждый замыкание реализует минимум один из этих трейтов:
// - |x| x + 1        → Fn
// - |x| { counter += x; } → FnMut
// - |x| { vec.push(x); }  → FnOnce (потребляет vec)

// Все замыкания реализуют FnOnce, FnMut реализует FnOnce, Fn реализует FnMut

fn call_once<F: FnOnce()>(f: F) { f(); }
fn call_mut<F: FnMut()>(mut f: F) { f(); }
fn call_fn<F: Fn()>(f: F) { f(); }
```

### Практические примеры замыканий

```rust
fn main() {
    // Фильтрация
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let evens: Vec<_> = numbers.iter().filter(|&&x| x % 2 == 0).collect();
    println!("Чётные: {evens:?}");  // [2, 4, 6, 8, 10]

    // Преобразование (map)
    let doubled: Vec<_> = numbers.iter().map(|x| x * 2).collect();
    println!("Удвоенные: {doubled:?}");  // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

    // Суммирование (fold)
    let sum: i32 = numbers.iter().fold(0, |acc, &x| acc + x);
    println!("Сумма: {sum}");  // 55

    // Сортировка с замыканием
    let mut names = vec!["Боря", "Аня", "Витя"];
    names.sort_by(|a, b| a.cmp(b));
    println!("{names:?}");  // ["Аня", "Боря", "Витя"]

    // Параллельная итерация с rayon (нужен крейт)
    // use rayon::prelude::*;
    // let sum: i32 = numbers.par_iter().sum();
}
```

---

## Владение (Ownership), заимствование, срезы

### 3.1 Правила владения

1. У каждого значения в Rust ровно **один владелец**.
2. Когда владелец выходит из области видимости, значение освобождается (`drop` вызывается автоматически).
3. Владельца можно **переместить** (move) — тогда старое имя становится недоступным.

```rust
let s1 = String::from("hello");
let s2 = s1;                 // s1 перемещено (moved) в s2
// println!("{s1}");         // ❌ ошибка компиляции: s1 перемещена

let a = 42;
let b = a;                   // i32 реализует Copy — значение скопировано
println!("{a} {b}");         // ✅ ок

let s3 = s2.clone();         // глубокое копирование, обе доступны
println!("{s2} {s3}");       // ✅
```

Типы с `Copy`: все числа (`i32`, `u64`, ...), `bool`, `char`, кортежи из Copy-типов, массивы из Copy-типов. Типы в куче (`String`, `Vec`, `Box`, `HashMap`, ...) — только move.

Перемещение в функцию — передача владения:

```rust
fn take(s: String) -> usize {
    s.len()                  // s уничтожится здесь
}

fn takes_two(a: String, b: String) -> (usize, usize) {
    (a.len(), b.len())
}

fn takes_by_ref(s: &String) -> usize {
    s.len()                  // не берёт владение
}

fn main() {
    let text = String::from("привет");
    let n = take(text);      // владение перешло в take
    // println!("{text}");   // ❌
    println!("{n}");

    let s1 = String::from("hello");
    let s2 = String::from("world");
    let (len1, len2) = takes_two(s1, s2);
    // println!("{s1} {s2}"); // ❌ оба перемещены
    println!("{len1} {len2}");

    let s3 = String::from("можно читать");
    let len = takes_by_ref(&s3);  // & — не перемещает
    println!("{len} {s3}");       // ✅ s3 всё ещё доступна
}
```

Для возврата владения из функции — просто вернуть значение:

```rust
fn create_string() -> String {
    String::from("возвращённый")
}

fn main() {
    let s = create_string();  // владение вернулось
    println!("{s}");
}
```

### Копирование vs Перемещение — детально

```rust
// Копируемые типы (Copy):
// i8, i16, i32, i64, i128, isize
// u8, u16, u32, u64, u128, usize
// f32, f64
// bool, char
// Кортежи из Copy-типов
// Массивы из Copy-типов

// Некопируемые типы (не Copy):
// String, Vec<T>, Box<T>, HashMap<K,V>, все типы с владением кучей

fn copy_example(x: i32) -> i32 { x }     // копия
fn move_example(s: String) -> usize { s.len() }  // move

fn main() {
    let a = 42;
    let b = copy_example(a);
    println!("{a} {b}");   // ✅ a всё ещё 42

    let s = String::from("hello");
    let len = move_example(s);
    // println!("{s}");    // ❌ s перемещена
    println!("{len}");     // ✅ 5
}
```

### Заимствование (Borrowing)

Ссылки (`&`) позволяют использовать значение, не забирая владение. `&mut` — изменяемая ссылка.

```rust
fn length(s: &String) -> usize {
    s.len()                  // s — ссылка, читает без перемещения
}

fn add_hello(s: &mut String) {
    s.push_str(", hello!");  // изменяемое заимствование
}

fn main() {
    let mut text = String::from("Rust");
    let len = length(&text);      // & — неизменяемая ссылка
    add_hello(&mut text);         // &mut — изменяемая
    println!("{len} {text}");     // 9 Rust, hello!
}
```

**Правила заимствования (проверяются компилятором):**

- В один момент времени либо **сколько угодно** неизменяемых `&`, либо **одна** изменяемая `&mut`
- Ссылка всегда действительна — никогда не висит (dangling)

```rust
let mut s = String::from("x");
let r1 = &s;
let r2 = &s;                 // ✅ несколько неизменяемых
// let r3 = &mut s;          // ❌ пока живы r1, r2 — нельзя
println!("{r1} {r2}");

let r3 = &mut s;             // ✅ после последнего использования r1, r2
r3.push_str("yz");
println!("{r3}");
```

### Заимствование в функциях — подробнее

```rust
// Неизменяемое заимствование — можно сколько угодно
fn len1(s: &String) -> usize { s.len() }
fn len2(s: &String) -> usize { s.len() }

fn main() {
    let text = String::from("hello");
    let a = len1(&text);
    let b = len2(&text);  // ✅ несколько неизменяемых заимствований
    println!("{a} {b} {text}");
}

// Изменяемое заимствование — только одно, и ни одного неизменяемого
fn modify(s: &mut String) { s.push_str("!"); }

fn main2() {
    let mut text = String::from("hello");
    // let a = len1(&text);
    // modify(&mut text);  // ❌ нельзя комбинировать & и &mut
    modify(&mut text);
    println!("{text}");  // hello!
}

// Заимствование распространяется на область видимости
fn main3() {
    let mut s = String::from("hello");
    let r = &s;
    // let r2 = &mut s;  // ❌ r ещё жив
    println!("{r}");      // последний use r — после этого можно &mut
    let r2 = &mut s;
    r2.push_str(" world");
    println!("{r2}");
}
```

### Срезы (Slices)

Срез — ссылка на непрерывную часть данных, без владения. `&[T]` — срез массива/вектора, `&str` — срез строки.

```rust
fn main() {
    let s = String::from("hello world");
    let hello = &s[0..5];        // "hello" (по байтам!)
    let world = &s[6..11];       // "world"
    let whole = &s[..];           // вся строка (эквивалент &s)

    let arr = [1, 2, 3, 4, 5];
    let mid = &arr[1..3];         // &[2, 3]
    let all: &[i32] = &arr[..]; // вся ссылка на массив

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

Безопасное получение первого слова (пример из The Rust Book):

```rust
fn first_word_safe(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[..i];
        }
    }
    s
}
```

### Срезы как параметры функций

```rust
// Принимаем срез вместо &String — более универсально
fn first_word(slice: &str) -> &str {
    match slice.find(' ') {
        Some(i) => &slice[..i],
        None => slice,
    }
}

fn sum_slice(slice: &[i32]) -> i32 {
    slice.iter().sum()
}

fn main() {
    let s = String::from("hello world");
    println!("{}", first_word(&s));    // hello
    println!("{}", first_word("прямая строка"));  // прямая (без &String!)

    let arr = [1, 2, 3, 4, 5];
    println!("{}", sum_slice(&arr));   // 15
    println!("{}", sum_slice(&arr[1..3]));  // 5
}
```

---

## Управляющие конструкции

### if / else if / else — выражение

```rust
let x = 10;
if x > 0 {
    println!("положительное");
} else if x == 0 {
    println!("ноль");
} else {
    println!("отрицательное");
}

// if — выражение, можно присвоить переменной
let result = if x % 2 == 0 { "чётное" } else { "нечётное" };
println!("{result}");

// if let — сокращённый match
let some_val = Some(42);
if let Some(v) = some_val {
    println!("{v}");
}

// if let с else
let color = Some("red");
if let Some(c) = color {
    println!("цвет: {c}");
} else {
    println!("нет цвета");
}

// matches! макрос (Rust 1.42+)
let x = 5;
if matches!(x, 1 | 2 | 3) {
    println!("маленькое число");
}
```

### loop — бесконечный цикл

```rust
let mut n = 0;
let done = loop {
    n += 1;
    if n == 10 {
        break n * 2;        // loop возвращает значение через break
    }
};
println!("{done}");          // 20

// loop с break и значением
let mut counter = 0;
let result = loop {
    counter += 1;
    if counter == 5 {
        break counter * 10;  // 50
    }
};
println!("{result}");  // 50
```

### while

```rust
let mut n = 3;
while n > 0 {
    println!("{n}");
    n -= 1;
}
// Вывод: 3, 2, 1

// while let — цикл с Option
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    println!("{top}");  // 3, 2, 1
}
```

### for по диапазону и коллекции

```rust
for i in 0..5 {              // 0,1,2,3,4 (не включает 5)
    print!("{i}");
}
println!();

for i in 0..=5 {             // включает 5
    print!("{i}");
}
println!();

// for по коллекции с индексом
let names = ["Аня", "Боря", "Витя"];
for (idx, name) in names.iter().enumerate() {
    println!("{idx}: {name}");
}
// 0: Аня
// 1: Боря
// 2: Витя

// for по срезу
let arr = [10, 20, 30];
for item in &arr {
    println!("{item}");
}

// for по изменяемым элементам
let mut arr2 = [1, 2, 3];
for item in &mut arr2 {
    *item *= 2;
}
println!("{arr2:?}");  // [2, 4, 6]

// for с перемещением (владение передаётся)
let v = vec![1, 2, 3];
for x in v {
    println!("{x}");
}
// println!("{v:?}");  // ❌ v перемещён
```

### break / continue

```rust
for i in 1..=10 {
    if i % 2 == 0 {
        continue;
    }
    if i > 7 {
        break;
    }
    print!("{i} ");           // 1 3 5 7
}
println!();

// break с значением
let result = loop {
    let mut n = 0;
    n += 1;
    if n * n > 100 {
        break n;    // возвращает 11 (первое n, где n² > 100)
    }
};
println!("{result}");  // 11
```

### match — сопоставление с образцом

```rust
enum Command {
    Help,
    Version,
    Run(String),
    Exit,
}

fn main() {
    let cmd = Command::Run(String::from("server"));

    match cmd {
        Command::Help => println!("справка"),
        Command::Version => println!("v1.0"),
        Command::Run(name) => println!("запуск: {name}"),
        Command::Exit => println!("выход"),
    }

    // match должен быть исчерпывающим; для чисел — паттерны
    let n = 7;
    let word = match n {
        1 => "один",
        2 | 3 => "два или три",
        4..=10 => "от четырёх до десяти",
        _ => "другое",            // fallback
    };
    println!("{word}");
}
```

### Паттерны match — подробно

```rust
// Литералы
match x {
    0 => println!("ноль"),
    1 => println!("один"),
    _ => println!("другое"),
}

// Диапазоны
match n {
    0..=9 => println!("однозначное"),
    10..=99 => println!("двузначное"),
    _ => println!("много"),
}

| — или
match n {
    1 | 2 | 3 => println!("маленькое"),
    _ => println!("большое"),
}

// Переменные (привязка)
match some_option {
    Some(value) => println!("значение: {value}"),
    None => println!("нет значения"),
}

// Деструктуризация структур
match point {
    Point { x, y } => println!("x={x}, y={y}"),
}

// Деструктуризация с игнорированием
match point {
    Point { x, .. } => println!("x={x}"),  // y игнорируется
}

// if-let guard
match n {
    x if x < 0 => println!("отрицательное"),
    0 => println!("ноль"),
    x if x % 2 == 0 => println!("чётное"),
    _ => println!("нечётное"),
}

// @-привязка (привязать значение к имени)
match s {
    "" => println!("пустая строка"),
    other @ "quit" | other @ "exit" => println!("команда: {other}"),
    other => println!("текст: {other}"),
}
```

### while let и if let

```rust
// while let — цикл, пока Option/Result содержит Some/Ok
let mut opt = Some(5);
while let Some(v) = opt {
    println!("{v}");
    opt = if v > 1 { Some(v - 1) } else { None };
}
// Вывод: 5, 4, 3, 2, 1

// if let — если паттерн совпал, выполнить блок
let opt: Option<i32> = Some(42);
if let Some(v) = opt {
    println!("значение: {v}");
}

// if let с else
let color: Option<&str> = None;
if let Some(c) = color {
    println!("цвет: {c}");
} else {
    println!("нет цвета");
}
```

---

## Комбинированный пример

```rust
fn main() {
    // Итераторы + фильтрация + преобразование
    let nums = vec![1, 2, 3, 4, 5, 6];
    let sum: i32 = nums
        .iter()
        .filter(|x| *x % 2 == 0)
        .map(|x| x * 10)
        .sum();
    println!("{sum}");       // 200 (2+4+6 → 20+40+60)

    // Замыкание как параметр
    let apply_twice = |f: fn(i32) -> i32, x: i32| f(f(x));
    let double = |x: i32| x * 2;
    println!("{}", apply_twice(double, 3));  // 12

    // match с enum
    #[derive(Debug)]
    enum Status {
        Active,
        Inactive,
        Error(String),
    }

    let statuses = vec![
        Status::Active,
        Status::Inactive,
        Status::Error("timeout".to_string()),
    ];

    for s in &statuses {
        match s {
            Status::Active => println!("активен"),
            Status::Inactive => println!("неактивен"),
            Status::Error(e) => println!("ошибка: {e}"),
        }
    }
}
```

---

## Задачи

1. Напишите функцию `is_even`, проверяющую чётность.
2. Напишите функцию `factorial(n)` через цикл.
3. Реализуйте `swap` двух чисел через `std::mem::swap`.
4. Напишите программу FizzBuzz.
5. Реализуйте `first_word` без match — через `split_whitespace`.
6. Напишите функцию, возвращающую максимальный элемент `&[i32]` без коллекций стандартной библиотеки (через iter().max() нельзя — через цикл).
7. Напишите замыкание, которое принимает число и возвращает `true`, если оно делится на 3 и на 5 одновременно.
8. Напишите функцию `count_occurrences(s: &str, ch: char) -> usize`, считающую количество вхождений символа в строку.
9. Реализуйте `fn is_palindrome(s: &str) -> bool`, проверяющую, является ли строка палиндромом.
10. Напишите функцию `flatten<T: Clone>(nested: &[Vec<T>]) -> Vec<T>`, которая «разворачивает` вложенный вектор.
11. Реализуйте замыкание `make_adder(n: i32) -> impl Fn(i32) -> i32`, которое возвращает функцию, добавляющую `n` к своему аргументу.
12. Напишите функцию `partition<T: Clone>(slice: &[T], predicate: impl Fn(&T) -> bool) -> (Vec<T>, Vec<T>)`, разделяющую срез на две части по предикату.

Ответы — в `practice.md`.
