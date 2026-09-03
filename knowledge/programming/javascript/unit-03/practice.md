# JavaScript — Unit 3: Проекты и упражнения

## Введение

Практическая часть юнита: три разобранных проекта (теория → код), полноценный мини-проект, 25 упражнений с решениями, разбор типичных ошибок, вопросы для самопроверки и глоссарий.

---

## 1. Разобранные проекты

### Проект 1: Memoize

```javascript
function memoize(fn) {
    const cache = new Map()
    return function(...args) {
        const key = JSON.stringify(args)
        if (cache.has(key)) {
            console.log("из кэша")
            return cache.get(key)
        }
        const result = fn(...args)
        cache.set(key, result)
        console.log("вычислено")
        return result
    }
}

const slowFib = n => n < 2 ? n : slowFib(n-1) + slowFib(n-2)
const fastFib = memoize(n => n < 2 ? n : fastFib(n-1) + fastFib(n-2))

console.time("slow"); console.log(slowFib(40)); console.timeEnd("slow")
console.time("fast"); console.log(fastFib(40)); console.timeEnd("fast")
```

Почему это работает: обёртка держит `cache` в замыкании; ключ — сериализованные аргументы; при повторе результат берётся из `Map`, рекурсия Фибоначчи превращается из экспоненциальной в линейную.

### Проект 2: Observable

```javascript
class Observable {
    constructor() {
        this.subscribers = new Set()
    }
    subscribe(fn) {
        this.subscribers.add(fn)
        return () => this.subscribers.delete(fn)
    }
    notify(data) {
        this.subscribers.forEach(fn => fn(data))
    }
}

// Usage
const store = new Observable()
const unsubscribe = store.subscribe(data => {
    console.log("Получено:", data)
})

store.notify("hello")  // Получено: hello
store.notify({x: 42})  // Получено: {x: 42}
unsubscribe()
store.notify("никто не получит")  // тишина
```

### Проект 3: Debounce + Throttle

```javascript
function debounce(fn, delay = 300) {
    let timer
    return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(() => fn.apply(this, args), delay)
    }
}

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

// Пример: поиск
const searchInput = document.getElementById("search")
searchInput.addEventListener("input", debounce(async (e) => {
    const results = await fetch(`/api/search?q=${e.target.value}`)
    console.log(await results.json())
}, 500))
```

---

## 2. Мини-проект: реактивная корзина

Задача: маленькое хранилище состояния с реактивным пересчётом итого, историей изменений и лимитом скидки. Тренирует Proxy, замыкания, Map и паттерн Observer.

```javascript
function createReactiveStore(initial = {}) {
    const state = initial
    const watchers = new Map()        // свойство -> набор слушателей
    const history = []
    const LIMIT = 1000

    function watch(key, fn) {
        if (!watchers.has(key)) watchers.set(key, new Set())
        watchers.get(key).add(fn)
        return () => watchers.get(key).delete(fn)
    }

    const proxy = new Proxy(state, {
        set(target, key, value) {
            const total = Object.keys(target)
                .reduce((sum, k) => sum + target[k], 0) - (target[key] ?? 0) + value

            if (total > LIMIT) {
                console.warn(`Лимит ${LIMIT} превышен, операция отменена`)
                return false
            }

            target[key] = value
            history.push({ key, value, at: new Date().toISOString() })
            ;(watchers.get(key) || []).forEach(fn => fn(value))
            return true
        }
    })

    proxy.history = () => history
    return { state: proxy, watch, history }
}

const cart = createReactiveStore({ apples: 100, bread: 60 })

const unwatch = cart.watch("apples", (v) => console.log(`Яблоки теперь: ${v} грн`))

cart.state.apples = 150   // Яблоки теперь: 150 грн
cart.state.apples = 880   // Лимит превышен, операция отменена
cart.state.bread = 80     // (листен означает apples — не сработает)

console.log(cart.history())
// [{key: "apples", value: 150, at: ...}, {key: "bread", value: 80, at: ...}]
```

