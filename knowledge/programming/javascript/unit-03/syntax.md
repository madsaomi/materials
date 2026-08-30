# JavaScript — Unit 3: Продвинутые темы

## Введение

В этом юните разбираются механизмы, которые отличают JavaScript от простых скриптовых языков: замыкания, контекст `this`, прототипное наследование, модули, однопоточный Event Loop, коллекции `Map`/`Set`, метапрограммирование через `Proxy`, `Symbol` и генераторы.

| Тема | Практический навык |
|------|--------------------|
| Замыкания | контроль области видимости, фабрики функций |
| this | управление контекстом вызова |
| Прототипы | наследование, цепочки объектов |
| Модули | организация и переиспользование кода |
| Event Loop | понимание асинхронности «изнутри» |
| Map/Set/WeakMap | коллекции с произвольными ключами |
| Proxy/Reflect | перехват операций над объектами |
| Генераторы и Symbol | метапрограммирование, ленивые вычисления |

---

## 1. Замыкания (Closures)

**Замыкание** — функция, которая «запоминает» своё лексическое окружение и сохраняет доступ к его переменным даже после того, как внешняя функция уже завершилась.

```javascript
function createCounter() {
    let count = 0
    return {
        increment: () => ++count,
        decrement: () => --count,
        getValue: () => count
    }
}

const counter = createCounter()
counter.increment()  // 1
counter.increment()  // 2
counter.decrement()  // 1
console.log(counter.getValue())  // 1
// count недоступен снаружи — инкапсуляция
```

### 1.1 Как работает замыкание

При создании каждая функция получает ссылку на **лексическое окружение** (`Lexical Environment`), где она была объявлена. Когда внешняя функция возвращает внутреннюю, внутренняя функция «тащит» за собой весь окружение.

```javascript
function makeGreeting(prefix) {
    // prefix — хранится в окружении замыкания
    return function(name) {
        return `${prefix}, ${name}!`
    }
}

const sayHi = makeGreeting("Привет")
const sayBye = makeGreeting("Пока")

console.log(sayHi("Алиса"))   // Привет, Алиса!
console.log(sayBye("Боб"))    // Пока, Боб!
```

Обратите внимание: каждый вызов `makeGreeting` создаёт **отдельное** окружение. Для `sayHi` и `sayBye` переменные `prefix` независимы.

### 1.2 Замыкание в цикле

Классическая ловушка: `var` имеет функциональную область видимости, поэтому все обработчики «видят» одно и то же значение.

```javascript
// Плохо — var
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0)
}
// Вывод: 3, 3, 3

// Хорошо — let (блочная область видимости)
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log(j), 0)
}
// Вывод: 0, 1, 2

// Альтернатива для var — замыкание-аргумент
for (var k = 0; k < 3; k++) {
    (function(step) {
        setTimeout(() => console.log(step), 0)
    })(k)
}
// Вывод: 0, 1, 2
```

### 1.3 Module pattern

Самый востребованный приём на замыканиях — приватные переменные с публичным API:

```javascript
const settings = (() => {
    let theme = "light"          // приватное состояние

    const setTheme = (value) => {
        theme = ["light", "dark"].includes(value) ? value : theme
        render()
    }

    const getTheme = () => theme

    const render = () => {
        console.log(`Тема применена: ${theme}`)
    }

    return { setTheme, getTheme }
})()
```

### 1.4 Для чего это нужно

| Сценарий | Пример |
|----------|--------|
| Приватное состояние | счётчики, кэши, флаги |
| Фабрики функций | `createValidator`, `makeGreeting` |
| Частичное применение | `bind`, каррирование |
| Модульный паттерн | IIFE-модули до ES Modules |

---

## 2. this и контекст выполнения

Значение `this` определяется **способом вызова** функции, а не тем, где она объявлена.

```javascript
const obj = {
    name: "Алиса",
    greet() { console.log(`Привет, ${this.name}!`) },
    greetArrow: () => console.log(`Привет, ${this.name}!`),
    greetBind: function() { console.log(`Привет, ${this.name}!`) }.bind({name: "Боб"})
}

obj.greet()           // Привет, Алиса!
obj.greetArrow()      // Привет, undefined! (стрелка не имеет своего this)
obj.greetBind()       // Привет, Боб!
```

### 2.1 Четыре правила

