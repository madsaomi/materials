# JavaScript — Unit 1: Основы

## Переменные и типы

```javascript
// var (устарел), let, const
let name = "Алиса"
const age = 25
var old = "не используй"

// типы
typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" (историческая ошибка)
```

## Строки

```javascript
let s = "Hello"
s.length           // 5
s.toUpperCase()    // "HELLO"
s.includes("ell")  // true
s.split("")        // ['H','e','l','l','o']
`Привет, ${name}!` // шаблонные строки
```

## Числа и операторы

```javascript
let a = 10, b = 3
a + b   // 13
a - b   // 7
a * b   // 30
a / b   // 3.333...
a % b   // 1
a ** b  // 1000
Math.max(1, 5, 3)  // 5
Math.floor(3.7)    // 3
```

## Массивы

```javascript
let arr = [1, 2, 3, 4, 5]
arr.push(6)        // добавить в конец
arr.pop()          // удалить последний
arr.unshift(0)     // добавить в начало
arr.shift()        // удалить первый
arr.slice(1, 3)    // [2, 3]
arr.includes(3)    // true
arr.indexOf(3)     // 2
```

## Функции

```javascript
// Function declaration
function add(a, b) { return a + b }

// Arrow function
const multiply = (a, b) => a * b

// Функция как аргумент
setTimeout(() => console.log("Прошла 1с"), 1000)
```

## Условия

```javascript
let age = 20
if (age >= 18) {
    console.log("Взрослый")
} else if (age >= 13) {
    console.log("Подросток")
} else {
    console.log("Ребёнок")
}

// Тернарный оператор
let status = age >= 18 ? "взрослый" : "ребёнок"

// switch
switch (age) {
    case 18: console.log("18!"); break
    default: console.log("другое")
}
```

## Циклы

```javascript
// for
for (let i = 0; i < 5; i++) console.log(i)

// for...of (массивы)
for (let item of arr) console.log(item)

// for...in (объекты)
for (let key in obj) console.log(key, obj[key])

// while
let i = 0
while (i < 3) { console.log(i); i++ }
```

## Объекты

```javascript
const person = {
    name: "Алиса",
    age: 25,
    greet() {
        console.log(`Привет, я ${this.name}!`)
    }
}
person.greet()      // Привет, я Алиса!
person.city = "Мск" // добавить поле
delete person.age   // удалить поле
```

## Задачи

1. Напишите функцию, проверяющую чётность числа
2. Создайте массив чисел 1-10 и отфильтруйте чётные
3. Напишите программу FizzBuzz
4. Создайте объект "книга" с полями title, author, year и методом info()

---

## 10. Область видимости (Scope)

Область видимости определяет, где переменная доступна. В JS три уровня: глобальный, функциональный и блочный.

```javascript
const global = "видна везде"

function f() {
    const inFunc = "видна внутри функции"
    if (true) {
        let inBlock = "видна внутри блока"
        var inBlockVar = "всплывает в функцию"
        console.log(global, inFunc, inBlock)  // всё доступно
    }
    // console.log(inBlock)   // ReferenceError!
    console.log(inBlockVar)  // ок: var не знает про блоки
}
```

| Директива | Область       | Переназначение | Хойстинг                | Рекомендация |
|-----------|---------------|----------------|-------------------------|--------------|
| `var`     | функция       | да             | `undefined` в начале    | не использовать |
| `let`     | блок `{ }`    | да             | без инициализации (TDZ) | изменяемые значения |
| `const`   | блок `{ }`    | нет            | без инициализации (TDZ) | по умолчанию |

Правила, которые я вывел на практик:

| Ситуация                          | Что писать | Почему                              |
|-----------------------------------|-----------|-------------------------------------|
| Значение не меняется              | `const`   | защищает от случайного переназначения |
| Значение меняется (счётчик и т.п.)| `let`     | изменяемость нужна                  |
| Работа с legacy-кодом             | `var`     | только если нельзя переписать       |
| Константы верхнего уровня         | `const UPPER = 42` | naming-конвенция для явных констант |

## 11. Хойстинг (поднятие)

Движок JS *поднимает* объявления вверх своей области видимости.

```javascript
sayHi()                 // работает! function declaration поднята целиком
function sayHi() {
    console.log("Привет")
}

console.log(x)          // undefined (объявление поднято, значение нет)
var x = 5

// console.log(y)        // ReferenceError: Temporal Dead Zone (TDZ)
let y = 10
```