Что тут интересного:

- `set` возвращает `false` — Proxy сигнализирует о запрете
- `watchers` — Map с ключами-свойствами и Set слушателей
- история пишется прямо из ловушки, минуя публичные методы

---

## 3. Упражнения с решениями

### Базовый уровень

#### Упражнение 1. Два независимых счётчика

Создайте две функции-счётчика с общим замыканием, но разным состоянием.

```javascript
function makeCounter(start = 0) {
    let value = start
    return {
        next: () => ++value,
        reset: () => value = start
    }
}

const a = makeCounter(10)
const b = makeCounter()
a.next()  // 11
b.next()  // 1
a.reset() // a теперь 10
```

#### Упражнение 2. Что выведет код с this?

```javascript
const obj = {
    value: 42,
    getValue() { return this.value },
    getValueArrow: () => this.value
}
const extracted = obj.getValue
console.log(obj.getValue())   // 42 — вызов через точку
console.log(extracted())      // undefined — потерян контекст
console.log(obj.getValueArrow()) // undefined — стрелка не имеет this
```

Решение — по правилам из §2: `this` зависит от вызова, стрелки берут внешний `this`.

#### Упражнение 3. Порядок вывода Event Loop

Предскажите вывод: `console.log("A")`, `Promise.resolve().then(() => console.log("B"))`, `setTimeout(() => console.log("C"), 0)`, `console.log("D")`.

```javascript
console.log("A")
Promise.resolve().then(() => console.log("B"))
setTimeout(() => console.log("C"), 0)
console.log("D")
// Вывод: A D B C
// Синхронный код -> микротаски -> макротаски
```

#### Упражнение 4. Уникальные значения через Set

```javascript
function unique(arr) {
    return [...new Set(arr)]
}
unique([1, 2, 2, 3, 3, 3, "3"])  // [1, 2, 3, "3"] — типы различаются
```

#### Упражнение 5. Частотный словарь через Map

```javascript
function countWords(words) {
    const freq = new Map()
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1)
    return freq
}
const f = countWords(["js", "js", "ts", "js"])
f.get("js")   // 3
```

#### Упражнение 6. Композиция pipe

```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x)
const addTax = x => x * 1.2
const round2 = x => Math.round(x * 100) / 100
pipe(addTax, round2)(99.99)   // 119.99
```

#### Упражнение 7. Каррированный add

```javascript
const add = a => b => c => a + b + c
add(1)(2)(3)   // 6
```

#### Упражнение 8. Частичное применение через bind

```javascript
function log(tag, message) { console.log(`[${tag}] ${message}`) }
const warnLog = log.bind(null, "WARN")
warnLog("мало места")   // [WARN] мало места
```

### Средний уровень

#### Упражнение 9. memoize с лимитом и своей key

```javascript
function memoize(fn, keyFn = JSON.stringify, limit = 100) {
    const cache = new Map()
    return function(...args) {
        const key = keyFn(args)
        if (cache.has(key)) return cache.get(key)
        const result = fn(...args)
        cache.set(key, result)
        if (cache.size > limit) {
            const firstKey = cache.keys().next().value   // старейшая запись
            cache.delete(firstKey)
        }
        return result
    }
}
const identity = memoize(x => x, ([x]) => String(x))
identity({a: 1})  // кэш по сериализации аргумента, не ссылке
```

#### Упражнение 10. debounce с immediate (leading)

```javascript
function debounce(fn, delay = 300, immediate = false) {
    let timer
    return function(...args) {
        const call = () => {
            timer = null
            if (!immediate) fn.apply(this, args)
        }
        const callNow = immediate && !timer
        clearTimeout(timer)
        timer = setTimeout(call, delay)
        if (callNow) fn.apply(this, args)
    }
}
```

#### Упражнение 11. throttle с trailing-вызовом