| Способ вызова | this равен |
|---------------|-----------|
| `obj.method()` | объект `obj` перед точкой |
| `fn()` | модуль / `undefined` в strict-режиме |
| `new Fn()` | новый созданный объект |
| `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)` | переданный `x` |

```javascript
"use strict"

function show() {
    console.log(this)
}

const user = { name: "Алиса", show }

user.show()        // { name: "Алиса", show } — правило точки
show()             // undefined (strict)
new show()         // экземпляр show
show.call({ n: 1 })  // { n: 1 }
show.apply({ n: 2 }) // { n: 2 }
const bound = show.bind({ n: 3 })
bound()               // { n: 3 } — навсегда
```

### 2.2 Стрелочные функции

Стрелки не имеют собственного `this` — берут его из внешней (лексической) области. Их `this` задать через `call`/`apply`/`bind` нельзя.

```javascript
class Timer {
    constructor() {
        this.tick = 0
        // стрелка сохраняет this экземпляра
        setInterval(() => {
            this.tick++
            console.log(this.tick)
        }, 1000)
    }
}

// Обычная функция потеряла бы this (или взяла глобальный объект)
```

### 2.3 call, apply, bind

```javascript
function log(prefix, suffix) {
    console.log(prefix, this.name, suffix)
}

const user = { name: "Боб" }

log.call(user, "Привет")          // Привет Боб undefined  — аргументы по списку
log.apply(user, ["Привет"])       // Привет Боб undefined  — аргументы массивом
const bound = log.bind(user, "Привет")  // частичное применение + привязка
bound("!")                          // Привет Боб !
```

---

## 3. Прототипы и цепочка прототипов

В JavaScript наследование — **прототипное**: объекты ссылаются на другие объекты через внутренний слот `[[Prototype]]`.

```javascript
function Animal(name) {
    this.name = name
}

Animal.prototype.speak = function() {
    console.log(`${this.name} издаёт звук`)
}

function Dog(name) {
    Animal.call(this, name)
}

Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Dog.prototype.bark = function() {
    console.log("Гав-гав!")
}

const dog = new Dog("Шарик")
dog.speak()  // Шарик издаёт звук
dog.bark()   // Гав-гав!
```

### 3.1 Как искать свойства

При обращении `dog.speak` движок проходит цепочку:

| Уровень | Что проверяется |
|---------|-----------------|
| 1. Сам объект `dog` | собственные свойства (`name`) |
| 2. `dog.__proto__` = `Dog.prototype` | `bark` |
| 3. `Dog.prototype.__proto__` = `Animal.prototype` | `speak` |
| 4. `Animal.prototype.__proto__` = `Object.prototype` | `toString`, `hasOwnProperty` |
| 5. Конец цепочки | `null` → `undefined` |

```javascript
console.log(Object.getPrototypeOf(dog) === Dog.prototype)  // true
console.log(dog instanceof Dog)                            // true
console.log(dog instanceof Animal)                         // true
console.log(dog instanceof Object)                         // true

console.log(Object.prototype.hasOwnProperty.call(dog, "name"))  // true
console.log(dog.hasOwnProperty("speak"))                        // false — метод в prototype
```

### 3.2 Object.create

Явное задание прототипа без функции-конструктора:

```javascript
const animal = {
    speak() { console.log(`${this.name} издаёт звук`) }
}

const cat = Object.create(animal)
cat.name = "Барсик"
cat.speak()  // Барсик издаёт звук
```

### 3.3 Прототипы vs классы

| Аспект | Прототипы | `class` |
|--------|-----------|---------|
| Синтаксис | функции + `.prototype` | нативный, привычный |
| Наследование | `Object.create` | `extends` |
| Конструктор родителя | `Parent.call(this, ...)` | `super(...)` |
| Приватные поля | нет | `#field` |
| Геттеры/сеттеры | `Object.defineProperty` | `get`/`set` в классе |

`class` — синтаксический сахар поверх прототипной модели. Класс — это функция-конструктор с настройками `prototype`.

---

## 4. Модули (ES Modules)

ES Modules — нативная модульная система. Один файл = один модуль, всё приватно, наружу — только `export`.

```javascript
// math.js
export const add = (a, b) => a + b
export const PI = 3.14159
export default class Calculator {
    sum(...args) { return args.reduce(add, 0) }
}

// main.js
import Calculator, { add, PI } from "./math.js"
import * as Math from "./math.js"

console.log(add(2, 3))        // 5
console.log(PI)               // 3.14159
console.log(Math.add(4, 5))   // 9
```