Таблица поведения:

| Конструкция              | Поднимается?     | Поведение до объявления |
|--------------------------|------------------|--------------------------|
| `function` declaration   | да (целиком)     | вызывать можно            |
| `var x = 5`              | да (объявление)  | `undefined`               |
| `class`                  | да (неактивна)   | `ReferenceError`          |
| `let` / `const`          | да (неинициализ.)| `ReferenceError` (TDZ)    |

> Личное правило: объявлять всё с `const`/`let` в верхней части блока — меньше сюрпризов с хойстингом.

## 12. Типы данных: полный справочник

В JS 7 примитивов и объектные типы.

| Тип          | typeof       | Пример                       | Особенность |
|--------------|--------------|------------------------------|-------------|
| string       | `"string"`   | `"привет"`                   | строки неизменяемы |
| number       | `"number"`   | `42`, `3.14`                 | всегда float (64-bit) |
| bigint       | `"bigint"`   | `42n`                        | для целых сверх 2^53 |
| boolean      | `"boolean"`  | `true` / `false`             | — |
| undefined    | `"undefined"`| `let x`                      | «ещё не назначено» |
| null         | `"object"`   | `null`                       | «намеренно пусто» (баг typeof) |
| symbol       | `"symbol"`   | `Symbol("id")`               | уникальные идентификаторы |
| объект/функция | `"object"`/`"function"` | `{ }`, `[]`, `() => {}` | ссылочный тип |

```javascript
// Практика: отличаем между собой
Array.isArray([])          // true
Array.isArray({})          // false
typeof null               // "object" — исторический баг, так и осталось
Number.isNaN(NaN)          // true
NaN === NaN               // false!
Object.is(NaN, NaN)        // true

// Number.isNaN vs isNaN (глобальная)
isNaN("abc")              // true  (приводит к числу!)
Number.isNaN("abc")       // false (проверяет строго)
```

Проверка «чего-то настоящего»:

```javascript
const x = value ?? "default"   // null/undefined -> default
const y = value || "default"   // любые falsy -> default (кроме 0, "", false)
const isSet = value != null    // true, если не null и не undefined
```

## 13. Приведение типов (Coercion)

JS автоматически приводит типы. Это главный источник багов новичков.

```javascript
// Явное приведение
Number("42")     // 42
Number("12px")   // NaN
String(42)       // "42"
Boolean(0)       // false
parseInt("42px") // 42
parseFloat("3.5em") // 3.5

// Неявное приведение — опасная зона
"1" + 2          // "12"  (сложение со строкой склеивает)
"1" - 2          // -1    (минус не для строк, считает как числа)
"5" * "2"        // 10
+"42"            // 42    (унарный плюс)

1 == "1"         // true  (нестрогое сравнение приводит)
1 === "1"        // false (строгое — и тип и значение)
```

| Выражение            | Результат | Комментарий |
|----------------------|-----------|-------------|
| `"1" + 2`            | `"12"`    | `+` со строкой → конкатенация |
| `"1" * 2`            | `2`       | `*` приводит строку к числу |
| `0 == false`         | `true`    | нестрогое сравнение |
| `0 === false`        | `false`   | строгое сравнение |
| `null == undefined`  | `true`    | специальный случай |
| `null === undefined` | `false`   | разные типы |
| `[] == false`        | `true`    | пустой массив приводится к `""` → `0` |
| `"" == 0`            | `true`    | пустая строка → 0 |

Порядок в неявном сравнении `a == b`:
1. одинаковые типы → сравниваются как есть;
2. `null` vs `undefined` → `true`;
3. число и строка → строка становится числом;
4. boolean приводится к числу (`true`→1, `false`→0);
5. объект сравнивается с примитивом через `valueOf()`/`toString()`.

> Правило: **всегда `===` и явное приведение**. `==` только когда намеренно сравниваете с `null`/`undefined`: `val == null` равно `val === null || val === undefined`.

## 14. Числа: арифметика и особенности float

```javascript
// Целые и дробные — один тип number (двоичная плавающая точка)
0.1 + 0.2               // 0.30000000000000004  («не та» сумма)
(0.1 + 0.2).toFixed(2)  // "0.30"
Math.round((0.1 + 0.2) * 100) / 100  // 0.3

// Деление и остаток
7 / 2    // 3.5
7 % 2    // 1
8 % 3    // 2
-8 % 3   // -2 (знак делимого)

// Специальные значения
1 / 0              // Infinity
-1 / 0             // -Infinity
"abc" * 2          // NaN
Number.MAX_SAFE_INTEGER   // 9007199254740991
9007199254740991n + 1n    // bigint для «честных» больших целых
```