```javascript
function throttle(fn, limit = 300) {
    let waiting = false
    let lastArgs
    return function(...args) {
        if (waiting) { lastArgs = args; return }
        fn.apply(this, args)
        waiting = true
        setTimeout(() => {
            waiting = false
            if (lastArgs) { fn.apply(this, lastArgs); lastArgs = null }
        }, limit)
    }
}
```

#### Упражнение 12. Observable с фильтром

```javascript
class Observable {
    constructor() { this.subscribers = new Set() }
    subscribe(fn, filter = () => true) {
        const wrapped = data => filter(data) && fn(data)
        this.subscribers.add(wrapped)
        return () => this.subscribers.delete(wrapped)
    }
    notify(data) { this.subscribers.forEach(fn => fn(data)) }
}

const numbers = new Observable()
numbers.subscribe(n => console.log("чёт:", n), n => n % 2 === 0)
numbers.notify(3)   // тишина
numbers.notify(4)   // чёт: 4
```

#### Упражнение 13. value-по умолчанию через Proxy

```javascript
function withDefaults(target, defaults) {
    return new Proxy(target, {
        get(obj, prop) {
            if (prop in obj) return obj[prop]
            return defaults[prop] ?? "не найдено"
        }
    })
}
const settings = withDefaults({ theme: "dark" }, { theme: "light", lang: "ru" })
settings.lang   // "ru"
settings.theme  // "dark" — собственное значение в приоритете
```

#### Упражнение 14. Ленивая бесконечная последовательность

```javascript
function* naturals() {
    let n = 1
    while (true) yield n++
}
const g = naturals()
g.next().value   // 1
g.next().value   // 2

// первые 5 чётных
const even = (function*() {
    for (const n of naturals()) if (n % 2 === 0) yield n
})()
Array.from({length: 5}, () => even.next().value)  // [2, 4, 6, 8, 10]
```

#### Упражнение 15. Обратный итератор

```javascript
function reverseIterable(arr) {
    return {
        [Symbol.iterator]() {
            let i = arr.length - 1
            return {
                next: () => i >= 0
                    ? { value: arr[i--], done: false }
                    : { done: true }
            }
        }
    }
}
[...reverseIterable([1, 2, 3])]  // [3, 2, 1]
```

#### Упражнение 16. Приватность через WeakMap

```javascript
const passwordStore = new WeakMap()

class Account {
    constructor(user, password) {
        this.user = user
        passwordStore.set(this, password)
    }
    verify(input) {
        return passwordStore.get(this) === input
    }
}

const acc = new Account("Алиса", "qwerty")
acc.verify("qwerty")        // true
acc.password                // undefined — не утечка
```

#### Упражнение 17. Наследование вручную через Object.create

```javascript
const base = { describe() { return `базовый ${this.name}` } }
const derived = Object.create(base)
derived.name = "дочерний"
derived.describe()          // базовый дочерний
Object.getPrototypeOf(derived) === base  // true
```

#### Упражнение 18. Кэш с истечением (TTL)

```javascript
function ttlCache(ttlMs = 5000) {
    const cache = new Map()
    return {
        set(key, value) { cache.set(key, { value, expires: Date.now() + ttlMs }) },
        get(key) {
            const entry = cache.get(key)
            if (!entry) return undefined
            if (Date.now() > entry.expires) { cache.delete(key); return undefined }
            return entry.value
        },
        size: () => cache.size
    }
}
const cache = ttlCache(100)
cache.set("a", 1)
cache.get("a")   // 1
```

### Сложный уровень

#### Упражнение 19. Свой Promise.all

```javascript
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = []
        let left = promises.length
        if (left === 0) return resolve([])
        promises.forEach((p, i) => {
            Promise.resolve(p)
                .then(value => {
                    results[i] = value
                    if (--left === 0) resolve(results)
                })
                .catch(reject)
        })
    })
}

promiseAll([Promise.resolve(1), Promise.resolve(2)]).then(console.log)  // [1, 2]
```

