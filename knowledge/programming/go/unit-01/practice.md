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

---

## Уровень 4: Строки (задачи 9-12)

### Задача 9. Подсчёт гласных

**Условие:** напишите функцию, которая считает гласные буквы (латиница и кириллица) в строке.

**Решение:**

```go
func countVowels(s string) int {
    count := 0
    for _, ch := range s {
        switch ch {
        case 'a', 'e', 'i', 'o', 'u',
            'а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я':
            count++
        }
    }
    return count
}

func main() {
    fmt.Println(countVowels("Hello, мир!")) // 3 (e, o, и)
}
```

**Пояснение:** `range` по строке идёт по рунам, поэтому кириллица обрабатывается верно (в отличие от индексации по байтам). `switch` с несколькими значениями в `case` — компактный способ сравнения с набором символов.

### Задача 10. Палиндром

**Условие:** проверьте, читается ли фраза одинаково слева направо и справа налево (без учёта регистра и пробелов).

**Решение:**

```go
func isPalindrome(s string) bool {
    s = strings.ToLower(strings.Join(strings.Fields(s), ""))
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        if runes[i] != runes[j] {
            return false
        }
    }
    return true
}

func main() {
    fmt.Println(isPalindrome("А роза упала на лапу Азора")) // true
    fmt.Println(isPalindrome("Go"))                          // false
}
```

**Пояснение:** три шага — убрать пробелы (`Fields` + `Join`), привести к нижнему регистру, сравнить символы с двух концов. Сравнение попарно экономит половину проходов.

### Задача 11. Инверсия регистра букв

**Условие:** переведите каждую букву строки в противоположный регистр: `"GoLang"` → `"gOlANG"`.

**Решение:**

```go
func swapCase(s string) string {
    var b strings.Builder
    for _, ch := range s {
        switch {
        case ch >= 'a' && ch <= 'z':
            b.WriteRune(ch - 'a' + 'A')
        case ch >= 'A' && ch <= 'Z':
            b.WriteRune(ch - 'A' + 'a')
        default:
            b.WriteRune(ch)
        }
    }
    return b.String()
}
```

**Пояснение:** работаем с кодами символов: `'б' - 'а' + 'Б'` — трюк с диапазонами. `strings.Builder` эффективнее конкатенации в цикле (не создаёт десятки промежуточных строк).

### Задача 12. Сумма цифр в строке

**Условие:** дана строка с цифрами и буквами (например `"a1b2c3"`). Посчитайте сумму всех цифр: `1+2+3 = 6`.

**Решение:**

```go
func digitSum(s string) int {
    total := 0
    for _, ch := range s {
        if ch >= '0' && ch <= '9' {
            total += int(ch - '0')
        }
    }
    return total
}

func main() {
    fmt.Println(digitSum("a1b2c3"))  // 6
    fmt.Println(digitSum("2026 год")) // 10
}
```

**Пояснение:** проверка `ch >= '0' && ch <= '9'` — идиоматичный способ отфильтровать цифры, а `ch - '0'` превращает символ-цифру в число от 0 до 9.

---

## Уровень 5: Срезы (задачи 13-17)

### Задача 13. Сумма и среднее

**Условие:** найдите сумму и среднее арифметическое среза чисел.

**Решение:**

```go
func average(nums []float64) (sum float64) {
    for _, n := range nums {
        sum += n
    }
    return sum
}

func main() {
    data := []float64{2.5, 4.0, 3.5}
    s := average(data)
    fmt.Printf("сумма: %.1f, среднее: %.1f\n", s, s/float64(len(data)))
    // сумма: 10.0, среднее: 3.3
}
```

**Пояснение:** именованный возвращаемый `sum` плюс naked return сокращают код. Сравни `s/float64(len(data))`: `len` возвращает `int`, делить `float64` на `int` без приведения нельзя.

### Задача 14. Максимум и его индекс

**Условие:** верните максимальный элемент среза и его позицию. Если срез пуст — верните `-1`.

**Решение:**

```go
func maxIndex(nums []int) (int, int) {
    if len(nums) == 0 {
        return 0, -1
    }
    maxV, idx := nums[0], 0
    for i, v := range nums[1:] {
        if v > maxV {
            maxV, idx = v, i+1
        }
    }
    return maxV, idx
}
```