| Метод Math           | Результат | Пример |
|----------------------|-----------|--------|
| `Math.floor(x)`      | вниз       | `3.7` → `3`, `-3.7` → `-4` |
| `Math.ceil(x)`       | вверх      | `3.1` → `4`, `-3.1` → `-3` |
| `Math.round(x)`      | к ближайшему | `3.5` → `4`, `3.4` → `3` |
| `Math.trunc(x)`      | отбросить дробь | `3.7` → `3`, `-3.7` → `-3` |
| `Math.abs(x)`        | модуль     | `-5` → `5` |
| `Math.min/max(...)`  | мин/макс   | `Math.max(1, 5, 3)` → `5` |
| `Math.random()`      | [0, 1)     | псевдослучайное |
| `Math.pow(a, b)`     | степень    | `Math.pow(2, 10)` → `1024` |
| `Math.sqrt(x)`       | корень     | `Math.sqrt(144)` → `12` |

Генерация случайных чисел:

```javascript
// 0..9
Math.floor(Math.random() * 10)
// 1..6 (кубик)
Math.floor(Math.random() * 6) + 1
// min..max включительно
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Форматирование
(1234.5678).toFixed(2)        // "1234.57"
(1000000).toLocaleString("ru-RU") // "1 000 000"
(0.5).toLocaleString("ru-RU", { style: "percent" }) // "50 %"
```

## 15. Строки: полный обзор методов

Строки неизменяемы — каждый метод возвращает *новую* строку.

```javascript
const s = "  JavaScript  язык  "

s.length             // длина
s[0]                 // "J" (только чтение)
s.at(-1)             // "я" от конца (ES2022)
s.toUpperCase()      // "  JAVASCRIPT  ЯЗЫК  "
s.toLowerCase()      // "  javascript  язык  "
s.trim()             // "JavaScript  язык" (убирает краевые пробелы)
s.trimStart()        // "JavaScript  язык  "
s.split(/\s+/)       // разделить по пробелам
s.repeat(3)          // повторить
s.padStart(10, "*")  // "******кот" выровнять по длине
s.padEnd(10, ".")    // "season 1..."
"hello".charCodeAt(0) // 104 код символа
String.fromCharCode(104) // "h"
```

| Метод                  | Что делает                  | Пример → результат |
|------------------------|-----------------------------|--------------------|
| `includes(sub)`        | содержит подстроку           | `"abc".includes("b")` → `true` |
| `startsWith(pre)`      | начинается с                 | `"cat".startsWith("ca")` → `true` |
| `endsWith(suf)`        | заканчивается на             | `"cat".endsWith("t")` → `true` |
| `indexOf(sub)`         | первая позиция или `-1`      | `"banana".indexOf("na")` → `2` |
| `lastIndexOf(sub)`     | последняя позиция            | `"banana".lastIndexOf("na")` → `4` |
| `slice(a, b)`          | вырезать [a, b)              | `"hello".slice(1, 3)` → `"el"` |
| `substring(a, b)`      | вырезать (без отрицательных) | `"hello".substring(1, 3)` → `"el"` |
| `replace(a, b)`        | заменить первое вхождение    | `"cat".replace("c","C")` → `"Cat"` |
| `replaceAll(a, b)`     | заменить все                 | `"catcat".replaceAll("c","C")` → `"CatCat"` |
| `split(sep)`           | разбить в массив             | `"a,b".split(",")` → `["a","b"]` |
| `join(sep)`            | (метод массива) склеить      | `["a","b"].join("")` → `"ab"` |

Шаблонные строки (template literals):

```javascript
const name = "Алиса"
const age = 25
const msg = `${name} учит JS ${age} лет`  // подстановка
const multi = `первая строка
вторая строка`                             // многострочность
const tagged = `итог: ${10 * 3}`          // любые выражения
```

## 16. Массивы: продвинутые методы и итерация

Три группы: мутирующие (меняют исходный), возвращающие новый, вызывающие функцию на элементах.

