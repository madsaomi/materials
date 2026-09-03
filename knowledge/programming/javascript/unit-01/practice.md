# JavaScript — Unit 1: Задачи

## Уровень 1: Лёгкие

```javascript
// 1. Чётность
const isEven = n => n % 2 === 0

// 2. Сумма массива
const sum = arr => arr.reduce((a, b) => a + b, 0)

// 3. Реверс строки
const reverse = s => s.split("").reverse().join("")

// 4. Палиндром
const isPalindrome = s => s === s.split("").reverse().join("")
```

## Уровень 2: Средние

```javascript
// 5. FizzBuzz
for (let i = 1; i <= 100; i++) {
    let out = ""
    if (i % 3 === 0) out += "Fizz"
    if (i % 5 === 0) out += "Buzz"
    console.log(out || i)
}

// 6. Фибоначчи
function fib(n) {
    let arr = [0, 1]
    for (let i = 2; i < n; i++)
        arr.push(arr[i-1] + arr[i-2])
    return arr
}

// 7. Факториал
const factorial = n => n <= 1 ? 1 : n * factorial(n - 1)
```

## Уровень 3: С объектами

```javascript
// 8. Книга
function Book(title, author, year) {
    this.title = title
    this.author = author
    this.year = year
    this.info = () => `${title} — ${author} (${year})`
}

// 9. Калькулятор
const calculator = {
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    mul: (a, b) => a * b,
    div: (a, b) => b === 0 ? "ошибка" : a / b
}

// 10. Счётчик слов
function wordCount(text) {
    return text
        .toLowerCase()
        .split(/\s+/)
        .reduce((acc, w) => {
            acc[w] = (acc[w] || 0) + 1
            return acc
        }, {})
}
```

## Мини-проект: Викторина (Node.js)

```javascript
const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const questions = {
    "Столица Японии?": "токио",
    "2+2*2=?": "6",
    "Цвет неба?": "голубой"
}
let score = 0
let keys = Object.keys(questions)
let idx = 0

function ask() {
    if (idx >= keys.length) {
        console.log(`Результат: ${score}/${keys.length}`)
        rl.close()
        return
    }
    const q = keys[idx]
    rl.question(q + " ", (answer) => {
        if (answer.toLowerCase().trim() === questions[q]) {
            console.log("✅ Верно!")
            score++
        } else {
            console.log(`❌ Неверно. Ответ: ${questions[q]}`)
        }
        idx++
        ask()
    })
}
ask()
```

## Ответы

1. `n => n % 2 === 0`
2. `[1,2,3,4,5,6,7,8,9,10].filter(n => n % 2 === 0)`
3. См. код выше
4. `{ title, author, year, info() { return ... } }`

---

## Уровень 4: С массивами и строками

```javascript
// 11. Найти самый длинный элемент массива
const longest = arr => arr.reduce((a, b) => b.length > a.length ? b : a)

// 12. Убрать дубликаты
const unique = arr => [...new Set(arr)]

// 13. Развернуть вложенный массив (без flat)
function flatten(arr) {
    return arr.reduce((acc, x) =>
        acc.concat(Array.isArray(x) ? flatten(x) : [x]), [])
}

// 14. Число -> массив цифр
const digits = n => String(n).split("").map(Number)

// 15. Первая заглавная буква каждого слова
const titleCase = s =>
    s.toLowerCase().split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")

// 16. Пересечение двух массивов
const intersect = (a, b) => a.filter(x => b.includes(x))
```

## Уровень 5: Немного алгоритмов

