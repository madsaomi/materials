# JavaScript — Unit 2: Массивы, объекты, DOM, async

> Темы юнита: map/filter/reduce, деструктуризация, spread/rest, классы, Promise, async/await, DOM, события.

---

## 1. Методы массивов

High-order функции — это функции, которые принимают другую функцию как аргумент или возвращают функцию. Методы массивов `map`, `filter`, `reduce`, `forEach` и др. — главные инструменты работы с массивами в современном JS.

```javascript
const nums = [1, 2, 3, 4, 5]

// map — преобразует каждый элемент, возвращает НОВЫЙ массив
nums.map(x => x * 2)        // [2, 4, 6, 8, 10]

// filter — оставляет элементы, прошедшие проверку
nums.filter(x => x > 2)     // [3, 4, 5]

// reduce — сворачивает массив в одно значение
nums.reduce((acc, x) => acc + x, 0) // 15

// find — первый элемент, прошедший проверку (или undefined)
nums.find(x => x > 3)       // 4

// some — есть ли хотя бы один подходящий
nums.some(x => x > 4)       // true

// every — все ли подходят
nums.every(x => x > 0)      // true

// sort — сортировка (мутирует исходный!)
nums.sort((a, b) => b - a)  // [5, 4, 3, 2, 1]
```

### 1.1 Сравнение методов

| Метод | Что делает | Возвращает | Мутирует? |
|-------|-----------|------------|-----------|
| `forEach` | выполняет функцию для каждого элемента | `undefined` | нет |
| `map` | преобразует каждый элемент | новый массив | нет |
| `filter` | отбирает элементы по условию | новый массив | нет |
| `reduce` | сворачивает массив в значение | одно значение | нет |
| `find` | ищет первый подходящий | элемент / `undefined` | нет |
| `findIndex` | ищет индекс первого подходящего | число / -1 | нет |
| `some` | есть ли подходящий элемент | `true`/`false` | нет |
| `every` | все ли подходят | `true`/`false` | нет |
| `sort` | сортирует | тот же массив | **да** |
| `reverse` | разворачивает | тот же массив | **да** |
| `slice` | копирует диапазон | новый массив | нет |
| `splice` | добавляет/удаляет | удалённые элементы | **да** |
| `includes` | есть ли значение | `true`/`false` | нет |

### 1.2 forEach, map, filter, reduce

```javascript
// forEach — просто выполняет действие (не создаёт результат)
const users = ["Алиса", "Боб", "Клара"]
users.forEach((name, index) => console.log(index, name))

// map — возвращает преобразованный массив
const prices = [100, 250, 80]
const withVAT = prices.map(p => p * 1.2) // [120, 300, 96]

// map с объектами — извлечение полей
const people = [{ name: "Алиса", age: 25 }, { name: "Боб", age: 30 }]
const names = people.map(p => p.name)    // ["Алиса", "Боб"]
const ages = people.map(p => p.age)      // [25, 30]

// filter с объектами
const adults = people.filter(p => p.age >= 18)

// reduce — гибкий инструмент
const cart = [
    { name: "Хлеб", price: 30, qty: 2 },
    { name: "Молоко", price: 60, qty: 1 },
    { name: "Яйца", price: 90, qty: 1 }
]
const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
// 30*2 + 60*1 + 90*1 = 210

// reduce с начальным значением важно указывать!
[].reduce((a, b) => a + b)       // TypeError: Reduce of empty array
[].reduce((a, b) => a + b, 0)    // 0 — безопасно
```

### 1.3 Цепочки методов

```javascript
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// классический вариант
const result = data
    .filter(x => x % 2 === 0)   // [2,4,6,8,10]
    .map(x => x * x)            // [4,16,36,64,100]
    .reduce((a, b) => a + b, 0) // 220
console.log(result) // 220

// reduce может заменить цепочку из нескольких методов за один проход
const sumOfEvens = data.reduce((acc, x) => x % 2 === 0 ? acc + x * x : acc, 0)
console.log(sumOfEvens) // 220
```