### 4.1 Формы export/import

| Код | Что делает |
|-----|-----------|
| `export const x = 1` | именованный экспорт |
| `export default fn` | экспорт по умолчанию (один на модуль) |
| `import { x, y } from "..."` | именованный импорт |
| `import x from "..."` | импорт default |
| `import * as ns from "..."` | весь модуль под namespace |
| `import("...")` | динамический импорт (Promise) |

### 4.2 Динамический импорт

```javascript
// Ленивая подгрузка модуля (ES2020)
const module = await import("./math.js")
const result = module.add(2, 3)
```

### 4.3 Re-export

```javascript
// utils/index.js — сборка API модуля
export { add, PI } from "./math.js"
export * from "./strings.js"
export { default as Calculator } from "./math.js"
```

### 4.4 ES Modules vs CommonJS

| Критерий | ES Modules (import/export) | CommonJS (require/module.exports) |
|----------|---------------------------|-----------------------------------|
| Стандарт | ECMAScript | Node.js / npm |
| Импорт | статический, анализируется | динамический `require` |
| Tree shaking | работает | нет |
| Top-level await | есть | нет |
| Подключение в Node | `"type": "module"` | по умолчанию |

---

## 5. Event Loop

JavaScript однопоточный, но не блокирующий: асинхронные операции выстраиваются в очереди, а `Event Loop` решает, в каком порядке их выполнять.

```javascript
console.log("1")           // 1

setTimeout(() => {
    console.log("2")       // 4
}, 0)

Promise.resolve().then(() => {
    console.log("3")       // 3
})

console.log("4")           // 2

// Вывод: 1, 4, 3, 2
// Сначала синхронный код, потом микротаски (Promise), потом макротаски (setTimeout)
```

### 5.1 Компоненты

| Компонент | Что это | Примеры |
|-----------|---------|---------|
| Стек вызовов | выполняющийся синхронный код | функции |
| Микроочередь | срочные задачи «в конце тика» | `Promise.then`, `queueMicrotask`, `await` |
| Макроочередь | обычные задачи | `setTimeout`, `setInterval`, I/O, события |
| `requestAnimationFrame` | кадры рендеринга (браузер) | анимации |

Порядок тика: синхронный код → опустошить микроочередь → `requestAnimationFrame` → одна макротаска → снова микроочередь...

### 5.2 Сравнение таймеров

```javascript
setTimeout(() => console.log("min 4ms"), 0)
setTimeout(() => console.log("min 0ms"), 0)   // порядок не гарантирован строго
queueMicrotask(() => console.log("micro"))     // между макротасками
Promise.resolve().then(() => console.log("then"))
```

Минимальная задержка `setTimeout` в браузере — 4 мс (после вложений), поэтому для «до ближайшего тика» используют `queueMicrotask` или сразу `Promise.resolve()`.

### 5.3 Блокирующий код — зло

```javascript
// Медленный синхронный цикл замораживает интерфейс
const start = Date.now()
while (Date.now() - start < 3000) {
    // блокирует и UI, и микротаски, и обработчики
}
```

---

## 6. Map, Set, WeakMap, WeakSet

### 6.1 Map

Коллекция «ключ → значение» с ключом любого типа и гарантированным порядком вставки.

```javascript
const map = new Map()
map.set("key", "value")
map.get("key")  // "value"

// Ключи — любые значения
const fn = () => {}
const objKey = {}
map.set(fn, "функция").set(objKey, "объект")
map.get(fn)  // "функция"

// Итерация
for (const [key, value] of map) console.log(key, value)
map.forEach((value, key) => console.log(key, value))
```

### 6.2 Set

Коллекция уникальных значений.

```javascript
const set = new Set([1, 2, 3, 3, 3])
set.size         // 3
set.has(2)       // true
set.add(4)       // Set(4)
set.delete(1)    // true
set.clear()      // пусто

// Уникализация массива
const unique = [...new Set([1, 2, 2, 3, 3, 3])]  // [1, 2, 3]
```

### 6.3 WeakMap и WeakSet

WeakMap — ключи **только объекты**, и слабые ссылки: если на ключ нет ссылок, запись удаляется сборщиком мусора.

