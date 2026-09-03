# Go — Unit 2: Методы, интерфейсы, работа с файлами

> Личный конспект. Базовые основы (переменные, циклы, функции, структуры) — в [Unit 1](../unit-01/syntax.md).

---

## 1. Методы

### 1.1 Что такое метод

Метод — это функция с **приёмником (receiver)**. Приёмник указывает, для какого типа определён метод. В Go нет классов: метод — это просто функция, первым формальным параметром которой является тип-приёмник.

```go
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}
```

Синтаксис: `func (имя Тип) ИмяМетода(аргументы) (результаты) { ... }`. Вызов через `переменная.Метод()`.

Методы можно определять только для типов, объявленных **в этом же пакете**. Нельзя добавить метод к `int`, `string` или типу из другого пакета напрямую. Решение — именованный тип:

```go
type MyInt int

func (m MyInt) IsEven() bool {
    return m%2 == 0
}

// Вызов
fmt.Println(MyInt(4).IsEven()) // true
fmt.Println(MyInt(7).IsEven()) // false
```

### 1.2 Value receiver (приёмник-значение)

Приёмник-значение получает **копию** структуры. Все изменения внутри метода остаются внутри копии и не влияют на оригинал.

```go
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Grow() {
    r.Width *= 2 // меняем копию — снаружи не изменится
}

rect := Rectangle{Width: 10, Height: 20}
rect.Grow()
fmt.Println(rect.Width) // 10, а не 20
```

### 1.3 Pointer receiver (приёмник-указатель)

Приёмник-указатель работает с **оригиналом** — изменения видны снаружи. Используется, когда нужно мутировать структуру или когда структура большая и копировать дорого.

```go
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

rect := Rectangle{Width: 10, Height: 20}
rect.Scale(2)
fmt.Println(rect.Width)  // 20
fmt.Println(rect.Height) // 40
```

### 1.4 Выбор receiver — таблица

| Ситуация | Receiver |
|----------|----------|
| Метод только читает поля | Value |
| Метод изменяет поля | Pointer |
| Структура большая (много полей) | Pointer |
| Нужно избежать копирования | Pointer |
| У типа уже есть pointer-методы | Pointer (консистентность) |
| Тип размером «слово» (int-подобный, маленькая) | Value |
| Сериализация / интерфейсы ожидают value-методы | Value |

**Правило консистентности:** лучше, чтобы у типа все методы были либо value, либо pointer. Иначе набор методов получается «смешанным», и тип может неожиданно не удовлетворять интерфейсу.

```go
// Смешивать не рекомендуется
type Counter struct{ n int }

func (c *Counter) Inc()  { c.n++ }        // pointer
func (c Counter) Value() int { return c.n } // value
```

### 1.5 Авто взятие адреса и разыменование

Go автоматически берёт адрес или разыменовывает указатель, когда это возможно:

```go
rect := Rectangle{10, 20}
// компилятор сам превращает в (&rect).Scale(2)
rect.Scale(2)

rp := &Rectangle{1, 2}
// компилятор сам превращает в (*rp).Area()
_ = rp.Area()
```

Исключение: pointer-метод **нельзя** вызвать на неадресуемом значении:

```go
Rectangle{1, 2}.Scale(2) // ОШИБКА компиляции
```

### 1.6 Встраивание (embedding) и методы

Встраивание структуры в структуру автоматически «поднимает» её методы наверх:

```go
type Person struct {
    Name string
    Age  int
}

func (p Person) Greet() string {
    return "Привет, я " + p.Name
}

type Employee struct {
    Person
    Company string
}

e := Employee{Person: Person{Name: "Алиса", Age: 30}, Company: "Google"}
fmt.Println(e.Greet())            // поднятый метод Person
fmt.Println(e.Name)               // поднятое поле
fmt.Println(e.Person.Greet())     // явный вызов тоже работает
```

Если вложенный тип переопределяет метод — он имеет приоритет:

```go
func (e Employee) Greet() string {
    return e.Person.Greet() + " из " + e.Company
}
```

### 1.7 Методы для других именованных типов

Методы можно определять не только для структур:

```go
type Meters float64

func (m Meters) ToKilometers() float64 {
    return float64(m) / 1000
}

type Path []string

func (p Path) Last() string {
    if len(p) == 0 {
        return ""
    }
    return p[len(p)-1]
}

fmt.Println(Path{"a", "b", "c"}.Last()) // c
```

---

## 2. Интерфейсы

### 2.1 Определение интерфейса

Интерфейс — это **набор методов**. Тип удовлетворяет интерфейсу автоматически, если у него есть все нужные методы. Ключевого слова `implements` в Go нет.

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}
```

### 2.2 Неявная реализация (duck typing)

```go
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

type Square struct {
    Side float64
}

func (s Square) Area() float64 {
    return s.Side * s.Side
}

func (s Square) Perimeter() float64 {
    return 4 * s.Side
}
```

И `Circle`, и `Square` автоматически реализуют `Shape`.

### 2.3 Интерфейс как параметр

```go
func printArea(s Shape) {
    fmt.Printf("S=%.2f, P=%.2f\n", s.Area(), s.Perimeter())
}

func main() {
    printArea(Circle{Radius: 1})    // S=3.14, P=6.28
    printArea(Square{Side: 2})      // S=4.00, P=8.00
}
```

Слайс интерфейсов может содержать разные типы:

```go
shapes := []Shape{
    Circle{Radius: 1},
    Square{Side: 2},
}
for _, s := range shapes {
    printArea(s)
}
```

### 2.4 Пустой интерфейс `any`

`interface{}` (для краткости — `any` с Go 1.18) не содержит методов, поэтому ему удовлетворяет **любой** тип. Используется для значений неизвестного заранее типа.

```go
func describe(v any) {
    fmt.Printf("Значение: %v, тип: %T\n", v, v)
}

describe("строка")
describe(42)
describe(Circle{Radius: 1})
```

Пустой интерфейс — не повод отказываться от типизации. Его место — JSON, логирование, обобщённые структуры.

### 2.5 Type assertion (утверждение типа)

Проверка конкретного типа внутри интерфейсного значения:

```go
var v any = "строка"

// опасно — panic при несовпадении
s := v.(string)
fmt.Println(s)

// безопасная форма: ok == false при несовпадении
s2, ok := v.(string)
if ok {
    fmt.Println("это строка:", s2)
}

n, ok := v.(int)
fmt.Println(n, ok) // 0 false — тип не совпал
```

### 2.6 Type switch

Компактный способ разобрать интерфейсное значение по типам:

```go
func typeName(v any) string {
    switch t := v.(type) {
    case string:
        return "строка: " + t
    case int:
        return fmt.Sprintf("целое: %d", t)
    case float64:
        return "дробное число"
    case Circle:
        return fmt.Sprintf("окружность r=%.1f", t.Radius)
    default:
        return fmt.Sprintf("неизвестный тип %T", v)
    }
}
```

### 2.7 Встраивание интерфейсов

Интерфейс может встраивать другой интерфейс — получается **объединение методов**:

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader
    Writer
}
```

### 2.8 nil и интерфейсы — ловушка

Интерфейс равен `nil` только когда **и тип, и значение** nil:

```go
var s Shape
fmt.Println(s == nil) // true

var c *Circle        // nil-указатель
var s2 Shape = c     // в интерфейсе ТИП *Circle и значение nil
fmt.Println(s2 == nil) // FALSE!

if s2 != nil {
    s2.Area() // panic: nil pointer dereference
}
```

Проверка на nil-указатель внутри интерфейса:

```go
func safeArea(s Shape) float64 {
    switch v := s.(type) {
    case nil:
        return 0
    case *Circle:
        if v == nil {
            return 0
        }
        return v.Area()
    default:
        return s.Area()
    }
}
```