```javascript
// 17. Простые числа до n (решето Эратосфена)
function primes(n) {
    const sieve = Array(n + 1).fill(true)
    sieve[0] = sieve[1] = false
    for (let i = 2; i * i <= n; i++)
        if (sieve[i])
            for (let j = i * i; j <= n; j += i) sieve[j] = false
    return sieve.map((v, i) => v ? i : -1).filter(x => x !== -1)
}

// 18. Максимальная подстрока палиндром? — проще: проверка образца "abba"
// Найти символ, который встречается чаще всех
function mostFrequent(str) {
    const counts = str.split("").reduce((acc, c) => {
        acc[c] = (acc[c] || 0) + 1
        return acc
    }, {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
}

// 19. Сортировка пузырьком
function bubbleSort(arr) {
    const a = [...arr]
    for (let i = 0; i < a.length; i++)
        for (let j = 0; j < a.length - 1 - i; j++)
            if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]
    return a
}

// 20. Бинарный поиск (массив обязан быть отсортирован)
function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1
    while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (arr[mid] === target) return mid
        arr[mid] < target ? (lo = mid + 1) : (hi = mid - 1)
    }
    return -1
}

// 21. Анаграмма
const isAnagram = (a, b) =>
    a.toLowerCase().split("").sort().join("") ===
    b.toLowerCase().split("").sort().join("")

// 22. Цезарь: сдвиг букв на k позиций
function caesar(str, k) {
    return str
        .split("")
        .map(c => {
            const code = c.charCodeAt(0)
            if (code >= 97 && code <= 122)
                return String.fromCharCode(((code - 97 + k) % 26 + 26) % 26 + 97)
            if (code >= 65 && code <= 90)
                return String.fromCharCode(((code - 65 + k) % 26 + 26) % 26 + 65)
            return c
        })
        .join("")
}
```

## Уровень 6: Объекты и функции высшего порядка

```javascript
// 23. Сгруппировать объекты по полю (reduce)
const groupBy = (arr, key) =>
    arr.reduce((acc, item) => {
        (acc[item[key]] ||= []).push(item)
        return acc
    }, {})

// 24. Сортировать массив объектов по ключу
const sortBy = (arr, key, dir = 1) =>
    [...arr].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir)

// 25. Каррированное сложение: add(1)(2)(3)
const curryAdd = a => b => c => a + b + c

// 26. Композиция функций: compose(f, g)(x) === f(g(x))
const compose = (...fns) => x => fns.reduceRight((v, fn) => fn(v), x)
const add1 = x => x + 1
const double = x => x * 2
compose(add1, double)(5)   // 11: сначала double, потом add1

// 27. Глубокая копия без JSON (обработка вложенных объектов и массивов)
function deepClone(value) {
    if (Array.isArray(value)) return value.map(deepClone)
    if (value && typeof value === "object")
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClone(v)]))
    return value
}

// 28. Простой мемоайзер для рекурсивного факториала
const memoize = fn => {
    const cache = new Map()
    return (...args) => {
        const key = String(args)
        if (cache.has(key)) return cache.get(key)
        const result = fn(...args)
        cache.set(key, result)
        return result
    }
}
const fastFact = memoize(n => n <= 1 ? 1 : n * fastFact(n - 1))

// 29. Проверка, сбалансированы ли скобки "(){}[]"
function isBalanced(str) {
    const pairs = { ")": "(", "}": "{", "]": "[" }
    const stack = []
    for (const ch of str) {
        if ("([{".includes(ch)) stack.push(ch)
        else if (pairs[ch] !== stack.pop()) return false
    }
    return stack.length === 0
}

// 30. Римские цифры -> число
const romanToInt = s => {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
    let total = 0
    for (let i = 0; i < s.length; i++) {
        const cur = map[s[i]]
        const next = map[s[i + 1]] || 0
        total += cur < next ? -cur : cur
    }
    return total
}
```

## Мини-проект 2: Трекер расходов (Node.js)

