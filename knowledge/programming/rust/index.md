# Rust — Полный конспект

## Введение

Rust — системный язык программирования, разработанный Mozilla (2010–2015, первый релиз 1.0 в мае 2015), затем перешедший в независимый проект Rust Foundation (основана в 2021 году при поддержке AWS, Google, Huawei, Microsoft, Mozilla и других). Главные принципы: безопасность памяти без сборщика мусора, производительность уровня C/C++, надёжность на этапе компиляции.

**Ключевые особенности:**

- **Система владения (ownership)** — компилятор проверяет память без GC, ошибки памяти ловятся на этапе компиляции
- Нулевая стоимость абстракций (zero-cost abstractions) — абстракции не создают накладных расходов во время выполнения
- Статическая типизация с мощным выводом типов (type inference)
- `enum` с данными (algebraic data types) и сопоставление с образцом (`match`) — исчерпывающий и безопасный
- Трейты (traits) — аналог интерфейсов, но с композицией и generics, без наследования
- Встроенные инструменты: `cargo`, `rustfmt`, `clippy`, `rustdoc`, `cargo clippy`, `cargo audit`
- Нет наследования, нет исключений (exceptions), нет сборщика мусора
- Поддержка FFI (Foreign Function Interface) для взаимодействия с C и другими языками
- Кросс-компиляция для множества платформ (включая WASM, embedded, ОС)

**Кому нужен:** системное программирование (ОС, драйверы, ядра), embedded, высоконагруженный бэкенд, WebAssembly, блокчейн (Solana, Parity/Substrate), инструменты CLI, game engines, ML-инфраструктура, веб-бэкенд, сетевые сервисы, базы данных.

**Области применения:**

- Системное программирование: curl, ripgrep, fd, bat, exa (многие Unix-утилиты переписаны на Rust)
- Веб-бэкенд: axum, actix-web, Rocket; фронтенд через WASM (Yew, Leptos, Dioxus)
- Блокчейн: Solana, Substrate (Polkadot), Near — ядра на Rust
- Инструменты разработки: cargo, rustup, deno (Node-альтернатива), uv (Python-пакетный менеджер), Polars (аналог pandas)
- Embedded: Embassy, RTIC; Raspberry Pi Pico, ESP32, nRF52
- Игровые движки: Bevy, Amethyst, ggez
- ML-инфраструктура: Candle, burn, tch-rs (обёртка над PyTorch)
- CLI-инструменты: ripgrep, fd, bat, exa, tokei, hyperfine
- Базы данных: SurrealDB, Databend, Rust-реализации Redis/PostgreSQL клиентов

**Уникальность Rust** — система владения: каждое значение имеет ровно одного владельца; при передаче владение перемещается (move); заимствование возможно только по правилам компилятора. Итог: потоки без data races, безопасное освобождение памяти, отсутствие use-after-free и null-pointer — всё проверяется до запуска программы. Это не runtime-проверка (как в GC-языках), а compile-time-проверка, которая не влияет на производительность.

---

## Сравнение с другими языками

### Rust vs C/C++

| Аспект | C/C++ | Rust |
|--------|-------|------|
| Безопасность памяти | Ручное управление, undefined behavior возможно | Проверяется компилятором, нет use-after-free, dangling pointers |
| Сборщик мусора | Нет | Нет (но есть Drop, RAII) |
| Параллелизм | Data races возможны, UB | Data races невозможны на уровне языка |
| Скорость компиляции | Быстрая | Медленнее (проверка владения, мономорфизация) |
| Кривая обучения | Умеренная | Крутая (владение, lifetimes) |
| Экосистема | Make, CMake, Conan, vcpkg | Cargo (встроен, единый стандарт) |
| Управление зависимостями | Фрагментировано | Единый реестр crates.io |
| Современные фичи | C++20/23 добавляют модули, concepts | Модули, трейты, async/await из коробки |

Rust обеспечивает безопасность C/C++ с гарантиями на уровне компилятора. В C++ можно случайно создать use-after-free, double-free, dangling pointer — в Rust эти ошибки невозможны без `unsafe` блока. `unsafe` в Rust — это не «всё разрешено», а явная декларация программиста: «я знаю, что делаю, и гарантирую безопасность».

### Rust vs Go

| Аспект | Go | Rust |
|--------|----|------|
| Скорость | Быстрая, но медленнее Rust | Очень быстрая, сопоставима с C++ |
| Простота | Простой синтаксис, быстрый старт | Сложнее, но мощнее |
| Concurrency | Горутины + каналы (встроены) | Потоки + каналы + async/await (требует runtime) |
| Сборщик мусора | Да (gc) | Нет |
| Типы | Интерфейсы (duck typing) | Трейты + generics |
| Вывод типов | Да | Да (более мощный) |
| Использование | Микросервисы, DevOps, облачные инструменты | Системное программирование, high-performance |

Go проще для старта и лучше подходит для микросервисов с высокой конкурентностью. Rust даёт больше контроля и производительности, но требует больше усилий.

### Rust vs Python/JavaScript/Java

| Аспект | Python/JS/Java | Rust |
|--------|----------------|------|
| Типизация | Динамическая (Python/JS) / статическая (Java) | Статическая + вывод типов |
| Скорость | Медленнее в 10–100x | Очень быстрая |
| Безопасность памяти | GC (Java/Python) или GC (V8) | Compile-time проверка |
| Кривая обучения | Пологая | Крутая |
| Использование | Скрипты, веб-приложения, прототипы | Системное ПО, высоконагруженные сервисы |
| Развёртывание | Интерпретаторы, JVM | Единственный бинарник без зависимостей |

Rust конкурирует с C/C++ в производительности, а не с динамическими языками в простоте. Однако Rust активно используется как «язык расширений» для Python (PyO3), Node.js (N-API), и других динамических языков — когда нужна производительность критичного пути.

### Rust vs C#

| Аспект | C# | Rust |
|--------|----|------|
| Платформа | .NET / CLR | Нативная компиляция |
| Сборщик мусора | Да (GC) | Нет |
| Безопасность памяти | Да (runtime) | Да (compile-time) |
| Производительность | Хорошая (но с overhead GC) | Отличная (zero-cost abstractions) |
| Async/await | Встроен | Встроен (требует runtime) |
| Использование | Enterprise, Unity, веб | Системное, embedded, high-performance |

### Почему Rust выбирают

