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