**Пояснение:** проверка пустого среза обязательна — иначе `nums[0]` даст panic. `range nums[1:]` экономит одно сравнение с первым элементом, но индекс смещается на `+1`.

### Задача 15. Удаление дубликатов

**Условие:** оставьте в срезе только первые вхождения элементов: `[1,2,2,3,1]` → `[1,2,3]`.

**Решение:**

```go
func unique(nums []int) []int {
    seen := make(map[int]bool)
    result := make([]int, 0, len(nums))
    for _, v := range nums {
        if !seen[v] {
            seen[v] = true
            result = append(result, v)
        }
    }
    return result
}

func main() {
    fmt.Println(unique([]int{1, 2, 2, 3, 1})) // [1 2 3]
}
```

**Пояснение:** map используется как «множество» — за O(1) проверяем, встречался ли элемент. Заранее выделенный `cap` (`make([]int, 0, len(nums))`) избегает лишних перераспределений.

### Задача 16. Разворот среза на месте

**Условие:** разверните срез, меняя элементы в том же массиве (не создавая новый).

**Решение:**

```go
func reverseSlice(nums []int) {
    for i, j := 0, len(nums)-1; i < j; i, j = i+1, j-1 {
        nums[i], nums[j] = nums[j], nums[i]
    }
}

func main() {
    a := []int{1, 2, 3, 4}
    reverseSlice(a)
    fmt.Println(a) // [4 3 2 1]
}
```

**Пояснение:** обмен через множественное присваивание `a, b = b, a` — встроенная возможность Go, отдельная временная переменная не нужна. Срез — ссылка на массив, поэтому функция меняет внешние данные.

### Задача 17. Удаление элемента по индексу

**Условие:** удалите элемент с данным индексом из среза.

**Решение:**

```go
func removeAt(nums []int, i int) []int {
    if i < 0 || i >= len(nums) {
        return nums
    }
    return append(nums[:i], nums[i+1:]...)
}

func main() {
    nums := []int{10, 20, 30, 40}
    nums = removeAt(nums, 2)
    fmt.Println(nums) // [10 20 40]
}
```

**Пояснение:** `append(слева, справа...)` склеивает две части среза. Важно: присваиваем результат обратно `nums = ...`, потому что `append` может вернуть новый массив. Внимание: операция модифицирует исходный массив (см. раздел 13.4 в syntax.md).

---

## Уровень 6: Map (задачи 18-20)

### Задача 18. Частота символов

**Условие:** подсчитайте, сколько раз встречается каждый символ в строке: `"abbc"` → `{a:1, b:2, c:1}`.

**Решение:**

```go
func charCount(s string) map[rune]int {
    counts := make(map[rune]int)
    for _, ch := range s {
        counts[ch]++
    }
    return counts
}

func main() {
    for ch, n := range charCount("abbc") {
        fmt.Printf("%c: %d\n", ch, n)
    }
}
```

**Пояснение:** классический паттерн «счётчик»: нулевой zero value в map для `int` равен `0`, поэтому `counts[ch]++` работает и для первого вхождения без явной инициализации. Ключ — `rune`, чтобы корректно учесть кириллицу.

### Задача 19. Переворот map

**Условие:** поменяйте местами ключи и значения: `{a:1, b:2}` → `{1:a, 2:b}`.

**Решение:**

```go
func invert(m map[string]int) map[int]string {
    result := make(map[int]string, len(m))
    for k, v := range m {
        result[v] = k
    }
    return result
}

func main() {
    fmt.Println(invert(map[string]int{"a": 1, "b": 2})) // map[1:a 2:b]
}
```

**Пояснение:** если два ключа имеют одинаковое значение, при инверсии один потеряется — это стоит учитывать. `make(map[int]string, len(m))` заранее задаёт ёмкость, что ускоряет заполнение.

### Задача 20. Самый частый элемент

**Условие:** найдите число, которое встречается в срезе чаще всего, и количество вхождений.

**Решение:**