| Метод                  | Меняет исходный | Описание | Пример |
|------------------------|-----------------|----------|--------|
| `push(x)` / `pop()`    | да              | добавить/убрать конец | — |
| `unshift(x)` / `shift()` | да            | добавить/убрать начало | — |
| `splice(i, n, ...x)`   | да              | удалить/вставить | `arr.splice(1,1)` |
| `concat(arr)`          | нет             | слить копии    | `[1].concat([2])` → `[1,2]` |
| `slice(a, b)`          | нет             | копия диапазона | `[1,2,3].slice(1)` → `[2,3]` |
| `map(f)`               | нет             | преобразовать каждый | `[1,2].map(x=>x*2)` → `[2,4]` |
| `filter(f)`            | нет             | оставить подходящие | `[1,2,3].filter(x=>x>1)` → `[2,3]` |
| `reduce(f, init)`      | нет             | свернуть в одно значение | `[1,2].reduce((a,b)=>a+b,0)` → `3` |
| `find(f)`              | нет             | первый подходящий | `[1,2].find(x=>x>1)` → `2` |
| `findIndex(f)`         | нет             | индекс первого | `[1,2].findIndex(x=>x>1)` → `1` |
| `some(f)`              | нет             | хотя бы один? | `[1,2].some(x=>x>1)` → `true` |
| `every(f)`             | нет             | все подходят? | `[1,2].every(x=>x>0)` → `true` |
| `flat(depth)`          | нет             | расплющить    | `[[1],[2]].flat()` → `[1,2]` |
| `flatMap(f)`           | нет             | map + flat(1) | `"ab cd".split(" ").flatMap(w=>w.split(""))` |
| `sort(f)`              | да              | сортировка    | `[3,1,2].sort((a,b)=>a-b)` → `[1,2,3]` |
| `toSorted(f)` (ES2023) | нет             | новая копия   | `arr.toSorted()` |

Метод `reduce` разобрать отдельно — самые частые кластеры:

```javascript
// сумма
[1, 2, 3].reduce((acc, x) => acc + x, 0)        // 6

// макс
[1, 7, 3].reduce((acc, x) => Math.max(acc, x))  // 7

// группировка по свойству
const users = [{ name: "Алиса", city: "Мск" }, { name: "Боб", city: "Мск" }, { name: "Кит", city: "Спб" }]
users.reduce((acc, u) => {
    (acc[u.city] ||= []).push(u.name)
    return acc
}, {})
// { "Мск": ["Алиса", "Боб"], "Спб": ["Кит"] }

// массив -> объект look-up
[("a", 1), ("b", 2)].reduce((acc, [k, v]) => (acc[k] = v, acc), {})  // { a: 1, b: 2 }
```

Деструктуризация и spread:

```javascript
const [first, second, ...rest] = [1, 2, 3, 4]  // 1, 2, [3, 4]
const copy = [...arr]                           // копия массива
const merged = [...a, ...b]                     // слияние
const max = Math.max(...numbers)                // разворачивание в аргументы
const [, secondEl] = arr                        // пропуск первого
const [x = "default"] = []                      // значение по умолчанию
```

## 17. Объекты: ссылки, копии, методы Object

```javascript
const user = {
    name: "Алиса",
    address: { city: "Мск" },       // вложенный объект
    tags: ["js", "ts"]              // вложенный массив
}

// Доступ
user.name            // "Алиса"
user["name"]         // "Алиса"
user.address.city    // "Мск"
const key = "name"
user[key]            // "Алиса" — динамический ключ

// Операции с ключами
Object.keys(user)     // ["name", "address", "tags"]
Object.values(user)   // ["Алиса", {...}, [...]]
Object.entries(user)  // [["name","Алиса"], ...]
const hasName = "name" in user          // true
const own = user.hasOwnProperty("name") // true
```

**Ссылки и копии** — ключевая тема:

```javascript
const a = { count: 1 }
const b = a          // b ссылается на ТОТ ЖЕ объект
b.count = 99
a.count              // 99! изменились оба

// неглубокая копия
const shallow = { ...a }            // верхний уровень отдельный
const shallow2 = Object.assign({}, a)

// глубокая копия (JSON-способ, для данных без функций/undefined)
const deep = JSON.parse(JSON.stringify(a))

// неглубокая копия оставляет вложенные ссылки
shallow.count = 5
a.count              // 99 (не пострадал)
shallow2.count       // 5
```

**Продвинутые приёмы объектов:**

