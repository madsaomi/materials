# Go (Golang) — Полный конспект

## Введение

Go — компилируемый, статически типизированный язык, созданный в Google (Роберт Гризмер, Роб Пайк, Кен Томпсон, 2009). 

**Ключевые особенности:**
- Лаконичный синтаксис
- Быстрая компиляция
- Встроенная конкурентность (goroutines, channels)
- Статическая типизация с выводом типов
- Сборщик мусора
- Нет наследования (композиция вместо наследования)
- Нет дженериков до 1.18 (с 1.18 есть generics)
- Нет исключений (ошибки — значения)

**Области:** бэкенд, микросервисы, CLI утилиты, DevOps инструменты (Docker, Kubernetes — на Go), сетевые сервисы.

---

## 1. Установка

```bash
# Linux (Ubuntu/Debian)
sudo apt install golang-go
# Или скачать с https://go.dev/dl/

# Проверка
go version

# Переменные окружения
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# go.mod (инициализация модуля)
go mod init example.com/myproject
```

---

## 2. Основы синтаксиса

### 2.1 Hello World

```go
package main

import (
    "fmt"
)

func main() {
    fmt.Println("Hello, World!")
}
```

**Структура программы:**
- `package main` — исполняемый пакет
- `func main()` — точка входа
- `import` — импорт пакетов
- `fmt.Println` — вывод

### 2.2 Переменные

```go
// Явное объявление
var name string = "Alice"
var age int = 30

// С выводом типа
var city = "Tokyo"

// Краткое объявление (только внутри функций)
count := 42

// Множественное объявление
var x, y int = 1, 2
a, b := 3, 4

// Константы
const Pi = 3.14159
const (
    StatusOK = 200
    StatusNotFound = 404
)

// Zero values (значения по умолчанию)
var i int       // 0
var f float64   // 0
var s string    // ""
var b bool      // false
var p *int      // nil
```

### 2.3 Типы данных

```go
// Числа
var i int          // 32/64 бита (зависит от платформы)
var i8 int8        // -128..127
var i16 int16      // -32768..32767
var i32 int32      // -2^31..2^31-1
var i64 int64      // -2^63..2^63-1
var u uint         // беззнаковый
var u8 uint8       // 0..255 (byte)
var f32 float32    // IEEE 754 single
var f64 float64    // IEEE 754 double
var c64 complex64  // комплексные
var c128 complex128

// Строки (неизменяемые, UTF-8)
s := "hello"
s[0]    // 'h' (byte)
len(s)  // 5
s + " world"

// Конвертация
f := float64(i)
i := int(f)
s := string(rune(65)) // "A"
n, _ := strconv.Atoi("42")
s := strconv.Itoa(42)

// Rune (Unicode code point)
r := '語'  // rune (int32)
s := string(r) // "語"
```

### 2.4 Управляющие конструкции

```go
// Если
if x > 0 {
    fmt.Println("positive")
} else if x < 0 {
    fmt.Println("negative")
} else {
    fmt.Println("zero")
}

// If с инициализацией (scope limited)
if err := doSomething(); err != nil {
    fmt.Println(err)
}

// Switch
switch day {
case "Mon", "Tue":
    fmt.Println("weekday")
case "Sat", "Sun":
    fmt.Println("weekend")
default:
    fmt.Println("unknown")
}

// Switch без выражения (if-else chain)
switch {
case score >= 90:
    grade = "A"
case score >= 80:
    grade = "B"
default:
    grade = "F"
}
```

### 2.5 Циклы (только for)

```go
// Классический
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// While
x := 0
for x < 10 {
    x++
}

// Бесконечный
for {
    break
}

// Range (итерация)
nums := []int{1, 2, 3}
for index, value := range nums {
    fmt.Println(index, value)
}

for key, val := range map[string]string{"a": "b"} {
    fmt.Println(key, val)
}

for i, char := range "hello" {
    fmt.Println(i, char) // i — byte index, char — rune
}

// Только ключ
for key := range m { ... }
```

---

## 3. Структуры данных