#### Упражнение 20. Свой Array.prototype.map

```javascript
function myMap(arr, fn, thisArg) {
    const result = new Array(arr.length)
    for (let i = 0; i < arr.length; i++) {
        if (i in arr) result[i] = fn.call(thisArg, arr[i], i, arr)
    }
    return result
}
myMap([1, 2, 3], x => x * 10)  // [10, 20, 30]
```

#### Упражнение 21. Pub/Sub EventBus

```javascript
class EventBus {
    constructor() { this.events = {} }

    on(event, fn) { (this.events[event] ??= []).push(fn) }

    emit(event, data) { (this.events[event] || []).forEach(fn => fn(data)) }

    off(event, fn) {
        this.events[event] = (this.events[event] || []).filter(f => f !== fn)
    }
}

const bus = new EventBus()
const unwatch = () => bus.on("tick", n => console.log("tick", n))
bus.emit("tick", 1)   // тишина — никто не подписан
```

#### Упражнение 22. LRU Cache

```javascript
function lru(limit = 3) {
    const cache = new Map()
    return {
        get(key) {
            if (!cache.has(key)) return undefined
            const value = cache.get(key)
            cache.delete(key)          // «освежаем» запись: удаляем и вставляем заново
            cache.set(key, value)
            return value
        },
        set(key, value) {
            cache.delete(key)
            cache.set(key, value)
            if (cache.size > limit) {
                const oldest = cache.keys().next().value
                cache.delete(oldest)
            }
        }
    }
}

const c = lru(2)
c.set("a", 1); c.set("b", 2); c.get("a"); c.set("c", 3)
// b вытеснено, a «свежее» c
```

#### Упражнение 23. Proxy: валидация типов

```javascript
function typed(params) {
    return new Proxy({}, {
        set(target, key, value) {
            const schema = params[key]
            if (schema && typeof value !== schema)
                throw new Error(`Поле ${key} должно быть ${schema}`)
            target[key] = value
            return true
        }
    })
}

const user = typed({ name: "string", age: "number" })
user.name = "Алиса"   // ок
user.age = "двадцать" // Error: Поле age должно быть number
```

#### Упражнение 24. Fluent-интерфейс через замыкания

```javascript
function logger() {
    const lines = []
    const api = {
        info: msg => (lines.push(`[INFO] ${msg}`), api),
        error: msg => (lines.push(`[ERROR] ${msg}`), api),
        print: () => console.log(lines.join("\n"))
    }
    return api
}

logger()
    .info("старт")
    .error("авария")
    .info("финиш")
    .print()
// [INFO] старт
// [ERROR] авария
// [INFO] финиш
```

#### Упражнение 25. Генератор Фибоначчи до N

```javascript
function* fibUpTo(n) {
    let [a, b] = [0, 1]
    while (a <= n) {
        yield a
        [a, b] = [b, a + b]
    }
}
[...fibUpTo(20)]   // [0, 1, 1, 2, 3, 5, 8, 13]
```

---

## 4. Типичные ошибки

### 4.1 Потеря this при передаче метода

```javascript
// Ошибка
setTimeout(obj.update, 100)    // this внутри update потерян

// Верно
setTimeout(() => obj.update(), 100)
setTimeout(obj.update.bind(obj), 100)
```

### 4.2 Стрелка там, где нужен this

```javascript
const obj = {
    name: "Алиса",
    greet: () => console.log(this.name)   // undefined
}
```

### 4.3 Замыкание в цикле с var

```javascript
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0)   // 3, 3, 3
}
// Замена var -> let решает проблему
```

### 4.4 Сравнение Map.get с устаревшими данными

```javascript
const m = new Map()
m.set("a", { count: 1 })
const ref = m.get("a")   // ту же ссылку мутируете дальше
ref.count = 100          // ок, но если меняли объект-ключ — get вернёт undefined
```

### 4.5 Забыли вернуть true из ловушки set