```javascript
const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const expenses = []
const ask = (q) => new Promise(resolve => rl.question(q, resolve))

async function main() {
    while (true) {
        console.log("\n[1] Добавить расход  [2] Показать  [3] Итог  [4] Выход")
        const cmd = (await ask("> ")).trim()
        if (cmd === "4") { console.log("Пока!"); rl.close(); return }

        if (cmd === "1") {
            const name = (await ask("Что купили? ")).trim()
            const priceRaw = (await ask("Сколько? ")).trim()
            const price = Number(priceRaw.replace(",", "."))
            if (!Number.isFinite(price) || price <= 0) {
                console.log("Некорректная цена")
                continue
            }
            expenses.push({ name, price, date: new Date().toLocaleDateString("ru-RU") })
            console.log(`Добавлено: ${name} — ${price} ₽`)
        }

        if (cmd === "2") {
            if (!expenses.length) { console.log("Пусто"); continue }
            expenses.forEach((e, i) => console.log(`${i + 1}. ${e.date}  ${e.name} — ${e.price} ₽`))
        }

        if (cmd === "3") {
            const total = expenses.reduce((s, e) => s + e.price, 0)
            console.log(`Всего потрачено: ${total.toFixed(2)} ₽`)
            const byDay = groupBy(expenses, "date")
            Object.entries(byDay).forEach(([day, list]) =>
                console.log(`  ${day}: ${list.reduce((s, e) => s + e.price, 0).toFixed(2)} ₽`))
        }
    }
}

function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
        (acc[item[key]] ||= []).push(item)
        return acc
    }, {})
}

main()
```

## Ответы к новым задачам

| № | Ключевая идея решения |
|----|------------------------|
| 11 | `reduce` со сравнением длин; на равных длинах stable возвращает первый |
| 12 | `Set` гарантирует уникальность, spread назад в массив |
| 13 | рекурсия + `Array.isArray`; база — примитив, шаг — слить вложенную часть |
| 14 | превратить в строку → массив символов → `Number` на каждом |
| 15 | split по пробелу, апперкейс первого символа, склейка обратно |
| 16 | `filter` по `includes`; дубликаты возможны — при желании `unique(intersect(a,b))` |
| 17 | решето: помечаем кратные; `i * i <= n` достаточно |
| 18 | reduce в счётчики, потом max по значениям через sort копии |
| 19 | пузырьковая сортировка: попарные обмены, каждый проход короче |
| 20 | двоичный поиск по индексам; `>> 1` — целочисленное деление на 2 |
| 21 | нормализуем, сортируем символы, сравниваем строки |
| 22 | работаем с кодами символов; `% 26` замыкает алфавит |
| 23 | `(acc[key] ||= []).push(item)` — стандартный паттерн группировки |
| 24 | `[...arr].sort(...)` — не мутируем оригинал; множитель `dir` для направления |
| 25 | каждая стрелка возвращает функцию, замыкая аргумент |
| 26 | `reduceRight` применяет справа налево, передавая результат дальше |
| 27 | рекурсивная копия: массивы через `map`, объекты через entries; функции/Date вернутся как есть |
| 28 | кэш в замыкании `Map`; `String(args)` как ключ |
| 29 | стек: открывающие — в стек, закрывающие — проверка верхушки |
| 30 | если меньше следующего символа — вычитаем, иначе прибавляем |

## Проверка знаний: контрольная

```javascript
// Запустите и предскажите вывод каждой строки ДО запуска
console.log(typeof null)                    // ?
console.log("5" - 2)                        // ?
console.log("5" + 2)                        // ?
console.log(0.1 + 0.2 === 0.3)              // ?
console.log([] + [])                        // ?
console.log(!!"false")                      // ?
console.log(3 > 2 > 1)                      // ?
console.log([1, 2] == "1,2")                // ?
console.log(parseInt("9x"))                 // ?
console.log(Number.isNaN("x"))              // ?
console.log(10 % -3)                        // ?
console.log((x => x)((y => y)(5)))          // ?
```

Ответы на контрольную: `"object"`, `3`, `"52"`, `false`, `""`, `true`, `false` (потому что `3>2 → true → true>1 → 1>1 → false`), `true`, `9`, `false`, `1`, `5`.