---

## 2. Деструктуризация

Деструктуризация позволяет «разобрать» массив или объект на отдельные переменные за один шаг. Появилась в ES2015.

### 2.1 Массивы

```javascript
// базовый случай
const [a, b, ...rest] = [1, 2, 3, 4, 5]
console.log(a, b, rest)  // 1, 2, [3, 4, 5]

// значения по умолчанию
const [x = 10, y = 20] = [1]
console.log(x, y)        // 1, 20 (y получил дефолт)

// пропуск элементов
const [first, , third] = [10, 20, 30]
console.log(first, third) // 10, 30

// обмен значений
let p = 1, q = 2
[q, p] = [p, q]
console.log(p, q)        // 2, 1

// в параметрах функции
function printFirst([head]) {
    return head
}
printFirst([7, 8, 9])    // 7
```

### 2.2 Объекты

```javascript
const person = { name: "Алиса", age: 25, city: "Москва" }

// базовый случай — переменные получают имена полей
const { name, age } = person
console.log(name, age)   // Алиса 25

// переименование
const { name: userName } = person
console.log(userName)    // Алиса

// значения по умолчанию + переименование
const { city, country = "Россия" } = person
console.log(city, country)  // Москва Россия

// вложенная деструктуризация
const user = { profile: { email: "a@x.com" }, roles: ["admin"] }
const { profile: { email }, roles: [mainRole] } = user
console.log(email, mainRole)  // a@x.com admin

// деструктуризация в параметрах функции
function greeting({ name, age }) {
    return `${name}, ${age} лет`
}
greeting(person)  // "Алиса, 25 лет"
```

### 2.3 Деструктуризация в реальном коде

```javascript
// обмен значениями (clean)
let firstName = "John"
let lastName = "Doe"
[firstName, lastName] = [lastName, firstName]

// извлечение данных из ответа API
const response = { data: { id: 1, title: "Пост" }, status: 200 }
const { data: { id, title }, status } = response

// работа с fetch
const { headers, body } = await fetch("/api/data")
```

---

## 3. Spread / Rest

### 3.1 Spread (`...`) — «распаковка»

```javascript
// массивы
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]     // [1, 2, 3, 4, 5]
const copy = [...arr1]           // копия массива
const merged = [...arr1, ...arr2]

// строки
const chars = [..."hello"]       // ["h","e","l","l","o"]

// объекты
const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1, c: 3 }   // { a: 1, b: 2, c: 3 }
const copyObj = { ...obj1 }      // копия (поверхностная!)

// spread в вызове функции
const nums = [1, 2, 3]
Math.max(...nums)                // 3
```

### 3.2 Rest (`...`) — «сбор остатка»

```javascript
// rest в параметрах функции
function sum(...nums) {
    return nums.reduce((a, b) => a + b)
}
sum(1, 2, 3, 4)  // 10

// rest с обычными параметрами
function log(prefix, ...values) {
    console.log(prefix, values.join(", "))
}
log("INFO:", "a", "b", "c")  // INFO: a, b, c

// rest в деструктуризации
const [head, ...tail] = [1, 2, 3, 4]
console.log(head, tail)      // 1, [2, 3, 4]

const { name, ...rest } = { name: "Алиса", age: 25, city: "Мск" }
console.log(rest)            // { age: 25, city: "Мск" }
```

### 3.3 Spread vs Rest — главное отличие

| Синтаксис | Где используется | Что делает |
|-----------|-----------------|-----------|
| `...arr` в литерале/вызове | слева от источника | **распаковывает** (spread) |
| `...args` в параметрах | в объявлении функции | **собирает** (rest) |
| `...rest` в деструктуризации | последний элемент | собирает остаток |

Одно и то же `...` играет две роли в зависимости от контекста:
- **справа** от «звёздочки» в литерале -> spread (распаковка)
- **в параметрах функции** -> rest (сбор)

---

## 4. Классы

Классы в JavaScript — «синтаксический сахар» над прототипным наследованием. Появились в ES2015.

### 4.1 Базовый класс

