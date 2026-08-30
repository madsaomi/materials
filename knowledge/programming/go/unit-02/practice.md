# Go — Unit 2: Задачи и проекты

> Все решения привожу сразу под условием. Код проверен локально (компилируется целиком только в файле-примере; фрагменты рассчитаны на понимание).

---

## 1. Задачи уровня 1 (базовый)

### 1.1 Интерфейс Vehicle

Создайте интерфейс `Vehicle` с методом `Move() string`, реализуйте для `Car` и `Bike`.

```go
type Vehicle interface {
    Move() string
}

type Car struct{ Brand string }

func (c Car) Move() string {
    return c.Brand + " едет"
}

type Bike struct{}

func (b Bike) Move() string {
    return "Велосипед едет"
}

func main() {
    vehicles := []Vehicle{Car{Brand: "Toyota"}, Bike{}}
    for _, v := range vehicles {
        fmt.Println(v.Move())
    }
}
// Toyota едет
// Велосипед едет
```

### 1.2 Счётчик строк в файле

Напишите функцию, читающую файл и возвращающую количество строк.

```go
func countLines(filename string) (int, error) {
    data, err := os.ReadFile(filename)
    if err != nil {
        return 0, err
    }
    content := string(data)
    if content == "" {
        return 0, nil // пустой файл — 0 строк
    }
    lines := strings.Split(content, "\n")
    return len(lines), nil
}
```

Замечание: последняя строка, оканчивающаяся на `\n`, даст пустую строку в срезе. Если нужно считать именно строки текста:

```go
func countLines2(filename string) (int, error) {
    f, err := os.Open(filename)
    if err != nil {
        return 0, err
    }
    defer f.Close()

    count := 0
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        count++
    }
    return count, scanner.Err()
}
```

### 1.3 Структура Task с методами

Создайте структуру `Task` с полями `Title`, `Done` и методы `MarkDone`, `String`.

```go
type Task struct {
    Title string
    Done  bool
}

func (t *Task) MarkDone() {
    t.Done = true
}

func (t Task) String() string {
    status := " "
    if t.Done {
        status = "✓"
    }
    return fmt.Sprintf("[%s] %s", status, t.Title)
}

func main() {
    t := Task{Title: "Выучить Go"}
    fmt.Println(t) // [ ] Выучить Go
    t.MarkDone()
    fmt.Println(t) // [✓] Выучить Go
}
```

Обратите внимание: `MarkDone` — pointer receiver (изменяет), `String` — value receiver (только читает).

### 1.4 Сохранение списка задач в JSON

```go
type Task struct {
    Title string `json:"title"`
    Done  bool   `json:"done"`
}

func main() {
    tasks := []Task{{Title: "Купить хлеб"}, {Title: "Написать отчёт", Done: true}}

    data, err := json.MarshalIndent(tasks, "", "  ")
    if err != nil {
        log.Fatal(err)
    }
    os.WriteFile("tasks.json", data, 0644)

    // обратно
    var loaded []Task
    content, _ := os.ReadFile("tasks.json")
    json.Unmarshal(content, &loaded)
    fmt.Println(loaded)
}
```

### 1.5 Интерфейс Shape и сумма площадей

```go
type Shape interface {
    Area() float64
}

type Circle struct{ Radius float64 }

func (c Circle) Area() float64 { return math.Pi * c.Radius * c.Radius }

type Rectangle struct{ W, H float64 }

func (r Rectangle) Area() float64 { return r.W * r.H }

func totalArea(shapes []Shape) float64 {
    total := 0.0
    for _, s := range shapes {
        total += s.Area()
    }
    return total
}

// totalArea([]Shape{Circle{2}, Rectangle{2, 3}}) ≈ 18.57
```

### 1.6 Безопасное утверждение типа

```go
func describe(v any) {
    if s, ok := v.(string); ok {
        fmt.Println("строка:", s)
        return
    }
    if n, ok := v.(int); ok {
        fmt.Println("целое:", n)
        return
    }
    fmt.Printf("неизвестно: %T\n", v)
}

describe("text") // строка: text
describe(10)     // целое: 10
```

