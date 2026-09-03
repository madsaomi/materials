# Go — Unit 3: Горутины, каналы, веб

## Горутины

```go
func sayHello() {
    fmt.Println("Hello from goroutine!")
}

func main() {
    go sayHello()  // запуск в отдельной горутине
    time.Sleep(100 * time.Millisecond)
}
```

## Каналы

```go
func main() {
    ch := make(chan int)

    // отправка в горутине
    go func() {
        ch <- 42
    }()

    // получение
    val := <-ch
    fmt.Println(val)  // 42
}
```

## Каналы с буфером

```go
ch := make(chan string, 2)
ch <- "hello"
ch <- "world"
fmt.Println(<-ch)  // hello
fmt.Println(<-ch)  // world
```

## select

```go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    go func() { time.Sleep(1 * time.Second); ch1 <- "one" }()
    go func() { time.Sleep(2 * time.Second); ch2 <- "two" }()

    select {
    case msg := <-ch1:
        fmt.Println(msg)
    case msg := <-ch2:
        fmt.Println(msg)
    case <-time.After(3 * time.Second):
        fmt.Println("timeout")
    }
}
```

## WaitGroup

```go
func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d started\n", id)
    time.Sleep(time.Second)
}

func main() {
    var wg sync.WaitGroup
    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }
    wg.Wait()
    fmt.Println("All done")
}
```

## HTTP сервер

```go
import "net/http"

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServe(":8080", nil)
}
```

## HTTP клиент

```go
resp, _ := http.Get("https://api.github.com")
defer resp.Body.Close()
body, _ := io.ReadAll(resp.Body)
fmt.Println(string(body))
```

## Задачи

1. Напишите программу, запускающую 5 горутин, печатающих свои номера
2. Напишите простой HTTP-сервер с двумя эндпоинтами: /hello и /time
3. Используя каналы, реализуйте пайплайн: generate → square → print
4. Напишите программу, параллельно скачивающую 3 URL

---

## 1. Модель конкурентности в Go

**Конкурентность (concurrency)** — это композиция независимо выполняющихся задач.
Это НЕ то же самое, что **параллелизм (parallelism)** — одновременное выполнение на
нескольких ядрах. Конкурентность — про *структуру программы*, параллелизм — про
*выполнение*. Go строит конкурентные программы через горутины и каналы, а как именно
они выполняются — решает планировщик.

### 1.1 Горутина vs поток ОС

| Параметр | Горутина | Поток ОС |
|---|---|---|
| Начальный размер стека | ~2 КБ | 1–8 МБ |
| Рост стека | динамический, автоматический | фиксированный |
| Максимум на процесс | миллионы | тысячи |
| Стоимость создания | наносекунды | микросекунды |
| Переключение контекста | планировщик Go (user-space) | ядро ОС |
| Каналы | встроенный механизм | нет |
| ID / управление | нет прямого управления | есть системные API |

Благодаря маленькому стеку и дешёвому переключению горутин можно запускать тысячи
и миллионы, не опасаясь утечки ресурсов. "Не делитесь памятью, общайтесь; общаясь —
делитесь" (Роб Пайк) — вот идеология Go.

### 1.2 Когда горутина попадает на другой поток

Планировщик Go (модель GMP) может переключать горутину без участия ОС в точках:

- операции с каналами (приём/отправка),
- блокирующие системные вызовы,
- `runtime.Gosched()`,
- длинные циклы без вызовов (могут "заморозить" горутину на ядре).

```go
import "runtime"

func main() {
    runtime.GOMAXPROCS(runtime.NumCPU()) // число потоков ОС для горутин
    fmt.Println("CPU:", runtime.NumCPU())
}
```

## 2. Горутины: детальный разбор

### 2.1 Запуск и аргументы

Ключевое слово `go` запускает функцию в новой горутине. Аргументы копируются
**в момент запуска**, поэтому передавать их параметром безопасно.