```javascript
class Person {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
    greet() {
        return `Привет, я ${this.name}!`
    }
}

const alice = new Person("Алиса", 25)
console.log(alice.greet())   // Привет, я Алиса!
console.log(alice instanceof Person) // true
```

### 4.2 Наследование

```javascript
class Student extends Person {
    constructor(name, age, major) {
        super(name, age)          // вызывает конструктор родителя!
        this.major = major
    }
    study() {
        return `${this.name} учит ${this.major}`
    }
    // переопределение метода родителя
    greet() {
        return `${super.greet()} Студент.`
    }
}

const s = new Student("Боб", 20, "CS")
console.log(s.greet())   // Привет, я Боб! Студент.
console.log(s.study())   // Боб учит CS
```

### 4.3 Свойства класса (поля)

```javascript
class Counter {
    // поля класса (выполняются при создании)
    count = 0
    static total = 0      // статическое поле

    increment() {
        this.count++
        Counter.total++
    }
}
```

### 4.4 Геттеры и сеттеры

```javascript
class Temperature {
    constructor(celsius) {
        this._celsius = celsius
    }
    get fahrenheit() {
        return this._celsius * 9 / 5 + 32
    }
    set fahrenheit(f) {
        this._celsius = (f - 32) * 5 / 9
    }
}

const temp = new Temperature(25)
console.log(temp.fahrenheit)  // 77
temp.fahrenheit = 32
console.log(temp._celsius)    // 0
```

### 4.5 Статические методы

```javascript
class MathUtils {
    static square(x) {
        return x * x
    }
    static isEven(n) {
        return n % 2 === 0
    }
}
console.log(MathUtils.square(5))  // 25
console.log(MathUtils.isEven(4))  // true
```

### 4.6 Приватные поля и методы (ES2022)

```javascript
class BankAccount {
    #balance = 0        // приватное поле

    constructor(initial) {
        this.#balance = initial
    }
    #validate(amount) {  // приватный метод
        if (amount < 0) throw new Error("Отрицательная сумма")
    }
    deposit(amount) {
        this.#validate(amount)
        this.#balance += amount
    }
    getBalance() {
        return this.#balance
    }
}

const acc = new BankAccount(100)
acc.deposit(50)
console.log(acc.getBalance()) // 150
// acc.#balance — SyntaxError! недоступно снаружи
```

### 4.7 Сравнение: классы vs функции-конструкторы

| Аспект | Классы (ES2015+) | Функции-конструкторы |
|--------|------------------|----------------------|
| Потомки | `extends` | `Object.create(proto)` |
| Вызов родителя | `super(...)` | `Parent.call(this, ...)` |
| Приватность | `#поле` (ES2022) | замыкание / `_` по соглашению |
| `new` без `new` | ошибка | работает (глюк) |
| Геттеры/сеттеры | встроены | `Object.defineProperty` |

---

## 5. Promise

Promise (обещание) — объект, представляющий результат асинхронной операции, которой ещё может не быть. Состояния: `pending` (ожидание), `fulfilled` (выполнено), `rejected` (отклонено).

### 5.1 Создание Promise

```javascript
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const promise = new Promise((resolve, reject) => {
    // асинхронная операция
    setTimeout(() => {
        Math.random() > 0.5 ? resolve("успех") : reject("ошибка")
    }, 1000)
})

promise
    .then(result => console.log("Результат:", result))
    .catch(error => console.error("Провал:", error))
    .finally(() => console.log("В любом случае"))
```

### 5.2 Цепочки then

```javascript
function getUser(id) {
    return new Promise(resolve => {
        setTimeout(() => resolve({ id, name: `User ${id}` }), 100)
    })
}

getUser(1)
    .then(user => {
        console.log("Пользователь:", user)
        return user.id + 1           // передаём дальше
    })
    .then(nextId => getUser(nextId)) // возвращаем новый Promise
    .then(user => console.log("Следующий:", user))
    .catch(err => console.error(err))
```

### 5.3 Статические методы Promise