```javascript
// computed properties (вычисляемые ключи)
const field = "price"
const item = { [field]: 99, ["group_" + field]: "cheap" }

// сокращённые свойства и методы
const name = "Алиса"
const obj = { name, greet() { return "hi" } }  // { name: "Алиса", ... }

// деструктуризация с переименованием и default
const { name: n, age = 18, ...restProps } = user

// обмен значениями без временной переменной
[a, b] = [b, a]

// защита от модификации
Object.freeze(obj)      // только чтение
Object.seal(obj)        // нельзя добавить/удалить ключи, менять можно
```

| Метод / оператор              | Что проверяет/делает |
|-------------------------------|----------------------|
| `Object.keys/values/entries`  | перечисляемые собственные поля |
| `"k" in obj`                  | ключ есть (включая из прототипа) |
| `Object.hasOwn(obj, "k")`     | только собственный (ES2022) |
| `Object.assign(target, srcs)` | скопировать собственные поля |
| `{ ...obj }`                  | неглубокая копия / слияние `{ ...a, ...b }` |
| `JSON.stringify(obj)`         | сериализация (пропускает функции и `undefined`) |

## 18. Операторы: приоритеты и логические особенности

| Приоритет (от высокого) | Операторы |
|-------------------------|-----------|
| 1 | `()` группировка, `?.[]` доступ |
| 2 | унарные `-`, `!`, `typeof`, `++`, `--` |
| 3 | `**` |
| 4 | `*`, `/`, `%` |
| 5 | `+`, `-` |
| 6 | `<`, `>`, `<=`, `>=` |
| 7 | `===`, `!==`, `==`, `!=` |
| 8 | `&&` |
| 9 | `\|\|` |
| 10 | `??` |
| 11 | `=`, `+=`, `? :` (справа налево) |

```javascript
// Логические И/ИЛИ возвращают ОДНО из значений (не boolean!)
"a" || "b"        // "a"  (первое truthy)
"" || "default"   // "default"
0 || 42           // 42
0 ?? 42           // 0   (?? игнорирует только null/undefined)
null ?? "d"       // "d"
undefined ?? "d"  // "d"

// Короткое замыкание
false && doSomething()   // doSomething НЕ вызовется
true || doSomething()    // тоже не вызовется

// ?? нельзя мешать с || без скобок
// null || 0 ?? "x"   // SyntaxError
(null || 0) ?? "x"  // 0

// Optional chaining
user?.address?.city ?? "нет данных"
cancel?.()
arr?.[0] ?? "пусто"
```

## 19. Условия: truthy/falsy, switch, тернарник

**Falsy значений ровно девять.** Всё остальное — truthy.

```javascript
// falsy: false, 0, -0, 0n, "", null, undefined, NaN, document.all
if (0) console.log("не выполнится")
if ("") console.log("не выполнится")
if ([]) console.log("пустой массив — truthy!")      // выполнится
if ({}) console.log("пустой объект — truthy!")      // выполнится
if ("0") console.log("строка '0' — truthy!")        // выполнится!
```

| Значение        | В `if` | Комментарий для себя |
|-----------------|--------|----------------------|
| `0`             | false  | проверять `x === 0`, а не `if (x)` |
| `""`            | false  | пустая строка |
| `[]`            | true   | пустой массив truthy |
| `{}`            | true   | пустой объект truthy |
| `NaN`           | false  | самое «молчаливое» falsy |
| `"0"`           | true   | строка-ноль truthy |
| `null`/`undefined` | false | отсутствие значения |

`switch` — строгое сравнение (`===`), без «проваливания» только с `break`:

```javascript
const day = "пн"
switch (day) {
    case "сб":
    case "вс":
        console.log("выходной")
        break
    case "пн":
    case "пт":
    case "пт":               // дубликат case = ошибка, но JS не запретит
        console.log("рабочий")
        break
    default:
        console.log("не знаю")
}
```

Цепочки тернарников (использовать осторожно):

```javascript
const g = s >= 90 ? "5" : s >= 75 ? "4" : s >= 60 ? "3" : "2"
```

## 20. Циклы: все конструкции и управление

| Конструкция   | Когда использовать          | Пример индекса |
|---------------|----------------------------|-------------------|
| `for`         | известное число итераций   | `for (let i = 0; i < n; i++)` |
| `while`       | условие до выполнения      | `while (user === null)` |
| `do...while`  | хотя бы одна итерация      | `do { x = roll() } while (x !== 6)` |
| `for...of`    | перебор элементов           | `for (const item of arr)` |
| `for...in`    | перебор ключей объекта      | `for (const key in obj)` |
| `forEach`     | метод массива, не for...of  | `arr.forEach((v, i) => ...)` |