---

## 3. Стандартные интерфейсы

| Интерфейс | Сигнатура | Назначение |
|-----------|-----------|-----------|
| `error` | `Error() string` | Ошибка |
| `fmt.Stringer` | `String() string` | Строковое представление |
| `io.Reader` | `Read([]byte) (int, error)` | Чтение потока |
| `io.Writer` | `Write([]byte) (int, error)` | Запись потока |
| `io.Closer` | `Close() error` | Закрытие ресурса |
| `sort.Interface` | `Len, Less, Swap` | Пользовательская сортировка |

### 3.1 fmt.Stringer

Если тип реализует `String() string`, `fmt` и `errors` используют его автоматически:

```go
type Temperature struct {
    Celsius float64
}

func (t Temperature) String() string {
    return fmt.Sprintf("%.1f°C", t.Celsius)
}

fmt.Println(Temperature{Celsius: 36.6}) // 36.6°C
fmt.Printf("%s\n", Temperature{Celsius: 0}) // 0.0°C
```

### 3.2 sort.Interface

```go
type ByAge []Person

func (s ByAge) Len() int           { return len(s) }
func (s ByAge) Less(i, j int) bool { return s[i].Age < s[j].Age }
func (s ByAge) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }

sort.Sort(ByAge(people))
```

Проще через `sort.Slice`:

```go
sort.Slice(people, func(i, j int) bool {
    return people[i].Age < people[j].Age
})
```

### 3.3 io.Reader / io.Writer

Файлы, `os.Stdin`, сетевые соединения, `bytes.Buffer` — всё это Reader/Writer. Благодаря этому функции принимают любой источник:

```go
func countBytes(r io.Reader) (int, error) {
    buf := make([]byte, 32*1024)
    var total int
    for {
        n, err := r.Read(buf)
        total += n
        if err == io.EOF {
            break
        }
        if err != nil {
            return total, err
        }
    }
    return total, nil
}
```

---

## 4. Обработка ошибок

### 4.1 Ошибка — это значение

В Go нет исключений. Функция возвращает ошибку последним значением, а вызывающий код обязан её проверить.

```go
type error interface {
    Error() string
}
```

### 4.2 Три способа создать ошибку

```go
import "errors"

// 1. errors.New
err1 := errors.New("файл не найден")

// 2. fmt.Errorf с форматированием
err2 := fmt.Errorf("ошибка в строке %d", 42)

// 3. собственный тип (метод Error())
type ValidationError struct {
    Field string
}

func (e ValidationError) Error() string {
    return fmt.Sprintf("ошибка в поле: %s", e.Field)
}

func validateAge(age int) error {
    if age < 0 {
        return ValidationError{Field: "age"}
    }
    return nil
}

err := validateAge(-5)
fmt.Println(err) // ошибка в поле: age
```

### 4.3 Обёртывание ошибок (%w, Go 1.13+)

```go
func readConfig(path string) error {
    data, err := os.ReadFile(path)
    if err != nil {
        return fmt.Errorf("не могу прочитать конфиг %s: %w", path, err)
    }
    _ = data
    return nil
}
```

`%w` сохраняет исходную ошибку в цепочке. Проверка через `errors.Is` / `errors.As`:

```go
err := readConfig("app.yaml")
if errors.Is(err, os.ErrNotExist) {
    fmt.Println("файл не существует")
}
```

### 4.4 Таблица функций пакета errors

| Функция | Назначение |
|---------|-----------|
| `errors.New(text)` | Простая ошибка |
| `fmt.Errorf(format, ...)` | Форматированная ошибка |
| `fmt.Errorf("...: %w", err)` | Обёртка с сохранением цепочки |
| `errors.Is(err, target)` | Совпадение по цепочке (== или Is) |
| `errors.As(err, &target)` | Поиск нужного типа в цепочке |
| `errors.Unwrap(err)` | Снять один слой обёртки |
| `errors.Join(errs...)` (1.20+) | Объединить несколько ошибок |