```javascript
const wm = new WeakMap()
let obj = {}
wm.set(obj, "secret")
obj = null  // запись удалится GC

// Нет .size, нет итераций — это защита от протечек памяти
```

### 6.4 Map vs Object

| Критерий | Map | Object |
|----------|-----|--------|
| Ключи | любые значения | строки / Symbol |
| Порядок | вставки | целочисленные ключи — по возрастанию |
| Размер | `map.size` | `Object.keys(o).length` |
| Итерация | интуитивная | нужен `Object.entries` |
| Производительность | частые добавления/удаления | лучше для статики |
| Безопасность | ключ `"__proto__"` не конфликтует | может конфликтовать |

---

## 7. Proxy и Reflect

`Proxy` перехватывает операции над объектом через **ловушки** (`traps`) и позволяет переопределить поведение.

```javascript
const validator = {
    set(target, key, value) {
        if (key === "age" && (typeof value !== "number" || value < 0))
            throw new Error("Некорректный возраст")
        target[key] = value
        return true
    }
}

const person = new Proxy({}, validator)
person.age = 25   // OK
person.age = -5   // Error: Некорректный возраст
```

### 7.1 Основные ловушки

| Ловушка | Перехватывает |
|---------|--------------|
| `get(target, prop)` | чтение `obj.prop` |
| `set(target, prop, value)` | запись `obj.prop = v` |
| `has(target, prop)` | оператор `in` |
| `deleteProperty(target, prop)` | `delete obj.prop` |
| `apply(target, thisArg, args)` | вызов функции |
| `construct(target, args)` | `new Fn(...)` |
| `ownKeys(target)` | `Object.keys` |
| `getPrototypeOf` / `setPrototypeOf` | работа с прототипом |

```javascript
const guarded = new Proxy({}, {
    get(target, prop) {
        if (prop in target) return target[prop]
        console.warn(`Свойство "${prop}" не существует`)
        return undefined
    },
    deleteProperty(target, prop) {
        if (prop.startsWith("_"))
            throw new Error("Нельзя удалять приватное свойство")
        return Reflect.deleteProperty(target, prop)
    }
})
```

### 7.2 Reflect

`Reflect` — набор инструментов, дублирующих внутренние операции. Его методы возвращают результат вместо выброса исключений и всегда вызываются в ловушках, чтобы не нарушать внутренние гарантии (например, невозможность записи).

```javascript
const target = {}
Reflect.set(target, "a", 1)          // true
Reflect.has(target, "a")              // true
Reflect.defineProperty(target, "b", { value: 42 })
Reflect.deleteProperty(target, "b")   // true

// Важно: внутри ловушек вызывайте Reflect-аналог
const proxy = new Proxy(target, {
    set(t, k, v) { return Reflect.set(t, k, v) }
})
```

### 7.3 Применения Proxy

| Задача | Ловушка |
|--------|---------|
| Валидация данных | `set` |
| Мемоизация функций | `apply` |
| Виртуализация (значение по умолчанию) | `get` |
| Скрытие приватных свойств | `ownKeys`, `get` |
| Счётчик обращений к полю | `get` |
| Реактивность (как в Vue) | `get` + `set` |

---

## 8. Задачи по юниту

1. Напишите функцию memoize, кэширующую результаты
2. Создайте Observable (паттерн Observer)
3. Используя Proxy, сделайте объект с валидацией строк
4. Напишите функцию debounce

Подробные решения — в файле `practice.md`.

---

## 9. Генераторы и итераторы

### 9.1 Генераторы

Функция со знака `*` возвращает объект-генератор. Код выполняется **лениво**: по одному `yield` на каждый `.next()`.

```javascript
function* countdown(from) {
    while (from > 0) {
        yield from--
    }
    return "готово"
}

const it = countdown(3)
it.next()  // { value: 3, done: false }
it.next()  // { value: 2, done: false }
it.next()  // { value: 1, done: false }
it.next()  // { value: "готово", done: true }
```

Бесконечная последовательность — без генератора стек переполнился бы:

```javascript
function* fib() {
    let [a, b] = [0, 1]
    while (true) {
        yield a
        [a, b] = [b, a + b]
    }
}

const g = fib()
Array.from({ length: 10 }, () => g.next().value)
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### 9.2 Передача значений в генератор

`next(x)` передаёт `x` как результат последнего `yield`:

```javascript
function* dialog() {
    const name = yield "Как вас зовут?"
    const age = yield `Привет, ${name}! Сколько лет?`
    return `Записано: ${name}, ${age} лет`
}