1. **Надёжность** — ошибки памяти невозможны без `unsafe`, что критично для безопасности (CVE из-за buffer overflow — одна из главных категорий уязвимостей)
2. **Производительность** — сопоставима с C/C++, нулевая стоимость абстракций
3. **Современный инструментарий** — cargo, crates.io, rustfmt, clippy, rustdoc — всё из коробки
4. **Отличная документация** — The Rust Book, Rust by Example, документация каждого крейта
5. **Сообщество** — рейтинг «самый любимый язык» на Stack Overflow более 8 лет подряд
6. **Безопасность параллелизма** — система типов предотвращает data races на уровне компиляции

---

## Экосистема Rust

### Cargo — менеджер проектов и сборки

`cargo` — встроенный инструмент, который заменяет Make, Maven, npm, pip и другие сборочные системы. Он управляет:

- Сборкой проекта (компиляция, линковка)
- Зависимостями (разрешение, загрузка, обновление)
- Тестированием
- Документацией
- Форматированием
- Линтерством

```bash
cargo new my_project          # создать проект
cargo init                    # инициализировать в существующей папке
cargo build                   # собрать (debug)
cargo build --release         # собрать с оптимизациями
cargo run                     # собрать и запустить
cargo check                   # быстрая проверка без кодогенерации
cargo clean                   # удалить build/ артефакты
cargo doc --open              # собрать и открыть документацию
```

### Cargo.toml — манифест проекта

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"
description = "Описание проекта"
license = "MIT OR Apache-2.0"
authors = ["Author <email@example.com>"]
repository = "https://github.com/user/repo"

[dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
axum = "0.7"

[dev-dependencies]
pretty_assertions = "1"
proptest = "1"

[build-dependencies]
bindgen = "0.69"

[features]
default = ["std"]
std = ["serde/std"]

[profile.release]
opt-level = 3
lto = true
codegen-units = 1

[profile.dev]
opt-level = 0
```

### crates.io — реестр пакетов

[crates.io](https://crates.io) — центральный реестр пакетов Rust (аналог npm registry, PyPI, Maven Central). На момент 2026 года — более 150 000 крейтов.

```bash
# Поиск крейтов
cargo search serde
cargo search axum

# Добавление зависимости (с Rust 1.62+)
cargo add serde --features derive
cargo add tokio --features full
cargo add axum

# Удаление
cargo remove serde

# Обновление зависимостей
cargo update          # обновить lock-файл
cargo upgrade         # обновить Cargo.toml (нужен cargo-upgrade)
```

### Важные крейты по категориям

**Веб и HTTP:**

- `axum` — веб-фреймворк от команды tokio, основанный на tower/hyper
- `actix-web` — высокопроизводительный веб-фреймворк с actor-моделью
- `warp` — функциональный веб-фреймворк на основе фильтров
- `rocket` — эргономичный веб-фреймворк с макросами
- `reqwest` — HTTP-клиент (sync и async)
- `hyper` — низкоуровневый HTTP-протокол

**Асинхронность и runtime:**

- `tokio` — асинхронный runtime (наиболее популярный)
- `async-std` — альтернативный async runtime, похожий на стандартную библиотеку
- `smol` — лёгкий async runtime

**Сериализация:**

- `serde` + `serde_json` — сериализация/десериализация (JSON, YAML, TOML, Bincode, ...)
- `serde_cbor`, `serde_msgpack` — бинарные форматы
- `rkyv` — zero-copy сериализация

**Обработка ошибок:**

- `thiserror` — derive-макрос для пользовательских ошибок
- `anyhow` — гибкая обработка ошибок для приложений
- `snafu` — альтернатива thiserror/anyhow с более детальным контролем

**CLI:**

- `clap` — парсинг аргументов командной строки (derive API)
- `structopt` (deprecated в пользу clap derive)
- `dialoguer` — интерактивные prompts
- `indicatif` — progress bars

**Тестирование:**

- `proptest` — property-based testing
- `quickcheck` — property-based testing (альтернатива proptest)
- `insta` — snapshot testing
- `criterion` — бенчмаркинг

**Дата и время:**

- `chrono` — дата и время
- `time` — современная альтернатива chrono

**Случайные числа:**

- `rand` — генерация случайных чисел
- `fastrand` — быстрая альтернатива

**Логирование:**

- `log` + `env_logger` — классическая связка
- `tracing` — структурированное логирование и трассировка (рекомендуется для async)
- `slog` — структурированное логирование

**Базы данных:**

- `sqlx` — async SQL с компилируемыми запросами
- `diesel` — ORM с compile-time проверкой запросов
- `rusqlite` — обёртка над SQLite
- `mongodb` — драйвер MongoDB
- `redis` — драйвер Redis

**Утилиты и прочее:**

- `rayon` — параллельные итераторы (data parallelism)
- `crossbeam` — низкоуровневые конкурентные примитивы
- `parking_lot` — более производительные Mutex/RwLock
- `anyhow`/`thiserror` — обработка ошибок
- `tracing` — структурированная трассировка
- `tower` — сетевые сервисы, middleware
- `bytes` — работа с байтовыми буферами

### Cargo Ecosystem — дополнительные инструменты

- `cargo-edit` — `cargo add`, `cargo rm`, `cargo upgrade`
- `cargo-watch` — автоматическая пересборка при изменении файлов
- `cargo-outdated` — проверка устаревших зависимостей
- `cargo-audit` — проверка зависимостей на уязвимости (CVE)
- `cargo-geiger` — проверка использования unsafe в зависимостях
- `cargo-expand` — разворачивание макросов (показывает сгенерированный код)
- `cargo bloat` — анализ размера бинарника
- `cargo flamegraph` — профилирование производительности
- `cargo deny` — проверка лицензий и зависимостей
- `cargo msrv` — проверка минимальной поддерживаемой версии Rust

### rustup — менеджер toolchain'ов

`rustup` — стандартный инструмент для управления версиями Rust:

```bash
# Установка
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Управление версиями
rustup show                    # показать активные toolchain'ы
rustup toolchain list          # список установленных
rustup default stable          # установить стабильную версию по умолчанию
rustup default nightly         # использовать nightly
rustup run nightly rustc --version

# Компоненты
rustup component add clippy rustfmt rust-docs rust-analyzer
rustup component remove rustfmt

# Targets (для кросс-компиляции)
rustup target add wasm32-unknown-unknown
rustup target add x86_64-unknown-linux-gnu
rustup target add aarch64-unknown-linux-gnu
rustup target add thumbv7m-none-eabi   # embedded ARM Cortex-M

# Обновление
rustup update stable
rustup update nightly
rustup update
```

### IDE и редакторы

- **rust-analyzer** — LSP-сервер для Rust (поддержка в VS Code, IntelliJ, Neovim, Emacs, Vim)
- **VS Code** + расширение "rust-analyzer" — самый популярный вариант
- **IntelliJ Rust** — плагин для JetBrains IDEs (CLion, IDEA)
- **Neovim** + rust-analyzer + telescope.nvim — популярная комбинация для Vim-пользователей
- **Emacs** + lsp-mode + rust-analyzer

---

## 1. Установка

### Через rustup (рекомендуется)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustc --version
cargo --version
rustup --version
```

### Альтернативные способы

```bash
# Ubuntu/Debian
sudo apt install rustc cargo

# Fedora/RHEL
sudo dnf install rustc cargo

# Arch Linux
sudo pacman -S rust

# macOS (Homebrew)
brew install rust

# Windows (winget)
winget install Rustlang.Rust

# Docker
docker run --rm -it rust:latest
```

### Набор компонентов

```bash
rustup component add clippy rustfmt rust-docs rust-analyzer
rustup target add wasm32-unknown-unknown thumbv7m-none-eabi
```

### Создание нового проекта

```bash
cargo new hello_world       # бинарный проект
cargo new --lib my_lib      # библиотечный проект
cd hello_world
cargo build                  # debug-сборка
cargo run                    # сборка + запуск
cargo run --release          # release-сборка с оптимизациями
cargo run --example my_example  # запуск примера
```

---

## 2. Основы синтаксиса

### 2.1 Hello World

```rust
fn main() {
    println!("Hello, world!");
}
```

`println!` — макрос (наличие `!`). `main` — точка входа. Каждая инструкция завершается точкой с запятой, но *выражения* её не требуют. Функция `main` может возвращать `Result`:

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Hello, world!");
    Ok(())
}
```

### 2.2 Переменные

```rust
let x = 5;          // неизменяемая переменная (immutable по умолчанию)
let mut y = 10;     // изменяемая
y += 1;

