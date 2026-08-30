# JavaScript — Unit 2: Задачи и проекты

> Полный практикум: уровень лёгкий → средний → сложный, мини-проект, типичные ошибки, вопросы и глоссарий.

---

## Часть 1. Лёгкие упражнения

```javascript
// 1. Квадраты чисел через map
const squares = [1, 2, 3, 4, 5].map(x => x ** 2)
// [1, 4, 9, 16, 25]

// 2. Фильтр строк длиннее 5 символов
const words = ["hello", "world", "js", "python", "go"]
const long = words.filter(w => w.length > 5)
// ["python"]

// 3. Сумма массива через reduce
const sum = [10, 20, 30].reduce((a, b) => a + b, 0)
// 60

// 4. Удвоить каждый элемент
const doubled = [1, 2, 3].map(x => x * 2)
// [2, 4, 6]

// 5. Чётные числа
const evens = [1, 2, 3, 4, 5, 6].filter(x => x % 2 === 0)
// [2, 4, 6]

// 6. Среднее арифметическое
const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length
avg([2, 4, 6])  // 4

// 7. Первый элемент больше порога
const firstBig = [5, 12, 8, 130].find(x => x > 10)
// 12

// 8. Проверка, что все положительные
[1, 2, 3].every(x => x > 0)   // true
[-1, 2, 3].every(x => x > 0)  // false
```

---

## Часть 2. Средние упражнения

```javascript
// 9. Группировка по длине слова
const words2 = ["hello", "world", "js", "python", "go"]
const grouped = words2.reduce((acc, w) => {
    const len = w.length
    acc[len] = acc[len] || []
    acc[len].push(w)
    return acc
}, {})
// { 2: ["js","go"], 5: ["hello","world"], 6: ["python"] }

// 10. Подсчёт вхождений элементов
const countOccurrences = arr => arr.reduce((acc, x) => {
    acc[x] = (acc[x] || 0) + 1
    return acc
}, {})
countOccurrences(["a", "b", "a", "c", "b", "a"])
// { a: 3, b: 2, c: 1 }

// 11. Сортировка массива объектов по полю
const sortBy = (arr, key, desc = false) =>
    [...arr].sort((a, b) => {
        const cmp = a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0
        return desc ? -cmp : cmp
    })

const people = [
    { name: "Боб", age: 30 },
    { name: "Алиса", age: 25 },
    { name: "Клара", age: 35 }
]
sortBy(people, "age")
// [{name:"Алиса",age:25},{name:"Боб",age:30},{name:"Клара",age:35}]

// 12. Объединение двух массивов без дублей
const union = (a, b) => [...new Set([...a, ...b])]
union([1, 2, 3], [3, 4, 5])  // [1, 2, 3, 4, 5]

// 13. Убрать дубли из массива
const unique = arr => [...new Set(arr)]
unique([1, 1, 2, 3, 3, 3, 4])  // [1, 2, 3, 4]

// 14. Развернуть строку
const reverse = s => s.split("").reverse().join("")
reverse("hello")  // "olleh"

// 15. Палиндром
const isPalindrome = s => {
    const clean = s.toLowerCase().replace(/[^a-zа-я0-9]/g, "")
    return clean === [...clean].reverse().join("")
}
isPalindrome("А роза упала на лапу Азора")  // true

// 16. Массив из чисел в диапазоне
const range = (from, to) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i)
range(3, 7)  // [3, 4, 5, 6, 7]

// 17. Итог корзины
const cart = [
    { name: "Хлеб", price: 30, qty: 2 },
    { name: "Молоко", price: 60, qty: 1 },
    { name: "Яйца", price: 90, qty: 1 }
]
const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
// 210

// 18. Оборачивание в класс с приватным полем
class BankAccount {
    #balance
    constructor(initial = 0) { this.#balance = initial }
    deposit(n) { this.#balance += n; return this }
    withdraw(n) { if (n > this.#balance) return false; this.#balance -= n; return true }
    get balance() { return this.#balance }
}
const acc = new BankAccount(100)
acc.deposit(50).withdraw(30)
acc.balance  // 120
```

---

## Часть 3. Сложные упражнения

