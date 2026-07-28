# JavaScript — Unit 2: Задачи и проекты

## Задачи

```javascript
// 1. Квадраты
const squares = [1, 2, 3, 4, 5].map(x => x ** 2)

// 2. Фильтр строк
const words = ["hello", "world", "js", "python", "go"]
const long = words.filter(w => w.length > 5)

// 3. Группировка по длине
const grouped = words.reduce((acc, w) => {
    const len = w.length
    acc[len] = acc[len] || []
    acc[len].push(w)
    return acc
}, {})
```

## Проект: Список задач (браузер)

```html
<!DOCTYPE html>
<html>
<body>
  <input id="taskInput" placeholder="Новая задача">
  <button id="addBtn">Добавить</button>
  <ul id="taskList"></ul>

  <script>
    const input = document.getElementById("taskInput")
    const list = document.getElementById("taskList")
    const btn = document.getElementById("addBtn")

    function addTask() {
        const text = input.value.trim()
        if (!text) return

        const li = document.createElement("li")
        li.textContent = text
        
        const delBtn = document.createElement("button")
        delBtn.textContent = "✕"
        delBtn.onclick = () => li.remove()
        
        li.onclick = () => li.classList.toggle("done")
        li.appendChild(delBtn)
        list.appendChild(li)
        input.value = ""
    }

    btn.addEventListener("click", addTask)
    input.addEventListener("keypress", e => {
        if (e.key === "Enter") addTask()
    })
  </script>

  <style>
    .done { text-decoration: line-through; opacity: 0.5; }
    li { cursor: pointer; padding: 5px; }
  </style>
</body>
</html>
```

## Проект: Fetch + отображение

```javascript
async function getUsers() {
    try {
        const resp = await fetch("https://jsonplaceholder.typicode.com/users")
        const users = await resp.json()
        
        const list = document.getElementById("userList")
        users.forEach(user => {
            const div = document.createElement("div")
            div.className = "user-card"
            div.innerHTML = `
                <h3>${user.name}</h3>
                <p>${user.email}</p>
                <p>${user.company.name}</p>
            `
            list.appendChild(div)
        })
    } catch (err) {
        console.error("Ошибка:", err)
    }
}
```

## Ответы

1. `[1,2,3,4,5].map(x => x * x)`
2. `words.filter(w => w.length > 5)`
3. `class Dog extends Animal { speak() { return "Woof!" } }`
4. См. проект fetch выше