### 3.1 Массивы и срезы (slices)

```go
// Массивы (фиксированная длина)
var arr [5]int
arr[0] = 1
arr2 := [3]int{1, 2, 3}
arr3 := [...]int{1, 2, 3}  // компилятор считает

// Срезы (динамические)
var s []int
s = append(s, 1, 2, 3)

s2 := make([]int, 5)        // len=5, cap=5
s3 := make([]int, 3, 10)    // len=3, cap=10
s4 := []int{1, 2, 3, 4, 5}

// Длина и ёмкость
len(s), cap(s)

// Срезы (не копируют данные!)
sub := s4[1:4]   // [2,3,4]
sub2 := s4[:3]   // [1,2,3]
sub3 := s4[2:]   // [3,4,5]
sub4 := s4[:]    // всё

// Копирование
dst := make([]int, len(src))
copy(dst, src)

// append может менять underlying array
s = append(s, 4, 5, 6)  // если cap не хватает — новый массив
```

### 3.2 Map (словари)

```go
// Создание
m := make(map[string]int)
m2 := map[string]int{
    "a": 1,
    "b": 2,
}

// Операции
m["c"] = 3
val := m["a"]           // 1
val, exists := m["z"]   // 0, false
delete(m, "a")

// Порядок не гарантирован
for k, v := range m {
    fmt.Println(k, v)
}
```

### 3.3 Struct

```go
type Person struct {
    Name string
    Age  int
    City string
}

// Создание
p1 := Person{"Alice", 30, "Tokyo"}
p2 := Person{Name: "Bob", Age: 25}
p3 := Person{Name: "Charlie"}
var p4 Person
p4.Name = "Dave"
p4.Age = 40

// Встраивание (композиция вместо наследования)
type Employee struct {
    Person
    Company string
    Salary  float64
}

e := Employee{
    Person: Person{Name: "Alice", Age: 30},
    Company: "Google",
    Salary: 200000,
}
fmt.Println(e.Name)       // прямой доступ
fmt.Println(e.Person.Age) // через встроенную
```

---

## 4. Функции

```go
// Простая функция
func add(x int, y int) int {
    return x + y
}

// Можно сократить, если типы повторяются
func add(x, y int) int { ... }

// Множественный возврат
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// Именованные возвращаемые значения
func swap(a, b int) (x, y int) {
    x = b
    y = a
    return  // naked return
}

// Variadic (вариативные аргументы)
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
sum(1, 2, 3)
sum([]int{1,2,3}...)  // распаковка среза

// Функция как значение
fn := func(a, b int) int { return a + b }
fmt.Println(fn(3, 4))

// Замыкание (closure)
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}
c := counter()
fmt.Println(c()) // 1
fmt.Println(c()) // 2
```

---

## 5. Методы

```go
type Rectangle struct {
    Width, Height float64
}

// Value receiver
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// Pointer receiver (мутация)
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

// Использование
rect := Rectangle{10, 20}
area := rect.Area()       // Go автоматически берёт указатель/значение
rect.Scale(2)             // (&rect).Scale(2)
```

---

## 6. Интерфейсы

```go
// Определение
type Shape interface {
    Area() float64
    Perimeter() float64
}

// Неявная реализация (duck typing)
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

// Использование
func printShapeInfo(s Shape) {
    fmt.Printf("Area: %.2f\n", s.Area())
}

// Пустой интерфейс (any, Go 1.18+)
func printAny(v any) {
    fmt.Printf("value: %v, type: %T\n", v, v)
}

// Type assertion
var i any = "hello"
s := i.(string)        // panic если не string
s, ok := i.(string)    // безопасно (ok = false)

// Type switch
switch v := i.(type) {
case string:
    fmt.Println("string:", v)
case int:
    fmt.Println("int:", v)
default:
    fmt.Println("unknown")
}

// Composition интерфейсов
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

---

## 7. Обработка ошибок

```go
// Ошибка — это значение (интерфейс error)
type error interface {
    Error() string
}

// Создание ошибок
import "errors"
err := errors.New("something went wrong")