```go
func printNum(n int) {
    fmt.Println(n)
}

func main() {
    for i := 1; i <= 5; i++ {
        go printNum(i) // каждый вызов получает свою копию i
    }
    time.Sleep(100 * time.Millisecond)
}
```

### 2.2 Анонимные функции и замыкания (ловушка!)

Замыкание захватывает переменную **по ссылке**. В цикле это приводит к тому, что все
горутины увидят последнее значение переменной (до Go 1.22 — и в range тоже):

```go
for i := 1; i <= 3; i++ {
    go func() { fmt.Println(i) }() // все напечатают 3 (или 4)
}

// Правильное решение — передать копию параметром:
for i := 1; i <= 3; i++ {
    go func(n int) { fmt.Println(n) }(i)
}
```

### 2.3 Жизненный цикл

- `main` — это тоже горутина. Когда `main` завершается, программа завершается
  **немедленно**, не дожидаясь остальных горутин.

- Поэтому примеры с `time.Sleep` в конце `main` — лишь учебный приём; в реальном коде
  используют `sync.WaitGroup` или каналы.

- У горутины **нет возврата значения** напрямую — результат передают через канал.

```go
func compute() <-chan int {
    out := make(chan int)
    go func() { out <- 2 + 2 }()
    return out
}

func main() {
    fmt.Println(<-compute()) // 4
}
```

## 3. Каналы: детальный разбор

Канал — типизированная "труба", через которую одна горутина отправляет данные, а другая
получает. Каналы создаются через `make`, инициализируются до нуля (nil) только при
объявлении `var`.

### 3.1 Операции с каналом

| Выражение | Смысл | Поведение |
|---|---|---|
| `ch <- v` | отправка | блокирует, пока не получено / не найдено место в буфере |
| `v := <-ch` | получение | блокирует, пока нет данных |
| `v, ok := <-ch` | получение с флагом | `ok == false`, если канал закрыт и пуст |
| `close(ch)` | закрытие | отправка после close → panic |
| `range ch` | итерация | идёт, пока канал не закрыт |

### 3.2 Небуферизированный канал — синхронный

Отправка и получение происходят **одновременно**: отправитель стоит, пока получатель
не придёт, и наоборот. Это готовый механизм синхронизации без shared-переменных.

```go
func main() {
    done := make(chan struct{}) // struct{} — сигнал без данных
    go func() {
        fmt.Println("работаю...")
        time.Sleep(time.Second)
        close(done) // закрытие = сигнал "готово"
    }()
    <-done // main ждёт
    fmt.Println("main завершился")
}
```

### 3.3 Буферизированный канал

Отправка не блокируется, пока в буфере есть место. Получение не блокируется, пока
буфер не пуст.

```go
ch := make(chan int, 3)
ch <- 1
ch <- 2
ch <- 3 // буфер полон (len==cap==3)
fmt.Println(len(ch), cap(ch)) // 3 3
fmt.Println(<-ch)             // 1, теперь len==2
```

Полезная формула: буфер размера N означает, что отправитель может "забежать вперёд"
не более чем на N значений.

### 3.4 Направленные (односторонние) каналы

Указывать направление можно в сигнатуре функции — это самодокументация и защита от
ошибок времени компиляции.

```go
func producer(out chan<- int) { // только отправка
    for i := 0; i < 5; i++ {
        out <- i
    }
    close(out)
}

func consumer(in <-chan int) { // только получение
    for v := range in {
        fmt.Println(v)
    }
}

func main() {
    ch := make(chan int)
    go producer(ch)
    consumer(ch)
}
```

### 3.5 nil-канал

Канал-ноль (`var ch chan int`) навсегда блокирует и отправку, и получение. Это
используют сознательно: ветка `select` с nil-каналом просто никогда не срабатывает
(временное отключение обработчика).

```go
var ch chan int
go func() {
    ch <- 1 // вечная блокировка, никто не заберёт
}()
```

### 3.6 Закрытие канала: кому закрывать?

- Закрывает **отправитель**. Закрывать канал приёмнику — ошибка (panic).
- `close` на уже закрытом канале — panic; отправка в закрытый — panic.
- Закрытие не "сбрасывает" канал: читатель получает оставшиеся значения, потом zero-value
  с `ok == false`.

