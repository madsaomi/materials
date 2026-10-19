# Go — Микро-детали

## 1. Gotchas

### 1.1 Итерация и замыкание

```go
// 🚫 Проблема: все горутины видят последнее значение
for _, v := range vals {
    go func() {
        fmt.Println(v) // все напечатают одинаковое значение
    }()
}

// ✅ Правильно: передать копию
for _, v := range vals {
    v := v  // или v := v (создать новую переменную в теле цикла)
    go func() {
        fmt.Println(v)
    }()
}

// ✅ Или как аргумент
for _, v := range vals {
    go func(val string) {
        fmt.Println(val)
    }(v)
}
```

### 1.2 nil map

```go
var m map[string]int
m["key"] = 1  // 🚫 panic! nil map assignment

// Чтение из nil map — безопасно (возвращает zero value)
fmt.Println(m["key"]) // 0

// ✅ Всегда инициализируйте:
m := make(map[string]int)
// или
m := map[string]int{}
```

### 1.3 nil slice

```go
var s []int
fmt.Println(s == nil)  // true
s = append(s, 1)       // ✅ append работает с nil slice
s[0] = 2               // 🚫 panic: index out of range

for range s { ... }    // ✅ range по nil slice безопасен
len(s)                 // ✅ 0
```

### 1.4 Каналы — состояния

| Состояние | Приём | Отправка | Закрытие |
|-----------|-------|----------|----------|
| nil | блокирует навсегда | блокирует навсегда | panic |
| Открыт | блокирует (пуст), получает | блокирует (полн), отправляет | успешно |
| Закрыт | zero value + false | panic | panic |

```go
var ch chan int // nil

<-ch  // блокируется навсегда!
ch <- 1 // блокируется навсегда!
close(ch) // panic!

ch := make(chan int)
close(ch)
<-ch  // 0, false (zero value)
ch <- 1 // panic: send on closed channel
close(ch) // panic: close of closed channel
```

### 1.5 Канал как мьютекс (одиночный буфер)

```go
ch := make(chan int, 1)
ch <- 1 // lock

<-ch // unlock

// Использование: ограничение конкурентности
limiter := make(chan struct{}, 10)
for _, task := range tasks {
    limiter <- struct{}{}  // wait for slot
    go func(t Task) {
        defer func() { <-limiter }()
        process(t)
    }(task)
}
```

### 1.6 Копирование Mutex

```go
type Counter struct {
    sync.Mutex  // 🚫 Mutex встраивание — не копировать!
    Value int
}

func (c Counter) Increment() { // передаётся по значению — копирует мьютекс!
    c.Lock()
    c.Value++
    c.Unlock()
}

// ✅ Правильно: по указателю
func (c *Counter) Increment() {
    c.Lock()
    c.Value++
    c.Unlock()
}
```

### 1.7 break в switch

```go
switch x {
case 1:
    fmt.Println("one")
    break  // избыточно, но понятно
case 2:
    fmt.Println("two")
    fallthrough  // в отличие от других языков!
case 3:
    fmt.Println("two or three")
}

// fallthrough: выполняется следующий case без проверки
```

---

## 2. Продвинутые паттерны

### 2.1 Nil-приёмник интерфейса

```go
type MyError struct {
    Msg string
}

func (e *MyError) Error() string {
    if e == nil {
        return ""
    }
    return e.Msg
}

func getError() error {
    var e *MyError = nil
    return e  // 🚫 возвращает НЕ nil интерфейс!
}

func main() {
    err := getError()
    fmt.Println(err == nil)  // false! Интерфейс != nil, хотя внутри nil
}

// ✅ Правильно:
func getError() error {
    var e *MyError = nil
    if someCondition {
        return nil  // явно вернуть nil как error
    }
    return e
}
```

### 2.2 Graceful error handling (проверка типов)