const it = dialog()
it.next()                    // { value: "Как вас зовут?", done: false }
it.next("Алиса")             // { value: "Привет, Алиса! Сколько лет?", done: false }
it.next(30)                  // { value: "Записано: Алиса, 30 лет", done: true }
```

### 9.3 Async-генераторы

```javascript
async function* streamNumbers() {
    for (let i = 1; i <= 3; i++) {
        await new Promise(r => setTimeout(r, 100))
        yield i
    }
}

for await (const n of streamNumbers()) {
    console.log(n)   // 1, 2, 3 (с задержками)
}
```

### 9.4 Свой итератор через Symbol.iterator

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

for (const n of range) console.log(n)  // 1 2 3 4 5
```

---

## 10. Symbol и метапрограммирование

`Symbol` — уникальный примитив. Подходит для приватных ключей и для договорённостей протоколов (`Symbol.iterator`, `Symbol.toStringTag`).

```javascript
const sym = Symbol("id")
Symbol("id") === Symbol("id")  // false — всегда уникальный

const field = Symbol("secret")
const obj = { [field]: 42 }
obj[field]           // 42
Object.keys(obj)     // [] — символьные ключи не перечисляются
```

### 10.1 Well-known symbols

| Symbol | Протокол |
|--------|----------|
| `Symbol.iterator` | `for...of`, spread, `Array.from` |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toStringTag` | строка в `Object.prototype.toString` |
| `Symbol.toPrimitive` | приведение к примитиву |
| `Symbol.hasInstance` | поведение `instanceof` |

```javascript
const team = {
    members: ["А", "Б", "В"],
    [Symbol.iterator]() {
        let i = 0
        return {
            next: () => ({
                value: this.members[i],
                done: i++ >= this.members.length
            })
        }
    },
    [Symbol.toStringTag]: "Team"
}

console.log([...team])      // ["А", "Б", "В"]
console.log(String(team))   // [object Team]
```

### 10.2 Symbol.for / Symbol.keyFor

Глобальный реестр — для шаривших символов между модулями и iframe:

```javascript
const a = Symbol.for("shared")     // создаёт в реестре
const b = Symbol.for("shared")     // находит тот же
a === b                            // true
Symbol.keyFor(a)                   // "shared"
```

---

## 11. Классы: продвинутые возможности

### 11.1 Структура класса

```javascript
class User {
    static count = 0                // статическое поле
    #password                       // приватное поле (ES2022)

    constructor(name, password) {
        this.name = name
        this.#password = password
        User.count++
    }

    get hiddenPassword() {          // геттер
        return "*".repeat(this.#password.length)
    }

    set hiddenPassword(value) {     // сеттер
        this.#password = value
    }

    static fromJSON(json) {
        const data = JSON.parse(json)
        return new User(data.name, data.password)
    }

    #checkStrength() {              // приватный метод
        return this.#password.length >= 8
    }

    isStrong() { return this.#checkStrength() }
}

const u = new User("Алиса", "s3cret")
console.log(u.name)             // Алиса
u.#password                     // SyntaxError — снаружи недоступно
u.hiddenPassword                // "******"
```

### 11.2 Наследование

```javascript
class Admin extends User {
    constructor(name, password, role = "admin") {
        super(name, password)        // вызвать конструктор родителя
        this.role = role
    }

    // Переопределение метода-сеттера родителя
    set hiddenPassword(value) {
        console.warn("Админу пароль не менять")
    }
}

const admin = new Admin("Боб", "q1w2e3")
admin instanceof Admin   // true
admin instanceof User    // true — цепочка прототипов построена
```

### 11.3 instanceof и проверки

```javascript
console.log(u instanceof User)      // true
console.log(User.prototype.isPrototypeOf(u))  // true
console.log(Object.getPrototypeOf(u) === User.prototype)  // true
```

---

## 12. Функциональное программирование

### 12.1 Чистые функции

Чистая функция: детерминирована (один вход — один выход) и без побочных эффектов.

| Характеристика | Чистая функция | Нечистая |
|----------------|----------------|----------|
| Одинаковые аргументы | всегда одинак. результат | может отличаться |
| Меняет состояние | нет | может |
| Читает глобальное | нет | может |
| Пример | `(a, b) => a + b` | `Math.random`, `Date.now` |

### 12.2 Каррирование

Превращение функции нескольких аргументов в цепочку функций по одному аргументу.

```javascript
const add = a => b => a + b
add(2)(3)          // 5

const inc = add(1)
const add5 = add(5)
inc(10)            // 11
add5(10)           // 15
```

### 12.3 Частичное применение и bind

```javascript
function multiply(a, b, c) { return a * b * c }
const triple = multiply.bind(null, 3)      // зафиксировали первый аргумент
triple(2, 4)       // 3 * 2 * 4 = 24
```

### 12.4 Композиция

```javascript
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x)

