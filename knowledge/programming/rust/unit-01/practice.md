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

// 4. Сумма кубов от 1 до n
fn sum_of_cubes(n: u32) -> u32 {
    (1..=n).map(|x| x * x * x).sum()
}

// 5. Проверка, что число является степенью двойки
fn is_power_of_two(n: u32) -> bool {
    n > 0 && (n & (n - 1)) == 0
}

// 6. Абсолютное значение
fn abs(n: i32) -> i32 {
    if n < 0 { -n } else { n }
}
```

## Уровень 2: Средние

```rust
// 7. FizzBuzz
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

// 8. Первое слово без match (через split_whitespace)
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or(s)
}

// 9. Максимум в срезе (без библиотечных методов)
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

// 10. Среднее арифметическое
fn average(slice: &[f64]) -> Option<f64> {
    if slice.is_empty() {
        return None;
    }
    Some(slice.iter().sum::<f64>() / slice.len() as f64)
}

// 11. Реверс строки
fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}

// 12. Подсчёт гласных букв
fn count_vowels(s: &str) -> usize {
    s.chars().filter(|c| matches!(c.to_ascii_lowercase(), 'a' | 'e' | 'i' | 'o' | 'u')).count()
}
```

## Уровень 3: Владение и заимствование

```rust
// 13. Возврат владения
fn take_and_return(s: String) -> String {
    s
}

// 14. Изменение через &mut
fn append_suffix(s: &mut String, suffix: &str) {
    s.push_str(suffix);
}

// 15. Реверс среза (заимствование)
fn reverse_slice(slice: &mut [i32]) {
    let mut i = 0;
    let mut j = slice.len().saturating_sub(1);
    while i < j {
        slice.swap(i, j);
        i += 1;
        j -= 1;
    }
}

// 16. Найти индекс максимального элемента
fn argmax(slice: &[i32]) -> Option<usize> {
    if slice.is_empty() {
        return None;
    }
    let mut max_idx = 0;
    for (i, &val) in slice.iter().enumerate() {
        if val > slice[max_idx] {
            max_idx = i;
        }
    }
    Some(max_idx)
}

// 17. Удалить дубликаты из среза (возвращает Vec)
fn unique_ordered(slice: &[i32]) -> Vec<i32> {
    let mut seen = std::collections::HashSet::new();
    slice.iter()
        .filter(|&&x| seen.insert(x))
        .copied()
        .collect()
}

// 18. Разделить строку на слова и вернуть Vec<String>
fn split_into_words(s: &str) -> Vec<String> {
    s.split_whitespace().map(|w| w.to_string()).collect()
}

// 19. Найти два числа, дающие сумму (Two Sum)
fn two_sum(nums: &[i32], target: i32) -> Option<(usize, usize)> {
    for (i, &a) in nums.iter().enumerate() {
        for (j, &b) in nums.iter().enumerate().skip(i + 1) {
            if a + b == target {
                return Some((i, j));
            }
        }
    }
    None
}

// 20. Переместить все нули в конец (in-place)
fn move_zeros(nums: &mut Vec<i32>) {
    let mut write = 0;
    for read in 0..nums.len() {
        if nums[read] != 0 {
            nums.swap(write, read);
            write += 1;
        }
    }
}
```

## Уровень 4: Замыкания и итераторы

```rust
// 21. Создать замыкание-генератор последовательности Фибоначчи
fn make_fibonacci() -> impl FnMut() -> u64 {
    let (mut a, mut b) = (0u64, 1u64);
    move || {
        let current = a;
        let next = a + b;
        a = b;
        b = next;
        current
    }
}

// 22. Создать замыкание-кэш (мемоизация)
fn make_cached<F>(mut f: F) -> impl FnMut(i32) -> i32
where
    F: FnMut(i32) -> i32,
{
    let mut cache = std::collections::HashMap::new();
    move |x: i32| {
        *cache.entry(x).or_insert_with(|| f(x))
    }
}

// 23. Функция, применяющая замыкание к каждому элементу среза
fn apply_to_all(slice: &[i32], f: impl Fn(i32) -> i32) -> Vec<i32> {
    slice.iter().map(|&x| f(x)).collect()
}

// 24. Функция, фильтрующая по предикату и возвращающая Vec
fn filter_vec<T>(v: Vec<T>, predicate: impl Fn(&T) -> bool) -> Vec<T> {
    v.into_iter().filter(predicate).collect()
}

// 25. Создать замыкание make_multiplier, возвращающее функцию умножения
fn make_multiplier(factor: i32) -> impl Fn(i32) -> i32 {
    move |x| x * factor
}
```

## Уровень 5: Мини-проекты

### Мини-проект 1: Калькулятор выражений (без парсера)

```rust
// Простой калькулятор для строк вида "2 + 3", "10 - 4", "3 * 7", "15 / 3"
fn simple_calculator(input: &str) -> Option<f64> {
    let parts: Vec<&str> = input.split_whitespace().collect();
    if parts.len() != 3 {
        return None;
    }
    let a: f64 = parts[0].parse().ok()?;
    let op = parts[1];
    let b: f64 = parts[2].parse().ok()?;
    match op {
        "+" => Some(a + b),
        "-" => Some(a - b),
        "*" => Some(a * b),
        "/" => if b != 0.0 { Some(a / b) } else { None },
        _ => None,
    }
}

