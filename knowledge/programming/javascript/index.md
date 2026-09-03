# JavaScript — Полный конспект

## Введение

JavaScript — язык программирования для веба. Создан Бренданом Айком в 1995 за 10 дней. Современный стандарт — ECMAScript (ES2025).

**Области:** фронтенд (браузер), бэкенд (Node.js), мобильные приложения (React Native), десктоп (Electron).

**Версии:**

- ES5 (2009) — строгий режим, JSON
- ES6/ES2015 — классы, стрелки, let/const, promises, modules
- Ежегодные релизы: ES2016, ES2017... ES2025

---

## 1. Основы

### 1.1 Типы данных

```javascript
// Примитивы
const str = "hello"           // string
const num = 42                // number (64-bit float)
const big = 9007199254740991n // bigint
const bool = true             // boolean
const undef = undefined       // undefined
const nul = null              // null
const sym = Symbol("id")      // symbol

// Объектные
const obj = { a: 1 }
const arr = [1, 2, 3]
const fn = function() {}
const date = new Date()

// typeof
typeof "hello"     // "string"
typeof 42          // "number"
typeof undefined   // "undefined"
typeof null        // "object"  (исторический баг)
typeof []          // "object"
typeof function(){} // "function"

// Проверка на массив
Array.isArray([1,2,3])  // true

// null vs undefined
undefined // "ещё не назначено"
null      // "намеренно пусто"
```

### 1.2 Переменные

```javascript
// var — функциональная область видимости (устарело)
var x = 1

// let — блочная область видимости
let y = 2
y = 3  // можно переназначить

// const — блочная, нельзя переназначить
const z = 4
z = 5  // TypeError

// const с объектами (можно менять свойства)
const obj = { a: 1 }
obj.a = 2  // ок
obj = {}   // TypeError
```

### 1.3 Строгий режим

```javascript
"use strict"
// Включает строгую проверку, запрещает неявные глобальные переменные
// По умолчанию в ES modules и классах
```

---

## 2. Операторы

```javascript
// Арифметические
+, -, *, /, %, ** (экспонента)

// Сравнения
==, !=   // с приведением типов (избегать)
===, !== // строгое сравнение (рекомендуется)

// Логические
&&, ||, !, ?? (nullish coalescing)

// Особенности
0 == false   // true
0 === false  // false
"" == false  // true
null == undefined // true
null === undefined // false

// Nullish coalescing (ES2020)
const name = input ?? "default"
// ?? — только для null/undefined (не для 0, "")

// Optional chaining (ES2020)
user?.address?.city       // undefined если нет адреса
obj?.method?.()           // вызов если метод существует
arr?.[0]                  // доступ если массив существует

// Spread (ES2015)
const arr2 = [...arr1, 4, 5]
const obj2 = { ...obj1, b: 2 }

// Destructuring
const [a, b] = [1, 2]
const { name, age } = person
const { name: n } = person  // переименование
```

---

## 3. Строки

```javascript
const s = "hello"

// Шаблонные строки (template literals, ES2015)
const name = "World"
const msg = `Hello, ${name}!`

// Методы
s.length           // 5
s[0]               // "h"
s.toUpperCase()    // "HELLO"
s.indexOf("l")     // 2
s.includes("ell")  // true
s.startsWith("he") // true
s.slice(1, 4)      // "ell"
s.split("")        // ["h","e","l","l","o"]
"a,b,c".split(",") // ["a","b","c"]
"  hi  ".trim()    // "hi"
"ab".repeat(3)     // "ababab"
s.replace("l", "L")       // "heLlo" (первое)
s.replaceAll("l", "L")    // "heLLo" (все, ES2021)

// Tagged templates
function highlight(strings, ...values) {
    return strings.reduce((acc, str, i) => 
        `${acc}${str}<b>${values[i] || ""}</b>`, "")
}
const result = highlight`Hello ${name}!`
```

---

## 4. Массивы

