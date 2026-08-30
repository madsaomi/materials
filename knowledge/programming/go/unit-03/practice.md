# Go — Unit 3: Проекты

## Проект 1: HTTP-сервер

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type Response struct {
    Message string `json:"message"`
    Time    string `json:"time"`
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
    resp := Response{
        Message: "Hello, World!",
        Time:    time.Now().Format(time.RFC3339),
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
}

func main() {
    http.HandleFunc("/api/hello", helloHandler)
    fmt.Println("Server on :8080")
    http.ListenAndServe(":8080", nil)
}
```

## Проект 2: Параллельный пайплайн

```go
package main

import "fmt"

func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

func main() {
    // пайплайн
    for result := range square(generate(1, 2, 3, 4, 5)) {
        fmt.Println(result)  // 1, 4, 9, 16, 25
    }
}
```

## Проект 3: Параллельный загрузчик

```go
package main

import (
    "fmt"
    "io"
    "net/http"
    "os"
    "sync"
)

func download(url string, wg *sync.WaitGroup) {
    defer wg.Done()
    resp, err := http.Get(url)
    if err != nil { return }
    defer resp.Body.Close()

    filename := url[strings.LastIndex(url, "/")+1:]
    file, _ := os.Create(filename)
    defer file.Close()
    
    written, _ := io.Copy(file, resp.Body)
    fmt.Printf("Скачан %s: %d байт\n", filename, written)
}

func main() {
    urls := []string{
        "https://httpbin.org/image/jpeg",
        "https://httpbin.org/image/png",
        "https://httpbin.org/image/webp",
    }
    var wg sync.WaitGroup
    for _, url := range urls {
        wg.Add(1)
        go download(url, &wg)
    }
    wg.Wait()
    fmt.Println("Всё скачано!")
}
```

## Ответы

1. `for i:=1; i<=5; i++ { go func(id int) { fmt.Println(id) }(i) }`
2. См. проект HTTP-сервер выше
3. `out := make(chan int); go func() { for _, n := range nums { out <- n*n }; close(out) }()`
4. См. проект параллельного загрузчика

---

## 1. Упражнения: горутины и каналы

### Блок A: базовые (1–10)

**1.** Запустите 5 горутин, каждая печатает свой номер, и дождитесь их через WaitGroup.

```go
var wg sync.WaitGroup
for i := 1; i <= 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        fmt.Println("горутина", n)
    }(i)
}
wg.Wait()
fmt.Println("все завершились")
```

**2.** Напишите функцию `isEven`, которая через канал возвращает результат проверки числа.

```go
func isEven(n int) <-chan bool {
    out := make(chan bool)
    go func() { out <- n%2 == 0 }()
    return out
}
fmt.Println(<-isEven(10)) // true
```

**3.** Создайте буферизированный канал `(capacity 2)`, отправьте "a", "b", "c" без
блокировки «вручную» — объяснение, почему третья отправка заблокирует горутину.

```go
func main() {
    ch := make(chan string, 2)
    ch <- "a"
    ch <- "b"
    go func() { ch <- "c" }() // в буфере нет места, но это отдельная горутина
    time.Sleep(100 * time.Millisecond)
    fmt.Println(len(ch)) // 2
    fmt.Println(<-ch, <-ch, <-ch) // a b c
}
```

**4.** Напишите функцию, которая принимает `<-chan int` и возвращает сумму чисел, пока
канал не закроется.

```go
func sumAll(in <-chan int) int {
    total := 0
    for v := range in {
        total += v
    }
    return total
}
```

**5.** Реализуйте таймер: горутина посит сообщение в канал через 2 секунды; `select`
должен поймать значение и напечатать «прошло 2 сек».

```go
ch := make(chan string)
go func() {
    time.Sleep(2 * time.Second)
    ch <- "звонок"
}()
select {
case msg := <-ch:
    fmt.Println(msg)
case <-time.After(3 * time.Second):
    fmt.Println("слишком рано")
}
```

**6.** Напишите конкурентный счётчик с `sync.Mutex`: 100 горутин, каждая делает 1000
инкрементов. Ответ должен быть ровно 100000.

```go
var mu sync.Mutex
counter := 0
var wg sync.WaitGroup
for i := 0; i < 100; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        for j := 0; j < 1000; j++ {
            mu.Lock()
            counter++
            mu.Unlock()
        }
    }()
}
wg.Wait()
fmt.Println(counter) // 100000
```

**7.** Перепишите счётчик из задачи 6, используя `sync/atomic` вместо Mutex.

```go
var counter atomic.Int64
// внутри горутины:
counter.Add(1)
// после Wait:
fmt.Println(counter.Load()) // 100000
```

**8.** Реализуйте «остановку по сигналу»: воркер бесконечно печатает «тик», main через
секунду закрывает канал `stop`, воркер завершается.

```go
stop := make(chan struct{})
go func() {
    t := time.NewTicker(100 * time.Millisecond)
    defer t.Stop()
    for {
        select {
        case <-stop:
            fmt.Println("стоп")
            return
        case <-t.C:
            fmt.Println("тик")
        }
    }
}()
time.Sleep(500 * time.Millisecond)
close(stop)
time.Sleep(50 * time.Millisecond)
```

**9.** Используя `forEach + каналы`, напишите генератор чисел Фибоначчи, отдающий значения
по одному.

```go
func fib(n int) <-chan int {
    out := make(chan int)
    go func() {
        a, b := 0, 1
        for i := 0; i < n; i++ {
            out <- a
            a, b = b, a+b
        }
        close(out)
    }()
    return out
}
for v := range fib(8) {
    fmt.Println(v) // 0 1 1 2 3 5 8 13
}
```

**10.** Напишите программу, которая печатает «Hello» и «World» попеременно из двух
горутин (без гонок — через канал-разрешение).

```go
turn := make(chan struct{})
done := make(chan struct{})
go func() {
    for i := 0; i < 3; i++ {
        <-turn
        fmt.Println("Hello")
    }
    close(done)
}()
go func() {
    for i := 0; i < 3; i++ {
        fmt.Println("World")
        turn <- struct{}{}
        time.Sleep(50 * time.Millisecond)
    }
}()
<-done
```

### Блок B: средние (11–15)

**11.** Worker Pool: 3 воркера обрабатывают 10 заданий (каждое — sleep + вывод номера).
Проверьте, что все 10 заданий выполнены.

```go
jobs := make(chan int)
var wg sync.WaitGroup