| Метод | Поведение |
|-------|-----------|
| `Promise.all([...])` | ждёт все, если хоть один упал — падает сразу |
| `Promise.allSettled([...])` | ждёт все, возвращает статусы (успех/провал) |
| `Promise.race([...])` | первый завершённый (неважно, успех или ошибка) |
| `Promise.any([...])` | первый успешный (если все упали — ошибка) |
| `Promise.resolve(x)` | сразу успешный Promise |
| `Promise.reject(x)` | сразу отклонённый Promise |

```javascript
const p1 = Promise.resolve(1)
const p2 = new Promise(r => setTimeout(() => r(2), 500))

Promise.all([p1, p2]).then(([a, b]) => console.log(a + b)) // 3
Promise.race([p1, p2]).then(x => console.log(x))           // 1 (первый)
```

### 5.4 Потери исключений в .then

```javascript
// Ошибка, брошенная внутри then, перехватывается следующим catch
Promise.resolve(10)
    .then(x => {
        throw new Error(`Что-то не так с ${x}`)
    })
    .then(() => console.log("не дойдём сюда"))
    .catch(err => console.error("Перехвачено:", err.message))
```

---

## 6. Async/Await

`async/await` — синтаксический сахар над Promise (ES2017). Делает асинхронный код читаемым, как синхронный.

### 6.1 Основы

```javascript
// функция с async всегда возвращает Promise!
async function fetchData() {
    const response = await fetch("https://api.github.com")
    const data = await response.json()
    return data
}

// использование
fetchData()
    .then(data => console.log(data))
    .catch(err => console.error("Ошибка:", err))
```

### 6.2 Обработка ошибок try/catch

```javascript
async function safeLoad() {
    try {
        const response = await fetch("https://api.github.com")
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        console.log(data)
    } catch (error) {
        console.error("Ошибка:", error)
    } finally {
        console.log("Загрузка завершена")
    }
}
```

### 6.3 Параллельное выполнение

```javascript
// Последовательное выполнение (медленно)
async function sequential() {
    const a = await fetchA()
    const b = await fetchB()   // ждёт, пока finish A
    return [a, b]
}

// Параллельное выполнение (быстро!)
async function parallel() {
    const [a, b] = await Promise.all([fetchA(), fetchB()])
    return [a, b]
}
```

### 6.4 Сравнение: Promise vs async/await

| Промис | Async/await |
|--------|-------------|
| `.then(x => ...)` | `const x = await ...` |
| `.catch(err => ...)` | `try { } catch (err) { }` |
| `.finally(() => ...)` | `finally { }` |
| сложно читать при цепочках | линейный читаемый код |
| `Promise.all` | `await Promise.all` |

---

## 7. DOM (Document Object Model)

DOM — программное представление HTML-документа в виде дерева объектов, с которыми JavaScript может взаимодействовать.

### 7.1 Поиск элементов

```javascript
// по id
document.getElementById("app")

// по CSS-селектору (первый)
document.querySelector(".class")
document.querySelector("#main > p.title")

// все совпадения (NodeList)
document.querySelectorAll("div")
document.querySelectorAll(".item")

// по тегу/классу (устаревшие, но рабочие)
document.getElementsByTagName("div")
document.getElementsByClassName("item")
```

### 7.2 Чтение и изменение содержимого

```javascript
// textContent — только текст (безопасно!)
el.textContent = "Новый текст"

// innerHTML — разбирает HTML (опасно, XSS!)
el.innerHTML = "<strong>жирный</strong>"

// innerText — как видимый текст на экране
el.innerText

// атрибуты
el.setAttribute("data-id", "42")
el.getAttribute("data-id")
el.removeAttribute("data-id")

// style
el.style.color = "red"
el.style.fontSize = "16px"   // camelCase вместо kebab-case

// классы
el.classList.add("active")
el.classList.remove("hidden")
el.classList.toggle("visible") // добавит/удалит
el.classList.contains("active") // true
```

### 7.3 Создание и вставка элементов

