# JavaScript — Unit 3: Продвинутые темы

## Замыкания (Closures)

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

## this и контекст

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

## Прототипы

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
Dog.prototype.bark = function() {
    console.log("Гав-гав!")
}

const dog = new Dog("Шарик")
dog.speak()  // Шарик издаёт звук
dog.bark()   // Гав-гав!
```

## Модули

```javascript
// math.js
export const add = (a, b) => a + b
export const PI = 3.14159
export default class Calculator { ... }

// main.js
import Calculator, { add, PI } from "./math.js"
import * as Math from "./math.js"
```

## Event Loop

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

## Map, Set, WeakMap

```javascript
const map = new Map()
map.set("key", "value")
map.get("key")  // "value"

const set = new Set([1, 2, 3, 3, 3])
set.size         // 3
set.has(2)       // true

// WeakMap — ключи только объекты, не мешает GC
const wm = new WeakMap()
let obj = {}
wm.set(obj, "secret")
obj = null  // запись удалится GC
```

## Proxy

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

## Задачи

1. Напишите функцию memoize, кэширующую результаты
2. Создайте Observable (паттерн Observer)
3. Используя Proxy, сделайте объект с валидацией строк
4. Напишите функцию debounce