```javascript
new Proxy({}, {
    set(t, k, v) { t[k] = v }   // возвращаем undefined => операция "не удалась"
})
// Возвращайте Reflect.set(t, k, v) или true
```

### 4.6 Строгий vs нестрогий this в обычной функции

```javascript
function f() { return this }
f()                     // window (нестрогий), undefined (строгий)
```

### 4.7 setTimeout(0) — это не «сейчас»

```javascript
Promise.resolve().then(f)      // микротаска — до макротасок
setTimeout(f, 0)               // макротаска — минимум 4ms в браузере
```

### 4.8 Мутация вместо копирования

```javascript
const a = [1, 2]
const b = a
b.push(3)        // a тоже [1,2,3] — это одна ссылка
// Копия: const b = [...a] или a.toSpliced(...)
```

### 4.9 JSON.stringify в ключе memoize

```javascript
memoize(fn)                // ключ JSON.stringify(args)
// Ошибка: функции, undefined, BigInt, Symbol ломают ключ
// Обходите: кастомная keyFn или Map вложенных Map
```

### 4.10 Сравнение NaN в Set/Map

```javascript
const s = new Set([NaN, NaN])
s.size   // 1 — Set использует SameValueZero, NaN равен NaN
```

### 4.11 Разница union и spread с дублями

```javascript
new Set([...a, ...b])   // объединение, но O(n+m) по памяти
a.union(b)              // ES2025, лениво и без лишнего массива
```

### 4.12 Proxy не прозрачен для Object.keys

```javascript
const proxy = new Proxy(target, { ownKeys() { return ["x"] } })
// Если забыли включить реальные ключи — Object.keys пуст/ложен
// Всегда совмещайте с Reflect.ownKeys(target) при необходимости
```

### 4.13 Деструктуризация теряет this сразу

```javascript
const { getUser } = service
getUser()   // this потерян, если метод полагается на this
```

### 4.14 Генератор: yield в стрелке и return

```javascript
function* g() { yield 1; return 2 }
g().next()   // {value: 1, done: false}
// 2 не попадёт в for...of — return завершает итерацию
```

### 4.15 Применение debounce внутри цикла

```javascript
for (const item of items) { debounce(save, 100)() }   // не тот это инструмент
// debounce ждёт «тишины» — вызывайте один раз на поток событий
```

### 4.16 WeakMap к примитивам

```javascript
const wm = new WeakMap()
wm.set("string key", 1)   // TypeError: Invalid value used as weak map key
```

### 4.17 class не хойстится

```javascript
new User()        // ReferenceError: провозглашение класса не поднимается
class User {}
```

### 4.18 __proto__ вместо Object.getPrototypeOf

```javascript
obj.__proto__            // устаревший сеттер/геттер
Object.getPrototypeOf(obj)  // современный стандарт
```

---

## 5. Вопросы для самопроверки

### Вопрос 1. Что такое замыкание?
Функция, сохраняющая ссылку на своё лексическое окружение, — доступ к переменным внешней функции сохраняется после её завершения. Пример — счётчик из §1.

### Вопрос 2. Чем стрелочная функция отличается от обычной?
Нет собственного `this`, `arguments`, `super`, не может быть конструктором. `this` берётся из внешней области.

### Вопрос 3. Как задать this функции навсегда?
Методом `bind`. `call`/`apply` задают контекст на один вызов.

### Вопрос 4. Чем Object.create отличается от new?
`Object.create(proto)` создаёт объект с заданным прототипом без запуска конструктора. `new Fn()` запускает конструктор с `this`.

### Вопрос 5. Что возвращает `set`-ловушка Proxy и почему это важно?
Булево значение — маркер успеха операции. Ложь означает «запись запрещена», в строгом режиме это вызовет TypeError.

### Вопрос 6. В каком порядке выполняются микро- и макротаски?
Сначала весь синхронный код, затем микроочередь, затем макротаски. Каждая макротаска перед следующей снова дёргает микроочередь.