const trim = s => s.trim()
const upper = s => s.toUpperCase()
const exclaim = s => s + "!"

const shout = pipe(trim, upper, exclaim)         // слева направо
console.log(shout("  hello "))                   // "HELLO!"

const shoutR = compose(exclaim, upper, trim)     // справа налево
console.log(shoutR("  hello "))                  // "HELLO!"
```

### 12.5 Мемоизация

```javascript
function memoize(fn) {
    const cache = new Map()
    return function(...args) {
        const key = JSON.stringify(args)
        if (cache.has(key)) return cache.get(key)
        const result = fn(...args)
        cache.set(key, result)
        return result
    }
}

const slowAdd = (a, b) => {
    console.log("вычисляю...")
    return a + b
}
const fastAdd = memoize(slowAdd)
fastAdd(1, 2)   // вычисляю... → 3
fastAdd(1, 2)   // из кэша → 3
```

### 12.6 Debounce и Throttle

```javascript
// Debounce — выполняет ПОСЛЕ паузы
function debounce(fn, delay = 300) {
    let timer
    return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(() => fn.apply(this, args), delay)
    }
}

// Throttle — выполняет НЕ ЧАЩЕ одного раза за интервал
function throttle(fn, limit = 300) {
    let inThrottle = false
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}
```

| Приём | Когда применять |
|-------|-----------------|
| Debounce | поиск при вводе, автодополнение, resize |
| Throttle | скролл, drag & drop, клики |
| Memoize | тяжёлые повторяющиеся вычисления |

---

## 13. Декораторы (Stage 3)

Декораторы оборачивают методы/классы, добавляя поведение без изменения исходного кода.

```javascript
function logged(originalMethod, context) {
    return function(...args) {
        console.log(`Вызов ${context.name} с аргументами:`, args)
        return originalMethod.call(this, ...args)
    }
}

class Calculator {
    @logged
    add(a, b) {
        return a + b
    }
}

const calc = new Calculator()
calc.add(2, 3)
// Вызов add с аргументами: [ 2, 3 ]
// 5
```

Применения: логирование, измерение времени, кэширование, привязка доступа.

---

## 14. Строгий режим

`"use strict"` включает строгую проверку кода. Включён по умолчанию в ES-модулях и внутри классов.

```javascript
"use strict"

// Запрещено / меняется поведение:
// - неявные глобальные переменные
scope = 10            // ReferenceError

// - присваивание свойствам без сеттера
const obj = {}
Object.defineProperty(obj, "x", { value: 1 })
obj.x = 2             // TypeError

// - отбрасывание параметра arguments
function f(a) { arguments[0] = 5; return a }   // вернёт 5, а не 1?

// - delete неизменяемых свойств
const o = Object.freeze({ p: 1 })
delete o.p            // TypeError

// - дублирование параметров
function dup(a, a) {}  // SyntaxError
```

Правило жизни: всегда пишите в строгом режиме (транспиляторы и модули включают его сами).

---

## 15. Новейшие возможности ES2022–ES2025

### 15.1 Приватные поля и статические блоки (ES2022)

```javascript
class Config {
    static #defaults = { port: 3000 }

    // статический блок инициализации — выполняется при загрузке класса
    static {
        console.log("Config загружен")
    }