let a = 5;
let a = a + 1;      // shadowing: переопределение переменной
let a = "строка";   // можно даже менять тип

const MAX_SIZE: u32 = 1024;   // константа: тип обязателен, UPPER_CASE
const PI: f64 = 3.14159;

static GREETING: &str = "Hello";   // статическая переменная (всегда доступна)
```

Ключевые отличия `let` + shadowing от `mut`:

- `mut` — изменение значения той же переменной в памяти
- shadowing — создание новой переменной с тем же именем (можно менять тип, преобразовывать)

### 2.3 Типы данных

**Целые числа:**

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
let hex = 0xFF;            // 255
let bin = 0b1010;          // 10
let oct = 0o17;            // 15
let underscores = 1_000_000;  // читаемость
```

**Другие базовые типы:**

```rust
let x: f64 = 3.14;      // float64 — по умолчанию
let y: f32 = 2.5;        // float32
let is_ok: bool = true;
let ch: char = 'я';      // Unicode-символ, 4 байта
let unit = ();           // пустой кортеж, тип "ничего"
let never: ! = panic!("это never type");  // never type — функция никогда не возвращается
```

**Кортежи (tuple):**

```rust
let point: (i32, f64, bool) = (10, 2.5, true);
let (x, y, z) = point;       // деструктуризация
println!("{x}");               // 10
println!("{}", point.1);       // 2.5 — доступ по индексу через точку
let (a, ..) = point;           // проигнорировать остальные поля
```

**Массивы (array) — фиксированная длина:**

```rust
let arr: [i32; 5] = [1, 2, 3, 4, 5];
let zeros = [0; 100];          // [0, 0, ..., 0] — 100 элементов
println!("{}", arr[0]);         // 1
println!("{}", arr.len());      // 5
```

**Срезы (slice) — динамический массив:**

```rust
let slice: &[i32] = &[1, 2, 3, 4, 5];   // ссылка на массив
```

### 2.4 Функции

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b                    // последнее выражение — возвращаемое значение (без ; и return)
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
}
```

Параметры функции — immutable по умолчанию; чтобы менять, нужно `mut x: i32`. Возвращается только одно значение — для нескольких используйте кортеж. Функции могут быть `pub` (публичными), `const` (константными), `async`.

### 2.5 Закрытия (Closures)

Замыкания — анонимные функции, которые могут захватывать переменные из окружающей среды:

```rust
let multiplier = 3;
let times_three = |x: i32| x * multiplier;   // захватывает multiplier по ссылке
println!("{}", times_three(5));                // 15

let mut offset = 0;
let mut add_offset = |x: i32| {
    offset += 1;
    x + offset
};
println!("{}", add_offset(10));   // 11
println!("{}", add_offset(10));   // 12 (offset изменился)

// move — захват владения (полное перемещение значений в замыкание)
let v = vec![1, 2, 3];
let consume = move || {
    println!("{v:?}");
    v.len()
};
// println!("{v:?}");  // ❌ v перемещён в замыкание
```

Замыкания реализуют трейты `Fn`, `FnMut`, `FnOnce` в зависимости от того, как они используют захваченные переменные:

- `Fn` — только по ссылке (чтение)
- `FnMut` — по изменяемой ссылке (модификация)
- `FnOnce` — по значению (перемещение, потребление)

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
```

---

## 3. Владение (Ownership), заимствование, срезы

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

### 3.2 Заимствование (Borrowing)

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

**Скопирование vs перемещение в функцию:**

```rust
fn copy_param(x: i32) {}       // Copy — копия, оригинал доступен
fn move_param(s: String) {}    // Move — владение ушло, оригинал недоступен
fn borrow_param(s: &String) {} // Borrow — только чтение
fn mut_borrow_param(s: &mut String) {} // Borrow mut — чтение и запись
```

### 3.3 Срезы (Slices)

Срез — ссылка на непрерывную часть данных, без владения. `&[T]` — срез массива/вектора, `&str` — срез строки.

```rust
let s = String::from("hello world");
let hello = &s[0..5];        // "hello" (по байтам!)
let world = &s[6..11];        // "world"
let whole = &s[..];           // вся строка (эквивалент &s)

let arr = [1, 2, 3, 4, 5];
let mid = &arr[1..4];         // [2, 3, 4]
let all: &[i32] = &arr[..];  // вся ссылка на массив
```

Безопасное получение первого слова (пример из The Rust Book):

```rust
fn first_word(s: &str) -> &str {
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}

fn main() {
    let sentence = String::from("hello world");
    let word = first_word(&sentence);
    println!("{word}");   // hello
    // sentence.clear();  // ❌ если раскомментировать — ошибка компиляции:
    // word ссылается на данные sentence, которые будут уничтожены
}
```