```javascript
// создание
const div = document.createElement("div")
div.textContent = "Привет"
div.className = "menu"

// вставка
parent.appendChild(div)     // в конец
parent.prepend(div)         // в начало
parent.insertBefore(div, ref)
div.replaceWith(newEl)      // заменить
div.remove()                // удалить себя

// создание через шаблонную строку (innerHTML)
const list = document.getElementById("list")
list.innerHTML = `
    <li>Один</li>
    <li>Два</li>
    <li>Три</li>
`
```

### 7.4 Навигация по дереву

```javascript
el.parentElement       // родитель
el.children            // дочерние элементы
el.firstElementChild   // первый ребёнок
el.lastElementChild    // последний ребёнок
el.nextElementSibling  // следующий сосед
el.previousElementSibling // предыдущий сосед
```

| Свойство | Что возвращает |
|----------|---------------|
| `parentElement` | родительский элемент |
| `children` | HTMLCollection дочерних элементов |
| `firstElementChild` | первый дочерний элемент |
| `lastElementChild` | последний дочерний элемент |
| `nextElementSibling` | следующий соседний элемент |
| `previousElementSibling` | предыдущий соседний элемент |
| `closest(sel)` | ближайший предок по селектору |

### 7.5 Поиск внутри контейнера

```javascript
const container = document.querySelector("#container")
container.querySelector(".item")          // внутри только этого контейнера
container.querySelectorAll("button")      // все кнопки внутри
```

---

## 8. События (Events)

События — реакция JavaScript на действия пользователя (клик, ввод, наведение) или на изменения состояния.

### 8.1 addEventListener

```javascript
el.addEventListener("click", (e) => {
    console.log("Клик!", e.target)
})

// можно вешать несколько обработчиков
el.addEventListener("click", () => console.log("первый"))
el.addEventListener("click", () => console.log("второй"))
```

### 8.2 Распространение событий (bubbling & capture)

DOM-события «всплывают» от самого глубокого элемента к `document`. Есть также фаза перехвата (capture) сверху вниз.

```javascript
// Всплытие (bubbling): клик по кнопке -> клик по родителю -> до body
document.querySelector("#btn").addEventListener("click", () => {
    console.log("Кнопка")
})
document.body.addEventListener("click", () => {
    console.log("Body (всплыло)")
})

// Остановка распространения
el.addEventListener("click", (e) => {
    e.stopPropagation()   // не даёт событию всплыть дальше
})

// preventDefault — отмена действия браузера по умолчанию
form.addEventListener("submit", (e) => {
    e.preventDefault()    // отмена перезагрузки страницы
    console.log("Форма обработана")
})
```

### 8.3 Частые события

| Событие | Триггер |
|---------|--------|
| `click` | клик |
| `dblclick` | двойной клик |
| `mouseover` / `mouseout` | наведение / уход |
| `keydown` / `keyup` | нажатие / отпускание клавиши |
| `input` | ввод в поле |
| `change` | изменение значения (после потери фокуса) |
| `submit` | отправка формы |
| `focus` / `blur` | фокус / потеря фокуса |
| `scroll` | прокрутка |
| `load` | загрузка страницы |
| `DOMContentLoaded` | после построения DOM (без картинок) |

```javascript
// клавиатура
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        console.log("Нажали Enter")
    }
    if (e.key === "Escape") {
        console.log("Отмена")
    }
})

// делегирование событий — один обработчик для многих элементов
list.addEventListener("click", (e) => {
    if (e.target.matches("li")) {
        console.log("Кликнули на", e.target.textContent)
    }
})
```

### 8.4 Делегирование событий

Вместо того чтобы вешать обработчик на каждый элемент, можно повесить один на родителя и через `e.target` определить, куда кликнули. Это выгодно, когда элементов много или они добавляются динамически.

```javascript
const table = document.querySelector("table")
table.addEventListener("click", (e) => {
    const row = e.target.closest("tr")
    if (row) console.log("Кликнули по строке", row.dataset.id)
})
```

---

## 9. Fetch API

