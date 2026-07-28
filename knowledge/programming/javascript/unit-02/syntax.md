# JavaScript — Unit 2: Массивы, объекты, DOM

## Методы массивов

```javascript
const nums = [1, 2, 3, 4, 5]

nums.map(x => x * 2)        // [2, 4, 6, 8, 10]
nums.filter(x => x > 2)     // [3, 4, 5]
nums.reduce((a, b) => a + b) // 15
nums.find(x => x > 3)       // 4
nums.some(x => x > 4)       // true
nums.every(x => x > 0)      // true
nums.sort((a, b) => b - a)  // [5, 4, 3, 2, 1]
```

## Деструктуризация

```javascript
// массивы
const [a, b, ...rest] = [1, 2, 3, 4, 5]
console.log(a, b, rest)  // 1, 2, [3, 4, 5]

// объекты
const person = { name: "Алиса", age: 25 }
const { name, age } = person
console.log(name, age)

// переименование
const { name: userName } = person
```

## Spread / Rest

```javascript
// spread
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]  // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 }
const obj2 = { ...obj1, c: 3 } // { a: 1, b: 2, c: 3 }

// rest
function sum(...nums) {
    return nums.reduce((a, b) => a + b)
}
sum(1, 2, 3, 4)  // 10
```

## Классы

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

class Student extends Person {
    constructor(name, age, major) {
        super(name, age)
        this.major = major
    }
    study() {
        return `${this.name} учит ${this.major}`
    }
}

const s = new Student("Боб", 20, "CS")
console.log(s.greet())  // Привет, я Боб!
```

## Promise и async/await

```javascript
// Promise
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

delay(1000).then(() => console.log("1s"))

// async/await
async function fetchData() {
    try {
        const response = await fetch("https://api.github.com")
        const data = await response.json()
        console.log(data)
    } catch (error) {
        console.error("Ошибка:", error)
    }
}
```

## DOM (браузер)

```javascript
// Поиск элементов
document.getElementById("app")
document.querySelector(".class")
document.querySelectorAll("div")

// Изменение
el.textContent = "Новый текст"
el.innerHTML = "<strong>жирный</strong>"
el.style.color = "red"
el.classList.add("active")

// События
el.addEventListener("click", (e) => {
    console.log("Клик!", e.target)
})

// Создание
const div = document.createElement("div")
div.textContent = "Привет"
document.body.appendChild(div)
```

## Задачи

1. Используя map, создайте массив квадратов чисел [1, 2, 3, 4, 5]
2. Отфильтруйте строки длиннее 5 символов
3. Создайте класс Animal с методом speak(), наследуйте Dog/Cat
4. Напишите функцию, fetch'ящую данные и выводящую их в консоль