```javascript
// 19. Глубокая копия (простая версия)
const deepCopy = obj => JSON.parse(JSON.stringify(obj))
deepCopy({ a: { b: c => c } })  // функции теряются, но для данных ок

// 20. Promise.all своими руками
function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = []
        let done = 0
        promises.forEach((p, i) => {
            p.then(value => {
                results[i] = value
                if (++done === promises.length) resolve(results)
            }).catch(reject)
        })
    })
}

// 21. debounce для поиска
function debounce(fn, delay = 300) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}
const search = debounce(q => console.log("Поиск:", q), 400)
search("я")
search("ябл")
search("яблоко")  // сработает только последний вызов

// 22. Эмуляция асинхронной загрузки с задержкой
const fetchUser = id => new Promise(resolve =>
    setTimeout(() => resolve({ id, name: `Пользователь ${id}` }), 200)
)

async function showUser(id) {
    const user = await fetchUser(id)
    console.log(user.name)
    return user
}

// 23. Параллельная загрузка нескольких сущностей
async function loadDashboard() {
    const [users, posts, comments] = await Promise.all([
        fetch("/api/users").then(r => r.json()),
        fetch("/api/posts").then(r => r.json()),
        fetch("/api/comments").then(r => r.json())
    ])
    return { users, posts, comments }
}

// 24. Асинхронная цепочка с обработкой ошибок
async function loadAndRender(url, container) {
    try {
        const resp = await fetch(url)
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        container.innerHTML = data.map(item => `<li>${item}</li>`).join("")
    } catch (error) {
        container.innerHTML = `<li class="error">Ошибка: ${error.message}</li>`
    }
}
```

---

## Мини-проект: «Заметки» (localStorage + DOM)

Полноценное приложение для хранения заметок в браузере. Данные живут в `localStorage`, интерфейс строится через DOM, добавление — через события.

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Заметки</title>
    <style>
        body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; }
        .note { border: 1px solid #ddd; border-radius: 6px; padding: 10px; margin: 8px 0; }
        .note h3 { margin: 0 0 6px; }
        .note button { margin-left: 8px; }
        input, button { padding: 8px; margin: 4px; }
    </style>
</head>
<body>
    <h1>Мои заметки</h1>
    <input id="title" placeholder="Название">
    <input id="body" placeholder="Текст">
    <button id="add">Добавить</button>
    <div id="list"></div>

    <script>
        // --- уровень данных: localStorage в виде массива заметок ---
        const STORAGE_KEY = "my-notes"
        function loadNotes() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
            } catch {
                return []
            }
        }
        function saveNotes(notes) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
        }

        // --- уровень представления: рендер списка ---
        const list = document.getElementById("list")
        function render(notes) {
            list.innerHTML = notes.map((n, i) => `
                <div class="note" data-index="${i}">
                    <h3>${n.title}</h3>
                    <p>${n.body}</p>
                    <button class="del">Удалить</button>
                </div>
            `).join("")
        }

        // --- логика: добавление и удаление ---
        const addBtn = document.getElementById("add")
        const titleInput = document.getElementById("title")
        const bodyInput = document.getElementById("body")

        function addNote() {
            const title = titleInput.value.trim()
            const body = bodyInput.value.trim()
            if (!title) return
            const notes = loadNotes()
            notes.push({ title, body })
            saveNotes(notes)
            render(notes)
            titleInput.value = ""
            bodyInput.value = ""
        }

        addBtn.addEventListener("click", addNote)
        titleInput.addEventListener("keydown", e => {
            if (e.key === "Enter") addNote()
        })

        // делегирование: один обработчик на контейнер
        list.addEventListener("click", e => {
            if (e.target.classList.contains("del")) {
                const idx = Number(e.target.closest(".note").dataset.index)
                const notes = loadNotes()
                notes.splice(idx, 1)
                saveNotes(notes)
                render(notes)
            }
        })

        // --- старт: отобразить сохранённые заметки ---
        render(loadNotes())
    </script>