Пример `errors.As` с собственным типом:

```go
var ve ValidationError
if errors.As(err, &ve) {
    fmt.Println("проблемное поле:", ve.Field)
}
```

### 4.5 Паттерн: собственный тип с дополнительными данными

Ошибка может нести больше, чем строку — код ошибки, поля, HttpStatus:

```go
type AppError struct {
    Code    int
    Message string
    Cause   error
}

func (e *AppError) Error() string {
    return fmt.Sprintf("код %d: %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
    return e.Cause
}
```

### 4.6 Ошибки — не строка: always handle

```go
data, err := os.ReadFile("in.txt")
if err != nil {
    return 0, fmt.Errorf("чтение failed: %w", err)
}
```

Самый частый антипаттерн — `_` вместо обработки ошибки.

---

## 5. defer, panic, recover

### 5.1 defer — отложенный вызов

`defer` выполняет вызов по завершении функции (или при panic). Вызовы срабатывают в обратном порядке (LIFO):

```go
func demo() {
    defer fmt.Println("третий (выполнится последним)")
    defer fmt.Println("второй")
    fmt.Println("первый")
}
// первый
// второй
// третий (выполнится последним)
```

Основное применение — гарантированное освобождение ресурсов:

```go
f, err := os.Open("file.txt")
if err != nil {
    log.Fatal(err)
}
defer f.Close() // закроется при выходе из функции в любом случае
```

### 5.2 Семантика аргументов defer

Аргументы вычисляются **в момент вызова** `defer`, а не в момент выполнения:

```go
x := 1
defer fmt.Println(x) // напечатает 1, даже если x изменится позже
x = 100
```

Чтобы захватить актуальное значение — анонимная функция (замыкание):

```go
x := 1
defer func() { fmt.Println(x) }() // напечатает 100
x = 100
```

### 5.3 panic

`panic` — аварийное завершение (индекс за границей слайса, nil-указатель и т.п.). Для обычных ошибок его НЕ используют — для этого есть `error`.

```go
func main() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("восстановились после:", r)
        }
    }()

    panic("что-то пошло не так")
    // программа не упадёт, напечатает "восстановились..."
}
```

### 5.4 Применение recover

`recover` работает только внутри `defer`. Типичный кейс — middleware для веб-сервера, чтобы одна паникующая горутина не убила процесс:

```go
func safeCall(fn func()) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("паника: %v", r)
        }
    }()
    fn()
    return nil
}
```

### 5.5 Таблица: error vs panic

| Механизм | Когда | Пример |
|----------|-------|--------|
| `error` | Ожидаемые, обрабатываемые ошибки | нет файла, невалидный ввод |
| `panic` | Программистские ошибки, инварианты | нет — это почти всегда баг |
| `recover` | Верхний уровень, чтобы не уронить сервис | middleware |

---

## 6. Работа с файлами

### 6.1 Простое чтение и запись

```go
import "os"

// запись
data := []byte("Hello, World!")
err := os.WriteFile("output.txt", data, 0644)

// чтение
content, err := os.ReadFile("input.txt")
if err != nil {
    log.Fatal(err)
}
fmt.Println(string(content))
```

### 6.2 os.OpenFile и флаги

```go
f, err := os.OpenFile("log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
if err != nil {
    log.Fatal(err)
}
defer f.Close()

f.WriteString("новая строка в лог\n")
```

| Флаг | Назначение |
|------|-----------|
| `os.O_RDONLY` | Только чтение |
| `os.O_WRONLY` | Только запись |
| `os.O_RDWR` | Чтение и запись |
| `os.O_CREATE` | Создать файл, если его нет |
| `os.O_APPEND` | Дописывать в конец |
| `os.O_TRUNC` | Обрезать файл при открытии |

### 6.3 Режимы доступа (пермишены)