```javascript
const arr = [1, 2, 3, 4, 5]

// CRUD
arr.push(6)         // [1,2,3,4,5,6] — в конец
arr.pop()           // удаляет с конца
arr.shift()         // удаляет сначала
arr.unshift(0)      // добавляет сначала
arr.splice(1, 2)    // удаляет 2 элемента с индекса 1
arr.splice(1, 0, 99)// вставляет 99 по индексу 1

// Итерация
arr.forEach((item, index) => console.log(item, index))
const doubled = arr.map(x => x * 2)
const evens = arr.filter(x => x % 2 === 0)
const sum = arr.reduce((acc, x) => acc + x, 0)
const firstEven = arr.find(x => x % 2 === 0)
const hasEven = arr.some(x => x % 2 === 0)
const allEven = arr.every(x => x % 2 === 0)
arr.includes(3)     // true
arr.indexOf(3)      // 2

// Сортировка
arr.sort((a, b) => a - b)  // числовая
arr.reverse()
arr.toSorted()     // новый массив (ES2023)
arr.toReversed()   // новый массив (ES2023)

// Flat & FlatMap
[[1, 2], [3, 4]].flat()         // [1,2,3,4]
["abc", "de"].flatMap(s => s.split("")) // ["a","b","c","d","e"]

// Статические методы
Array.from("hello")    // ["h","e","l","l","o"]
Array.from({length: 5}, (_, i) => i)  // [0,1,2,3,4]
Array.of(1, 2, 3)      // [1,2,3]
```

---

## 5. Объекты

```javascript
// Создание
const obj = { name: "Alice", age: 30 }
const key = "city"
obj[key] = "Tokyo"     // динамический ключ

// Доступ
obj.name       // "Alice"
obj["name"]    // "Alice"

// Копирование
const copy = { ...obj }
const copy2 = Object.assign({}, obj)
const deepCopy = JSON.parse(JSON.stringify(obj))

// Ключи, значения, записи
Object.keys(obj)    // ["name", "age", "city"]
Object.values(obj)  // ["Alice", 30, "Tokyo"]
Object.entries(obj) // [["name","Alice"], ["age",30], ["city","Tokyo"]]

// Заморозка
Object.freeze(obj)     // нельзя менять
Object.seal(obj)       // можно менять, но не добавлять/удалять
```

---

## 6. Функции

### 6.1 Function Declaration vs Expression

```javascript
// Declaration (hoisting — поднимается)
function add(a, b) {
    return a + b
}

// Expression (не hoisting)
const add = function(a, b) {
    return a + b
}

// Arrow function (ES2015)
const add = (a, b) => a + b
const square = x => x * x
const noArgs = () => 42

// Ограничения стрелок:
// - нет своего this (берёт из внешнего контекста)
// - нет arguments
// - нельзя как конструктор (new)
// - нет super
```

### 6.2 Параметры

```javascript
// Default parameters
function greet(name = "Guest") {
    return `Hello, ${name}`
}

// Rest parameters
function sum(...nums) {
    return nums.reduce((a, b) => a + b, 0)
}

// Arguments (только в обычных функциях)
function oldSum() {
    return Array.from(arguments).reduce((a, b) => a + b, 0)
}
```

### 6.3 Контекст (this)

```javascript
// Обычная функция — this зависит от вызова
function show() {
    console.log(this)
}
obj.show()        // obj
show()            // window/global (undefined в strict mode)
new show()        // новый объект

// Стрелочная — this из внешнего контекста
const obj = {
    name: "Alice",
    greet: () => {
        console.log(this.name)  // undefined!
    },
    greet2() {
        console.log(this.name)  // "Alice"
    }
}

// bind, call, apply
function log(prefix) { console.log(prefix, this.name) }
const user = { name: "Bob" }
log.call(user, "User:")    // User: Bob
log.apply(user, ["User:"]) // User: Bob
const bound = log.bind(user) // навсегда привязан
bound("User:")              // User: Bob
```

### 6.4 Замыкание (Closure)