// Форматированные ошибки
import "fmt"
err := fmt.Errorf("user %d not found", id)

// Wrap (обёртывание, Go 1.13+)
err := fmt.Errorf("read failed: %w", originalErr)
errors.Is(err, os.ErrNotExist)     // проверка цепочки
errors.As(err, &pathErr)           // проверка типа

// Panic / Recover (только для критических случаев)
defer func() {
    if r := recover(); r != nil {
        fmt.Println("recovered from:", r)
    }
}()
panic("something bad")
```

---

## 8. Конкурентность

### 8.1 Goroutines

```go
// Запуск горутины
go func() {
    fmt.Println("in goroutine")
}()

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d starting\n", id)
}

// WaitGroup
var wg sync.WaitGroup
for i := 1; i <= 5; i++ {
    wg.Add(1)
    go worker(i, &wg)
}
wg.Wait()
```

### 8.2 Channels

```go
// Создание
ch := make(chan int)          // небуферизированный (блокирующий)
ch := make(chan int, 10)      // буферизированный

// Отправка и получение
ch <- 42      // отправить
val := <-ch   // получить

// Закрытие
close(ch)
val, ok := <-ch  // ok = false если канал закрыт

// Range по каналу
for val := range ch {
    fmt.Println(val)
}

// Select (мультиплексирование)
select {
case msg1 := <-ch1:
    fmt.Println(msg1)
case msg2 := <-ch2:
    fmt.Println(msg2)
case <-time.After(1 * time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("no message ready")
}

// Пример: worker pool
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

jobs := make(chan int, 100)
results := make(chan int, 100)

for w := 1; w <= 3; w++ {
    go worker(w, jobs, results)
}

for j := 1; j <= 5; j++ {
    jobs <- j
}
close(jobs)

for r := 1; r <= 5; r++ {
    <-results
}

// Fan-out, Fan-in
// Канал только для чтения/записи
func readOnly(ch <-chan int) int { return <-ch }
func writeOnly(ch chan<- int, val int) { ch <- val }
```

### 8.3 Sync примитивы

```go
// Mutex
var mu sync.Mutex
var counter int

mu.Lock()
counter++
mu.Unlock()

// RWMutex
var rw sync.RWMutex
rw.RLock()   // много читателей
// read
rw.RUnlock()
rw.Lock()    // один писатель
// write
rw.Unlock()

// Once (однократное выполнение)
var once sync.Once
once.Do(func() {
    fmt.Println("initialized")
})

// Cond
cond := sync.NewCond(&mu)
cond.Wait()
cond.Signal()
cond.Broadcast()

// Atomic
import "sync/atomic"
var counter atomic.Int64
counter.Add(1)
counter.Load()
counter.Store(42)
```

### 8.4 Context

```go
import "context"

// Создание
ctx := context.Background()
ctx := context.TODO()

// С таймаутом
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

// С дедлайном
ctx, cancel := context.WithDeadline(context.Background(), time.Now().Add(5*time.Second))

// С отменой
ctx, cancel := context.WithCancel(context.Background())
cancel()  // отменяет

// Со значениями
ctx := context.WithValue(context.Background(), "key", "value")
val := ctx.Value("key")

// Пример: HTTP запрос с контекстом
req, _ := http.NewRequestWithContext(ctx, "GET", "https://example.com", nil)
resp, err := http.DefaultClient.Do(req)

// Пример: горутина с отменой
go func(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            return
        default:
            // работа
        }
    }
}(ctx)
```

---

## 9. Пакеты и модули

```go
// math/operations.go
package operations

func Add(a, b int) int {
    return a + b  // экспортируется (с большой буквы)
}

func subtract(a, b int) int {
    return a - b  // приватная (с маленькой)
}

// main.go
package main

import (
    "fmt"
    "example.com/myproject/math/operations"
)

func main() {
    fmt.Println(operations.Add(2, 3))
}

// init() — выполняется при импорте пакета
func init() {
    // инициализация
}

