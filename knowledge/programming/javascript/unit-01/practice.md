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