Fetch — современный способ делать HTTP-запросы (заменил `XMLHttpRequest`).

### 9.1 GET

```javascript
const response = await fetch("https://jsonplaceholder.typicode.com/users")
if (!response.ok) throw new Error(`HTTP ${response.status}`)
const users = await response.json()
console.log(users)
```

### 9.2 POST — отправка данных

```javascript
const response = await fetch("/api/users", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: "Алиса", age: 25 })
})
const created = await response.json()
```

### 9.3 Ответы и статусы

```javascript
const resp = await fetch("/api/data")

resp.status          // 200, 404, 500...
resp.ok              // true для 200-299
resp.statusText      // "OK", "Not Found"
resp.headers.get("content-type")

// парсинг тела
resp.json()          // объект
resp.text()          // строка
resp.blob()          // бинарные данные / файл
resp.formData()      // FormData
```

### 9.4 Обработка ошибок

```javascript
async function getData(url) {
    try {
        const resp = await fetch(url)
        if (!resp.ok) {
            throw new Error(`Сеть ответила ошибкой: ${resp.status}`)
        }
        return await resp.json()
    } catch (error) {
        // сюда попадут и сетевые ошибки, и наши throw
        console.error("Запрос провалился:", error.message)
        return null
    }
}

const data = await getData("/api/news")
if (data) { /* используем */ }
```

---

## 10. localStorage и другие хранилища браузера

### 10.1 localStorage

Хранит данные в виде пар «ключ-значение». Всё хранится как строки (JSON-сериализация обязательна для объектов).

```javascript
localStorage.setItem("key", "value")     // сохранить
const val = localStorage.getItem("key")  // получить
localStorage.removeItem("key")           // удалить
localStorage.clear()                     // очистить всё

// сохранение объекта — сериализуем в JSON
const settings = { theme: "dark", lang: "ru" }
localStorage.setItem("settings", JSON.stringify(settings))

// чтение объекта
const parsed = JSON.parse(localStorage.getItem("settings"))
```

### 10.2 Сравнение хранилищ

| Хранилище | Объём | Жизнь данных | Видимость | Тип данных |
|-----------|-------|--------------|-----------|-----------|
| `localStorage` | ~5MB | бессрочно | та же вкладка/сайт | строки |
| `sessionStorage` | ~5MB | до закрытия вкладки | вкладка | строки |
| `cookie` | ~4KB | по дате истечения | сайт + отправляется на сервер | строки |
| `IndexedDB` | большой | бессрочно | сайт | объекты, транзакции |

### 10.3 Cookies (базово)

```javascript
// установить cookie
document.cookie = "theme=dark; max-age=3600; path=/"

// прочитать все cookies
console.log(document.cookie)  // "theme=dark; session=abc"
```

---

## 11. JSON

JSON (JavaScript Object Notation) — текстовый формат обмена данными. Отличается от JS-объектов: ключи в двойных кавычках, нет методов, нет `undefined`/`NaN`.

```javascript
// сериализация (объект -> строка)
const obj = { name: "Алиса", age: 25, tags: ["a", "b"] }
const json = JSON.stringify(obj)
// '{"name":"Алиса","age":25,"tags":["a","b"]}'

// парсинг (строка -> объект)
const restored = JSON.parse(json)
console.log(restored.name) // Алиса

// форматирование
JSON.stringify(obj, null, 2)  // отступ в 2 пробела — красиво печатает

// что НЕ попадает в JSON
JSON.stringify({ a: undefined, b: () => {}, c: NaN })
// '{"c":null}' — undefined и функции пропущены, NaN стало null
```

| Ограничение | Пример |
|-------------|--------|
| нет `undefined` | `JSON.stringify({a: undefined})` -> `"{}"` |
| нет функций | `JSON.stringify({f: () => {}})` -> `"{}"` |
| нет `NaN` | `JSON.stringify({n: NaN})` -> `'{"n":null}'` |
| нет `Symbol` | `JSON.stringify({s: Symbol()})` -> `"{}"` |
| нет дат как объектов | `Date` -> строка `"2026-..."` |