```go
func mostFrequent(nums []int) (int, int) {
    counts := make(map[int]int)
    best, bestCount := nums[0], 0
    for _, v := range nums {
        counts[v]++
        if counts[v] > bestCount {
            best, bestCount = v, counts[v]
        }
    }
    return best, bestCount
}

func main() {
    fmt.Println(mostFrequent([]int{1, 3, 2, 3, 1, 3})) // 3 3
}
```

**Пояснение:** один проход вместо двух: обновляем «чемпиона» на каждом шаге. Сложность O(n) по времени за счёт map.

---

## Уровень 7: Структуры и методы (задачи 21-24)

### Задача 21. Прямоугольник

**Условие:** создайте структуру `Rectangle`, добавьте методы площади и периметра.

**Решение:**

```go
type Rectangle struct {
    W, H float64
}

// value receiver: ничего не меняем
func (r Rectangle) Area() float64      { return r.W * r.H }
func (r Rectangle) Perimeter() float64 { return 2 * (r.W + r.H) }

// pointer receiver: масштабируем оригинал
func (r *Rectangle) Scale(f float64) {
    r.W *= f
    r.H *= f
}

func main() {
    r := Rectangle{3, 4}
    fmt.Printf("площадь: %.0f, периметр: %.0f\n", r.Area(), r.Perimeter())
    r.Scale(2)
    fmt.Println(r.W, r.H) // 6 8
}
```

**Пояснение:** методы не изменяющие данные — value receiver; метод, меняющий поля — pointer receiver (иначе изменения пропадут, т.к. копия). Сравни с задачей 7.

### Задача 22. Книга и печать описания

**Условие:** структура `Book` (название, автор, страницы). Добавьте метод `Info()`, возвращающий строку, и метод `PagesPerDay` для прочтения за N дней.

**Решение:**

```go
type Book struct {
    Title  string
    Author string
    Pages  int
}

func (b Book) Info() string {
    return fmt.Sprintf("%s — %s, %d стр.", b.Title, b.Author, b.Pages)
}

func (b Book) PagesPerDay(days int) int {
    if days <= 0 {
        return 0
    }
    return (b.Pages + days - 1) / days // округление вверх
}

func main() {
    b := Book{Title: "Штурм Голанга", Author: "Алиса", Pages: 300}
    fmt.Println(b.Info())          // Штурм Голанга — Алиса, 300 стр.
    fmt.Println(b.PagesPerDay(7))  // 43 страницы в день
}
```

**Пояснение:** `(x + d - 1) / d` — формула деления с округлением вверх. `fmt.Sprintf` собирает строку вместо ручной конкатенации.

### Задача 23. Самый молодой студент

**Условие:** дан срез студентов (имя, возраст). Найдите самого молодого.

**Решение:**

```go
type Student struct {
    Name string
    Age  int
}

func youngest(students []Student) Student {
    if len(students) == 0 {
        return Student{}
    }
    best := students[0]
    for _, s := range students[1:] {
        if s.Age < best.Age {
            best = s
        }
    }
    return best
}

func main() {
    group := []Student{
        {Name: "Анна", Age: 21},
        {Name: "Борис", Age: 19},
        {Name: "Вера", Age: 23},
    }
    fmt.Println(youngest(group).Name) // Борис
}
```

**Пояснение:** сравнение по полю структуры `s.Age < best.Age`. Пустой срез возвращает zero value структуры — договариваемся об этом в контракте функции.

### Задача 24. Сортировка студентов по возрасту

**Условие:** отсортируйте студентов по возрастанию возраста, используя `sort.Slice`.

**Решение:**

```go
import "sort"

func sortByAge(students []Student) {
    sort.Slice(students, func(i, j int) bool {
        return students[i].Age < students[j].Age
    })
}

func main() {
    group := []Student{
        {Name: "Вера", Age: 23},
        {Name: "Анна", Age: 21},
        {Name: "Борис", Age: 19},
    }
    sortByAge(group)
    for _, s := range group {
        fmt.Println(s.Name, s.Age)
    }
    // Борис 19, Анна 21, Вера 23
}
```

**Пояснение:** `sort.Slice` получает функцию-компаратор; сортировка идёт на месте, менять присваивание не нужно.

---

## Уровень 8: Ошибки и ввод (задачи 25-27)