for w := 1; w <= 3; w++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        for job := range jobs {
            time.Sleep(100 * time.Millisecond)
            fmt.Printf("воркер %d выполнил %d\n", id, job)
        }
    }(w)
}
for j := 1; j <= 10; j++ {
    jobs <- j
}
close(jobs)
wg.Wait()
```

**12.** Fan-in: объедините каналы `a` (числа 1..3) и `b` (числа 4..6) в один поток.

```go
func merge(a, b <-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    wg.Add(2)
    pump := func(c <-chan int) {
        defer wg.Done()
        for v := range c {
            out <- v
        }
    }
    go pump(a)
    go pump(b)
    go func() { wg.Wait(); close(out) }()
    return out
}
// gen(1,2,3) и gen(4,5,6) — как в проекте 2
```

**13.** Реализуйте `/health` эндпоинт, который отвечает 200 OK, и `/metrics`, который
считает количество запросов с помощью `atomic.Int64`.

```go
var requests atomic.Int64

func counter(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        requests.Add(1)
        next(w, r)
    }
}
mux := http.NewServeMux()
mux.HandleFunc("GET /health", counter(func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprint(w, "ok")
}))
mux.HandleFunc("GET /metrics", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "requests: %d\n", requests.Load())
})
http.ListenAndServe(":8080", mux)
```

**14.** HTTP-клиент с таймаутом: запросите `https://httpbin.org/delay/5` с
`context.WithTimeout` 2 секунды и обработайте ошибку отмены.

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "https://httpbin.org/delay/5", nil)
resp, err := http.DefaultClient.Do(req)
if err != nil {
    if errors.Is(err, context.DeadlineExceeded) {
        fmt.Println("таймаут!")
    } else {
        fmt.Println("ошибка:", err)
    }
    return
}
defer resp.Body.Close()
```

**15.** Напишите паттерн «задано N попыток»: горутина пытается выполнить работу до тех
пор, пока не получит успех или не исчерпает 3 попытки.

```go
attempts := func(ctx context.Context, fn func() error, n int) error {
    var err error
    for i := 0; i < n; i++ {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }
        if err = fn(); err == nil {
            return nil
        }
        time.Sleep(200 * time.Millisecond)
    }
    return err
}
```

### Блок C: веб (16–20)

**16.** JSON API «калькулятор»: POST /calc с `{"a":2,"b":3}` возвращает `{"sum":5}`.

```go
type calcReq struct {
    A int `json:"a"`
    B int `json:"b"`
}
type calcResp struct {
    Sum int `json:"sum"`
}