// blank import (для side effects)
import _ "github.com/lib/pq"
```

---

## 10. Стандартная библиотека

### 10.1 Ввод/вывод (io, os)

```go
// Чтение файла
data, err := os.ReadFile("file.txt")
os.WriteFile("out.txt", []byte("hello"), 0644)

// Буферизированное чтение
f, _ := os.Open("file.txt")
defer f.Close()
scanner := bufio.NewScanner(f)
for scanner.Scan() {
    line := scanner.Text()
}

// io.Reader / io.Writer
r := strings.NewReader("hello")
io.Copy(os.Stdout, r)
```

### 10.2 Форматирование

```go
fmt.Printf("string: %s, int: %d, float: %.2f\n", s, i, f)
fmt.Sprintf("formatted")
fmt.Fprintf(w, "write to writer")

// struct → string
type User struct { Name string; Age int }
u := User{"Alice", 30}
fmt.Printf("%+v\n", u)   // {Name:Alice Age:30}
fmt.Printf("%#v\n", u)   // main.User{Name:"Alice", Age:30}
```

### 10.3 HTTP

```go
// Сервер
http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, %s!", r.URL.Query().Get("name"))
})
http.ListenAndServe(":8080", nil)

// Современный маршрутизатор (Go 1.22+)
mux := http.NewServeMux()
mux.HandleFunc("GET /api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    fmt.Fprintf(w, "user %s", id)
})
http.ListenAndServe(":8080", mux)

// JSON
import "encoding/json"

type Response struct {
    Message string `json:"message"`
    Code    int    `json:"code"`
}

json.NewEncoder(w).Encode(Response{Message: "ok", Code: 200})

// Клиент
resp, err := http.Get("https://api.github.com")
resp, err := http.Post(url, "application/json", body)
resp, err := http.PostForm(url, url.Values{"key": {"val"}})
```

### 10.4 JSON

```go
// Маршалинг
data, err := json.Marshal(obj)
data, err := json.MarshalIndent(obj, "", "  ")

// Унмаршалинг
err := json.Unmarshal(data, &obj)

// Decoder/Encoder (потоковый)
json.NewDecoder(r.Body).Decode(&obj)
json.NewEncoder(w).Encode(&obj)

// Теги структур
type Config struct {
    Host string `json:"host" yaml:"host"`
    Port int    `json:"port,omitempty"`
    Tags []string `json:"tags,omitempty"`
    _    struct{} `json:"-"` // игнорировать
}
```

### 10.5 Тестирование

```go
// math_test.go
package operations

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    expected := 5
    if result != expected {
        t.Errorf("Add(2,3) = %d, want %d", result, expected)
    }
}

// Table-driven
func TestAddTable(t *testing.T) {
    tests := []struct {
        a, b, expected int
    }{
        {1, 2, 3},
        {0, 0, 0},
        {-1, 1, 0},
    }
    for _, tt := range tests {
        if got := Add(tt.a, tt.b); got != tt.expected {
            t.Errorf("Add(%d,%d)=%d, want %d", tt.a, tt.b, got, tt.expected)
        }
    }
}

// Benchmark
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(1, 2)
    }
}

// Запуск
// go test ./...
// go test -bench=.
// go test -v -cover
```

### 10.6 Другие важные пакеты

```go
// Время
import "time"
t := time.Now()
t.Format("2006-01-02 15:04:05")
t.Add(2 * time.Hour)
time.Sleep(100 * time.Millisecond)

// Криптография
import "crypto/sha256"
hash := sha256.Sum256([]byte("data"))

// Сортировка
sort.Ints([]int{3, 1, 2})
sort.Slice(s, func(i, j int) bool { return s[i].Age < s[j].Age })

// Флаги
flag.String("name", "default", "description")
flag.Parse()

// Шаблоны
import "text/template"
tmpl, _ := template.New("test").Parse("Hello, {{.Name}}!")
tmpl.Execute(os.Stdout, data)

// Логирование
log.Println("info")
log.Fatal("fatal")   // os.Exit(1)
```

---

## 11. Generics (Go 1.18+)

```go
// Функция с дженериками
func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}