### Задача 25. Безопасный квадратный корень

**Условие:** верните корень числа, но для отрицательных — осмысленную ошибку.

**Решение:**

```go
import "math"

func safeSqrt(x float64) (float64, error) {
    if x < 0 {
        return 0, fmt.Errorf("корень из отрицательного числа: %v", x)
    }
    return math.Sqrt(x), nil
}

func main() {
    for _, v := range []float64{9, -4} {
        r, err := safeSqrt(v)
        if err != nil {
            fmt.Println("Ошибка:", err)
            continue
        }
        fmt.Printf("sqrt(%.0f) = %.2f\n", v, r)
    }
}
```

**Пояснение:** сигнатура `(float64, error)` — стандартный контракт Go. Проверяющий код обрабатывает ошибку и продолжает цикл через `continue`.

### Задача 26. Чтение числа из строки с проверкой

**Условие:** парсите строку в `int`; при неудаче — сообщите пользователю и запросите снова, пока не введёт корректно.

**Решение:**

```go
func readInt(scanner *bufio.Scanner) (int, error) {
    for {
        fmt.Print("Введите целое число: ")
        scanner.Scan()
        text := strings.TrimSpace(scanner.Text())
        n, err := strconv.Atoi(text)
        if err != nil {
            fmt.Printf("%q — не число, попробуйте ещё раз.\n", text)
            continue
        }
        return n, nil
    }
}

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    n, err := readInt(scanner)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println("Вы ввели:", n)
}
```

**Пояснение:** цикл `for` с `continue` при неудаче — типичный «валидатор ввода». `TrimSpace` снимает случайные пробелы, а `Atoi` сообщает о некорректном формате через `error`.

### Задача 27. Деление с богатой ошибкой

**Условие:** вычислите `a / b`, но дайте детальную ошибку с обёртыванием исходной.

**Решение:**

```go
import "errors"

var ErrZeroDivision = errors.New("деление на ноль")

func div(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("в выражении %v / %v: %w", a, b, ErrZeroDivision)
    }
    return a / b, nil
}

func main() {
    _, err := div(10, 0)
    if errors.Is(err, ErrZeroDivision) {
        fmt.Println("поймали деление на ноль:", err)
    }
}
```

**Пояснение:** `%w` сохраняет исходную ошибку в цепочке, `errors.Is` позволяет найти её по типажу. Так общая ошибка получает контекст (какие значения), не теряя причины.

---

## Мини-проект: Телефонная книга

**Задание:** консольная программа со структурой `Contact`, добавлением, поиском и списком контактов. Цель — применить структуры, map, циклы и ввод.

```go
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

type Contact struct {
    Name  string
    Phone string
}

type PhoneBook struct {
    contacts map[string]Contact
}

func NewPhoneBook() *PhoneBook {
    return &PhoneBook{contacts: make(map[string]Contact)}
}

func (b *PhoneBook) Add(c Contact) error {
    if _, exists := b.contacts[c.Name]; exists {
        return fmt.Errorf("контакт %q уже существует", c.Name)
    }
    b.contacts[c.Name] = c
    return nil
}

func (b *PhoneBook) Get(name string) (Contact, error) {
    c, ok := b.contacts[name]
    if !ok {
        return Contact{}, fmt.Errorf("контакт %q не найден", name)
    }
    return c, nil
}

func (b *PhoneBook) All() []Contact {
    result := make([]Contact, 0, len(b.contacts))
    for _, c := range b.contacts {
        result = append(result, c)
    }
    return result
}

func main() {
    book := NewPhoneBook()
    scanner := bufio.NewScanner(os.Stdin)

    for {
        fmt.Print("> ")
        scanner.Scan()
        parts := strings.Fields(scanner.Text())
        if len(parts) == 0 {
            continue
        }
        switch parts[0] {
        case "add":
            if len(parts) != 3 {
                fmt.Println("использование: add <имя> <телефон>")
                continue
            }
            if err := book.Add(Contact{Name: parts[1], Phone: parts[2]}); err != nil {
                fmt.Println(err)
            } else {
                fmt.Println("добавлено")
            }
        case "get":
            if len(parts) != 2 {
                fmt.Println("использование: get <имя>")
                continue
            }
            c, err := book.Get(parts[1])
            if err != nil {
                fmt.Println(err)
            } else {
                fmt.Printf("%s: %s\n", c.Name, c.Phone)
            }
        case "list":
            for _, c := range book.All() {
                fmt.Printf("%s: %s\n", c.Name, c.Phone)
            }
        case "exit":
            fmt.Println("пока!")
            return
        default:
            fmt.Println("команды: add, get, list, exit")
        }
    }
}
```