mux.HandleFunc("POST /calc", func(w http.ResponseWriter, r *http.Request) {
    var req calcReq
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "bad json", http.StatusBadRequest)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(calcResp{Sum: req.A + req.B})
})
```

**17.** Middleware-логирование с измерением времени, применённое к двум эндпоинтам.

```go
func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
```

**18.** Сервер, отдающий статические файлы из папки `public` по адресу `/static/`.

```go
mux := http.NewServeMux()
mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.Dir("public"))))
```

**19.** Страница через `html/template`, которая выводит список задач и защищена от XSS
(передайте злонамеренную строку в Name и проверьте экранирование).

```go
tmpl := template.Must(template.New("t").Parse("<ul>{{range .}}<li>{{.Name}}</li>{{end}}</ul>"))

type Item struct{ Name string }

http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    items := []Item{{Name: "<script>alert(1)</script>"}, {Name: "купить молоко"}}
    tmpl.Execute(w, items)
})
http.ListenAndServe(":8080", nil)
```

**20.** Полный цикл клиент-сервер: клиент отправляет GET /ping, сервер отвечает pong.
Проверьте обработку `resp.StatusCode`.

```go
// Сервер
http.HandleFunc("GET /ping", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("pong"))
})

// Клиент
resp, err := http.Get("http://localhost:8080/ping")
if err != nil || resp.StatusCode != http.StatusOK {
    fmt.Println("не удалось")
} else {
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body)) // pong
}
```

## 2. Мини-проект: Чат-сервер на каналах

Полноценный чат на чистом `net` (TCP): клиенты подключаются, сообщения рассылаются всем.
Используем паттерн «hub» — одна горутина владеет состоянием, клиентам запрещено его менять.

```go
package main

import (
    "bufio"
    "fmt"
    "net"
    "strings"
    "time"
)

type client struct {
    conn   net.Conn
    name   string
    outbox chan string
}

// hub — единственная горутина, меняющая состояние
type hub struct {
    clients map[*client]bool
    join    chan *client
    leave   chan *client
    msg     chan string // сообщения от клиентов
}

func newHub() *hub {
    return &hub{
        clients: make(map[*client]bool),
        join:    make(chan *client),
        leave:   make(chan *client),
        msg:     make(chan string),
    }
}

func (h *hub) run() {
    for {
        select {
        case c := <-h.join:
            h.clients[c] = true
            go c.writeLoop() // фанат аут: пишем каждому клиенту в своей горутине
            h.broadcast("→ " + c.name + " в чате")
        case c := <-h.leave:
            if _, ok := h.clients[c]; ok {
                delete(h.clients, c)
                close(c.outbox)
                h.broadcast("← " + c.name + " вышел")
            }
        case m := <-h.msg:
            h.broadcast(m)
        }
    }
}

func (h *hub) broadcast(m string) {
    for c := range h.clients {
        select {
        case c.outbox <- m:
        default: // переполнение — пропускаем, клиент отвалится по таймауту
        }
    }
}

func (c *client) writeLoop() {
    for m := range c.outbox {
        fmt.Fprintln(c.conn, m)
    }
}

func handleConn(h *hub, conn net.Conn) {
    defer conn.Close()

    fmt.Fprint(conn, "Введите имя: ")
    name, _ := bufio.NewReader(conn).ReadString('\n')
    name = strings.TrimSpace(name)
    if name == "" {
        name = "anon"
    }

    c := &client{conn: conn, name: name, outbox: make(chan string, 10)}
    h.join <- c
    defer func() { h.leave <- c }()

    scanner := bufio.NewScanner(conn)
    for scanner.Scan() {
        text := strings.TrimSpace(scanner.Text())
        if text == "/quit" {
            return
        }
        h.msg <- fmt.Sprintf("[%s] %s", time.Now().Format("15:04"), text)
    }
}

