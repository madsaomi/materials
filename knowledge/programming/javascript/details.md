# JavaScript — Микро-детали

## 1. Type coercion (приведение типов)

### 1.1 == vs ===

```javascript
// == приводит типы (избегать)
1 == '1'        // true
0 == false      // true
'' == false     // true
[] == false     // true
null == undefined // true
[1] == 1        // true

// === строгое сравнение (ВСЕГДА)
1 === '1'       // false
0 === false     // false
null === undefined // false

// Исключение: проверка на null/undefined
if (x == null) { } // x === null || x === undefined
```

### 1.2 Falsy значения

```javascript
// Все falsy:
false, 0, -0, 0n, '', "", ``, null, undefined, NaN

// Всё остальное — truthy:
'0'      // truthy!
'false'  // truthy!
[]       // truthy! (пустой массив)
{}       // truthy! (пустой объект)
```

### 1.3 NaN

```javascript
typeof NaN      // 'number' 🤡
NaN === NaN     // false! (единственное значение не равное себе)
NaN == NaN      // false
Object.is(NaN, NaN) // true (правильная проверка)
isNaN('hello')  // true (приводит к числу)
Number.isNaN('hello') // false (не приводит)
```

### 1.4 + оператор

```javascript
1 + 2 + '3'     // '33' (слева направо: 1+2=3, 3+'3'='33')
'1' + 2 + 3     // '123' ('1'+2='12', '12'+3='123')
1 + '2' + 3     // '123'

// Унарный +
+'42'           // 42
+new Date()     // timestamp
+true           // 1
```

---

## 2. Event Loop — глубже

### 2.1 Порядок выполнения

```javascript
console.log('1: sync')

setTimeout(() => console.log('2: macrotask'), 0)

Promise.resolve().then(() => console.log('3: microtask'))

queueMicrotask(() => console.log('4: microtask (queueMicrotask)'))

requestAnimationFrame(() => console.log('5: animation frame'))

setImmediate(() => console.log('6: check (Node)')) // Node only

process.nextTick(() => console.log('7: nextTick (Node)')) // Node only

// Вывод: 1, 3, 4, 2, 5, (6, 7 в Node)
```

### 2.2 Микротаски добавляют новые микротаски

```javascript
Promise.resolve().then(() => {
    console.log('then 1')
    Promise.resolve().then(() => {
        console.log('then 2')
        Promise.resolve().then(() => {
            console.log('then 3')
        })
    })
})

setTimeout(() => console.log('timeout'))

// Вывод: then 1, then 2, then 3, timeout
// Микротаски обрабатываются до макротасок!
```

### 2.3 async/await — микротаски

```javascript
async function foo() {
    console.log('2')
    await null  // await создаёт микротаску
    console.log('4')
}

console.log('1')
foo()
console.log('3')

// Вывод: 1, 2, 3, 4
```

---

## 3. Prototype chain — детали

### 3.1 Создание объекта без прототипа

```javascript
const pure = Object.create(null)
pure.__proto__      // undefined (нет прототипа)
pure.toString()     // TypeError! нет метода
'key' in pure       // работает (наследуемые методы в Object.prototype не видны)
```

### 3.2 Object.create и наследование

```javascript
const animal = {
    speak() { return '...' }
}

const dog = Object.create(animal)
dog.speak = function() { return 'Woof' }

console.log(dog.speak())      // 'Woof'
console.log(animal.speak())   // '...'

// Цепочка: dog → animal → Object.prototype → null
```

### 3.3 Проверка свойств

```javascript
const obj = { a: 1 }

'a' in obj           // true (собственное + наследованное)
obj.hasOwnProperty('a') // true (только собственное)
Object.hasOwn(obj, 'a') // true (ES2022, современный)
'a' in Object.create(null) // работает
```

---

## 4. Функциональное программирование

### 4.1 Currying vs Partial Application

```javascript
// Currying — возвращает функцию пока не получить все аргументы
const curryAdd = a => b => c => a + b + c
curryAdd(1)(2)(3)  // 6

// Partial application — фиксирует часть аргументов
const partialAdd = (a) => (b, c) => a + b + c
partialAdd(1)(2, 3)  // 6
```

### 4.2 Memoization с WeakMap

```javascript
const memoize = (fn) => {
    const cache = new WeakMap()
    return (obj) => {
        if (!cache.has(obj)) {
            cache.set(obj, fn(obj))
        }
        return cache.get(obj)
    }
}

// WeakMap — ключи только объекты, GC-friendly
```

### 4.3 Trampoline (рекурсия без stack overflow)

```javascript
const trampoline = (fn) => (...args) => {
    let result = fn(...args)
    while (typeof result === 'function') {
        result = result()
    }
    return result
}

const factorial = trampoline(
    (n, acc = 1) => n <= 1 ? acc : () => factorial(n - 1, n * acc)
)

factorial(100000)  // не переполняет стек
```

---

## 5. Глубже про Promise

### 5.1 Promise.all vs allSettled vs race vs any

```javascript
const p1 = Promise.resolve(1)
const p2 = Promise.reject('err')
const p3 = new Promise(r => setTimeout(() => r(3), 1000))

Promise.all([p1, p2, p3])     // отклоняется сразу: 'err'
Promise.allSettled([p1, p2, p3]) // ждёт все, возвращает статусы
Promise.race([p1, p2])        // 1 (быстрее)
Promise.any([p1, p2])         // 1 (первый успешный)
```