### 3.4 Время жизни (Lifetimes) — кратко

Компилятор отслеживает, как долго действительны ссылки. Обычно работает автоматически (elision), но в функциях с несколькими ссылками нужно писать аннотации. Подробнее — в `details.md`.

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

`'a` означает: результат живёт не дольше, чем короткая из входных ссылок.

---

## 4. Структуры и перечисления

### 4.1 Структуры (struct)

```rust
struct User {
    name: String,
    age: u8,
    active: bool,
}

fn main() {
    let u1 = User {
        name: String::from("Alice"),
        age: 30,
        active: true,
    };
    let u2 = User {
        name: String::from("Bob"),
        ..u1                       // оставшиеся поля из u1 (move)
    };
    println!("{} {} {}", u1.name, u1.age, u1.active);
    println!("{} {}", u2.name, u2.age);
}
```

Tuple-структуры и unit-структуры:

```rust
struct Point(i32, i32);        // поля без имён
struct Color(u8, u8, u8);
struct Unit;                   // структура без полей

let origin = Point(0, 0);
println!("{}", origin.0);      // 0
```

### 4.2 Перечисления (enum)

```rust
enum Shape {
    Circle(f64),                       // вариант с данными
    Rectangle { width: f64, height: f64 },  // именованные поля
    Line,                              // без данных
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * *r * *r,
        Shape::Rectangle { width, height } => *width * *height,
        Shape::Line => 0.0,
    }
}
```

**Option\<T>** — замена null из других языков:

```rust
let some: Option<i32> = Some(5);
let none: Option<i32> = None;

fn divide(n: i32, d: i32) -> Option<i32> {
    if d == 0 { None } else { Some(n / d) }
}

// Методы Option
let val = Some(42);
val.unwrap();           // 42
val.unwrap_or(0);       // 42
val.unwrap_or_else(|| 0);
val.and(Some(100));     // Some(100)
val.or(None);           // Some(42)
val.map(|x| x * 2);     // Some(84)
val.map_or(0, |x| x * 2);  // 84
```

**Result\<T, E>** — операция, которая может завершиться ошибкой:

```rust
fn parse_int(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse()
}

fn main() {
    let ok: Result<i32, _> = parse_int("42");
    let err: Result<i32, _> = parse_int("abc");

    ok.unwrap();                    // 42
    err.unwrap_or(0);               // 0
    err.unwrap_or_else(|e| -1);     // -1
    err.expect("ожидалось число");  // паника с сообщением
}
```

### 4.3 Методы (impl)

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {            // метод: первый параметр &self
        self.width * self.height
    }

    fn scale(&mut self, k: f64) {
        self.width *= k;
        self.height *= k;
    }

    fn square(side: f64) -> Rectangle {   // ассоциированная функция (без self)
        Rectangle { width: side, height: side }
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let mut r = Rectangle { width: 3.0, height: 4.0 };
    println!("{}", r.area());         // 12
    r.scale(2.0);
    println!("{}", r.area());         // 48
    let sq = Rectangle::square(5.0);  // вызов через ::
    println!("{}", sq.area());        // 25
}
```

---

## 5. Управляющие конструкции

```rust
// if / else if / else — выражение
let x = 10;
if x > 0 {
    println!("положительное");
} else if x == 0 {
    println!("ноль");
} else {
    println!("отрицательное");
}

let result = if x % 2 == 0 { "чётное" } else { "нечётное" };

// loop — бесконечный цикл (можно выйти с результатом)
let mut n = 0;
let done = loop {
    n += 1;
    if n == 10 {
        break n * 2;        // loop возвращает значение
    }
};
println!("{done}");          // 20

// while
let mut n = 3;
while n > 0 {
    println!("{n}");
    n -= 1;
}

// for по диапазону и коллекции
for i in 0..5 {              // 0,1,2,3,4 (не включает 5)
    print!("{i}");
}
for i in 0..=5 {             // включает 5
    print!("{i}");
}
for (idx, ch) in "abc".chars().enumerate() {
    println!("{idx}: {ch}");
}

// break / continue
for i in 1..=10 {
    if i % 2 == 0 {
        continue;
    }
    if i > 7 {
        break;
    }
    print!("{i}");           // 1 3 5 7
}
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

### if let — сокращённый match

```rust
let some_val = Some(42);

// Вместо:
// match some_val {
//     Some(v) => println!("{v}"),
//     None => println!("нет значения"),
// }

// Можно:
if let Some(v) = some_val {
    println!("{v}");
}

// if let с else:
let color = Some("red");
if let Some(c) = color {
    println!("цвет: {c}");
} else {
    println!("нет цвета");
}

// matches! макрос (Rust 1.42+):
let x = 5;
if matches!(x, 1 | 2 | 3) {
    println!("маленькое число");
}
```

### while let

```rust
let mut stack = vec![1, 2, 3];
while let Some(top) = stack.pop() {
    println!("{top}");  // 3, 2, 1
}
```

---

## 6. Строки

Два основных типа: `String` (владеющая, изменяемая, в куче) и `&str` (срез строки, заимствованная).

```rust
let mut s = String::new();
s.push('a');
s.push_str("bc");                 // "abc"

let from_literal = "hello";       // &'static str
let owned: String = from_literal.to_string();
let owned2 = String::from("world");
let combined = format!("{} {}", from_literal, owned2);  // "hello world"
```

**Методы:**

```rust
let s = String::from("  Hello, Rust!  ");

s.len();                          // длина в БАЙТАХ (16)
s.is_empty();                     // false
s.trim();                         // "Hello, Rust!"
s.to_lowercase();                 // "  hello, rust!  "
s.to_uppercase();
s.contains("Rust");               // true
s.starts_with('H');               // true (после trim)
s.ends_with("!");
s.replace("Rust", "C++");         // "  Hello, C++!  "
s.split(',').collect::<Vec<_>>(); // ["  Hello", " Rust!  "]
s.chars().count();                // число Unicode-символов
s.chars().nth(2);                 // Some('H')

// Итерация по символам
for ch in s.trim().chars() {
    print!("{ch}");
}

// Преобразование
let bytes = s.as_bytes();         // &[u8]
let as_str: &str = &s;            // приведение к &str
let from_bytes = String::from_utf8_lossy(bytes);
```

**Важно:** индексация `s[0]` не работает — строки — это UTF-8 байты, индекс может попасть внутрь символа. Используйте `s.chars()`, срезы `&s[..n]` только по границам символов, или `.bytes()`.

**Форматирование:**