```go
func main() {
    ch := make(chan int)
    go func() {
        ch <- 10
        close(ch)
    }()
    v, ok := <-ch // 10, true
    v2, ok2 := <-ch // 0, false — канал исчерпан
}
```

## 4. select: детальный разбор

`select` ждёт первое готовое событие из нескольких каналов. **Важно**: если готовы
несколько веток, выбирается одна **случайная**. Порядок `case` не гарантирует
приоритета.

### 4.1 default — неблокирующая проверка

```go
select {
case v := <-ch:
    fmt.Println("получили:", v)
default:
    fmt.Println("данных нет — работаем дальше")
}
```

### 4.2 Таймаут и тикер

```go
ch := make(chan int)
go func() { time.Sleep(3 * time.Second); ch <- 1 }()

select {
case v := <-ch:
    fmt.Println(v)
case <-time.After(1 * time.Second):
    fmt.Println("слишком долго, выходим")
}

// Периодическое выполнение
ticker := time.NewTicker(500 * time.Millisecond)
for range ticker.C {
    fmt.Println("тик")
}
```

### 4.3 Паттерн for-select

Цикл с `select` — главный паттерн долгоживущих горутин (работы + сигнал остановки).

```go
func worker(stop <-chan struct{}) {
    for {
        select {
        case <-stop:
            fmt.Println("останавливаюсь")
            return
        default:
            fmt.Println("работаю")
            time.Sleep(200 * time.Millisecond)
        }
    }
}

func main() {
    stop := make(chan struct{})
    go worker(stop)
    time.Sleep(700 * time.Millisecond)
    close(stop)
    time.Sleep(100 * time.Millisecond)
}
```

### 4.4 select с nil-каналами

```go
var disabled chan int // nil — ветка выключена

select {
case v := <-disabled: // никогда не сработает
    fmt.Println(v)
case v := <-active:
    fmt.Println("активный:", v)
}
```

## 5. sync: примитивы синхронизации

### 5.1 WaitGroup

Ждёт завершения горутин. Правила: `Add` вызывают **до** `go` (в той же горутине),
`Done` — по одному разу на горутину, обычно через `defer`.

```go
var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)
    go func(u string) {
        defer wg.Done()
        fetch(u)
    }(url)
}
wg.Wait()
```

### 5.2 Mutex

Защищает критическую секцию от гонки данных.

```go
var mu sync.Mutex
counter := 0

for i := 0; i < 1000; i++ {
    go func() {
        mu.Lock()
        counter++
        mu.Unlock()
    }()
}
```

`sync.Mutex` нельзя копировать после первого использования — передавайте указатель.

### 5.3 RWMutex

Много читателей + один писатель: чтение не блокирует чтение.

```go
var rw sync.RWMutex
cache := make(map[string]string)

func Get(k string) string {
    rw.RLock()
    defer rw.RUnlock()
    return cache[k]
}

func Set(k, v string) {
    rw.Lock()
    defer rw.Unlock()
    cache[k] = v
}
```

### 5.4 Once

Выполняет функцию ровно один раз даже при конкурентных вызовах (ленивая инициализация).

```go
var once sync.Once

func initConfig() {
    once.Do(func() {
        config = loadFromDisk()
    })
}
```

### 5.5 atomic

Для простых счётчиков атомарные операции быстрее мьютекса и без гонок.

```go
var count atomic.Int64 // Go 1.19+

count.Add(1)
n := count.Load()       // прочитать
count.Store(42)         // записать
count.Swap(7)
ok := count.CompareAndSwap(7, 8)
```

## 6. Паттерн Worker Pool

Фиксированный пул воркеров читает задания из канала и пишет результаты. Это
контролирует степень параллелизма и защищает от перегрузки.

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * j
    }
}