```javascript
function counter() {
    let count = 0
    return function() {
        return ++count
    }
}
const c = counter()
c() // 1
c() // 2

// Module pattern
const counter = (function() {
    let count = 0
    return {
        increment: () => ++count,
        decrement: () => --count,
        getValue: () => count
    }
})()
```

---

## 7. Объектно-ориентированное программирование

### 7.1 Классы (ES2015)

```javascript
class Animal {
    static species = "unknown"
    #privateField = "secret"  // приватное поле (ES2022)
    
    constructor(name, age) {
        this.name = name
        this.age = age
    }
    
    speak() {
        return "..."
    }
    
    static create(name) {
        return new this(name, 0)
    }
    
    get humanYears() {
        return this.age * 7
    }
    
    set humanYears(years) {
        this.age = years / 7
    }
}

class Dog extends Animal {
    static species = "canine"
    
    constructor(name, age, breed) {
        super(name, age)
        this.breed = breed
    }
    
    speak() {
        return `${super.speak()} Woof!`
    }
}

const dog = new Dog("Rex", 3, "Husky")
dog instanceof Dog     // true
dog instanceof Animal  // true

// Приватные методы (ES2022)
class MyClass {
    #privateMethod() {
        return "secret"
    }
    
    publicMethod() {
        return this.#privateMethod()
    }
}
```

### 7.2 Прототипы (старый способ)

```javascript
function Animal(name) {
    this.name = name
}

Animal.prototype.speak = function() {
    return "..."
}

function Dog(name) {
    Animal.call(this, name)
}

Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Dog.prototype.speak = function() {
    return "Woof!"
}
```

---

## 8. Асинхронность

### 8.1 Callbacks

```javascript
fs.readFile("file.txt", "utf8", (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(data)
})
// Callback hell — проблема вложенности
```

### 8.2 Promises (ES2015)

```javascript
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        Math.random() > 0.5 ? resolve("ok") : reject("error")
    }, 1000)
})

promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("done"))

// Статические методы
Promise.all([p1, p2, p3])       // все успешно
Promise.allSettled([p1, p2])    // все (независимо от ошибок)
Promise.race([p1, p2])          // первый выполненный
Promise.any([p1, p2])           // первый успешный

// Цепочки
fetchUser(id)
    .then(user => fetchPosts(user.id))
    .then(posts => renderPosts(posts))
    .catch(err => showError(err))
```

### 8.3 Async/Await (ES2017)

```javascript
async function getUserData(id) {
    try {
        const user = await fetch(`/api/users/${id}`)
        const data = await user.json()
        return data
    } catch (error) {
        console.error("Failed:", error)
        throw error
    }
}

// Параллельное выполнение
async function parallel() {
    const [user, posts] = await Promise.all([
        fetchUser(id),
        fetchPosts(id)
    ])
    return { user, posts }
}

// Top-level await (ES2022, в модулях)
const data = await fetch("/api/data")
```

### 8.4 Event Loop

```javascript
// Микротаски (Promise, queueMicrotask)
// Макротаски (setTimeout, setInterval, I/O)

console.log("1")
setTimeout(() => console.log("2"), 0)
Promise.resolve().then(() => console.log("3"))
console.log("4")
// Вывод: 1, 4, 3, 2
// (микротаски выполняются до макротасок)
```

---

## 9. Модули (ES2015)

```javascript
// math.js
export const PI = 3.14159
export function add(a, b) { return a + b }
export default class Calculator { ... }

// main.js
import Calculator, { PI, add as sum } from "./math.js"
import * as math from "./math.js"

// Динамический импорт (ES2020)
const module = await import("./math.js")

// Re-export
export { add } from "./math.js"
export * from "./math.js"
```

---

## 10. Браузерное API

### 10.1 DOM

