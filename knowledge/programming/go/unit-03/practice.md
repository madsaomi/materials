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