func main() {
    const workers = 3
    jobs := make(chan int, 10)
    results := make(chan int, 10)

    for w := 1; w <= workers; w++ {
        go worker(w, jobs, results)
    }

    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)

    for r := 1; r <= 9; r++ {
        fmt.Println("результат:", <-results)
    }
}
```

## 7. Паттерны Pipeline, Fan-out, Fan-in

Pipeline — цепочка каналов, где каждая стадия превращает вход в выход.

```
производитель → фильтр → агрегатор → потребитель
    gen()  →   sq()   →   в main
```

```go
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
```

**Fan-out**: запустить несколько стадий на одном входе (каждый элемент обработает одна).
**Fan-in**: собрать результаты нескольких каналов в один.

```go
// fan-in: свести out1 и out2 в один поток
func merge(chs ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int)

    collect := func(c <-chan int) {
        defer wg.Done()
        for v := range c {
            out <- v
        }
    }

    wg.Add(len(chs))
    for _, c := range chs {
        go collect(c)
    }

    go func() {
        wg.Wait()
        close(out)
    }()
    return out
}

func main() {
    out1 := sq(gen(1, 2, 3))
    out2 := sq(gen(4, 5, 6))
    for v := range merge(out1, out2) {
        fmt.Println(v)
    }
}
```

## 8. Context: отмена и таймауты

`context.Context` передаёт дедлайн, отмену и значения через всю цепочку вызовов —
обязательный параметр для серверов и бэкендов.

| Конструктор | Назначение |
|---|---|
| `context.Background()` | корень, не отменяемый |
| `context.WithCancel(parent)` | ручная отмена через `cancel()` |
| `context.WithTimeout(parent, d)` | автозавершение через `d` |
| `context.WithDeadline(parent, t)` | автозавершение к моменту `t` |
| `context.WithValue(parent, k, v)` | хранение значений |

```go
func doJob(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err() // context.Canceled или DeadlineExceeded
        default:
            fmt.Println("выполняю...")
            time.Sleep(100 * time.Millisecond)
        }
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
    defer cancel()
    err := doJob(ctx)
    fmt.Println(err) // context deadline exceeded
}
```

HTTP-запрос с контекстом автоматически отменяется клиентом при истечении таймаута:

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

req, err := http.NewRequestWithContext(ctx, "GET", "https://example.com", nil)
if err != nil { /* ... */ }
resp, err := http.DefaultClient.Do(req)
```

## 9. errgroup: горутины с ошибками

Пакет `golang.org/x/sync/errgroup` — как WaitGroup, но возвращает первую ошибку и
умеет отменять контекст.

```bash
go get golang.org/x/sync/errgroup
```

```go
import "golang.org/x/sync/errgroup"

func main() {
    var g errgroup.Group

    for _, u := range urls {
        g.Go(func() error { return fetch(u) })
    }

    if err := g.Wait(); err != nil {
        fmt.Println("первая ошибка:", err)
    }
}
```

## 10. HTTP-сервер в деталях

### 10.1 ServeMux и маршруты (Go 1.22+)

Современный `ServeMux` поддерживает методы и шаблоны путей:

```go
mux := http.NewServeMux()

mux.HandleFunc("GET /users/{id}", getUsers)     // только GET, id — параметр
mux.HandleFunc("POST /users", createUser)
mux.HandleFunc("DELETE /users/{id}", deleteUser)
mux.HandleFunc("GET /static/", serveStatic)
mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    http.Error(w, "не найдено", http.StatusNotFound)
})

http.ListenAndServe(":8080", mux)

func getUsers(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id") // значение из {id}
    fmt.Fprintf(w, "user: %s", id)
}
```

### 10.2 Ответ и коды статуса

```go
func handler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    w.WriteHeader(http.StatusCreated) // 201, до любых Write
    w.Write([]byte(`{"ok":true}`))
}
```

**Правило**: сначала `Header().Set(...)`, затем `WriteHeader`, потом `Write`.

### 10.3 JSON API

