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