// Тип с дженериками
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() T {
    if len(s.items) == 0 {
        var zero T
        return zero
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item
}

// Интерфейс с дженериками
type Numeric interface {
    ~int | ~float64
}

func Sum[T Numeric](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

// Constraints (пакет golang.org/x/exp/constraints)
// constraints.Ordered, constraints.Integer, constraints.Float
```

---

## 12. Паттерны проектирования

### 12.1 Pipeline

```go
// generator → stage1 → stage2 → consumer
func gen(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func sq(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

// Использование
for n := range sq(gen(1, 2, 3, 4)) {
    fmt.Println(n)
}
```

### 12.2 Options (Functional Options)

```go
type Server struct {
    host string
    port int
    tls  bool
}

type Option func(*Server)

func WithHost(host string) Option {
    return func(s *Server) {
        s.host = host
    }
}

func WithPort(port int) Option {
    return func(s *Server) {
        s.port = port
    }
}

func NewServer(opts ...Option) *Server {
    s := &Server{host: "localhost", port: 8080, tls: false}
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// Использование
server := NewServer(WithHost("example.com"), WithPort(443))
```

### 12.3 Worker Pool

```go
func workerPool(numWorkers int, jobs <-chan int, results chan<- int) {
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for job := range jobs {
                results <- job * 2
            }
        }(i)
    }
    wg.Wait()
    close(results)
}
```

---

## 13. Продвинутые темы

### 13.1 Reflection

```go
import "reflect"

t := reflect.TypeOf(obj)
v := reflect.ValueOf(obj)

t.Name()          // "Person"
t.Kind()          // reflect.Struct
t.NumField()      // количество полей
t.Field(0).Name   // "Name"
v.Field(0).String() // значение

// Изменение через reflection
v := reflect.ValueOf(&obj).Elem()
v.Field(0).SetString("NewName")
```

### 13.2 Unsafe

```go
import "unsafe"

// Преобразование между типами (редко, для оптимизаций)
func bytesToString(b []byte) string {
    return *(*string)(unsafe.Pointer(&b))
}
```

### 13.3 CGo

```go
/*
#include <stdlib.h>
*/
import "C"

func main() {
    cstr := C.CString("hello")
    C.free(unsafe.Pointer(cstr))
}
```

---

## 14. Инструменты

```bash
# Компиляция и запуск
go run main.go
go build -o myapp main.go
go install          # в $GOPATH/bin

# Форматирование
go fmt ./...
gofmt -w -s .

# Линтер
go vet ./...

# Модули
go mod init example.com/project
go mod tidy
go mod vendor
go get -u ./...     # обновить зависимости

# Тестирование
go test ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Профилирование
go test -bench=.
go test -cpuprofile=cpu.out
go tool pprof cpu.out

# Популярные тулы
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install github.com/air-verse/air@latest  # hot reload
```

---

## 15. Экосистема

### 15.1 Популярные библиотеки

| Библиотека | Назначение |
|-----------|-----------|
| Gin / Echo / Chi / Fiber | HTTP роутеры |
| GORM / sqlx | ORM / работа с БД |
| Viper | Конфигурация |
| Cobra | CLI (kubectl, hugo) |
| Zap / Logrus | Логирование |
| testify | Тестирование (assert, mock) |
| gRPC-Go | gRPC |
| Prometheus client | Метрики |
| fsnotify | Наблюдение за файлами |
| embed (stdlib) | Встраивание файлов |

### 15.2 Базы данных

```go
// database/sql
import "database/sql"
import _ "github.com/lib/pq"  // PostgreSQL

db, err := sql.Open("postgres", "postgres://user:pass@localhost/db")
rows, err := db.Query("SELECT id, name FROM users WHERE age > $1", 18)
for rows.Next() {
    var id int
    var name string
    rows.Scan(&id, &name)
}

// SQLC — генерация кода из SQL
// sqlc generate → type-safe Go код
```

### 15.3 CI/CD

```yaml
# .github/workflows/go.yml
name: Go
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: "1.23"
      - run: go build ./...
      - run: go vet ./...
      - run: go test -cover ./...
```

---

## 16. Частые ошибки

1. **Игнорирование ошибок**
   ```go
   // Плохо
   json.Unmarshal(data, &obj)
   
   // Хорошо
   if err := json.Unmarshal(data, &obj); err != nil {
       log.Fatal(err)
   }
   ```

2. **Гонка данных (data race)**
   ```go
   // go run -race main.go
   var counter int
   go func() { counter++ }()
   counter++  // race!
   ```

3. **Забытый `()` в defer**
   ```go
   defer fmt.Println("done")()  // ошибка!
   defer func() { fmt.Println("done") }()  // правильно
   ```

4. **Цикл с замыканием**
   ```go
   for _, v := range vals {
       go func() { fmt.Println(v) }()  // баг: все увидят последнее значение
       go func(val string) { fmt.Println(val) }(v)  // правильно
   }
   ```

5. **Использование `nil` map**
   ```go
   var m map[string]int
   m["key"] = 1  // panic! Используйте make()
   ```

6. **Копирование мьютекса**
   ```go
   // Mutex нельзя копировать (передавайте по указателю)
   ```

7. **Закрытие канала дважды**
   ```go
   // close(ch) — только один раз!
   ```

---

## 17. Производительность

```go
// Избегайте аллокаций
var buf bytes.Buffer
for _, s := range strings {
    buf.WriteString(s)
}
result := buf.String()  // лучше чем s1 + s2 + s3

// Пул объектов
var pool = sync.Pool{
    New: func() any {
        return make([]byte, 1024)
    },
}

buf := pool.Get().([]byte)
defer pool.Put(buf)

// Escape analysis
// Если переменная не escape'ит — на стеке, иначе на куче

// Профилирование
import _ "net/http/pprof"
// http://localhost:6060/debug/pprof/

// Benchmarks
func BenchmarkX(b *testing.B) {
    for i := 0; i < b.N; i++ {
        X()
    }
}
```

---

## 18. Ресурсы

- **go.dev/doc** — официальная документация
- **gobyexample.com** — примеры кода
- **golang.org/wiki** — best practices, статьи
- **Effective Go** — как писать по-гошному
- **YouTube: JustForFunc** — глубокие темы
- **YouTube: Anthony GG** — Go туториалы
- **Awesome Go** — список библиотек

---

## 19. Практические упражнения

### 19.1 Базовые

1. Напишите функцию, которая проверяет, является ли строка палиндромом.
2. Реализуйте срез (stack) с generic-типом.
3. Напишите HTTP сервер с JSON API.
4. Реализуйте Word Count с `map`.
5. Напишите CLI утилиту с `flag`.

### 19.2 Средние

1. Реализуйте Worker Pool с каналами.
2. Напишите Rate Limiter с использованием `time.Ticker`.
3. Сделайте параллельный web scraper.
4. Реализуйте LRU cache с sync.RWMutex.
5. Напишите middleware для HTTP (логирование, авторизация).

### 19.3 Продвинутые

1. Напишите свой Event Loop на каналах.
2. Реализуйте паттерн Circuit Breaker.
3. Напишите gRPC сервер/клиент.
4. Реализуйте distributed counter с etcd/redis.
5. Напишите интерпретатор простого языка.

---

## 🎓 Курс

| Unit | Тема | Содержание |
|------|------|-----------|
| [Unit 1](unit-01/syntax.md) | Основы | Переменные, типы, условия, циклы, функции, структуры |
| [Unit 2](unit-02/syntax.md) | Методы и интерфейсы | Методы, интерфейсы, ошибки, файлы, JSON |
| [Unit 3](unit-03/syntax.md) | Горутины и веб | Горутины, каналы, select, HTTP сервер, WaitGroup |

Каждый unit включает: теорию, задачи, проекты.

- [Unit 1: задачи](unit-01/practice.md) | [Unit 2: задачи](unit-02/practice.md) | [Unit 3: проекты](unit-03/practice.md)

---

*Полный конспект Go. Регулярно дополняется.*
