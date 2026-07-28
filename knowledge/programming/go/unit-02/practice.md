# Go — Unit 2: Задачи и проекты

## Задачи

```go
// 1. Интерфейс Vehicle
type Vehicle interface {
    Move() string
}

type Car struct{ Brand string }
func (c Car) Move() string { return c.Brand + " едет" }

type Bike struct{}
func (b Bike) Move() string { return "Велосипед едет" }

// 2. Счётчик строк
func countLines(filename string) (int, error) {
    data, err := os.ReadFile(filename)
    if err != nil {
        return 0, err
    }
    lines := strings.Split(string(data), "\n")
    return len(lines), nil
}
```

## Проект: Менеджер задач (CLI)

```go
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

type Task struct {
    Title string `json:"title"`
    Done  bool   `json:"done"`
}

type TodoList struct {
    Tasks []Task `json:"tasks"`
    db    string
}

func NewTodoList(db string) *TodoList {
    t := &TodoList{db: db}
    t.load()
    return t
}

func (t *TodoList) load() {
    data, err := os.ReadFile(t.db)
    if err != nil {
        t.Tasks = []Task{}
        return
    }
    json.Unmarshal(data, t)
}

func (t *TodoList) save() {
    data, _ := json.MarshalIndent(t, "", "  ")
    os.WriteFile(t.db, data, 0644)
}

func (t *TodoList) Add(title string) {
    t.Tasks = append(t.Tasks, Task{Title: title})
    t.save()
}

func (t *TodoList) Done(idx int) {
    if idx >= 0 && idx < len(t.Tasks) {
        t.Tasks[idx].Done = true
        t.save()
    }
}

func (t *TodoList) Show() {
    for i, task := range t.Tasks {
        status := " "
        if task.Done { status = "✓" }
        fmt.Printf("%d. [%s] %s\n", i+1, status, task.Title)
    }
}

func main() {
    todo := NewTodoList("tasks.json")
    todo.Add("Выучить Go")
    todo.Add("Сделать проект")
    todo.Show()
}
```

## Ответы

1. Car { func(c Car) Move() string { return "car moves" } }
2. `func countLines(fn string) int { d, _ := os.ReadFile(fn); return len(strings.Split(string(d), "\n")) }`
3. `type Task struct { Title string; Done bool }; func (t *Task) MarkDone() { t.Done = true }`
4. См. проект TodoList выше
