# Go — Unit 1: Задачи

## Уровень 1: Лёгкие

```go
// 1. Чётность
func isEven(n int) bool {
    return n%2 == 0
}

// 2. Максимум
func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}

// 3. Факториал
func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n-1)
}
```

## Уровень 2: Средние

```go
// 4. Реверс строки
func reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}

// 5. Фибоначчи
func fib(n int) []int {
    result := []int{0, 1}
    for i := 2; i < n; i++ {
        result = append(result, result[i-1]+result[i-2])
    }
    return result
}

// 6. FizzBuzz
func fizzbuzz() {
    for i := 1; i <= 100; i++ {
        switch {
        case i%15 == 0:
            fmt.Println("FizzBuzz")
        case i%3 == 0:
            fmt.Println("Fizz")
        case i%5 == 0:
            fmt.Println("Buzz")
        default:
            fmt.Println(i)
        }
    }
}
```

## Уровень 3: Со структурами

```go
// 7. Калькулятор
type Calculator struct{}

func (c Calculator) Add(a, b float64) float64  { return a + b }
func (c Calculator) Sub(a, b float64) float64  { return a - b }
func (c Calculator) Mul(a, b float64) float64  { return a * b }
func (c Calculator) Div(a, b float64) (float64, error) {
    if b == 0 { return 0, fmt.Errorf("деление на 0") }
    return a / b, nil
}

// 8. Счётчик слов
func wordCount(text string) map[string]int {
    words := strings.Fields(text)
    counts := make(map[string]int)
    for _, w := range words {
        counts[w]++
    }
    return counts
}
```

## Мини-проект: Викторина

```go
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    questions := map[string]string{
        "Столица Японии?": "токио",
        "2+2*2=?":         "6",
        "Цвет неба?":      "голубой",
    }
    score := 0
    scanner := bufio.NewScanner(os.Stdin)

    for q, a := range questions {
        fmt.Print(q + " ")
        scanner.Scan()
        answer := strings.TrimSpace(strings.ToLower(scanner.Text()))
        if answer == a {
            fmt.Println("✅ Верно!")
            score++
        } else {
            fmt.Printf("❌ Неверно. Ответ: %s\n", a)
        }
    }
    fmt.Printf("Результат: %d/%d\n", score, len(questions))
}
```

## Ответы

1. `func isEven(n int) bool { return n%2 == 0 }`
2. `if a > b { return a }; return b`
3. `for _, v := range slice { if v%2 == 0 { fmt.Println(v) } }`
4. См. FizzBuzz выше