### 1.7 Type switch

```go
func kind(v any) string {
    switch v.(type) {
    case string:
        return "string"
    case int:
        return "int"
    case float64:
        return "float64"
    case bool:
        return "bool"
    case []any:
        return "slice"
    default:
        return "other"
    }
}
```

### 1.8 Кастомная ошибка с полем

```go
type ValidationError struct {
    Field string
    Value any
}

func (e ValidationError) Error() string {
    return fmt.Sprintf("неверное значение %v в поле %q", e.Value, e.Field)
}

func validateAge(age int) error {
    if age < 0 || age > 150 {
        return ValidationError{Field: "age", Value: age}
    }
    return nil
}

err := validateAge(-5)
fmt.Println(err) // неверное значение -5 в поле "age"
```

### 1.9 fmt.Stringer для денег

```go
type Money struct {
    Amount   int64
    Currency string
}

func (m Money) String() string {
    return fmt.Sprintf("%d.%02d %s", m.Amount/100, m.Amount%100, m.Currency)
}

// fmt.Println(Money{Amount: 1250, Currency: "RUB"}) // 12.50 RUB
```

### 1.10 Сортировка по полю структуры

```go
type Person struct {
    Name string
    Age  int
}

people := []Person{
    {Name: "Иван", Age: 30},
    {Name: "Ольга", Age: 22},
    {Name: "Пётр", Age: 41},
}

sort.Slice(people, func(i, j int) bool {
    return people[i].Age < people[j].Age
})

// [{Ольга 22} {Иван 30} {Пётр 41}]
```

---

## 2. Задачи уровня 2 (средний)

### 2.1 Обёртка ошибки и errors.Is

Функция `openConfig` оборачивает ошибку `os.ReadFile` с `%w`. Проверьте цепочку через `errors.Is`.

```go
func openConfig(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("open config %q: %w", path, err)
    }
    return data, nil
}

func main() {
    _, err := openConfig("nope.yaml")
    if errors.Is(err, os.ErrNotExist) {
        fmt.Println("файл конфига отсутствует")
    } else if err != nil {
        fmt.Println("другая ошибка:", err)
    }
}
```

### 2.2 Сумма чисел из файла

Файл содержит по одному числу на строку. Посчитайте сумму.

```go
func sumFile(filename string) (int, error) {
    f, err := os.Open(filename)
    if err != nil {
        return 0, err
    }
    defer f.Close()

    total := 0
    scanner := bufio.NewScanner(f)
    for scanner.Scan() {
        n, err := strconv.Atoi(strings.TrimSpace(scanner.Text()))
        if err != nil {
            return 0, fmt.Errorf("строка %q: %w", scanner.Text(), err)
        }
        total += n
    }
    return total, scanner.Err()
}
```

### 2.3 Дописывание в лог (O_APPEND)

```go
func appendLog(line string) error {
    f, err := os.OpenFile("app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        return err
    }
    defer f.Close()

    _, err = f.WriteString(line + "\n")
    return err
}
```

### 2.4 Конфигурация в JSON-файл

```go
type Config struct {
    Host    string   `json:"host"`
    Port    int      `json:"port,omitempty"`
    Timeout string   `json:"timeout"`
    Tags    []string `json:"tags,omitempty"`
    Secret  string   `json:"-"`
}

func saveConfig(path string, cfg Config) error {
    data, err := json.MarshalIndent(cfg, "", "  ")
    if err != nil {
        return err
    }
    return os.WriteFile(path, data, 0600)
}

// loadConfig — обратная операция
func loadConfig(path string) (Config, error) {
    var cfg Config
    data, err := os.ReadFile(path)
    if err != nil {
        return cfg, err
    }
    err = json.Unmarshal(data, &cfg)
    return cfg, err
}
```

### 2.5 Произвольный JSON в map

```go
func parseAny(jsonStr string) (map[string]any, error) {
    var result map[string]any
    err := json.Unmarshal([]byte(jsonStr), &result)
    return result, err
}

func main() {
    m, _ := parseAny(`{"user":"аня","coins":100}`)
    fmt.Println(m["user"])            // аня
    if coins, ok := m["coins"].(float64); ok {
        fmt.Println(int(coins))      // 100 (числа приходят как float64)
    }
}
```