```go
var target *MyError
if errors.As(err, &target) {
    // target указывает на MyError
}

var pathError *fs.PathError
if errors.As(err, &pathError) {
    fmt.Println(pathError.Path)
}

// Последовательная проверка
if errors.Is(err, io.EOF) {
    // normal end
}
```

### 2.3 Embedded поле с конфликтом

```go
type A struct {
    Name string
}

type B struct {
    Name string
}

type C struct {
    A
    B
    Name string // своё поле переопределяет A.Name и B.Name
}

c := C{}
c.Name = "my"    // C.Name
c.A.Name = "a"   // A.Name
c.B.Name = "b"   // B.Name

// c.Name — не амбигиозно, т.к. C.Name переопределяет оба
```

### 2.4 Строгие типы — перечисление через iota

```go
type Status int

const (
    StatusUnknown Status = iota
    StatusPending
    StatusActive
    StatusInactive
    StatusDeleted
)

// Строковое представление
func (s Status) String() string {
    switch s {
    case StatusPending:
        return "pending"
    case StatusActive:
        return "active"
    // ...
    default:
        return "unknown"
    }
}

// Проверка валидности
func (s Status) Valid() bool {
    switch s {
    case StatusPending, StatusActive, StatusInactive:
        return true
    }
    return false
}
```

### 2.5 Test helpers

```go
func TestHelper(t *testing.T) {
    t.Helper() // отмечает функцию как helper — покажет правильную строку ошибки
    // ...
}

// Cleanup (1.14+)
func TestWithCleanup(t *testing.T) {
    tempDir := t.TempDir() // автоматически удаляется после теста
    db := setupDB(t)
    t.Cleanup(func() {
        db.Close()
    })
}

// Subtests
func TestGroup(t *testing.T) {
    tests := []struct{
        name string
        input int
        want  int
    }{
        {"positive", 5, 25},
        {"negative", -3, 9},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            if got := square(tt.input); got != tt.want {
                t.Errorf("square(%d)=%d, want %d", tt.input, got, tt.want)
            }
        })
    }
}
```

---

## 3. Производительность

### 3.1 Escape analysis

```go
// На стеке (не escape'ит)
func sum() int {
    nums := [3]int{1, 2, 3} // на стеке
    return nums[0] + nums[1]
}

// На куче (escape'ит)
func sum() *[3]int {
    nums := &[3]int{1, 2, 3} // escape'ит на кучу
    return nums
}

// fmt.Printf заставляет escape'ить строки
func format(n int) string {
    return fmt.Sprintf("%d", n) // n escape'ит
}
// 🔁 strconv.Itoa(n) — не escape'ит
```

### 3.2 Что быстрее

| Операция | Время | Примечание |
|----------|-------|------------|
| `make([]int, n)` | O(n) | выделение памяти |
| `append` без cap | O(n) амортиз. | копирование при переполнении |
| `s[i]` | O(1) | прямой доступ |
| `range slice` | O(n) | быстрее C-style for для слайсов |
| `map[key]` | O(1) | амортизированно |
| `json.Marshal` | ~200ns | отражение (reflection) |
| `string +` | O(n) | новая аллокация |
| `strings.Builder` | O(n) | ✅ для конкатенации |

### 3.3 Избегайте аллокаций

```go
// 🚫 Плохо: много аллокаций
func ConcatWrong(parts []string) string {
    result := ""
    for _, p := range parts {
        result += p  // новая строка на каждую итерацию
    }
    return result
}

// ✅ Хорошо
func ConcatGood(parts []string) string {
    var b strings.Builder
    for _, p := range parts {
        b.WriteString(p)
    }
    return b.String()
}

// ✅ Ещё быстрее с предварительным выделением
func ConcatPrealloc(parts []string) string {
    var total int
    for _, p := range parts {
        total += len(p)
    }
    var b strings.Builder
    b.Grow(total)
    for _, p := range parts {
        b.WriteString(p)
    }
    return b.String()
}
```

---

## 4. Сборщик мусора

### 4.1 GOGC

