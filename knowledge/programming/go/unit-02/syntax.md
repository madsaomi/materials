# Go — Unit 2: Методы, интерфейсы, работа с файлами

## Методы

```go
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}
```

## Интерфейсы

```go
type Shape interface {
    Area() float64
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func printArea(s Shape) {
    fmt.Printf("Площадь: %.2f\n", s.Area())
}
```

## Ошибки

```go
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
```

## Работа с файлами

```go
import "os"

// запись
data := []byte("Hello, World!")
err := os.WriteFile("output.txt", data, 0644)

// чтение
content, _ := os.ReadFile("input.txt")
fmt.Println(string(content))
```

## Пакет fmt

```go
fmt.Print("hello")         // без новой строки
fmt.Println("hello")       // с новой строкой
fmt.Printf("int: %d, str: %s\n", 42, "hi")
fmt.Sprintf("hello %s", "world")  // вернуть строку
```

## JSON

```go
import "encoding/json"

type User struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

// Маршалинг
u := User{Name: "Алиса", Age: 25}
data, _ := json.Marshal(u)
fmt.Println(string(data))  // {"name":"Алиса","age":25}

// Демаршалинг
var u2 User
json.Unmarshal(data, &u2)
```

## Задачи

1. Создайте интерфейс Vehicle с методом Move(), реализуйте для Car и Bike
2. Напишите функцию, читающую файл и возвращающую количество строк
3. Создайте структуру Task с полями Title, Done и методы MarkDone, String
4. Напишите программу, сохраняющую список задач в JSON