```javascript
// Поиск элементов
document.getElementById("myId")
document.querySelector(".myClass")
document.querySelectorAll("div > p")
document.getElementsByTagName("div")

// Манипуляция
el.textContent = "Hello"
el.innerHTML = "<b>bold</b>"
el.setAttribute("data-id", "1")
el.classList.add("active")
el.classList.remove("hidden")
el.classList.toggle("visible")

// Создание
const div = document.createElement("div")
div.textContent = "New element"
parent.appendChild(div)
parent.insertBefore(div, ref)
parent.append(div)                    // ES2017
parent.prepend(div)                   // ES2017
el.replaceWith(newEl)                 // ES2017

// События
el.addEventListener("click", (e) => {
    e.preventDefault()   // отмена действия по умолчанию
    e.stopPropagation()  // остановка всплытия
})
```

### 10.2 Fetch

```javascript
// GET
const response = await fetch("https://api.github.com/users/octocat")
const data = await response.json()

// POST
const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Alice" })
})

// FormData
const form = new FormData()
form.append("file", fileInput.files[0])
await fetch("/upload", { method: "POST", body: form })
```

### 10.3 Хранилище

```javascript
// localStorage (5MB, не истекает)
localStorage.setItem("key", "value")
const val = localStorage.getItem("key")
localStorage.removeItem("key")
localStorage.clear()

// sessionStorage (до закрытия вкладки)
sessionStorage.setItem("key", "value")

// IndexedDB — большие объёмы данных
```

---

## 11. Node.js

### 11.1 Основы

```javascript
// Модули CommonJS (require)
const fs = require("fs")
const express = require("express")

// ES Modules (в package.json: "type": "module")
import fs from "node:fs"
import express from "express"

// Файловая система
const data = fs.readFileSync("file.txt", "utf8")  // синхронно
const data = await fs.promises.readFile("file.txt", "utf8")  // async

// Потоки (streams)
const readStream = fs.createReadStream("large.txt")
readStream.pipe(process.stdout)
```

### 11.2 Express.js

```javascript
import express from "express"

const app = express()
app.use(express.json())

// Маршруты
app.get("/api/users", (req, res) => {
    res.json([{ id: 1, name: "Alice" }])
})

app.get("/api/users/:id", (req, res) => {
    const id = req.params.id
    const query = req.query.search
    res.json({ id, query })
})

app.post("/api/users", (req, res) => {
    const body = req.body
    res.status(201).json(body)
})

// Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: "Internal Server Error" })
})

app.listen(3000)
```

### 11.3 Асинхронное программирование

```javascript
// Process
process.argv       // аргументы
process.env        // переменные окружения
process.exit(0)    // успешный выход
process.exit(1)    // с ошибкой

// Events
import { EventEmitter } from "node:events"
const emitter = new EventEmitter()
emitter.on("data", (msg) => console.log(msg))
emitter.emit("data", "hello")
```

---

## 12. Современный JavaScript

### 12.1 Map, Set, WeakMap, WeakSet

```javascript
// Map (ключи любого типа)
const map = new Map()
map.set("key", "value")
map.get("key")
map.has("key")
map.delete("key")
map.size

// Set (уникальные значения)
const set = new Set([1, 2, 2, 3])
set.has(2)      // true
set.add(4)
set.delete(1)
```

### 12.2 Symbol

```javascript
const sym = Symbol("description")
Symbol("a") === Symbol("a")   // false (всегда уникальный)

// Использование: приватные ключи
const _private = Symbol("private")
class MyClass {
    [_private] = 42
    getPrivate() { return this[_private] }
}

// Well-known symbols
Symbol.iterator
Symbol.toStringTag
```

### 12.3 Proxy и Reflect

```javascript
const handler = {
    get(target, prop) {
        if (prop in target) {
            return target[prop]
        }
        return "default"
    },
    set(target, prop, value) {
        if (prop === "age" && value < 0) {
            throw new Error("invalid age")
        }
        target[prop] = value
        return true
    }
}

const proxy = new Proxy({}, handler)
proxy.name = "Alice"
proxy.age = -1  // Error!

// Reflect
class MyClass {
    constructor(name) {
        this.name = name
    }
}
const instance = Reflect.construct(MyClass, ["Alice"])
```