### 2.6 Валидация с errors.Join

Соберите все ошибки анкеты в одну.

```go
func validateUser(name, email string, age int) error {
    var errs []error
    if name == "" {
        errs = append(errs, errors.New("имя обязательно"))
    }
    if !strings.Contains(email, "@") {
        errs = append(errs, errors.New("некорректный email"))
    }
    if age < 0 || age > 150 {
        errs = append(errs, fmt.Errorf("age=%d вне диапазона", age))
    }
    return errors.Join(errs...)
}

// validateUser("", "bad", -1) → две ошибки в одной
```

### 2.7 Копирование файла через io.Copy

```go
func copyFile(src, dst string) error {
    in, err := os.Open(src)
    if err != nil {
        return err
    }
    defer in.Close()

    out, err := os.Create(dst)
    if err != nil {
        return err
    }
    defer out.Close()

    _, err = io.Copy(out, in)
    return err
}
```

### 2.8 Временный файл

```go
func writeTemp(dir, content string) (string, error) {
    f, err := os.CreateTemp(dir, "note-*.txt")
    if err != nil {
        return "", err
    }
    defer f.Close()

    if _, err := f.WriteString(content); err != nil {
        return "", err
    }
    return f.Name(), nil
}
```

---

## 3. Задачи уровня 3 (продвинутый)

### 3.1 ReadWriter: копирование потока в файл

Определите интерфейс, объединяющий Reader и Writer, и реализуйте объект «логгер» с буфером.

```go
type ReadWriter interface {
    io.Reader
    io.Writer
}

// bytes.Buffer удовлетворяет ReadWriter — используем готовый
func copyViaBuffer(rw ReadWriter, chunk string) {
    rw.Write([]byte(chunk))
    buf := make([]byte, len(chunk))
    rw.Read(buf)
    fmt.Println("прочитано:", string(buf))
}

// copyViaBuffer(bytes.NewBuffer(nil), "данные")
```

### 3.2 Безопасный вызов с recover

Функция выполняет другую функцию и превращает panic в error.

```go
func try(fn func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("panic: %v", r)
        }
    }()
    fn()
    return nil
}

func risky() {
    var s []int
    fmt.Println(s[5]) // panic: индекс за границей
}

func main() {
    if err := try(risky); err != nil {
        fmt.Println("перехвачено:", err)
    }
}
```

### 3.3 Валидатор на reflection

Проверьте поля, помеченные тегом `validate:"required"`.

```go
func validateRequired(s any) []string {
    var misses []string
    v := reflect.ValueOf(s)
    t := v.Type()

    for i := 0; i < t.NumField(); i++ {
        tag := t.Field(i).Tag.Get("validate")
        if strings.Contains(tag, "required") && v.Field(i).IsZero() {
            misses = append(misses, t.Field(i).Name)
        }
    }
    return misses
}

type Signup struct {
    Name     string `validate:"required"`
    Email    string `validate:"required"`
    Age      int
}

// validateRequired(Signup{Email: "a@b.c"}) → ["Name"]
```

### 3.4 Парсер CSV → JSON

Считайте CSV-файл и запишите выборку в JSON.

```go
func csvToJSON(csvPath, jsonPath string) error {
    in, err := os.Open(csvPath)
    if err != nil {
        return err
    }
    defer in.Close()

    reader := csv.NewReader(in)
    records, err := reader.ReadAll() // [][]string: первая строка — заголовки
    if err != nil {
        return err
    }
    if len(records) == 0 {
        return nil
    }

    headers := records[0]
    var rows []map[string]string
    for _, line := range records[1:] {
        row := map[string]string{}
        for i, val := range line {
            if i < len(headers) {
                row[headers[i]] = val
            }
        }
        rows = append(rows, row)
    }

    data, err := json.MarshalIndent(rows, "", "  ")
    if err != nil {
        return err
    }
    return os.WriteFile(jsonPath, data, 0644)
}
```

### 3.5 Обёртка ошибки с кодом HTTP