| Код | rwx | Описание |
|-----|-----|----------|
| `0644` | rw-r--r-- | Владелец пишет, остальные читают (файлы по умолчанию) |
| `0600` | rw------- | Только владелец (секреты, ключи) |
| `0755` | rwxr-xr-x | Исполняемые файлы, каталоги |

### 6.4 Построчное чтение (bufio.Scanner)

```go
import "bufio"

f, err := os.Open("data.txt")
if err != nil {
    log.Fatal(err)
}
defer f.Close()

scanner := bufio.NewScanner(f)
for scanner.Scan() {
    line := scanner.Text()
    fmt.Println(line)
}
if err := scanner.Err(); err != nil {
    log.Fatal(err)
}
```

### 6.5 Каталоги и пути (path/filepath)

```go
// каталоги
os.Mkdir("docs", 0755)
os.MkdirAll("a/b/c", 0755) // создаст все вложенные

// обход дерева каталогов
filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
    if err != nil {
        return err
    }
    if !info.IsDir() {
        fmt.Println(path)
    }
    return nil
})

// разбор пути
filepath.Base("/home/user/a.txt")  // a.txt
filepath.Dir("/home/user/a.txt")   // /home/user
filepath.Ext("photo.jpg")          // .jpg
```

### 6.6 Временные файлы

```go
f, err := os.CreateTemp("", "prefix-*.tmp")
if err != nil {
    log.Fatal(err)
}
defer os.Remove(f.Name()) // не забудем удалить

f.WriteString("временные данные")

dir, err := os.MkdirTemp("", "mydir")
defer os.RemoveAll(dir)
```

### 6.7 Проверка существования и удаление

```go
if _, err := os.Stat("file.txt"); errors.Is(err, os.ErrNotExist) {
    fmt.Println("файла нет")
}

os.Remove("file.txt")       // удалить файл
os.RemoveAll("tmp/")        // удалить дерево
os.Rename("a.txt", "b.txt") // переименовать/переместить
```

---

## 7. Пакет fmt

### 7.1 Функции вывода

```go
fmt.Print("hello")          // без новой строки
fmt.Println("hello")        // с новой строкой
fmt.Printf("int: %d, str: %s\n", 42, "hi")

msg := fmt.Sprintf("hello %s", "world") // возвращает строку
fmt.Println(msg)

fmt.Fprintf(os.Stderr, "ошибка: %v\n", err) // в любой io.Writer
```

### 7.2 Вербы форматирования

| Верб | Назначение | Пример вывода |
|------|-----------|---------------|
| `%v` | значение по умолчанию | `42` |
| `%+v` | struct с именами полей | `{Name:Алиса Age:25}` |
| `%#v` | значение в Go-синтаксисе | `main.User{Name:"Алиса", Age:25}` |
| `%T` | тип значения | `string` |
| `%d` | целое в десятичной | `42` |
| `%x` | целое в шестнадцатеричной | `2a` |
| `%f` | float | `3.140000` |
| `%.2f` | float, 2 знака | `3.14` |
| `%s` | строка / срез байт | `hello` |
| `%q` | строка в кавычках | `"hello"` |
| `%t` | bool | `true` |
| `%5d` | ширина 5 (вправо) | `   42` |
| `%-5d` | выравнивание влево | `42   ` |
| `%v` + Stringer | метод String() | `36.6°C` |

### 7.3 `%v` → `%+v` → `%#v`

```go
type User struct {
    Name string
    Age  int
}

u := User{Name: "Алиса", Age: 25}

fmt.Printf("%v\n", u)   // {Алиса 25}
fmt.Printf("%+v\n", u)  // {Name:Алиса Age:25}
fmt.Printf("%#v\n", u)  // main.User{Name:"Алиса", Age:25}
```

### 7.4 Строковая конкатенация в fmt

```go
name := "Мир"
msg := fmt.Sprintf("Привет, %s!", name)
// Для простых случаев "+" быстрее:
join := "Привет, " + name + "!"
```