```rust
println!("{}", 42);                    // 42
println!("{:?}", 42);                   // 42 (Debug)
println!("{:#?}", vec![1, 2, 3]);      // многострочный Debug
println!("{name} is {age}", name="Alice", age=30);  // именованные аргументы
println!("{0} {1} {0}", "hello", "world");  // повтор аргумента
println!("{:b}", 42);                   // двоичное: 101010
println!("{:#x}", 255);                 // шестнадцатеричное с 0x: 0xff
println!("{:.2}", 3.14159);             // 3.14 (2 знака после запятой)
println!("{:>10}", "hi");               // "        hi" (правое выравнивание, ширина 10)
println!("{:0>10}", 42);                // "0000000042" (заполнение нулями)
```

---

## 7. Обработка ошибок

### 7.1 panic — аварийная остановка

```rust
fn main() {
    let v = vec![1, 2, 3];
    // v[10];                    // ❌ panic: index out of bounds
    panic!("всё сломалось");
}
```

`panic!` — для unrecoverable ошибок (неисправимых). Можно настроить поведение при panic:

- `panic = "abort"` в Cargo.toml — просто завершает процесс (меньше кода, меньше overhead)
- `panic = "unwind"` (по умолчанию) — пытается распаковать стек

### 7.2 unwrap / expect — быстрый способ для Result/Option

```rust
fn main() {
    let x: i32 = "42".parse().unwrap();       // 42
    // let y: i32 = "abc".parse().unwrap();   // ❌ panic
    let y: i32 = "42".parse().expect("не число");  // с сообщением

    let opt = Some(7);
    let v = opt.unwrap_or(0);      // 7 — безопасная альтернатива
    let n: Option<i32> = None;
    let v = n.unwrap_or(42);       // 42

    let result: Result<i32, _> = "7".parse();
    let v = result.unwrap_or(0);   // 7
}
```

### 7.3 Оператор `?`

Пробрасывает ошибку наверх, не разворачивая вручную:

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;        // ? возвращает ошибку из функции
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// Более короткий вариант:
fn read_username2(path: &str) -> Result<String, io::Error> {
    std::fs::read_to_string(path)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let name = read_username("user.txt")?;
    println!("{name}");
    Ok(())
}
```

`?` работает с `Result` и `Option`. Для `Option` можно использовать `.ok_or()` или `.ok_or_else()` для преобразования в `Result`.

### 7.4 Собственный тип ошибки

```rust
use std::fmt;

#[derive(Debug)]
enum MyError {
    NotFound(String),
    InvalidNumber(String),
}

impl fmt::Display for MyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MyError::NotFound(name) => write!(f, "не найдено: {name}"),
            MyError::InvalidNumber(s) => write!(f, "не число: {s}"),
        }
    }
}

impl std::error::Error for MyError {}

fn find_user(id: u32) -> Result<String, MyError> {
    if id == 0 {
        Err(MyError::NotFound(format!("id={id}")))
    } else {
        Ok(format!("User-{id}"))
    }
}
```

### 7.5 Конвейер ошибок с anyhow

```rust
use anyhow::{Context, Result};

fn read_config(path: &str) -> Result<String> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("не удалось прочитать файл {path}"))?;
    Ok(content)
}

fn parse_config(content: &str) -> Result<serde_json::Value> {
    let value: serde_json::Value = serde_json::from_str(content)
        .context("невалидный JSON в конфиге")?;
    Ok(value)
}

fn main() -> Result<()> {
    let config = read_config("config.json")?;
    let parsed = parse_config(&config)?;
    println!("{parsed:?}");
    Ok(())
}
```

---

## 8. Обобщения и трейты

### 8.1 Обобщённые функции и структуры

```rust
fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    largest
}

struct Pair<T> {
    first: T,
    second: T,
}

impl<T> Pair<T> {
    fn new(first: T, second: T) -> Pair<T> {
        Pair { first, second }
    }
}

// Специализация для конкретного типа
impl Pair<i32> {
    fn sum(&self) -> i32 {
        self.first + self.second
    }
}

fn main() {
    println!("{}", largest(&[3, 7, 1, 9]));    // 9
    println!("{}", largest(&['a', 'z', 'm'])); // 'z'
    let p = Pair::new(1, 2);
    println!("{}", p.sum());
}
```

### 8.2 Трейты (traits)

```rust
trait Summary {
    fn summarize(&self) -> String;
    fn default_summary(&self) -> String {      // реализация по умолчанию
        String::from("(нет описания)")
    }
}

struct Article {
    title: String,
    author: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("«{}» — {}", self.title, self.author)
    }
}

// Трейт как ограничение (bound)
fn notify<T: Summary>(item: &T) {
    println!("{}", item.summarize());
}

// То же через "trait bounds" синтаксис
fn notify2(item: &impl Summary) {
    println!("{}", item.summarize());
}

fn main() {
    let a = Article { title: String::from("Rust"), author: String::from("Alice") };
    notify(&a);           // «Rust» — Alice
    println!("{}", a.default_summary());
}
```

### 8.3 derive — автоматическая реализация трейтов

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 1, y: 2 };
    println!("{p:?}");                // Debug: Point { x: 1, y: 2 }
    let q = p.clone();                // Clone
    assert_eq!(p, q);                 // PartialEq
}
```

**Общие трейты:** `Debug` (вывод `{:?}`), `Clone`/`Copy` (копирование), `PartialEq`/`Eq` (сравнение), `PartialOrd`/`Ord` (сортировка), `Hash` (для HashMap), `Default` (значения по умолчанию), `Serialize`/`Deserialize` (serde).

### 8.4 Трейты с методами, имеющими реализацию по умолчанию

```rust
trait Animal {
    fn name(&self) -> String;
    fn speak(&self) -> String {
        format!("{} говорит...", self.name())
    }
}

struct Dog {
    name: String,
}

impl Animal for Dog {
    fn name(&self) -> String {
        format!("Собака {}", self.name)
    }
    // speak() использует реализацию по умолчанию
}

fn make_sound(animal: &impl Animal) {
    println!("{}", animal.speak());
}
```

### 8.5 Супертрейты (Supertraits)

Супертрейт ограничивает трейт, требуя реализации другого трейта:

```rust
trait Read {
    fn read(&self) -> String;
}

trait ReadWrite: Read {    // ReadWrite требует Read
    fn write(&self, data: &str);
}

struct File {
    name: String,
}

impl Read for File {
    fn read(&self) -> String {
        format!("содержимое {}", self.name)
    }
}

impl ReadWrite for File {
    fn write(&self, data: &str) {
        println!("записано в {}: {}", self.name, data);
    }
}
```