### 12.4 Декораторы (Stage 3)

```javascript
function logged(target, context) {
    const method = target
    return function(...args) {
        console.log(`Calling ${context.name} with`, args)
        return method.call(this, ...args)
    }
}

class MyClass {
    @logged
    add(a, b) {
        return a + b
    }
}
```

---

## 13. Тестирование

```javascript
// Vitest (быстрее Jest)
import { describe, it, expect, vi } from "vitest"

describe("Math", () => {
    it("should add numbers", () => {
        expect(add(2, 3)).toBe(5)
        expect(add(0, 0)).toBe(0)
    })
    
    it.skip("should skip this", () => { ... })
    it.todo("should implement later")
})

// Mocking
vi.mock("./db.js")
vi.spyOn(console, "log")

// Async
it("should fetch data", async () => {
    const data = await fetchUser(1)
    expect(data.name).toBe("Alice")
})
```

---

## 14. Инструменты и экосистема

### 14.1 Node.js и менеджеры пакетов

```bash
# nvm — менеджер версий Node
nvm install 22
nvm use 22

# npm
npm init -y
npm install express
npm install -D typescript vitest
npm run build
npx create-react-app my-app

# yarn
yarn add express

# pnpm (быстрее и эффективнее)
pnpm add express
```

### 14.2 Сборщики

```bash
# Vite (ультрабыстрый, рекомендуется)
npm create vite@latest my-app -- --template react

# esbuild (для библиотек)
esbuild src/index.js --bundle --outfile=dist/bundle.js

# Webpack (легаси, но стабилен)
# Turbopack (от Vercel, новый)
```

### 14.3 Линтеры и форматтеры

```bash
# ESLint
npm init @eslint/config
npx eslint src/

# Prettier (форматирование)
npx prettier --write src/
```

### 14.4 TypeScript

```typescript
// Статическая типизация
interface User {
    name: string
    age: number
    email?: string  // опционально
}

const user: User = {
    name: "Alice",
    age: 30
}

// Generics
function identity<T>(arg: T): T {
    return arg
}
```

---

## 15. Продвинутые темы

### 15.1 Генераторы

```javascript
function* fibonacci() {
    let a = 0, b = 1
    while (true) {
        yield a
        [a, b] = [b, a + b]
    }
}

const fib = fibonacci()
fib.next()  // { value: 0, done: false }
fib.next()  // { value: 1, done: false }

// async generators
async function* streamData(url) {
    const response = await fetch(url)
    for await (const chunk of response.body) {
        yield chunk
    }
}
```

### 15.2 Iterators

```javascript
const range = {
    from: 1,
    to: 5,
    [Symbol.iterator]() {
        let current = this.from
        const end = this.to
        return {
            next() {
                if (current <= end) {
                    return { value: current++, done: false }
                }
                return { done: true }
            }
        }
    }
}

for (const n of range) {
    console.log(n)  // 1, 2, 3, 4, 5
}
```

### 15.3 SharedArrayBuffer и Atomics

```javascript
const buffer = new SharedArrayBuffer(1024)
const arr = new Int32Array(buffer)
Atomics.add(arr, 0, 5)
Atomics.load(arr, 0)  // 5
Atomics.store(arr, 0, 10)
Atomics.wait(arr, 0, 5)   // ждёт
Atomics.notify(arr, 0, 1) // пробуждает
```

---

## 16. Паттерны проектирования

### 16.1 Module

```javascript
const MyModule = (() => {
    const privateVar = "secret"
    
    const privateMethod = () => {
        console.log(privateVar)
    }
    
    return {
        publicMethod: () => {
            privateMethod()
        }
    }
})()
```

### 16.2 Observer

```javascript
class Observable {
    constructor() {
        this.observers = new Set()
    }
    
    subscribe(fn) {
        this.observers.add(fn)
        return () => this.observers.delete(fn)
    }
    
    notify(data) {
        this.observers.forEach(fn => fn(data))
    }
}

const subject = new Observable()
const unsub = subject.subscribe(data => console.log(data))
subject.notify("hello")
unsub()
```