Для множества фрагментов лучше `strings.Builder` (см. Unit 2, раздел 9).

### 7.5 Ввод данных

```go
var name string
var age int
fmt.Scanf("%s %d", &name, &age) // "Алиса 25"

// построчно со сканером
scanner := bufio.NewScanner(os.Stdin)
for scanner.Scan() {
    fmt.Println("вы ввели:", scanner.Text())
}
```

---

## 8. JSON

### 8.1 Маршалинг и демаршалинг

```go
import "encoding/json"

type User struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

u := User{Name: "Алиса", Age: 25}

// объект → JSON
data, err := json.Marshal(u)
fmt.Println(string(data)) // {"name":"Алиса","age":25}

// JSON → объект
var u2 User
err = json.Unmarshal(data, &u2)
fmt.Println(u2.Name) // Алиса
```

### 8.2 Теги структур

| Тег | Эффект |
|-----|--------|
| `json:"name"` | Имя поля в JSON |
| `json:"-"` | Поле игнорируется |
| `json:"age,omitempty"` | Пропустить нулевое значение |
| `json:"count,string"` | Число как строка |

```go
type Config struct {
    Host   string  `json:"host"`
    Port   int     `json:"port,omitempty"`
    Tags   []string `json:"tags,omitempty"`
    Secret string  `json:"-"`
}
```

### 8.3 Encoder / Decoder — потоковая работа

```go
// запись с отступами (читабельно)
enc := json.NewEncoder(w)
enc.SetIndent("", "  ")
enc.Encode(user)

// чтение из потока (например, из HTTP body)
var user User
err := json.NewDecoder(r.Body).Decode(&user)
```

Для файлов часто используют `MarshalIndent`:

```go
data, _ := json.MarshalIndent(todos, "", "  ")
os.WriteFile("tasks.json", data, 0644)
```

### 8.4 Вложенные структуры и коллекции

```go
type Order struct {
    ID    int      `json:"id"`
    Items []string `json:"items"`
    Total float64  `json:"total"`
}

orders := []Order{
    {ID: 1, Items: []string{"молоко", "хлеб"}, Total: 125.50},
    {ID: 2, Items: []string{"кофе"}, Total: 450.00},
}

data, _ := json.MarshalIndent(orders, "", "  ")
```

### 8.5 Работа с произвольным JSON

```go
// любые данные → map[string]any
var raw map[string]any
json.Unmarshal([]byte(`{"a":1,"b":"x","c":[1,2,3]}`), &raw)
fmt.Println(raw["a"]) // 1

// разбор по шагам
var cfg struct {
    Host string `json:"host"`
    Port int    `json:"port"`
}
json.Unmarshal(jsonData, &cfg)
```

### 8.6 Нетипизированные значения после Unmarshal

Числа становятся `float64`, объекты — `map[string]any`, массивы — `[]any`:

```go
n, ok := raw["a"].(float64)
```

---

## 9. Строки: пакеты strings и strconv

### 9.1 strings

| Функция | Результат |
|---------|-----------|
| `strings.Split(s, ",")` | `["a","b"]` |
| `strings.Join(xs, ",")` | `"a,b"` |
| `strings.Contains(s, sub)` | `true/false` |
| `strings.HasPrefix` / `HasSuffix` | префикс/суффикс |
| `strings.TrimSpace(s)` | без обрамляющих пробелов |
| `strings.ToUpper` / `ToLower` | регистр |
| `strings.ReplaceAll(s, old, new)` | все замены |
| `strings.Fields(s)` | слова по пробелам |
| `strings.Repeat(s, n)` | повторение |
| `strings.Index(s, sub)` | позиция подстроки |

```go
csv := "a,b,c"
cells := strings.Split(csv, ",")         // [a b c]
joined := strings.Join(cells, ";")       // a;b;c
words := strings.Fields("  привет мир ") // [привет мир]
clean := strings.TrimSpace("  x  ")      // x
```