### 8.6 Объединение трейтов (Trait Bounds)

```rust
fn process<T: std::fmt::Display + std::fmt::Debug>(item: T) {
    println!("Display: {}", item);
    println!("Debug: {:?}", item);
}

// Синтаксис через +:
fn process2(item: &(impl std::fmt::Display + std::fmt::Debug)) {
    println!("{}", item);
}
```

---

## 9. Модули и пакеты

### 9.1 Модули внутри файла

```rust
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    fn secret() { /* приватная */ }

    pub mod constants {
        pub const PI: f64 = 3.14159;
    }
}

use math::constants::PI;
use math::add;

fn main() {
    println!("{}", add(2, 3));
    println!("{PI}");
}
```

По умолчанию всё приватно; `pub` — публичный. `use` подтягивает в область видимости. Можно использовать `pub(crate)` для видимости внутри крейта, `pub(super)` для видимости в родительском модуле.

### 9.2 Модули в файлах

```
my_project/
├── src/
│   ├── main.rs
│   ├── lib.rs            # для библиотеки
│   ├── utils.rs
│   └── models/
│       ├── mod.rs
│       └── user.rs
└── Cargo.toml
```

`mod utils;` в `main.rs` подключает `src/utils.rs`, `mod models;` — `src/models/mod.rs`. Вложенные модули — через `models::user::User`.

```rust
mod utils {
    pub fn greet() {
        println!("привет из utils");
    }
}

mod models {
    pub mod user {
        pub struct User {
            pub name: String,
        }

        impl User {
            pub fn new(name: &str) -> User {
                User { name: name.to_string() }
            }
        }
    }
}

fn main() {
    utils::greet();
    let u = models::user::User::new("Alice");
    println!("{}", u.name);
}
```

### 9.3 Cargo.toml — манифест проекта

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[dev-dependencies]
pretty_assertions = "1"
proptest = "1"

[profile.release]
opt-level = 3
lto = true
```

```bash
cargo add serde          # добавить зависимость (с 1.62)
cargo build              # собрать
cargo run                # запустить
```

### 9.4 Публикация в crates.io

```bash
cargo publish --dry-run      # проверка
cargo publish                  # публикация (нужен токен)
```

`cargo publish` требует: публичный репозиторий с лицензией в `Cargo.toml`, `README.md`, версию, которой нет на crates.io. Для подготовки используйте `cargo login` с API-токеном.

---

## 10. Коллекции

### 10.1 Vec\<T> — динамический массив

```rust
let mut v: Vec<i32> = Vec::new();
v.push(1);
v.push(2);
v.push(3);

let v2 = vec![4, 5, 6];          // макрос

println!("{}", v[0]);            // 1 — паникует при выходе за границы
v.get(10);                       // None — безопасный доступ

v.pop();                         // Some(3) — убрать последний
v.len();                         // 2
v.contains(&2);                  // true
v.remove(0);                     // убрать по индексу
v.sort();                        // сортировка на месте
v.reverse();                     // разворот
v.dedup();                       // убрать дубликаты (после sort)
v.retain(|x| x % 2 == 0);       // оставить только чётные
v.clear();                       // очистить

for x in &v {                    // итерация по ссылкам
    println!("{x}");
}

for x in v {                     // итерация с перемещением
    println!("{x}");
}

// Итерация с индексом
for (i, x) in v.iter().enumerate() {
    println!("{i}: {x}");
}

// Преобразования
let doubled: Vec<i32> = v.iter().map(|x| x * 2).collect();
let sum: i32 = v.iter().sum();
let filtered: Vec<i32> = v.into_iter().filter(|x| x > 2).collect();
```

### 10.2 HashMap\<K, V> — словарь

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Alice"), 10);
scores.insert(String::from("Bob"), 25);

scores.get("Alice");                       // Some(&10)
scores.get("Mallory");                     // None
scores.contains_key("Bob");                // true

scores.entry(String::from("Alice")).or_insert(0);   // вставить, если нет
scores.entry(String::from("Carol")).or_insert(0);   // вставит 0

for (name, score) in &scores {
    println!("{name}: {score}");
}

// Подсчёт слов
let text = "a b a c a b";
let mut counts: HashMap<&str, u32> = HashMap::new();
for word in text.split(' ') {
    *counts.entry(word).or_insert(0) += 1;
}
// {"a": 3, "b": 2, "c": 1}
```

### 10.3 HashSet\<T> — множество

```rust
use std::collections::HashSet;

let mut seen = HashSet::new();
seen.insert(1);
seen.insert(2);
seen.insert(1);                 // не добавится (уже есть)

seen.contains(&2);              // true
seen.len();                     // 2

let a: HashSet<_> = [1, 2, 3].into_iter().collect();
let b: HashSet<_> = [3, 4, 5].into_iter().collect();
let union: HashSet<_> = a.union(&b).collect();        // {1,2,3,4,5}
let inter: HashSet<_> = a.intersection(&b).collect(); // {3}
let diff: HashSet<_> = a.difference(&b).collect();     // {1,2}
let sym_diff: HashSet<_> = a.symmetric_difference(&b).collect(); // {1,2,4,5}
```

### 10.4 VecDeque, LinkedList, BTreeMap, BTreeSet

```rust
use std::collections::{VecDeque, LinkedList, BTreeMap, BTreeSet};

// VecDeque — двусторонняя очередь (O(1) push/pop с обоих концов)
let mut deque: VecDeque<i32> = VecDeque::new();
deque.push_front(1);
deque.push_back(2);
let front = deque.pop_front();  // Some(1)

// BTreeMap — отсортированный словарь (по ключу)
let mut sorted = BTreeMap::new();
sorted.insert("b", 2);
sorted.insert("a", 1);
sorted.insert("c", 3);
// Итерация в порядке ключей: a, b, c
for (k, v) in &sorted {
    println!("{k}: {v}");
}

// BTreeSet — отсортированное множество
let mut set: BTreeSet<i32> = BTreeSet::new();
set.insert(3);
set.insert(1);
set.insert(2);
// Итерация: 1, 2, 3
```

---

## 11. Конкурентность

### 11.1 Потоки (threads)

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..=3 {
            println!("поток: {i}");
            thread::sleep(Duration::from_millis(10));
        }
    });

    for i in 1..=3 {
        println!("главный: {i}");
        thread::sleep(Duration::from_millis(10));
    }

    handle.join().unwrap();      // дождаться завершения
}