fn main() {
    assert_eq!(simple_calculator("2 + 3"), Some(5.0));
    assert_eq!(simple_calculator("10 - 4"), Some(6.0));
    assert_eq!(simple_calculator("3 * 7"), Some(21.0));
    assert_eq!(simple_calculator("15 / 3"), Some(5.0));
    assert_eq!(simple_calculator("10 / 0"), None);
    assert_eq!(simple_calculator("invalid"), None);
}
```

### Мини-проект 2: Таблица умножения

```rust
fn main() {
    for i in 1..=9 {
        let row: Vec<String> = (1..=9).map(|j| format!("{:3}", i * j)).collect();
        println!("{}", row.join(" "));
    }
}
```

### Мини-проект 3: Анализ текста

```rust
fn analyze_text(text: &str) {
    let words: Vec<&str> = text.split_whitespace().collect();
    let chars = text.chars().count();
    let lines = text.lines().count();

    // Частоты слов
    let mut freq = std::collections::HashMap::new();
    for word in &words {
        let cleaned = word.trim_matches(|c: char| !c.is_alphanumeric());
        *freq.entry(cleaned.to_lowercase()).or_insert(0) += 1;
    }

    println!("Слов: {}", words.len());
    println!("Символов: {chars}");
    println!("Строк: {lines}");
    println!("Частоты: {freq:?}");
}
```

### Мини-проект 4: Список дел (To-Do CLI)

```rust
#[derive(Debug, Clone)]
enum Status {
    Pending,
    Done,
}

struct Todo {
    id: u32,
    text: String,
    status: Status,
}

struct TodoList {
    todos: Vec<Todo>,
    next_id: u32,
}

impl TodoList {
    fn new() -> Self {
        TodoList {
            todos: Vec::new(),
            next_id: 1,
        }
    }

    fn add(&mut self, text: &str) {
        self.todos.push(Todo {
            id: self.next_id,
            text: text.to_string(),
            status: Status::Pending,
        });
        self.next_id += 1;
    }

    fn complete(&mut self, id: u32) -> Result<(), String> {
        if let Some(todo) = self.todos.iter_mut().find(|t| t.id == id) {
            todo.status = Status::Done;
            Ok(())
        } else {
            Err(format!("задача {id} не найдена"))
        }
    }

    fn list(&self) {
        for todo in &self.todos {
            let status = match todo.status {
                Status::Pending => "⏳",
                Status::Done => "✅",
            };
            println!("{status} [{id}] {text}", id = todo.id, text = todo.text);
        }
    }

    fn pending_count(&self) -> usize {
        self.todos.iter().filter(|t| matches!(t.status, Status::Pending)).count()
    }
}

fn main() {
    let mut list = TodoList::new();
    list.add("Купить продукты");
    list.add("Выучить Rust");
    list.add("Прогнать тесты");
    list.complete(2).unwrap();
    list.list();
    println!("Осталось: {}", list.pending_count());
}
```

## Ответы

1. `fn is_even(n: i32) -> bool { n % 2 == 0 }`
2. Цикл от 2 до n с умножением
3. `(1..=n).map(|x| x * x).sum()`
4. `(1..=n).map(|x| x * x * x).sum()`
5. `n > 0 && (n & (n - 1)) == 0`
6. `if n < 0 { -n } else { n }`
7. `match (i % 3, i % 5) { (0,0) => "FizzBuzz", (0,_) => "Fizz", (_,0) => "Buzz", _ => i }`
8. `s.split_whitespace().next().unwrap_or(s)`
9. Итерация с запоминанием максимума через `?` для `Option`
10. Проверка `is_empty()` → `None`, иначе `sum() / len() as f64`
11. `s.chars().rev().collect()`
12. `s.chars().filter(|c| matches!(...)).count()`
13. `fn take_and_return(s: String) -> String { s }`
14. `fn append_suffix(s: &mut String, suffix: &str) { s.push_str(suffix); }`
15. `while i < j { slice.swap(i, j); i += 1; j -= 1; }`
16. Итерация с `enumerate()` и отслеживанием индекса максимума
17. `HashSet` для отслеживания увиденных, `filter` + `collect`
18. `s.split_whitespace().map(|w| w.to_string()).collect()`
19. Двойной цикл с `enumerate()` и `skip(i + 1)`
20. Два указателя (read/write) с `swap`
21. Замыкание с мутабельным состоянием `(a, b)`
22. `HashMap` для кэширования результатов
23. `slice.iter().map(|&x| f(x)).collect()`
24. `v.into_iter().filter(predicate).collect()`
25. `move |x| x * factor`

---

*Unit 1: Задачи. Ответы и решения — см. выше. Переходите к Unit 2.*