### 9.2 Сборка строк через Builder

Конкатенация в цикле порождает много аллокаций — лучше `strings.Builder`:

```go
var sb strings.Builder
sb.WriteString("Строка ")
sb.WriteString("за строкой")
sb.WriteString(" с добавками")
result := sb.String()
```

### 9.3 strconv

| Функция | Назначение |
|---------|-----------|
| `strconv.Atoi(s)` | строка → int |
| `strconv.Itoa(n)` | int → строка |
| `strconv.ParseFloat(s, 64)` | строка → float64 |
| `strconv.ParseBool(s)` | строка → bool |
| `strconv.FormatFloat(f, 'f', 2, 64)` | float64 → строка |

```go
n, err := strconv.Atoi("42")  // 42, nil (если строка кривая — err != nil)
s := strconv.Itoa(42)         // "42"
f, _ := strconv.ParseFloat("3.14", 64)
b, _ := strconv.ParseBool("true")
```

### 9.4 rune и байты в строках UTF-8

```go
s := "привет"
fmt.Println(len(s))          // 12 — количество БАЙТ
fmt.Println(len([]rune(s)))  // 6 — количество символов

for i, r := range s {
    fmt.Printf("индекс=%d символ=%c\n", i, r)
}
// индекс=0 символ=п
// индекс=2 символ=р
// ...
```

`range` по строке итерирует по рунам (символам), пара байт складывается в один рун.

---

## 10. Теги структур и reflection

### 10.1 Зачем нужны теги

Теги — это метаданные полей структуры. Их читает `encoding/json`, `encoding/xml`, ORM, валидаторы.

```go
type User struct {
    Name string `json:"name" db:"username" validate:"required"`
}
```

### 10.2 Чтение тегов через reflect

```go
import "reflect"

t := reflect.TypeOf(User{})
field, _ := t.FieldByName("Name")

field.Tag.Get("json")      // "name"
field.Tag.Get("db")        // "username"
field.Tag.Get("validate")  // "required"
```

### 10.3 Мини-валидатор на reflect

```go
func validateRequired(s any) []string {
    var errs []string
    v := reflect.ValueOf(s)
    t := v.Type()
    for i := 0; i < t.NumField(); i++ {
        tag := t.Field(i).Tag.Get("validate")
        if strings.Contains(tag, "required") && v.Field(i).IsZero() {
            errs = append(errs, t.Field(i).Name)
        }
    }
    return errs
}
```

Reflection — инструмент фреймворков. В прикладном коде он нужен редко, а несёт риск падений и потери производительности.

---

## 11. Потоки: пакет io, Reader/Writer

### 11.1 Единый интерфейс потоков

`os.Stdin`, файлы, сетевые соединения, `bytes.Buffer` — все реализуют `io.Reader`/`io.Writer`. Это позволяет писать универсальные функции:

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

### 11.2 io.Copy между потоками

```go
// копия строки в stdout
io.Copy(os.Stdout, strings.NewReader("hello"))

// сетевые данные сразу в файл
netConn → io.Copy(file, conn)
```

### 11.3 bytes.Buffer

Буфер в памяти, реализующий Reader и Writer:

```go
var buf bytes.Buffer
buf.WriteString("строчка 1\n")
buf.WriteString("строчка 2\n")
fmt.Print(buf.String())
```

---

## 12. Задачи для самопроверки (кратко)

1. Создайте интерфейс `Vehicle` с методом `Move()`, реализуйте для `Car` и `Bike`.
2. Напишите функцию, читающую файл и возвращающую количество строк.
3. Создайте структуру `Task` с полями `Title`, `Done` и методы `MarkDone`, `String`.
4. Напишите программу, сохраняющую список задач в JSON.

> Развёрнутые решения — в файле [practice.md](practice.md).

---

*Unit 2: методы, интерфейсы, ошибки, файлы, fmt, JSON, строки, reflection, потоки.*