// move-замыкание захватывает владение
fn main2() {
    let v = vec![1, 2, 3];
    let handle = thread::spawn(move || {
        println!("{:?}", v);     // v перемещён в поток
    });
    handle.join().unwrap();
}
```

### 11.2 Каналы (mpsc — multiple producer, single consumer)

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        tx.send(String::from("hello")).unwrap();
        tx.send(String::from("world")).unwrap();
    });

    for received in rx {         // итерация по сообщениям
        println!("получено: {received}");
    }
}

// Несколько отправителей
fn multi_producer() {
    let (tx, rx) = mpsc::channel();
    let tx2 = tx.clone();

    thread::spawn(move || { tx.send(1).unwrap(); });
    thread::spawn(move || { tx2.send(2).unwrap(); });

    let values: Vec<i32> = rx.iter().take(2).collect();
    println!("{values:?}");     // [1, 2] (порядок не гарантирован)
}
```

### 11.3 Общее состояние: Arc\<Mutex\<T>>

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        }));
    }

    for h in handles {
        h.join().unwrap();
    }

    println!("итог: {}", *counter.lock().unwrap());   // 10
}
```

- `Arc` — атомарный подсчёт ссылок (разделяемая собственность между потоками);
- `Mutex` — взаимоисключающий доступ (один поток за раз);
- `RwLock` — чтение параллельно, запись эксклюзивно:

```rust
use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    let data = Arc::new(RwLock::new(vec![1, 2, 3]));

    let data_read = Arc::clone(&data);
    let reader = thread::spawn(move || {
        let read_guard = data_read.read().unwrap();
        println!("чтение: {:?}", *read_guard);
    });

    let data_write = Arc::clone(&data);
    let writer = thread::spawn(move || {
        let mut write_guard = data_write.write().unwrap();
        write_guard.push(4);
    });

    reader.join().unwrap();
    writer.join().unwrap();
    println!("итог: {:?}", *data.read().unwrap());
}
```

### 11.4 Scoped Threads (стабильно с Rust 1.63+)

```rust
use std::thread;

fn main() {
    let mut v = vec![1, 2, 3];

    // scoped threads — не нужен Arc/Mutex, т.к. компилятор гарантирует
    // что все потоки завершатся до выхода из области видимости
    thread::scope(|s| {
        s.spawn(|| {
            println!("вектор: {:?}", v);  // ✅ можно читать v
        });
        s.spawn(|| {
            v.push(4);  // ✅ можно изменять v
        });
    });
    // v доступен здесь — все потоки завершены
    println!("{v:?}");  // [1, 2, 3, 4]
}
```

### 11.5 async/await — кратко

Асинхронный код работает на `tokio` (не в std). Подходит для I/O-bound задач (HTTP, БД).

```rust
// Cargo.toml: tokio = { version = "1", features = ["full"] }

use std::time::Duration;

async fn fetch_user(id: u32) -> String {
    tokio::time::sleep(Duration::from_millis(50)).await;
    format!("User-{id}")
}

#[tokio::main]
async fn main() {
    let (a, b) = tokio::join!(
        fetch_user(1),
        fetch_user(2)
    );
    println!("{a} {b}");
}
```

`async fn` возвращает `Future`; выполняется в runtime (`#[tokio::main]`). `await` — точка ожидания, не блокирует поток. Подробнее — в `details.md`.

---

## 12. Тестирование

Тесты пишутся в `#[cfg(test)]`-модуле или в отдельной папке `tests/`.

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 2), 4);
        assert_ne!(add(2, 2), 5);
    }

    #[test]
    fn test_failing() {
        assert!(false, "этот тест упадёт");
    }

    #[test]
    #[should_panic(expected = "boom")]
    fn test_panics() {
        panic!("boom");
    }

    #[test]
    fn test_result_type() -> Result<(), String> {
        if add(1, 1) == 2 {
            Ok(())
        } else {
            Err(String::from("неверная сумма"))
        }
    }

    #[test]
    #[ignore]                     // пропуск по умолчанию
    fn slow_test() {}
}
```

```bash
cargo test                    # все тесты
cargo test test_add           # фильтр по имени
cargo test -- --nocapture     # показать println!
cargo test -- --ignored       # только ignored
cargo test --release          # тесты в release
```

### Интеграционные тесты

Папка `tests/` — каждый файл — отдельный интеграционный тест:

```
my_project/
├── src/
│   └── lib.rs
└── tests/
    ├── integration_test.rs
    └── another_test.rs
```

```rust
// tests/integration_test.rs
use my_lib::add;

#[test]
fn test_add_from_lib() {
    assert_eq!(add(2, 3), 5);
}
```

### Doc-тесты

Тесты прямо в документации:

```rust
/// Складывает два числа
///
/// # Примеры
///
/// ```
/// let result = my_crate::add(2, 3);
/// assert_eq!(result, 5);
/// ```
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

```bash
cargo test --doc           # запустить doc-тесты
```

---

## 13. Популярные крейты