```go
func apiHandler(w http.ResponseWriter, r *http.Request) {
    type Req struct {
        Name string `json:"name"`
        Age  int    `json:"age"`
    }
    type Resp struct {
        Greeting string `json:"greeting"`
    }

    var req Req
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "плохой JSON", http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(Resp{
        Greeting: fmt.Sprintf("Привет, %s (%d)", req.Name, req.Age),
    })
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("POST /greet", apiHandler)
    http.ListenAndServe(":8080", mux)
}
```

### 10.4 Middleware

Middleware — функция, оборачивающая handler: здравый смысл для логов, auth, CORS, rate limit.

```go
func logMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        fmt.Printf("%s %s за %v\n", r.Method, r.URL.Path, time.Since(start))
    })
}

mux := http.NewServeMux()
mux.HandleFunc("/", handler)
http.ListenAndServe(":8080", logMiddleware(mux))
```

### 10.5 Статические файлы

```go
mux.Handle("GET /assets/", http.StripPrefix("/assets/",
    http.FileServer(http.Dir("./static"))))
// http://host/assets/style.css → ./static/style.css
```

### 10.6 Шаблоны html/template

```go
import "html/template"

var tmpl = template.Must(template.ParseFiles("index.html"))

func page(w http.ResponseWriter, r *http.Request) {
    tmpl.Execute(w, map[string]string{"Title": "Привет", "Name": "Мир"})
}
```

```html
<h1>{{.Title}}, {{.Name}}!</h1>
```

`html/template` автоматически экранирует данные — защита от XSS.

## 11. HTTP-клиент в деталях

### 11.1 Свой http.Client

`http.Get` использует `DefaultClient` без таймаута — это опасно. Создавайте клиента с
`Timeout` и переиспользуйте (внутри пул соединений):

```go
client := &http.Client{
    Timeout: 5 * time.Second,
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 20,
        IdleConnTimeout:     90 * time.Second,
    },
}
```

### 11.2 Полный запрос с заголовками и JSON

```go
import (
    "bytes"
    "context"
    "encoding/json"
    "net/http"
    "time"
)

func createUser(ctx context.Context, name string) error {
    body, _ := json.Marshal(map[string]string{"name": name})

    req, err := http.NewRequestWithContext(ctx, http.MethodPost,
        "https://api.example.com/users", bytes.NewReader(body))
    if err != nil {
        return err
    }
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer <token>")

    client := &http.Client{Timeout: 3 * time.Second}
    resp, err := client.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    if resp.StatusCode >= 400 {
        return fmt.Errorf("статус %d", resp.StatusCode)
    }

    var result map[string]any
    return json.NewDecoder(resp.Body).Decode(&result)
}
```

### 11.3 Таблица методов пакета http

| Вызов | Метод HTTP |
|---|---|
| `http.Get(url)` | GET |
| `http.Post(url, ct, body)` | POST |
| `http.PostForm(url, values)` | POST (form) |
| `http.NewRequest(method, url, body)` | любой метод (DELETE, PUT, PATCH) |
| `http.NewRequestWithContext(ctx, ...)` | любой метод с отменой |

## 12. Сводные таблицы

### 12.1 Когда блокируется канал?

| Ситуация | Результат |
|---|---|
| Отправка в небуферизированный канал без получателя | блокируется |
| Отправка в полный буферизированный канал | блокируется |
| Получение из пустого канала | блокируется |
| Отправка в закрытый канал | panic |
| Получение из закрытого пустого канала | zero value, ok=false |
| Любая операция с nil-каналом | вечная блокировка |

### 12.2 Mutex или каналы?

| Задача | Инструмент |
|---|---|
| Защита общего поля/счётчика | `sync.Mutex`, `atomic` |
| Кэш с чтением и записью | `sync.RWMutex` |
| Передача данных между горутинами | канал |
| Оповещение о событии | `chan struct{}` + `close` |
| Ожидание группы задач | `sync.WaitGroup`, `errgroup` |
| Общая приостановка работы | `context.Context` |

Читайте вслух: "я передаю значение A из горутины X в горутину Y" → нужен канал.
"Я защищаю поле от гонки" → нужен мьютекс.