</body>
</html>
```

### Что здесь отрабатывается

| Концепция | Где в проекте |
|-----------|---------------|
| DOM-поиск | `getElementById` |
| события | `addEventListener`, `keydown`, делегирование |
| рендер списка | `map().join("")` в `innerHTML` |
| localStorage | `loadNotes` / `saveNotes` с JSON |
| работа с массивом | `push`, `splice` |
| безопасность данных | `trim()`, проверка пустоты, try/catch в парсинге |

---

## Типичные ошибки (топ-15)

1. **`sort()` сортирует как строки** без функции сравнения: `[10, 9, 2].sort()` → `[10, 2, 9]`. Всегда передавайте `(a, b) => a - b`.

2. **Забывают начальное значение в `reduce`** — на пустом массиве получается `TypeError`. Всегда указывайте `, 0` (или другой старт).

3. **`map` в не того, `map` не мутирует** — многие ожидают, что `map` изменит исходный массив. Он возвращает новый.

4. **Путают `==` и `===`** — `0 == false` это `true`, но это ловушка. Пользуйтесь `===`.

5. **Используют `innerHTML` с пользовательским вводом** — риск XSS. Для текста используйте `textContent`.

6. **Потеря `this` в обычной функции внутри метода** — в колбэке `setTimeout`, `forEach` `this` теряется. Решение: стрелочная функция.

7. **Проверка на ошибки fetch только через `catch`** — HTTP-ошибки (404) НЕ вызывают `reject`. Нужна проверка `resp.ok`.

8. **Читают объект из `localStorage` без `JSON.parse`** — получают строку `"[object Object]"`. Всегда сериализуйте и парсьте.

9. **Мутируют объекты через spread** — `{...obj}` — неглубокая копия. Вложенные объекты по-прежнему общие.

10. **Ожидают, что `const` делает объект неизменяемым** — `const obj` запрещает переназначение переменной, но не изменение полей.

11. **`await` применяют внутри не-async функции** — `SyntaxError: await is only valid in async`. Функция обязана быть `async`.

12. **Забывают `return` в стрелочной функции с телом** — `x => { x * 2 }` возвращает `undefined`. Без скобок `{}` возвращается автоматически.

13. **Приватное поле вне класса** — обращение к `#balance` снаружи даёт `SyntaxError`. Доступ только внутри класса.

14. **Повесить обработчик на каждый динамический элемент** — при добавлении новых элементов обработчик теряется. Используйте делегирование на родителя.

15. **Сравнение объектов через `===`** — `{a:1} === {a:1}` это `false`, сравниваются ссылки, а не содержимое.

---

## Вопросы для самопроверки (с ответами)

**1. Чем `map` отличается от `forEach`?**
`map` возвращает новый массив с преобразованными элементами; `forEach` просто выполняет функцию и возвращает `undefined`. Если нужен результат — `map`.

**2. Что вернёт `[1,2,3].find(x => x > 5)`?**
`undefined` — если элемента нет, `find` возвращает `undefined`.

**3. Когда использовать `reduce`?**
Когда нужно свести массив к одному значению: сумма, произведение, объект-группировка, счётчик, итог корзины.

**4. В чём разница между spread и rest?**
Spread (`...`) распаковывает массив/объект в литерале или вызове функции. Rest (`...`) собирает оставшиеся аргументы/элементы в массив в параметрах функции или в деструктуризации.

**5. Зачем нужен `super` в конструкторе наследника?**
`super(...)` вызывает конструктор родительского класса, инициализируя его поля. Без него унаследованные поля не будут установлены (SyntaxError до вызова).

**6. Что такое состояние Promise `pending`?**
Это начальное состояние, пока операция ещё не завершилась. Переходит в `fulfilled` (успех, вызов `resolve`) или `rejected` (ошибка, вызов `reject`).

**7. Для чего `Promise.all` и чем отличается от `allSettled`?**
`Promise.all` ждёт все, но падает при первой ошибке. `allSettled` ждёт все и возвращает статусы каждого, не прерываясь на ошибках.

**8. Что делает `await`?**
Приостанавливает выполнение async-функции до разрешения Promise и возвращает его результат. Работает только внутри `async`.

**9. Чем `textContent` отличается от `innerHTML`?**
`textContent` задаёт/читает только текст (безопасно, HTML не разбирается). `innerHTML` разбирает строку как HTML (риск XSS, но позволяет вставлять разметку).

**10. Что такое всплытие событий (bubbling)?**
Событие после обработки на целевом элементе «поднимается» к предкам до `document`. Через `e.target` узнаём, на каком элементе произошло, через `stopPropagation()` — останавливаем всплытие.

**11. Зачем нужна проверка `if (!resp.ok)` после `fetch`?**
`fetch` отклоняет Promise только при сетевой ошибке. HTTP-статусы 404/500 считаются «успешным» ответом, поэтому их нужно проверять вручную через `resp.ok` / `resp.status`.