    static get defaults() { return Config.#defaults }
}
```

### 15.2 new Set/Map методы (ES2025)

```javascript
const a = new Set([1, 2, 3])
const b = new Set([2, 3, 4])

a.union(b)          // Set {1,2,3,4}
a.intersection(b)   // Set {2,3}
a.difference(b)     // Set {1}
a.symmetricDifference(b)  // Set {1,4}
a.isSubsetOf(b)     // false
```

### 15.3 Array methods (ES2023)

```javascript
const arr = [5, 1, 4, 2]
arr.toSorted()      // [1,2,4,5] — новый массив
arr.toReversed()    // [2,4,1,5]
arr.toSpliced(1, 2) // [5] — без мутаций

// Префикс "to" = возвращает новый массив, исходный не трогает
```

### 15.4 Прочее

```javascript
// ES2020: nullish coalescing + optional chaining
const city = user?.address?.city ?? "неизвестно"

// ES2021: логические операторы присваивания
x ||= defaultValue      // x = x || defaultValue
x &&= otherValue        // только если x истинно
x ??= fallback          // только если x null/undefined

// ES2021: replaceAll, Promise.any
"a-b-c".replaceAll("-", " ")   // "a b c"

// ES2023: pipes в массивах
[1, 2, 3].map(x => x * 2).toReversed()  // [6,4,2]
```

---

## 16. Паттерны проектирования

### 16.1 Module

```javascript
const store = (() => {
    let state = {}
    const get = () => state
    const set = (patch) => { state = { ...state, ...patch } }
    return { get, set }
})()
```

### 16.2 Observer

```javascript
class Observable {
    constructor() { this.subscribers = new Set() }
    subscribe(fn) {
        this.subscribers.add(fn)
        return () => this.subscribers.delete(fn)
    }
    notify(data) { this.subscribers.forEach(fn => fn(data)) }
}
const store = new Observable()
const un = store.subscribe(d => console.log(d))
store.notify("hello")
un()
```

### 16.3 Singleton

```javascript
class Singleton {
    static #instance
    static getInstance() {
        if (!Singleton.#instance) Singleton.#instance = new Singleton()
        return Singleton.#instance
    }
}
const s1 = Singleton.getInstance()
const s2 = Singleton.getInstance()
console.log(s1 === s2)   // true
```

### 16.4 Factory

```javascript
function createButton(type) {
    const buttons = {
        primary: { classes: "btn btn-primary", text: "Сохранить" },
        danger:  { classes: "btn btn-danger",  text: "Удалить" }
    }
    return { ...buttons[type], render() { console.log(`<button class="${this.classes}">${this.text}</button>`) } }
}
createButton("danger").render()
```

### 16.5 Façade

```javascript
const api = {
    async getUsers() { ... },
    async createUser(data) { ... },
    async deleteUser(id) { ... }
}
// Facade прячет детали (токены, обработку ошибок, пагинацию)
```

### 16.6 Сводная таблица

| Паттерн | Суть | Упоминалось |
|---------|------|-------------|
| Module | приватное состояние + публичное API | §1.3 |
| Observer | подписка на изменения | §16.2 |
| Singleton | один экземпляр на процесс | §16.3 |
| Factory | создание объектов без `new` рядом | §16.4 |
| Façade | упрощённый интерфейс сложной системы | §16.5 |
| Decorator | добавление поведения поверх | §13 |
| Memoize | кэш результатов | §12.5 |

---

## 17. Шпаргалка: версии ECMAScript

| Год | Версия | Ключевые новинки |
|-----|--------|------------------|
| 2015 | ES6 | `let/const`, стрелки, классы, `Promise`, модули, `Map/Set` |
| 2016 | ES7 | `Array.includes`, оператор `**` |
| 2017 | ES8 | `async/await`, `Object.entries/values`, `padStart` |
| 2018 | ES9 | rest/spread для объектов, `Promise.finally` |
| 2019 | ES10 | `flat`, `flatMap`, `Object.fromEntries` |
| 2020 | ES11 | `??`, `?.`, BigInt, `Promise.allSettled`, динамический импорт |
| 2021 | ES12 | `replaceAll`, `??=`, `Promise.any`, `WeakRef` |
| 2022 | ES13 | приватные поля, топ-левел `await`, статические блоки |
| 2023 | ES14 | `toSorted`, `toReversed`, `toSpliced`, `with` |
| 2024 | ES15 | `Promise.withResolvers`, `Object.groupBy` |
| 2025 | ES16 | методы `Set`: `union`, `intersection`, `difference` |

---

*Все конструкции юнита проверяйте в консоли браузера. Подробные упражнения и разбор типичных ошибок — в `practice.md`.*