```go
// GOGC=100 (default) — GC когда куча выросла на 100%
// GOGC=off — отключить GC
// GOGC=200 — реже GC (больше памяти, меньше CPU)
// GOGC=50 — чаще GC (меньше памяти, больше CPU)

// В коде:
import "runtime/debug"
debug.SetGCPercent(200)  // реже GC
debug.FreeOSMemory()     // форсировать освобождение
```

### 4.2 Утечки памяти

```go
// 1. Держать ссылку на большой слайс
func getSubslice() []byte {
    data := readLargeFile() // 100MB
    return data[:10]        // держит ВЕСЬ 100MB в памяти!
}
// ✅ Правильно: копировать
func getSubsliceOK() []byte {
    data := readLargeFile()
    out := make([]byte, 10)
    copy(out, data[:10])
    return out
}

// 2. Забытая горутина
// 3. Неудалённый элемент из map
// 4. Строки из слайса байт (string переиспользует underlying []byte)
```

---

## 5. Синхронизация — нюансы

### 5.1 sync.Map — когда использовать

```go
var m sync.Map

// ✅ Только для:
// 1. Write-heavy с конкурентностью
// 2. Когда ключи создаются один раз и читаются много
// 3. Когда разные горутины работают с разными ключами

// 🚫 НЕ для:
// Чтения/записи одного ключа из многих горутин (обычный map + RWMutex быстрее)

// Использование:
m.Store("key", "value")
val, ok := m.Load("key")
m.Delete("key")
m.LoadOrStore("key", "default")
m.Range(func(key, val any) bool { return true })
```

### 5.2 sync.Pool

```go
var bufferPool = sync.Pool{
    New: func() any {
        return new(bytes.Buffer)
    },
}

func process() {
    buf := bufferPool.Get().(*bytes.Buffer)
    defer bufferPool.Put(buf)
    buf.Reset()
    // use buf
}
// Пул очищается GC — не использовать для долгоживущих данных!
```

### 5.3 Context — продвинутое

```go
// Значения в контексте — только для request-scoped данных
type contextKey string
const userKey contextKey = "user"

ctx := context.WithValue(context.Background(), userKey, "alice")
user := ctx.Value(userKey).(string)

// Таймаут — обязательно defer cancel
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()  // иначе утечка!

// AfterFunc (1.21+)
cancel := context.AfterFunc(ctx, func() {
    log.Println("context cancelled")
})
```

---

## 6. Рефлексия — эффективное использование

```go
// Копирование значений без знания типа (медленно)
func Copy(dst, src any) {
    dv := reflect.ValueOf(dst).Elem()
    sv := reflect.ValueOf(src).Elem()
    dv.Set(sv)
}

// Iterate struct fields
func Inspect(obj any) {
    v := reflect.ValueOf(obj)
    t := v.Type()
    for i := range v.NumField() {
        fmt.Printf("%s: %v\n", t.Field(i).Name, v.Field(i).Interface())
    }
}

// Проверка типа — быстрее type assertion, чем reflection
var i any = "hello"
if s, ok := i.(string); ok {
    fmt.Println(s)
}
```

---

## 7. JSON — продвинутые нюансы

```go
// Control zero values
type User struct {
    Name  string `json:"name,omitempty"`  // пропустить если пусто
    Email string `json:"email,omitempty"`
    Tags  []string `json:"tags,omitempty"`
}

// Custom marshaling
type Duration time.Duration

func (d Duration) MarshalJSON() ([]byte, error) {
    return json.Marshal(time.Duration(d).String())
}

func (d *Duration) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    dur, err := time.ParseDuration(s)
    if err != nil {
        return err
    }
    *d = Duration(dur)
    return nil
}

// Raw message (отложенный парсинг)
type Event struct {
    Type string          `json:"type"`
    Data json.RawMessage `json:"data"` // парсится позже
}
```

---

*Микро-детали Go. Дополняется.*