```javascript
// for...in — лучше не для массивов: отдаёт и индексы, и наследуемые ключи
const obj = { a: 1, b: 2, c: 3 }
for (const key in obj) console.log(key, obj[key])

// for...of — правильный способ для массивов и строк
const word = "кот"
for (const ch of word) console.log(ch)  // к, о, т

// Управление циклом
for (let i = 0; i < 10; i++) {
    if (i % 2) continue       // пропустить нечётные
    if (i === 8) break        // выйти на 8
    console.log(i)            // 0 2 4 6
}

// вложенные циклы и метки (labels) — обычно лучше вынести в функцию
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) break outer
        console.log(i, j)
    }
}
```

Рецепты:

```javascript
// простая индексация, если нужны оба цикла
for (let i = 0; i < arr.length; i++) {
    console.log(i, arr[i])
}

// перебор Map
for (const [key, value] of map) console.log(key, value)

// бесконечный с выходом по условию
while (true) {
    const cmd = getCommand()
    if (cmd === "exit") break
}
```

## 21. Функции: параметры, this, замыкания

```javascript
// Function declaration — хойстинг полный
function add(a, b) { return a + b }

// Function expression — не поднимается
const add2 = function(a, b) { return a + b }

// Arrow — короткая, нет своего this/arguments
const add3 = (a, b) => a + b

// Параметры по умолчанию
function greet(name = "Гость", times = 1) {
    return `Привет, ${name} `.repeat(times).trim()
}

// Rest-параметры — собрать всё «лишнее» в массив
function sum(...nums) {
    return nums.reduce((a, b) => a + b, 0)
}

// arguments — только в обычных функциях (не стрелках)
function legacy() {
    return Array.from(arguments).length
}
```

| Ключевой момент          | Обычная функция | Стрелочная |
|--------------------------|-----------------|------------|
| `this`                   | зависит от вызова | наследует из внешнего контекста |
| `arguments`              | есть            | нет        |
| `new` (конструктор)      | можно           | нельзя     |
| `super`                  | есть (в классах)| нет        |
| «поднятие»               | полное          | нет (const) |

`this` в разных вызовах:

```javascript
function show() { console.log(this) }
show()                 // window / global (undefined в strict)
obj.show()             // obj        — контекст объекта-владельца
new show()             // новый объект
show.call(otherObj)    // otherObj   — явный контекст
const s = show.bind(obj)  // навсегда привязан к obj

// Замыкание: функция «запоминает» внешние переменные
function makeCounter(start = 0) {
    let count = start                 // приватная «капсула»
    return {
        up: () => ++count,
        down: () => --count,
        get: () => count
    }
}
const c = makeCounter(5)
c.up()     // 6
c.down()   // 5
```

Практический пример фабрики (замыкание на параметре):

```javascript
const formatBy = (pre) => (n) => `${pre}${n}`
const withSign = formatBy("+")
withSign(100)   // "+100"
```

## 22. Встроенные объекты: Math, Date, JSON, Number

```javascript
// Date
const now = new Date()
now.getFullYear()          // 2026
now.getMonth()             // 0..11 (!) август = 7
now.getDate()              // день месяца 1..31
now.getDay()               // день недели 0(вс)..6
now.toLocaleDateString("ru-RU")   // "30.08.2026"
now.toLocaleTimeString("ru-RU")   // локальное время
new Date(2026, 7, 30)      // 30 августа 2026 (месяцы с 0)
Date.now()                 // миллисекунды с 1970

// Разность дат — в миллисекундах
const start = Date.now()
// ...работа...
const diff = Math.round((Date.now() - start) / 1000)  // секунды

// JSON
const user = { name: "Алиса", age: 25 }
const str  = JSON.stringify(user)          // '{"name":"Алиса","age":25}'
const back = JSON.parse(str)               // обратно объект
JSON.stringify({ a: undefined, f: () => {} })  // '{}' — пропускает не-JSON

// Number
Number.isInteger(42)      // true
Number.isFinite(1/0)      // false (Infinity)
Number.isNaN("x")         // false — не приводит тип
(255).toString(16)        // "ff"  — в другой системе счисления
Number("1 000".replaceAll(" ", ""))  // 1000
```