```go
type HTTPError struct {
    Status  int
    Message string
}

func (e *HTTPError) Error() string {
    return fmt.Sprintf("http %d: %s", e.Status, e.Message)
}

func handler() error {
    return &HTTPError{Status: 404, Message: "нет такого пользователя"}
}

func main() {
    err := handler()
    var he *HTTPError
    if errors.As(err, &he) {
        fmt.Printf("статус %d, %s\n", he.Status, he.Message)
    }
}
```

---

## 4. Мини-проект: менеджер задач (CLI)

Хранение базируется на JSON-файле. Базовый проект:

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
    if len(t.Tasks) == 0 {
        fmt.Println("задач нет")
        return
    }
    for i, task := range t.Tasks {
        status := " "
        if task.Done {
            status = "✓"
        }
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

### 4.1 Расширение: удаление, переключение, статистика

```go
func (t *TodoList) Remove(idx int) {
    if idx >= 0 && idx < len(t.Tasks) {
        t.Tasks = append(t.Tasks[:idx], t.Tasks[idx+1:]...)
        t.save()
    }
}

func (t *TodoList) Toggle(idx int) {
    if idx >= 0 && idx < len(t.Tasks) {
        t.Tasks[idx].Done = !t.Tasks[idx].Done
        t.save()
    }
}

func (t *TodoList) PendingCount() int {
    n := 0
    for _, task := range t.Tasks {
        if !task.Done {
            n++
        }
    }
    return n
}
```

### 4.2 Интерфейс команд для терминала

```go
func main() {
    todo := NewTodoList("tasks.json")

    if len(os.Args) < 2 {
        todo.Show()
        return
    }

    switch os.Args[1] {
    case "add":
        if len(os.Args) < 3 {
            fmt.Println("использование: todo add <текст>")
            return
        }
        todo.Add(os.Args[2])
    case "done":
        if idx, err := strconv.Atoi(os.Args[2]); err == nil {
            todo.Done(idx - 1)
        }
    case "remove":
        if idx, err := strconv.Atoi(os.Args[2]); err == nil {
            todo.Remove(idx - 1)
        }
    case "toggle":
        if idx, err := strconv.Atoi(os.Args[2]); err == nil {
            todo.Toggle(idx - 1)
        }
    case "stats":
        fmt.Printf("открытых задач: %d\n", todo.PendingCount())
    default:
        todo.Show()
    }
}
```

Теперь работает так: `go run . add "купить молоко"`, `go run . done 1`, `go run . list`.

### 4.3 Финализация проекта (checklist)

- [x] Хранение задач в JSON-файле
- [x] Команды add / done / remove / toggle / stats
- [ ] Переименование: `rename <индекс> <новый текст>`
- [ ] Поиск: `find <подстрока>`
- [ ] Работа с ошибками save()/load() — без игнорирования

---

## 5. Типичные ошибки

### 5.1 Mutex копируется вместе со структурой

```go
// ПЛОХО: struct с mutex копируется по значению
type Cache struct {
    mu sync.Mutex
    m  map[string]string
}

// ХОРОШО: всегда передавай через *Cache
func (c *Cache) Set(k, v string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.m[k] = v
}
```

`sync.Mutex` нельзя копировать после использования — `go vet` сообщит об ошибке.

### 5.2 Verifier: метод на копии структуры

```go
// ПЛОХО: изменить структуру через value receiver не выйдет
func (t Task) MarkDone() {
    t.Done = true // меняется копия
}

// ХОРОШО: pointer receiver
func (t *Task) MarkDone() {
    t.Done = true
}
```

### 5.3 Пустой interface{} как универсальный аргумент

```go
// ПЛОХО: типизация теряется, ошибки уходят в рантайм
func add(a, b any) any { return a.(int) + b.(int) }

// ХОРОШО: конкретные типы
func addInts(a, b int) int { return a + b }
```

### 5.4 errors.New для текста с параметрами

```go
// ПЛОХО — строит строку руками
errors.New("user " + name + " not found")

// ХОРОШО
fmt.Errorf("user %s not found", name)
```

### 5.5 Игнорирование ошибки

```go
// ПЛОХО
json.Unmarshal(data, &cfg)

// ХОРОШО
if err := json.Unmarshal(data, &cfg); err != nil {
    log.Fatal(err)
}
```

### 5.6 Забытые скобки в defer

```go
// ПЛОХО: defer вызовет функцию Println, возврат значения
defer fmt.Println("done")

// ХОРОШО: анонимная функция вызывается сразу
defer func() { fmt.Println("done") }()
```

### 5.7 Ошибка при закрытии через defer

```go
// ПЛОХО: ошибка Close теряется
defer f.Close()

// ХОРОШО (если важен результат)
defer func() {
    if err := f.Close(); err != nil {
        log.Printf("close: %v", err)
    }
}()
```

### 5.8 Сравнение ошибок через ==

```go
// ПЛОХО: так сравнивают только «синглтоны» вроде io.EOF; обёртки не совпадают
if err == myErr { ... }

// ХОРОШО
if errors.Is(err, myErr) { ... }
```

### 5.9 panic вместо error

```go
// ПЛОХО
func divide(a, b int) int {
    if b == 0 {
        panic("деление на ноль")
    }
    return a / b
}

// ХОРОШО
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("деление на ноль")
    }
    return a / b, nil
}
```

### 5.10 Интерфейс с nil-указателем внутри

```go
// ПЛОХО: сравнение s != nil «проходит», но внутри nil-указатель
var c *Circle
var s Shape = c
if s != nil {
    s.Area() // panic
}

// ХОРОШО: проверять на каждый уровень
if s == nil { return }
c, ok := s.(*Circle)
if c == nil { return }
```

### 5.11 Имя типа совпало с пакетом

```go
// ПЛОХО: неудобно ссылаться
type json struct{}             // тень пакета json
// ХОРОШО — например, структуры называем по предмету
type JSONHandler struct{}
```

### 5.12 Не использовать stringer в ошибках

```go
// ПЛОХО: message отражает только Random
func (e ValidationError) Error() string { ... }

// ХОРОШО: держим поля (Field, Value) и собираем строку в Error()
```

### 5.13 Строки в цикле через +

```go
// ПЛОХО: O(n²) аллокаций
s := ""
for _, w := range words {
    s += w
}

// ХОРОШО
var sb strings.Builder
for _, w := range words {
    sb.WriteString(w)
}
s := sb.String()
```

### 5.14 Числа float64 в JSON-мапах

```go
// ПЛОХО: неожиданный тип
coins := raw["coins"]
fmt.Printf("%d", coins)  // подаст float64!

// ХОРОШО: приведение по проверке
if n, ok := raw["coins"].(float64); ok {
    fmt.Printf("%.0f", n)
}
```

### 5.15 Неполное чтение io.Reader

```go
// ПЛОХО: Read может вернуть меньше байт
n := len(buf)
r.Read(buf)

// ХОРОШО: io.ReadFull
n, err := io.ReadFull(r, buf)
```

### 5.16 Метод не может изменить встроенную структуру

```go
// ПЛОХО: изменения Person «внутри» Employee не сохранятся, если Person передана по значению
func (e Employee) Rename(name string) { e.Person.Name = name }
// ХОРОШО
func (e *Employee) Rename(name string) { e.Person.Name = name }
```

### 5.17 Приёмник не в том пакете

```go
// ПЛОХО: методы на чужих типах не разрешены
func (u otherpkg.User) Hello() { ... }

// ХОРОШО: свой тип-обёртка
type UserWrapper struct{ otherpkg.User }
```

### 5.18 Производительность Reflection-валидации в цикле

```go
// ПЛОХО: reflect для каждой записи в hot-path
for _, u := range users { reflect-based validate }

// ХОРОШО: генерируем/валидируем вручную для конкретных полей
```

---

## 6. Вопросы для самопроверки

**1. Чем method отличается от function?**
Метод — функция с приёмником: `func (r Rectangle) Area()`. Вызывается через `x.Area()`, а не `Area(x)`.

**2. Value receiver или Pointer receiver?**
Value — только чтение (получает копию). Pointer — чтение/изменение или большие структуры, работает с оригиналом.

**3. Можно ли определить метод на int?**
Нет, напрямую нельзя. Создайте именованный тип: `type MyInt int`.

**4. Что значит «интерфейс реализуется неявно»?**
Не нужно писать `implements`. Достаточно, чтобы тип имел все методы интерфейса — компилятор сам проверит в местах использования.

**5. Что такое пустой интерфейс `any`?**
`interface{}` без методов. Ему удовлетворяют все типы. Используется для значений неизвестного заранее типа.

**6. В чём разница type assertion и type switch?**
Утверждение проверяет один тип (`v.(string)`), тип-switch обрабатывает несколько вариантов в `switch`.

**7. Как сравнить ошибку из обёртки?**
`errors.Is(err, target)` проверяет всю цепочку обёрток, `errors.As` находит тип в цепочке.

**8. Что делает `%w` в fmt.Errorf?**
Оборачивает ошибку и сохраняет её в цепочке — `errors.Is`/`errors.As` увидят исходную.

**9. Зачем нужен defer?**
Гарантированное выполнение по завершении функции — закрытие файлов, освобождение мьютексов, logout.

**10. Когда уместен panic?**
Никогда для обычных ошибок. Только для программистских ошибок и аварийных инвариантов.

**11. Что происходит при вызове recover вне defer?**
Ничего полезного — `recover` срабатывает только внутри отложенной функции.

**12. Как открыть файл для дописывания?**
`os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)`.

**13. Чем `MarshalIndent` лучше `Marshal` для файлов?**
Читаемый вывод с отступами, удобно хранить и дебажить.

**14. Почему числа из JSON в map — float64?**
`encoding/json` раскладывает произвольные числа в `float64` (других вариантов с целостностью не гарантирует).

**15. difference %v, %+v, %#v?**
`%v` — значения через пробел, `%+v` — с именами полей, `%#v` — литерал в Go-синтаксисе (можно скопировать в код).

**16. Как сортировать слайс структур?**
`sort.Slice(s, func(i, j int) bool { return s[i].Age < s[j].Age })`.

**17. Что делает `errors.Join`?**
Объединяет несколько ошибок в одну, сохраняя их все (Go 1.20+).

**18. Как посчитать символы (не байты) в строке?**
`len([]rune(s))`. Байты — `len(s)`.

---

## 7. Глоссарий

| Термин | Перевод / смысл |
|--------|-----------------|
| Method (method set) | Метод, набор методов типа |
| Receiver | Приёмник — тип, к которому привязан метод |
| Value receiver | Приёмник-значение (копия) |
| Pointer receiver | Приёмник-указатель (оригинал) |
| Interface | Интерфейс — набор методов |
| Duck typing | Неявная реализация интерфейсов через совпадение методов |
| Type assertion | Утверждение типа: `v.(T)` |
| Type switch | Переключатель по типам: `switch v.(type)` |
| Empty interface / any | Интерфейс без методов, «любой тип» |
| Embedding | Встраивание — композиция вместо наследования |
| error | Интерфейс ошибки: `Error() string` |
| errors.Is / errors.As | Проверка цепочки ошибок / поиск типа в цепочке |
| %w verb | Спец-верб fmt.Errorf для обёртки ошибки |
| defer | Отложенный вызов (LIFO) |
| panic / recover | Аварийная остановка / восстановление в defer |
| os.ReadFile | Чтение файла целиком в []byte |
| os.OpenFile | Открытие файла с флагами |
| bufio.Scanner | Построчный сканер потоков/файлов |
| Marshaling / Unmarshaling | Сериализация / десериализация (обычно JSON) |
| Struct tag | Тег поля: `json:"name"` |
| MarshalIndent | Сериализация с отступами |
| Stringer | Интерфейс `String() string` |
| Reflection | `reflect` — чтение типов/меток в рантайме |
| io.Reader / io.Writer | Абстракции «источник» / «приёмник» потока |
| io.Copy | Копирование данных между Reader и Writer |

---

*Unit 2: задачи базового, среднего и продвинутого уровня, мини-проект на JSON, типичные ошибки, вопросы и глоссарий.*