**Пояснение:** структура `PhoneBook` оборачивает map, а методы дают понятный интерфейс. Ошибки возвращаются и печатаются — пользователь видит причину. Разбор ввода — через `strings.Fields` и `switch` по команде.

---

## Мини-проект: Атмосферный прогноз погоды

**Задание:** программа вычисляет среднюю температуру за неделю, находит самый тёплый и холодный день, используя структуры и срезы.

```go
package main

import (
    "fmt"
    "sort"
)

type Day struct {
    Name string
    Temp float64
}

type Forecast struct {
    Days []Day
}

func (f Forecast) Average() float64 {
    if len(f.Days) == 0 {
        return 0
    }
    var sum float64
    for _, d := range f.Days {
        sum += d.Temp
    }
    return sum / float64(len(f.Days))
}

func (f Forecast) Hottest() Day {
    best := f.Days[0]
    for _, d := range f.Days[1:] {
        if d.Temp > best.Temp {
            best = d
        }
    }
    return best
}

func (f Forecast) Coldest() Day {
    best := f.Days[0]
    for _, d := range f.Days[1:] {
        if d.Temp < best.Temp {
            best = d
        }
    }
    return best
}

func (f Forecast) SortedAsc() []Day {
    result := make([]Day, len(f.Days))
    copy(result, f.Days)
    sort.Slice(result, func(i, j int) bool {
        return result[i].Temp < result[j].Temp
    })
    return result
}

func main() {
    forecast := Forecast{Days: []Day{
        {Name: "Пн", Temp: 15},
        {Name: "Вт", Temp: 18},
        {Name: "Ср", Temp: 12},
        {Name: "Чт", Temp: 20},
        {Name: "Пт", Temp: 17},
        {Name: "Сб", Temp: 22},
        {Name: "Вс", Temp: 19},
    }}

    fmt.Printf("Средняя: %.1f C\n", forecast.Average())
    fmt.Printf("Тёплый день: %s (%.0f)\n", forecast.Hottest().Name, forecast.Hottest().Temp)
    fmt.Printf("Холодный день: %s (%.0f)\n", forecast.Coldest().Name, forecast.Coldest().Temp)

    fmt.Println("По возрастанию:")
    for _, d := range forecast.SortedAsc() {
        fmt.Printf("  %s: %.0f\n", d.Name, d.Temp)
    }
}
```

**Пояснение:** value receiver подходит — методы только читают данные. `SortedAsc` копирует срез (`copy`), чтобы не сортировать оригинал: сортировка изменяет слайс на месте. Методы делают код читаемым без циклов в `main`.

---

## Чек-лист перед сдачей задачи

1. Программа компилируется: `go build` без ошибок.
2. Все переменные и импорты используются.
3. Ошибки проверяются (`err != nil`), а не игнорируются.
4. Нет записи в nil map и обращения к пустому срезу.
5. Имена осмысленные, форматирование через `gofmt`.
6. Есть проверка крайних случаев: пустой ввод, ноль, минимум/максимум.

---

## Как подойти к решению задачи (пошагово)

1. **Прочитай условие** и выпиши вход и ожидаемый выход.
2. **Разбей на шаги:** «сперва разобрать ввод, потом посчитать, потом вывести».
3. **Выбери структуры данных:** срез для последовательностей, map для «по ключу», структура для связанных полей.
4. **Напиши тестовые данные** прямо рядом: `fmt.Println(функция(пример))`.
5. **Проверь крайние случаи:** пустой срез, ноль, отрицательное число, одна буква.
6. **Рефактори:** вынеси повторяющийся код в функцию, добавь комментарий только там, где логика неочевидна.