## Типичные ошибки

| № | Ошибка | Некорректно | Правильно | Почему |
|----|--------|-------------|-----------|--------|
| 1 | Нестрогое сравнение | `x == 5` | `x === 5` | `==` приводит типы: `"5" == 5` → true |
| 2 | Индекс за границей | `arr[len]` даёт `undefined` | проверить `i < arr.length` | отсутствующий элемент не ошибка, но баг |
| 3 | Забыл `break` в switch | `case 1: ... case 2:` | ставить `break` или `return` | «проваливание» в следующий case |
| 4 | Мутация через map | `arr.map(x => x * 2)` и ждать ярлык | map возвращает НОВЫЙ массив | его надо присвоить |
| 5 | `sort()` без функции | `[10, 9, 1].sort()` → `[1, 10, 9]` | `sort((a, b) => a - b)` | по умолчанию сортирует строки |
| 6 | Сложение строк | `"Всего: " + 40 + 2` → `"Всего: 402"` | `"Всего: " + (40 + 2)` | `+` со строкой склеивает |
| 7 | Сравнение с float | `0.1 + 0.2 === 0.3` → false | `Math.abs(x - 0.3) < 1e-9` | двоичная арифметика |
| 8 | `var` в циклах | `for (var i...)` в асинхронном коде | `let i` | `var` один на функцию, знаменитый баг setTimeout(i) |
| 9 | Присвоение вместо сравнения | `if (x = 5)` вечно true | `if (x === 5)` | `=` возвращает значение |
| 10 | Путаница в month | `new Date(2026, 7, 30)` равен августу | `getMonth() + 1` при выводе | месяцы от 0 |
| 11 | NaN === NaN | `x === NaN` — всегда false | `Number.isNaN(x)` | NaN не равен самому себе |
| 12 | Мутация константы-объекта | `const o = {}; o = {}` — ошибка | менять можно только свойства | const блокирует переназначение, не поля |
| 13 | Забыть про замыкание в цикле | счётчик живёт после цикла | каждый вызов создаёт своё окружение | переиспользуйте factory |
| 14 | `typeof null` = "object" | проверять `typeof x === "object"` для null | `x === null` отдельно | исторический баг языка |
| 15 | `arguments` в стрелке | `() => arguments` → ReferenceError | rest `(...args)` | у стрелок нет `arguments` |
| 16 | `==` против `?.[]` | `user?.addr?.city` падает если `= null` | прочитать `?? "нет"` | optional chaining для ссылок на свойство |
| 17 | Парсер чисел из строк | `parseInt("10.6x")` → 10 | `parseFloat` или `Number` | parseInt отбрасывает дробь |
| 18 | `delete` для массива | `delete arr[0]` оставляет дырку | `splice(0, 1)` | delete не сдвигает элементы |

## Вопросы для самопроверки (с ответами)

1. **Чем `let` отличается от `var`?**
   `let` блочная область видимости и не инициализируется до объявления (TDZ); `var` функциональная и поднимается со значением `undefined`.

2. **Почему `typeof null` === "object"?**
   Исторический баг: в ранней версии JS `null` хранился как указатель на нулевой объект, tag = 0. Исправлять не стали (обратная совместимость).

3. **Что возвращает `NaN === NaN`?** `false`. NaN не равен ничему, включая себя. Проверка — `Number.isNaN()`.

4. **Как скопировать объект глубоко?** `JSON.parse(JSON.stringify(obj))` для данных без функций/undefined/Date; для общего случая — рекурсивная функция `deepClone`.

5. **Чем map отличается от forEach?** `map` возвращает новый массив той же длины; `forEach` ничего не возвращает и только выполняет побочные действия.

6. **Когда `??` вместо `\|\|`?** `??` срабатывает только на `null`/`undefined`, поэтому `0 ?? "x"` → 0. `||` сработает на любом falsy: `0 || "x"` → `"x"`.