**12. Как сохранить объект в `localStorage`?**
Сериализовать через `JSON.stringify`, передать в `setItem`; при чтении — `JSON.parse(getItem(...))`. Данные в localStorage — только строки.

**13. В чём польза делегирования событий?**
Один обработчик на родителя вместо множества на детей. Работает для динамически добавляемых элементов и экономнее по памяти.

**14. Почему `async` функция всегда возвращает Promise?**
`async` автоматически оборачивает возвращаемое значение в Promise (обёртка через `Promise.resolve`). Поэтому её результат принимают через `await` или `.then`.

**15. Как сделать копию массива?**
`[...arr]`, `arr.slice()`, `Array.from(arr)`. Внимание: это неглубокая копия — вложенные объекты/массивы остаются общими.

---

## Глоссарий

| Термин | Определение |
|--------|-------------|
| **Массив** | Упорядоченная коллекция элементов, доступ по индексу `arr[i]`. |
| **map** | Метод, создающий новый массив путём преобразования каждого элемента. |
| **filter** | Метод, возвращающий новый массив с элементами, прошедшими условие. |
| **reduce** | Метод, сворачивающий массив в одно значение (аккумулятор). |
| **forEach** | Метод, выполняющий функцию для каждого элемента; результат не возвращает. |
| **Деструктуризация** | Разбор массива/объекта на отдельные переменные: `const {a} = obj`. |
| **Spread** | `...` распаковывает элементы массива/поля объекта в литерал или вызов. |
| **Rest** | `...` собирает оставшиеся аргументы/элементы в массив. |
| **Класс** | Шаблон для создания объектов: `class X {}` + `new X()`. |
| **Наследование** | `class B extends A` — класс B получает поля и методы A. |
| `super` | Ключевое слово вызова конструктора/метода родителя. |
| **Promise** | Объект-обещание результата асинхронной операции (pending/fulfilled/rejected). |
| **async/await** | Синтаксис для работы с Promise как с синхронным кодом. |
| **Callback** | Функция, передаваемая другой функции и вызываемая по событию. |
| **DOM** | Дерево объектов страницы, с которым работает JavaScript. |
| **getElementById** | Поиск элемента по id. |
| **querySelector** | Поиск первого элемента по CSS-селектору. |
| **querySelectorAll** | Поиск всех элементов по CSS-селектору (NodeList). |
| **addEventListener** | Подписка на событие элемента. |
| **Всплытие (bubbling)** | Распространение события вверх по дереву от цели к `document`. |
| **stopPropagation** | Остановка распространения события. |
| **preventDefault** | Отмена действия браузера по умолчанию (например, перезагрузки формы). |
| **Делегирование** | Один обработчик на родителя для многих дочерних элементов. |
| **Fetch API** | Современный интерфейс для HTTP-запросов. |
| `resp.ok` | `true`, если HTTP-статус в диапазоне 200-299. |
| **JSON** | Текстовый формат обмена данными; `stringify`/`parse`. |
| **localStorage** | Постоянное хранилище пары ключ-значение в браузере (~5MB). |
| **XSS** | Внедрение вредоносного кода; избегается через `textContent`. |
| **innerHTML** | Чтение/запись HTML-разметки элемента (осторожно с вводом). |
| **textContent** | Чтение/запись только текстового содержимого (безопасно). |
| **Дебаунс** | Отложенный запуск функции после «тишины» в событиях. |

---

## Ответы (сводно)

1. `[1,2,3,4,5].map(x => x * x)` — квадраты.
2. `words.filter(w => w.length > 5)` — длинные строки.
3. `class Dog extends Animal { speak() { return "Woof!" } }`.
4. См. проект fetch: `async function` + `await fetch(url)` + `try/catch`.
5. Корзина: `cart.reduce((s, i) => s + i.price * i.qty, 0)`.
6. Группировка: `reduce` с накоплением объекта по ключу.
7. `async` + `find` по массиву или `fetch /api/users/:id`.
8. `sortBy = (arr, key) => [...arr].sort((a,b) => a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0)`.

---

*Unit 2 пройден: массивы, объекты, DOM, события, async. Переходите к Unit 3 — продвинутые темы.*