### Вопрос 7. Зачем WeakMap, если есть Map?
Слабые ссылки на ключи: записи удаляются сборщиком мусора вместе с ключом. Ключи — только объекты, нет итерации и size. Защита от утечек.

### Вопрос 8. Чем Map лучше Object?
Произвольные ключи, итерация, точный size, порядок вставки, отсутствие конфликта с `__proto__`.

### Вопрос 9. Что делает Symbol.for?
Ищет/создаёт символ в глобальном реестре, чтобы разные модули шарили одну сущность. `Symbol.keyFor` возвращает строку из реестра.

### Вопрос 10. Как сделать объект итерируемым?
Реализовать метод `[Symbol.iterator]()`, возвращающий объект с `next(): {value, done}`. Тогда заработают `for...of`, spread, `Array.from`.

### Вопрос 11. В чём смысл Reflect внутри ловушек?
`Reflect` повторяет внутренние операции и возвращает результат, не ломая семантику (например, конфликт с «неменяемым» свойством). Использовать в ловушках — стандарт де-факто.

### Вопрос 12. Почему setTimeout(…, 0) не мгновенный?
Задача попадает в макроочередь; движок сначала доделывает стек и микроочередь; в браузере ещё действует минимальная задержка (4 мс).

### Вопрос 13. Что выведет `[3].fill(0)` и почему?
`[3].fill(0)` — массив из одного элемента. Опечатка классическая: `Array(3).fill(0)` даёт `[0,0,0]`.

### Вопрос 14. Генератор — это итератор?
Да. Генератор возвращает объект с `next()`, подходящий для `for...of`, и дополнительно умеет `yield`, `return`, принимать значения через `next(x)`.

### Вопрос 15. Может ли class существовать без new?
Методы/статические можно вызывать (`User.staticMethod()`), но сам класс без `new` выбросит TypeError — `Class constructor cannot be invoked without 'new'`.

### Вопрос 16. Что такое tree shaking?
Удаление неиспользуемого экспорта из бандла. Работает только с ES Modules, потому что импорты статические и анализируются на этапе сборки.

### Вопрос 17. В чём отличие debounce от throttle?
Debounce выполняет после паузы (подходит для поиска). Throttle не чаще раза в интервал (подходит для скролла). Обе — обёртки на замыканиях.

---

## 6. Глоссарий

| Термин | Определение |
|--------|-------------|
| Замыкание (Closure) | функция с доступом к переменным лексического окружения места создания |
| Лексическое окружение | структура `{ переменные, ссылка на родителя }` |
| Контекст (this) | текущий объект вызова функции |
| Hoisting | «подъём» объявлений var/function наверх области видимости |
| Прототип | объект-«родитель» в цепочке наследования |
| Цепочка прототипов | путь поиска свойств от объекта до `null` |
| Модуль | изолированный файл с export/import |
| Tree shaking | удаление мёртвого кода при сборке |
| Event Loop | цикл обработки очередей микро- и макротасок |
| Микротаска | задача после текущей синхронной порции (Promise) |
| Макротаска | обычная задача очереди (setTimeout, I/O) |
| Memoization | кэширование результатов по аргументам |
| Debounce | отложенный вызов после периода тишины |
| Throttle | вызов с ограничением частоты |
| Итератор | объект с методом `next(): {value, done}` |
| Генератор | функция `*`, лениво выдающая значения через `yield` |
| Symbol | уникальный примитив, ключ и протокольный маркер |
| Proxy | обёртка, перехватывающая операции над объектом |
| Ловушка (trap) | обработчик операции в Proxy |
| Reflect | набор методов — «зеркало» внутренних операций |
| IIFE | выражение `(function(){…})()` — немедленный вызов |
| Строгий режим | `"use strict"` — повышенные требования к коду |

---

*Практикуйтесь: запускайте решения в консоли, меняйте параметры и наблюдайте за поведением Event Loop и замыканий.*