| Крейт | Назначение |
|-------|-----------|
| [serde](https://docs.rs/serde) | Сериализация/десериализация (JSON, YAML, BSON, ...) |
| [tokio](https://docs.rs/tokio) | Асинхронный runtime, сети, таймеры, ввод-вывод |
| [axum](https://docs.rs/axum) | Веб-фреймворк от команды tokio (HTTP-серверы, API) |
| [actix-web](https://docs.rs/actix-web) | Альтернативный высокопроизводительный веб-фреймворк |
| [rayon](https://docs.rs/rayon) | Параллельные итераторы (data parallelism) |
| [clap](https://docs.rs/clap) | Парсинг аргументов командной строки (CLI) |
| [thiserror](https://docs.rs/thiserror) | Удобные типы ошибок через derive |
| [anyhow](https://docs.rs/anyhow) | Простая обработка ошибок в приложениях |
| [reqwest](https://docs.rs/reqwest) | HTTP-клиент (sync и async) |
| [chrono](https://docs.rs/chrono) | Дата и время |
| [rand](https://docs.rs/rand) | Генерация случайных чисел |
| [log](https://docs.rs/log) + [env_logger](https://docs.rs/env_logger) | Логирование |
| [tracing](https://docs.rs/tracing) | Структурированное логирование/трассировка |
| [sqlx](https://docs.rs/sqlx) | Асинхронная работа с БД (компилируемые запросы) |
| [diesel](https://docs.rs/diesel) | ORM |
| [tui-rs](https://docs.rs/tui) / [ratatui](https://docs.rs/ratatui) | TUI-приложения |
| [proptest](https://docs.rs/proptest) | Property-based тестирование |
| [criterion](https://docs.rs/criterion) | Бенчмаркинг |
| [insta](https://docs.rs/insta) | Snapshot-тестирование |
| [crossbeam](https://docs.rs/crossbeam) | Низкоуровневые конкурентные примитивы |
| [parking_lot](https://docs.rs/parking_lot) | Более производительные Mutex/RwLock |

---

## 14. Полезные команды

```bash
cargo new project_name        # новый проект
cargo init                    # инициализация в текущей папке
cargo build                   # сборка (debug)
cargo build --release         # сборка с оптимизациями
cargo run                     # сборка + запуск
cargo run --release
cargo check                   # быстрая проверка без кодогенерации
cargo test                    # тесты
cargo test test_add           # фильтр по имени
cargo test -- --nocapture   # показать println!
cargo clippy                  # линтер (ловит неидиоматичный код)
cargo clippy -- -D warnings  # предупреждения как ошибки
cargo fmt                     # форматирование по rustfmt
cargo fmt --check             # проверить форматирование (для CI)
cargo add <crate>             # добавить зависимость
cargo remove <crate>
cargo doc                     # сборка документации
cargo doc --open
cargo publish                 # публикация в crates.io
cargo expand                  # разворачивание макросов (cargo-expand)
cargo audit                   # проверка зависимостей на уязвимости
cargo outdated                # проверить устаревшие зависимости
cargo bloat                   # анализ размера бинарника
cargo clean                   # удалить build/ артефакты
```

Файлы: `Cargo.toml` (манифест), `Cargo.lock` (зафиксированные версии, в git для бинарников). Проект хранится в `src/`.

---

## 15. Ресурсы

- **[The Rust Book](https://doc.rust-lang.org/book/)** — официальная книга (есть русский перевод)
- **[Rust by Example](https://doc.rust-lang.org/rust-by-example/)** — язык через примеры
- **[Exercism Rust Track](https://exercism.org/tracks/rust)** — практика с менторами
- **[Rustlings](https://github.com/rust-lang/rustlings)** — маленькие упражнения в терминале
- **[Rust Playground](https://play.rust-lang.org/)** — код в браузере
- **[docs.rs](https://docs.rs)** — документация всех крейтов
- **[crates.io](https://crates.io)** — реестр пакетов
- **[Tour of Rust](https://tourofrust.com)** — короткий интерактивный курс
- **[Rust Design Patterns](https://rust-unofficial.github.io/patterns/)** — паттерны проектирования
- **[r/rust](https://www.reddit.com/r/rust/)** и **This Week in Rust** — новости сообщества
- **[Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)** — стиль написания библиотек
- **[Rust Performance Book](https://nnethercote.github.io/perf-book/)** — оптимизация производительности
- **[Rust Security Response](https://security.rust-lang.org/)** — политика безопасности

---

## 🎓 Курс

| Unit | Тема | Содержание |
|------|------|-----------|
| [Unit 1](unit-01/syntax.md) | Основы | Переменные, типы, функции, владение, заимствование, срезы, управляющие конструкции, замыкания |
| [Unit 2](unit-02/syntax.md) | Структуры и перечисления | struct, enum, Option/Result, match, impl, методы, коллекции (Vec, HashMap, HashSet), derive |
| [Unit 3](unit-03/syntax.md) | Ошибки, трейты, конкурентность | Обработка ошибок, трейты, обобщения, модули, потоки, каналы, Arc/Mutex, RwLock, тестирование |

Каждый unit включает: теорию, задачи, разбор.

- [Unit 1: задачи](unit-01/practice.md) | [Unit 2: задачи](unit-02/practice.md) | [Unit 3: задачи](unit-03/practice.md)

Дополнительно:

- [Детали: lifetimes, unsafe, макросы, async/await](details.md)
- [Практические проекты](projects/index.md)

---

## Рекомендуемый порядок изучения

### Для новичков в программировании

1. **Unit 1** — основы синтаксиса, переменные, типы, функции, владение, заимствование, срезы
2. **Unit 2** — структуры, перечисления, Option/Result, методы, коллекции
3. **Unit 3** — обработка ошибок, трейты, конкурентность, тестирование
4. **details.md** — lifetimes, unsafe, макросы, async/await в глубину
5. **Проекты** — начать с простых (grepsh, угадай число), затем переходить к сложным

### Для опытных программистов (из другого языка)

1. **Unit 1** — но с акцентом на владение и заимствование (это главная сложность)
2. **Unit 2** — структуры, enum, match — быстро, знакомые паттерны
3. **Unit 3** — трейты, обобщения, конкурентность — ключевые отличия от других языков
4. **details.md** — lifetimes (глава 1), trait objects (глава 2), async/await (глава 7)
5. **Проекты** — сразу к средним проектам (todo-api, парсер)

### Для тех, кто уже знает C/C++

1. **Unit 1** — владение вместо manual memory management, заимствование вместо raw pointers
2. **Unit 2** — enum с данными вместо union/variant, match вместо switch
3. **Unit 3** — трейты вместо виртуальных функций, Arc/Mutex вместо shared_ptr + mutex
4. **details.md** — unsafe (глава 4) — аналогичен C, но с контрактами; Pin (глава 6) — аналог unique_ptr для self-referential типов
5. **Проекты** — grepsh (CLI), todo-api (веб), парсер (AST)

### Для тех, кто знает Go/Python/JS

1. **Unit 1** — владение и заимствование — ключевая концепция, которой нет в вашем языке
2. **Unit 2** — enum с данными, Option/Result — замена nil/exception
3. **Unit 3** — трейты (аналог интерфейсов Go, но с generics), конкурентность (потоки вместо горутин)
4. **details.md** — lifetimes (аналог borrow checker в Go, но строже), async/await (аналог goroutines + channels)
5. **Проекты** — grepsh (аналог grep/awk), todo-api (аналог Flask/FastAPI)

### Общий план на 4–6 недель

| Неделя | Фокус | Задачи |
|--------|-------|--------|
| 1 | Unit 1 + Unit 2 основы | Все задачи из practice.md Unit 1 и Unit 2 |
| 2 | Unit 2 продвинутый + Unit 3 основы | Все задачи из practice.md Unit 2 и Unit 3 |
| 3 | details.md (lifetimes, unsafe, async) | Переписать проекты с использованием продвинутых фич |
| 4 | Проект 1 (grepsh) | Реализовать CLI-утилиту с clap |
| 5 | Проект 2 (todo-api) или Проект 3 (парсер) | Выбрать по интересу |
| 6 | Проект 4 (угадай число) + завершение | Углубиться в rand, match, обработку ошибок |

---

*Полный конспект Rust. Регулярно дополняется.*