### 16.3 Singleton

```javascript
class Singleton {
    static #instance
    
    constructor() {
        if (Singleton.#instance) {
            return Singleton.#instance
        }
        Singleton.#instance = this
    }
    
    static getInstance() {
        if (!Singleton.#instance) {
            Singleton.#instance = new Singleton()
        }
        return Singleton.#instance
    }
}
```

### 16.4 Pub/Sub (Event Bus)

```javascript
class EventBus {
    constructor() {
        this.events = {}
    }
    
    on(event, fn) {
        (this.events[event] ||= []).push(fn)
    }
    
    emit(event, data) {
        (this.events[event] || []).forEach(fn => fn(data))
    }
    
    off(event, fn) {
        this.events[event] = (this.events[event] || []).filter(f => f !== fn)
    }
}
```

---

## 17. Производительность

### 17.1 Оптимизация

```javascript
// Debounce
function debounce(fn, delay) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

// Throttle
function throttle(fn, limit) {
    let inThrottle
    return (...args) => {
        if (!inThrottle) {
            fn(...args)
            inThrottle = setTimeout(() => inThrottle = false, limit)
        }
    }
}

// Memoization
function memoize(fn) {
    const cache = new Map()
    return (...args) => {
        const key = JSON.stringify(args)
        if (cache.has(key)) return cache.get(key)
        const result = fn(...args)
        cache.set(key, result)
        return result
    }
}
```

### 17.2 Web Workers

```javascript
// worker.js
self.onmessage = (e) => {
    const result = heavyComputation(e.data)
    self.postMessage(result)
}

// main.js
const worker = new Worker("worker.js")
worker.postMessage(data)
worker.onmessage = (e) => console.log(e.data)
worker.onerror = (err) => console.error(err)
worker.terminate()
```

---

## 18. Ресурсы

- **MDN (developer.mozilla.org)** — лучшая документация
- **JavaScript.info** — учебник
- **Node.js docs** — документация Node
- **Can I Use (caniuse.com)** — поддержка браузеров
- **State of JS** — ежегодный опрос
- **Awesome JavaScript** — github.com/sorrycc/awesome-javascript

---

## 19. Практические упражнения

### 19.1 Базовые

1. Напишите функцию debounce.
2. Реализуйте глубокое копирование объекта.
3. Напишите Promise.all с нуля.
4. Реализуйте EventEmitter класс.
5. Напишите функцию сортировки массива объектов по ключу.

### 19.2 Средние

1. Реализуйте LRU Cache.
2. Напишите свой Array.prototype.map.
3. Реализуйте паттерн Observable (RxJS light).
4. Напишите простой Virtual DOM.
5. Реализуйте свой JSON.parse.

### 19.3 Продвинутые

1. Напишите свой реактивный фреймворк (Vue-like).
2. Реализуйте Async/Await с генераторами.
3. Напишите WebSocket сервер и клиент.
4. Реализуйте GraphQL клиент.
5. Напишите свой bundler (минимальный Webpack).

---

## 🎓 Курс

| Unit | Тема | Содержание |
|------|------|-----------|
| [Unit 1](unit-01/syntax.md) | Основы | Переменные, типы, условия, циклы, функции, объекты |
| [Unit 2](unit-02/syntax.md) | Массивы, DOM, async | map/filter/reduce, классы, Promise, async/await, DOM |
| [Unit 3](unit-03/syntax.md) | Продвинутые темы | Замыкания, прототипы, модули, Event Loop, Proxy |

Каждый unit включает: теорию, задачи, проекты.

- [Unit 1: задачи](unit-01/practice.md) | [Unit 2: задачи](unit-02/practice.md) | [Unit 3: проекты](unit-03/practice.md)

---

*Полный конспект JavaScript. Регулярно дополняется.*