## 23. Обработка ошибок: try/catch/throw

```javascript
try {
    const data = JSON.parse("не-json")
} catch (err) {
    console.error("Ошибка:", err.message)
} finally {
    console.log("Выполнится в любом случае")
}

// Свой тип ошибки
class ValidationError extends Error {
    constructor(message, field) {
        super(message)
        this.name = "ValidationError"
        this.field = field
    }
}

function validateAge(n) {
    if (typeof n !== "number") throw new TypeError("должно быть число")
    if (n < 0 || n > 150) throw new ValidationError("нереальный возраст", "age")
}

try {
    validateAge("x")
} catch (e) {
    if (e instanceof ValidationError) console.log(`Поле ${e.field}: ${e.message}`)
    else console.error("Неожиданная ошибка", e)
}
```

| Тип ошибки        | Происходит когда |
|-------------------|------------------|
| `ReferenceError`  | переменная не объявлена |
| `TypeError`       | операция над неверным типом (`null.method()`) |
| `SyntaxError`     | синтаксическая ошибка в коде/JSON |
| `RangeError`      | нарушение диапазона (глубокая рекурсия) |
| `Error`           | базовый тип |

## 24. Отладка и console

```javascript
console.log("обычная")
console.info("инфо")
console.warn("предупреждение")
console.error("ошибка")
console.table([{ n: 1 }, { n: 2 }])   // таблица
console.time("t"); /* код */ console.timeEnd("t")  // замер времени
console.assert(1 + 1 === 3, "математика сломалась") // выведет только при false

// Интерактивная остановка (в браузере/инструментах)
debugger

// Группировка
console.group("группа")
console.log("внутри")
console.groupEnd()

// Полезные трюки
console.log("value:", %o, obj)   // инспекция объекта
const trace = () => console.trace()  // стек вызова
```

Как я отлаживаю *значение по шагам*: `console.log` после каждого подозрительного шага, потом `debugger` в подозрительной точке, потом — `node --inspect`.

## 25. Шпаргалки и таблицы

**Сравнение самых частых «парезов» новичка:**

| Код                     | Результат | Почему |
|-------------------------|-----------|--------|
| `[] + []`               | `""`      | обе стороны приводятся к строке |
| `[] + {}`               | `"[object Object]"` | объект → строка |
| `{} + []`               | `0`       | `{}` в начале строки трактуется как блок |
| `1 + 2 + "3"`           | `"33"`    | слева направо: сначала 3, потом "33" |
| `"3" + 2 + 1`           | `"321"`   | строка перехватывает склейку |
| `true + true`           | `2`       | boolean → 1 |
| `[1, 2] + [3, 4]`       | `"1,23,4"`| массивы → строки |

**Когда какой метод (быстрый выбор):**

| Хочу получить         | Метод |
|-----------------------|-------|
| все элементы × 2      | `map` |
| только чётные         | `filter` |
| сумму                | `reduce` |
| есть ли элемент       | `includes` / `some` |
| индекс элемента       | `indexOf` / `findIndex` |
| первый подходящий     | `find` |
| копия диапазона       | `slice` |
| сортировка копии      | `toSorted` |
| уникальные значения   | `new Set(arr)` + spread |
| подсчёт вхождений     | `reduce` в объект |
| разбить по пробелам   | `str.split(/\s+/)` |

**Вырjjqшая по типу проверка:**

| Что проверяю                 | Правильный способ |
|------------------------------|-------------------|
| есть ли ключ у объекта       | `Object.hasOwn(obj, key)` |
| является ли массивом         | `Array.isArray(x)` |
| NaN                          | `Number.isNaN(x)` |
| полноценный числовой ввод    | `Number.isFinite(+input)` |
| null/undefined               | `x == null` |
| пустая строка                | `x === ""` |
| числа в «строковом» виде     | `String(x) === String(+x)` |

**Соответствие тема курса → разделы конспекта:**

| Тема из плана курса              | Разделы конспекта |
|----------------------------------|-------------------|
| Переменные и область видимости   | 10, 11, 12 |
| Типы и приведение                | 12, 13 |
| Числа, логика операторов         | 14, 18 |
| Строки и массивы                 | 15, 16 |
| Объекты и вложенность            | 17 |
| Условия и циклы                  | 19, 20 |
| Функции и замыкания              | 21, 22 |
| Ошибки и отладка                 | 23, 24 |