### 5.2 Promise — не отменяемые

```javascript
// Promise нельзя отменить, но можно игнорировать
let cancelled = false

const fetchWithCancel = (url) => {
    cancelled = false
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(r => cancelled ? reject({cancelled: true}) : resolve(r))
    })
}

// AbortController (современный)
const controller = new AbortController()
fetch(url, { signal: controller.signal })
controller.abort()  // выбрасывает AbortError
```

### 5.3 Async iterators

```javascript
// Генератор асинхронных итераций
async function* asyncCounter(limit) {
    for (let i = 0; i < limit; i++) {
        await new Promise(r => setTimeout(r, 100))
        yield i
    }
}

for await (const num of asyncCounter(5)) {
    console.log(num)  // 0,1,2,3,4 с интервалом
}
```

---

## 6. Регулярные выражения — продвинутые

```javascript
// Named groups
const date = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
const match = date.exec('2024-03-15')
match.groups.year   // '2024'
match.groups.month  // '03'

// Lookahead
const password = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/
// Хотя бы 1 заглавная, 1 строчная, 1 цифра, минимум 8 символов

// Lookbehind (ES2018)
const price = /(?<=\$)\d+/
price.exec('Price: $100')[0]  // '100'

// Unicode property escapes (ES2018)
/^\p{Script=Latin}+$/u.test('hello')  // true
/^\p{L}+$/u.test('日本語')  // true (любые буквы)
```

---

## 7. Proxy — продвинутые трюки

```javascript
// Ленивая инициализация
const lazyObj = new Proxy({}, {
    get(target, prop) {
        if (!(prop in target)) {
            console.log(`initializing ${prop}`)
            target[prop] = expensiveComputation(prop)
        }
        return target[prop]
    }
})

// Валидация
const validator = {
    set(target, prop, value) {
        if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
            throw new Error('Invalid age')
        }
        target[prop] = value
        return true
    }
}

// Negate array index
const negArray = new Proxy([], {
    get(target, prop) {
        const idx = Number(prop)
        if (idx < 0) {
            return target[target.length + idx]
        }
        return target[prop]
    }
})
negArray.push(1, 2, 3)
negArray[-1]  // 3
```

---

## 8. Error handling

### 8.1 Ошибки в промисах

```javascript
// Необработанная ошибка — process.on('unhandledRejection')
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason)
})

// Всегда заканчивайте цепочку .catch()
fetchData()
    .then(data => process(data))
    .then(result => display(result))
    .catch(err => handleError(err)) // обязательно!
```

### 8.2 Error.cause (ES2022)

```javascript
try {
    await fetchData()
} catch (err) {
    throw new Error('Failed to fetch data', {
        cause: err  // сохраняет оригинальную ошибку
    })
}
// err.cause — оригинальная ошибка
```

### 8.3 try/finally для ресурсов

```javascript
async function withResource() {
    const res = await acquire()
    try {
        return await use(res)
    } finally {
        await release(res)  // выполняется даже при return
    }
}
```

---

## 9. CommonJS vs ESModules

```javascript
// CommonJS (require)
const fs = require('fs')
module.exports = { myFunc }

// ES modules (import)
import fs from 'node:fs'
export const myFunc = () => {}

// Смешивание:
// CJS → import() для ESM (динамический импорт)
// ESM → createRequire для CJS
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const fs = require('fs')
```

---

## 10. Таймеры и микротаски

```javascript
// setTimeout(fn, 0) — минимум 4ms (HTML spec)
// setTimeout(fn, 0) в Node — минимум 1ms

// requestAnimationFrame (браузер) — ~16ms (60fps)
// setImmediate (Node) — после I/O, перед setTimeout

// Разница между setImmediate и setTimeout(fn, 0) в Node:
// setImmediate — после текущей фазы I/O
// setTimeout(fn, 0) — после таймеров
```

---

## 11. Array — продвинутые методы

```javascript
// at() (ES2022) — поддерживает отрицательные индексы
[1, 2, 3].at(-1)  // 3
[1, 2, 3].at(-2)  // 2

// toSorted, toReversed, toSpliced, with (ES2023)
// возвращают НОВЫЙ массив (не мутируют)
const arr = [3, 1, 2]
const sorted = arr.toSorted()  // [1, 2, 3]
const reversed = arr.toReversed()  // [2, 1, 3]
const spliced = arr.toSpliced(1, 1)  // [3, 2]
const updated = arr.with(1, 99)  // [3, 99, 2]
console.log(arr)  // [3, 1, 2] — оригинал не изменился

// groupBy (ES2024)
Object.groupBy([1, 2, 3, 4, 5], n => n % 2 === 0 ? 'even' : 'odd')
// { odd: [1, 3, 5], even: [2, 4] }
```

---

## 12. Worker — передача данных

```javascript
// postMessage копирует данные (структурированное клонирование)
// НО: Transferable objects — zero-copy!

// main.js
const buffer = new ArrayBuffer(1024 * 1024 * 100)  // 100MB
worker.postMessage(buffer, [buffer])  // передача владения
// buffer нейтрализован (byteLength = 0) в main

// SharedArrayBuffer — общая память
const sab = new SharedArrayBuffer(1024)
worker.postMessage(sab)  // не нужно transfer — shared!
```

---

*Микро-детали JavaScript. Дополняется.*