7. **Что такое короткое замыкание?** Если левый операнд уже определяет результат (`false && ...` или `true || ...`), правая часть не вычисляется вообще.

8. **В чём разница `slice` и `splice`?** `slice` не мутирует и возвращает копию диапазона; `splice` меняет исходный массив (удаляет/вставляет).

9. **Почему `[10, 9, 1].sort()` неправильный?** По умолчанию элементы приводятся к строкам и сравниваются лексикографически → порядок `[1, 10, 9]`.

10. **Как работает `this` в стрелке?** У стрелки нет своего `this`, она берёт его из ближайшей обычной функции/глобального контекста.

11. **Что такое замыкание?** Функция, сохраняющая доступ к переменным своей области объявления, даже когда эта область завершилась. Пример: `makeCounter`.

12. **Зачем `strict mode`?** Ловит неявные глобальные переменные, выкидывает ошибки на «тихие» операции (`this` = undefined вместо window), запрещает дубликаты параметров.

13. **Как развернуть число или строку?** `String(n).split("").reverse().join("")`; для чисел затем `Number(...)`.

14. **В чём суть деструктуризации?** Быстрое извлечение значений: `const { name, age } = user`, `const [a, b] = [1, 2]`. Удобно для параметров объектов-настроек.

15. **Как удалить дубликаты из массива?** `[...new Set(arr)]` — Set хранит только уникальные значения, порядок сохраняется.

16. **Какая разница между декларациями функции?** `function f(){}` поднимается целиком (можно вызвать до объявления); `const f = () => {}` — нет, и у неё нет `this`/`arguments`/`new`.

## Глоссарий

| Термин | Определение | Пример |
|--------|-------------|--------|
| **TDZ (Temporal Dead Zone)** | Промежуток от начала блока до объявления `let`/`const`, где доступ даёт ReferenceError | `x; let x` |
| **Hoisting** | Поведение «подъёма» объявлений вверх области видимости | вызов функции до её строки |
| **Truthy / Falsy** | Значение, приводимое к true / false в булевом контексте | falsy: `0`, `""`, `null` |
| **Coercion** | Неявное приведение типов движком | `"5" - 2` → 3 |
| **Arrow function** | Короткий синтаксис функции, но без своего `this` | `const f = x => x * 2` |
| **Closure** | Функция, «запоминающая» внешние переменные | счётчик из factory |
| **Rest** | Сбор оставшихся аргументов в массив | `(...nums)` |
| **Spread** | Разворачивание массива/объекта в элементы | `[...a, ...b]` |
| **Destructuring** | Распаковка значений из массива/объекта | `const {a} = obj` |
| **Chaining** | Последовательный вызов методов по «цепочке» | `s.split("").reverse().join("")` |
| **Mutation** | Изменение объекта/массива «на месте» | `arr.push(1)` |
| **Immutable** | Неизменяемый стиль: каждый шаг делает новый объект | `arr.concat()`, `toSorted()` |
| **Ternary** | Короткий условный оператор `условие ? да : нет` | `x > 0 ? 1 : -1` |
| **Refactor** | Переписывание кода без смены поведения | заменить цикл на `map/filter` |
| **Edge case** | Краевой случай, который валит наивные решения | пустой массив, отрицательное число |

## Карта прогресса

| Тема | Упражнения | Статус |
|------|-----------|--------|
| Переменные и типы | 1, 2, 4, 12 | |
| Строки | 3, 15, 18, 21, 22 | |
| Массивы | 6, 11, 13, 16, 19, 20 | |
| Объекты | 8, 23, 24, 27 | |
| Функции высшего порядка | 25, 26, 28 | |
| Алгоритмы | 14, 17, 29, 30 | |
| Мини-проекты | Викторина, Трекер расходов | |

Зачёркивайте статус по мере решения: `[x]` — решено, `[ ]` — в работе.