---

## 12. Обработка данных: примеры из практики

### 12.1 Группировка

```javascript
const words = ["яблоко", "груша", "слива", "арбуз", "абрикос"]

// по первой букве
const byLetter = words.reduce((groups, word) => {
    const first = word[0]
    groups[first] = groups[first] || []
    groups[first].push(word)
    return groups
}, {})
// { я: ["яблоко"], г: ["груша"], с: ["слива"], а: ["арбуз","абрикос"] }
```

### 12.2 Агрегация

```javascript
const orders = [
    { id: 1, amount: 100, status: "done" },
    { id: 2, amount: 250, status: "pending" },
    { id: 3, amount: 50,  status: "done" }
]

const totalDone = orders
    .filter(o => o.status === "done")
    .reduce((sum, o) => sum + o.amount, 0)  // 150

// маппинг в отображаемый формат
const view = orders.map(o => ({
    id: o.id,
    label: `Заказ #${o.id}`,
    done: o.status === "done"
}))
```

### 12.3 Поиск и сортировка объектов

```javascript
const people = [
    { name: "Боб", age: 30 },
    { name: "Алиса", age: 25 },
    { name: "Клара", age: 35 }
]

// поиск по имени
people.find(p => p.name === "Алиса")

// сортировка по возрасту
people.sort((a, b) => a.age - b.age)

// сортировка по строке (сравнение без учёта регистра)
people.sort((a, b) => a.name.localeCompare(b.name))

// список имён из отфильтрованного набора
people.filter(p => p.age >= 18).map(p => p.name)
```

---

## 13. Ошибки в разработке и отладка

### 13.1 throw и Error

```javascript
function divide(a, b) {
    if (b === 0) {
        throw new Error("Деление на ноль!")
    }
    return a / b
}

try {
    divide(10, 0)
} catch (err) {
    console.error(err.message)  // "Деление на ноль!"
} finally {
    console.log("Команда выполнена")
}
```

### 13.2 Стек вызовов и console

```javascript
// отладочный вывод
console.log("просто лог")
console.info("информация")
console.warn("предупреждение")
console.error("ошибка")
console.table(arrayOfObjects)  // таблица — удобно визуализировать
console.time("label")          // таймер
// ... код ...
console.timeEnd("label")       // "label: 12.34 ms"
```

---

## 14. Управление потоком данных (памятка)

```javascript
// цепочка данных: получить -> преобразовать -> отфильтровать -> сохранить
fetch("/api/products")
    .then(res => res.json())
    .then(products => products.filter(p => p.inStock))
    .then(items => items.map(p => ({ name: p.name, price: p.price })))
    .then(view => localStorage.setItem("products", JSON.stringify(view)))
    .catch(err => console.error(err))
```

---

## 15. Типичные паттерны

### 15.1 Debounce (задержка поиска)

```javascript
function debounce(fn, delay = 300) {
    let timer
    return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(() => fn.apply(this, args), delay)
    }
}

const onSearch = debounce(query => console.log("Ищем:", query), 400)
```

### 15.2 Универсальный рендер списка

```javascript
function renderList(container, items, templateFn) {
    container.innerHTML = items.map(templateFn).join("")
}

renderList(list, users, user => `
    <li class="user" data-id="${user.id}">
        <strong>${user.name}</strong> — ${user.email}
    </li>
`)
```

---

## Задачи (для самопроверки)

1. Используя `map`, создайте массив квадратов чисел `[1, 2, 3, 4, 5]`.
2. Отфильтруйте строки длиннее 5 символов.
3. Создайте класс `Animal` с методом `speak()`, наследуйте `Dog`/`Cat`.
4. Напишите функцию, которая `fetch`'ит данные и выводит их в консоль.
5. Суммируйте цены корзины через `reduce`.
6. Группируйте массив слов по первой букве через `reduce`.
7. Напишите функцию, которая находит пользователя по `id` и возвращает его имя (async).
8. Реализуйте сортировку массива объектов по любому полю.
