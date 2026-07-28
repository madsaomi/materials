# Go — Unit 1: Основы

## Переменные и типы

```go
package main

import "fmt"

func main() {
    // var
    var name string = "Алиса"
    var age int = 25
    var height float64 = 1.75

    // короткая запись
    city := "Москва"

    // несколько переменных
    x, y := 10, 20

    fmt.Println(name, age, height, city)
    fmt.Println(x + y)
}
```

## Типы данных

```go
// Числа
var i int = 42
var f float64 = 3.14
var b bool = true
var s string = "hello"

// Массивы (фикс. размер)
var arr [5]int = [5]int{1, 2, 3, 4, 5}

// Срезы (динамические)
slice := []int{1, 2, 3}
slice = append(slice, 4)

// Карты
m := map[string]int{
    "один": 1,
    "два":  2,
}
```

## Условия и циклы

```go
// if
if age >= 18 {
    fmt.Println("Взрослый")
} else {
    fmt.Println("Ребёнок")
}

// for (единственный цикл в Go)
for i := 0; i < 5; i++ {
    fmt.Println(i)
}

// range
nums := []int{10, 20, 30}
for idx, val := range nums {
    fmt.Printf("%d: %d\n", idx, val)
}

// while
count := 0
for count < 3 {
    fmt.Println(count)
    count++
}
```

## Функции

```go
func add(a, b int) int {
    return a + b
}

// несколько возвращаемых значений
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, fmt.Errorf("на ноль делить нельзя")
    }
    return a / b, nil
}

func main() {
    fmt.Println(add(3, 5))
    result, err := divide(10, 2)
    if err != nil {
        fmt.Println("Ошибка:", err)
    } else {
        fmt.Println(result)
    }
}
```

## Указатели

```go
func increment(x *int) {
    *x++
}

func main() {
    a := 10
    increment(&a)
    fmt.Println(a) // 11
}
```

## Структуры

```go
type Person struct {
    Name string
    Age  int
}

func main() {
    p := Person{
        Name: "Алиса",
        Age:  25,
    }
    fmt.Println(p.Name, p.Age)
}
```

## Задачи

1. Напишите функцию, проверяющую чётность числа
2. Напишите функцию, возвращающую максимальное из двух чисел
3. Создайте срез чисел 1-10 и выведите только чётные
4. Напишите программу "FizzBuzz"