func main() {
    h := newHub()
    go h.run()

    ln, err := net.Listen("tcp", ":9090")
    if err != nil {
        panic(err)
    }
    fmt.Println("Чат на :9090, подключитесь: nc localhost 9090")
    for {
        conn, err := ln.Accept()
        if err != nil {
            continue
        }
        go handleConn(h, conn)
    }
}
```

Как это устроено:
- `hub.run()` — единственный владелец `clients`, поэтому гонок нет в принципе;
- клиент пишет в **свой** `outbox`, а writer-горутина отправляет в сокет;
- `leave`-канал с чистой ликвидацией: закрываем `outbox`, удаляем из карты.

Попробуйте: `go run .`, затем в двух терминалах `nc localhost 9090`.

## 3. Типичные ошибки

**1. Присыпать конец main `time.Sleep` вместо синхронизации.**
```go
go work()          // программа может завершиться мгновенно
time.Sleep(1 * time.Second) // ненадёжно!
// Правильно: wg.Wait(), <-done, errgroup
```

**2. `WaitGroup.Add` внутри горутины.**
```go
wg.Add(1)          // должно быть ДО go
go func() { defer wg.Done(); work() }()
```

**3. Гонка данных при инкременте счётчика.**
```go
counter++ // из 100 горутин → потери апдейтов
// Правильно: sync.Mutex, atomic
// Проверка: go run -race main.go
```

**4. Захват переменной цикла замыканием.**
```go
for _, u := range urls {
    go func() { fetch(u) }() // все возьмут последний u
}
// Правильно: go func(u string) { fetch(u) }(u)
```

**5. Отправка в канал, который закрывает другой отправитель → panic.**
```go
go func() { ch <- 1 }()
go func() { ch <- 2; close(ch) }() // первая отправка упадёт в закрытый
```

**6. Не читать из канала после `close` — завис на `range`?** Не верно: `range`
корректно завершается после закрытия. Реальная ошибка — не закрывать канал вовсе,
тогда `range` висит вечно.

**7. `select` с блокирующим default пропускает события.**
```go
select {
case v := <-ch:  // при default выбирается мгновенно, чансы упустить — 1/N
default:
}
// Если надо обязательно дождаться — убирайте default.
```

**8. Забыть `defer resp.Body.Close()` — утечка соединений.**
```go
resp, _ := http.Get(url)
defer resp.Body.Close() // обязательно! иначе пул соединений исчерпается
```

**9. Игнорирование `err` при JSON-Decode.**
```go
json.NewDecoder(r.Body).Decode(&req) // пустой body → zero-value, молча
if err := ...; err != nil { http.Error(w, "bad request", 400); return }
```

**10. `WriteHeader` после `Write` — молча игнорируется/даёт лишнее.**
```go
w.Write([]byte("ok"))
w.WriteHeader(201) // код НЕ применится
```

**11. Копирование `sync.Mutex`.**
```go
func f(m sync.Mutex) { ... } // копия: защита теряется
// Правильно: f(m *sync.Mutex)
```

**12. Опустошение `default` в `select` внутри цикла — печатает «спин» на 100% CPU.**
```go
for {
    select {
    case <-ch:
    default: // busy-spin; вредно — добавьте time.Sleep или уберите default
    }
}
```

**13. Отправка в небуферизированный канал из main без получателя → дедлок-паника**
```go
ch := make(chan int)
ch <- 1 // fatal error: all goroutines are asleep - deadlock!
```

**14. `close` канала дважды.**
```go
close(ch)
close(ch) // panic: close of closed channel
// Защищайтесь: только один владелец закрывает канал
```

**15. Не закрывать канал результата в пайплайне — потребитель ждёт вечно.**
```go
func stage(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out) // TODO: не забыть!
        for v := range in { out <- v * 2 }
    }()
    return out
}
```

**16. HTTP `ListenAndServe` без обработки ошибки.**
```go
log.Fatal(http.ListenAndServe(":8080", mux)) // видим порт занят/нет прав
```

**17. Игнор `GOMAXPROCS` и раздутый пул воркеров:** тысячи горутин на дешёвые задачи
ухудшают производительность; подбирайте размер пула под нагрузку (обычно равно числу CPU).

## 4. Вопросы для самопроверки

**1. Чем горутина отличается от потока ОС?**
_Ответ:_ стартовый стек ~2 КБ (растёт динамически) против 1–8 МБ; переключение на уровне
планировщика Go, а не ядра; можно держать миллионы горутин, потоков — тысячи.

**2. Когда создавать буферизированный канал, а когда нет?**
_Ответ:_ небуферизированный — когда нужна синхронизация «приём/отдача строго одновременно»
и обратная связь между горутинами; буферизированный — когда есть «пачки» данных и
приёмник может обрабатывать их чуть позже.

**3. Что возвращает получение из закрытого канала?**
_Ответ:_ zero-value типа; при двухзначной форме `v, ok := <-ch` — `ok == false`. Отправка
в закрытый — panic.

**4. Гарантирует ли `select` выбор case в порядке написания?**
_Ответ:_ нет. При нескольких готовых ветках выбор случайный и примерно равномерный.

**5. Что произойдёт, если закроют канал, а его попытаются закрыть ещё раз?**
_Ответ:_ panic (`close of closed channel`). Закрытию должен принадлежать один владелец —
обычно единственный отправитель.

**6. Как остановить долгоживущую горутину корректно?**
_Ответ:_ через `select { case <-stop: return }`, закрыв канал `stop` или отменив
`context.Context`. Нельзя «убить» чужую горутину извне.

**7. Канал `chan struct{}` используется для чего?**
_Ответ:_ для передачи сигналов без данных (событий) — struct{} занимает ноль байт;
закрытие такого канала = широковещательное оповещение всем читателям.

**8. select с `time.After` внутри цикла создаёт тикер, который…**
_Ответ:_ ждёт время, потом утекает (таймер не освобождается до срабатывания). Для
повторяющихся интервалов используйте `time.Ticker` + `Stop`.

**9. Что такое гонка данных и как её найти?**
_Ответ:_ неупорядоченный доступ нескольких горутин к общей памяти без синхронизации.
Обнаружение: `go run -race`, `go test -race`.

**10. Чем `sync.Mutex` отличается от `sync.RWMutex`?**
_Ответ:_ RWMutex позволяет параллельное чтение (RLock), блокируя конкурентную запись;
если читателей много — выше пропускная способность.

**11. Для чего `sync.Once`?**
_Ответ:_ гарантирует однократное выполнение функции при конкурентных вызовах — ленивая
инициализация синглтонов и конфигов.

**12. Что вернёт `ctx.Err()` после отмены контекста?**
_Ответ:_ `context.Canceled` (ручная отмена) или `context.DeadlineExceeded` (просрочен
таймаут/дедлайн). До отмены — nil.

**13. Почему `http.DefaultClient` лучше не использовать для боевых запросов?**
_Ответ:_ у него нет таймаута — зависший DNS/сокет повесит запрос навсегда. Нужен свой
клиент с `Timeout` и настройками пула соединений.

**14. Что будет, если не закрыть `resp.Body` у HTTP-клиента?**
_Ответ:_ соединение не вернётся в пул — постепенно исчерпаются дескрипторы и соединения;
первая же ошибка «too many open files». Закрывайте через `defer` (и лучше с чтением до конца).

**15. В чём разница контекста «горутины-воркера через select» и просто канала stop?**
_Ответ:_ функционально они эквивалентны для отдельной горутины; контекст добавляет
дедлайны, значения и передачу через API (метод принимает `ctx context.Context` —
часть сигнатуры). Канал `stop` — простецкий аналог без побочек.

## 5. Глоссарий

| Термин | Значение |
|---|---|
| Goroutine (горутина) | лёгкий поток, запускаемый `go func()` |
| Канал (channel) | типизированный канал обмена данными между горутинами |
| Буферизированный канал | канал с вместимостью > 0; отправка не блокирует до заполнения |
| `close` | закрытие канала; «радио-сигнал окончания» для `range` и select |
| `select` | мультиплексирование нескольких каналов, выбор готового события |
| `sync.WaitGroup` | счётчик ожидаемых горутин |
| `sync.Mutex` | блокировка критической секции |
| `sync.RWMutex` | блокировка «много читателей / один писатель» |
| `sync.Once` | однократное выполнение функции |
| `sync/atomic` | атомарные операции для счётчиков и флагов |
| Data race (гонка) | несинхронизированный доступ к общей памяти |
| Worker Pool | фиксированный пул горутин, обрабатывающий задания из канала |
| Pipeline | цепочка каналов, где каждая стадия преобразует поток |
| Fan-out | разделение одного канала на несколько обработчиков |
| Fan-in | слияние нескольких каналов в один |
| `context.Context` | дедлайн/отмена/значения, передаваемые через вызовы |
| `errgroup` | WaitGroup + обработка первой ошибки |
| Handler | функция `func(w http.ResponseWriter, r *http.Request)` |
| Middleware | обёртка вокруг handler (логирование, auth, CORS) |
| `html/template` | безопасные шаблоны с автоматическим экранированием |
| Планировщик Go | рантайм-планировщик горутин на потоках ОС |