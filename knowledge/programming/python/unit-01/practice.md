# Python — Unit 1: Задачи

## Уровень 1: Лёгкие

```python
# 1. Калькулятор возраста
year = int(input("Год рождения: "))
age = 2026 - year
print(f"Вам {age} лет")

# 2. Чётное или нечётное
n = int(input("Число: "))
print("Чётное" if n % 2 == 0 else "Нечётное")

# 3. Максимум из трёх
a, b, c = 5, 12, 8
print(max(a, b, c))
```

## Уровень 2: Средние

```python
# 4. Таблица умножения
for i in range(1, 10):
    for j in range(1, 10):
        print(f"{i*j:4}", end="")
    print()

# 5. Числа Фибоначчи
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        print(a, end=" ")
        a, b = b, a + b
fib(10)  # 0 1 1 2 3 5 8 13 21 34

# 6. Палиндром
s = "топот"
print(s == s[::-1])  # True
```

## Уровень 3: Сложные

```python
# 7. FizzBuzz
for i in range(1, 101):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)

# 8. Подсчёт слов
text = "hello world hello python hello"
words = text.split()
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
print(freq)  # {'hello': 3, 'world': 1, 'python': 1}
```

## Мини-проект: Викторина

```python
questions = {
    "Столица Японии?": "токио",
    "Сколько планет в Солнечной системе?": "8",
    "2 + 2 * 2 = ?": "6"
}
score = 0
for q, a in questions.items():
    answer = input(q + " ").lower().strip()
    if answer == a:
        print("✅ Верно!")
        score += 1
    else:
        print(f"❌ Неверно. Ответ: {a}")
print(f"Результат: {score}/{len(questions)}")
```

## Ответы к задачам

1. `print(f"Привет, {name}! Тебе {age} лет")`
2. `return a + b`
3. `[x for x in range(1, 11) if x % 2 == 0]`
4. `all(n % i != 0 for i in range(2, int(n**0.5)+1))`

---

## Уровень 1: Лёгкие (дополнительно)

### 9. Сумма цифр числа

Разбиваем число на строку и складываем цифры.

```python
n = 12345
total = 0
for d in str(n):
    total += int(d)
print(total)  # 15
```

### 10. Факториал без рекурсии

```python
def factorial(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

print(factorial(5))  # 120
```

### 11. Наибольший общий делитель (алгоритм Евклида)

```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print(gcd(48, 18))  # 6
```

### 12. Таблица умножения для одного числа

```python
n = 7
for i in range(1, 11):
    print(f"{n} × {i} = {n * i}")
```

---

## Уровень 2: Средние (дополнительно)

### 13. Решето Эратосфена

Находит все простые числа до n за O(n log log n).

```python
def primes_upto(n):
    sieve = [True] * (n + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if sieve[i]:
            for j in range(i * i, n + 1, i):
                sieve[j] = False
    return [x for x, is_prime in enumerate(sieve) if is_prime]

print(primes_upto(30))  # [2,3,5,7,11,13,17,19,23,29]
```

### 14. Шифр Цезаря

Каждый символ сдвигается на `shift` позиций по алфавиту.

```python
def caesar(text, shift):
    alphabet = "абвгдежзийклмнопрстуфхцчшщъыьэюя"
    result = []
    for ch in text.lower():
        if ch in alphabet:
            idx = (alphabet.index(ch) + shift) % len(alphabet)
            result.append(alphabet[idx])
        else:
            result.append(ch)
    return "".join(result)

print(caesar("привет", 3))   # тузжзх
print(caesar("тузжзх", -3))  # привет
```

### 15. Проверка баланса скобок

Классическая задача на стек.

```python
def is_balanced(s):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in ")]}":
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

print(is_balanced("([]{})"))     # True
print(is_balanced("([)]"))       # False
print(is_balanced("("))          # False
```

### 16. Второе максимальное число

```python
nums = [3, 9, 1, 9, 7, 4]
max1, max2 = max(nums[0], nums[1]), min(nums[0], nums[1])
for x in nums[2:]:
    if x > max1:
        max2 = max1
        max1 = x
    elif x > max2 and x != max1:
        max2 = x
print(max2)  # 7
```

---

## Уровень 3: Сложные (дополнительно)

### 17. Частотный анализ текста — топ-3 слова

```python
import re
text = "яблоко груша яблоко слива яблоко груша груша лимон слива слива слива"
words = re.findall(r"\w+", text.lower())
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
top3 = sorted(freq, key=freq.get, reverse=True)[:3]
print(top3)                          # ['яблоко', 'слива', 'груша']
print([(w, freq[w]) for w in top3])
```

### 18. Слияние двух отсортированных списков

```python
def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    result.extend(a[i:])
    result.extend(b[j:])
    return result

print(merge([1, 3, 5], [2, 4, 6]))  # [1,2,3,4,5,6]
```

### 19. Two Sum

Найти два числа, дающие в сумме заданное значение (за O(n)).

```python
def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return None

print(two_sum([2, 7, 11, 15], 9))   # [0, 1]
print(two_sum([3, 2, 4], 6))        # [1, 2]
```

---

## Уровень 4: Для собеседования

### 20. FizzBuzz без накопления, в одну строку

```python
res = ["FizzBuzz" if i % 15 == 0
       else "Fizz" if i % 3 == 0
       else "Buzz" if i % 5 == 0
       else i for i in range(1, 101)]
print(res)
```

### 21. Первый неповторяющийся символ

```python
def first_unique(s):
    for ch in s:
        if s.count(ch) == 1:
            return ch
    return None

print(first_unique("abacabad"))  # 'c'
print(first_unique("aabb"))      # None
```

### 22. Уникальные элементы без set

```python
def uniq(lst):
    result = []
    for x in lst:
        if x not in result:
            result.append(x)
    return result

print(uniq([1, 2, 2, 3, 1, 4]))  # [1, 2, 3, 4]
```

### 23. Генератор Фибоначчи через yield

```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci()
print([next(gen) for _ in range(10)])  # [0,1,1,2,3,5,8,13,21,34]
```

### 24. Проверка анаграмм

```python
def is_anagram(a, b):
    a = a.lower().replace(" ", "")
    b = b.lower().replace(" ", "")
    return sorted(a) == sorted(b)

print(is_anagram("listen", "silent"))  # True
print(is_anagram("кот", "ток"))        # True
print(is_anagram("кот", "кит"))        # False
```

### 25. Разворот списка без срезов

```python
def reverse_list(lst):
    result = []
    for i in range(len(lst) - 1, -1, -1):
        result.append(lst[i])
    return result

print(reverse_list([1, 2, 3, 4]))  # [4, 3, 2, 1]
print([1, 2, 3, 4][::-1])          # то же самое через срез
```

---

## Задачи на применение

### 26. Валидация пароля

```python
def check_password(pw):
    return {
        "длина >= 8": len(pw) >= 8,
        "есть цифра": any(c.isdigit() for c in pw),
        "есть буква": any(c.isalpha() for c in pw),
        "есть спецсимвол": any(not c.isalnum() for c in pw),
    }

for k, ok in check_password("Passw0rd!").items():
    print(f"{'✓' if ok else '✗'} {k}")
```

### 27. Средний балл учеников

```python
grades = {"Аня": [5, 4, 5], "Боря": [3, 3], "Витя": [5, 5, 5]}
for name, g in grades.items():
    avg = sum(g) / len(g)
    print(f"{name}: {avg:.2f}")
```

### 28. Поиск числа по его делителям

```python
def divisors(n):
    return [i for i in range(1, n + 1) if n % i == 0]

print(divisors(12))  # [1, 2, 3, 4, 6, 12]
```

### 29. Шифрование «побуквенное зеркало»

```python
def mirror(text):
    alphabet = "абвгдежзийклмнопрстуфхцчшщъыьэюя"
    table = str.maketrans(alphabet, alphabet[::-1])
    return text.lower().translate(table)

print(mirror("привет"))   # фйчъуя? (зеркало алфавита)
```

Здесь `str.maketrans` сопоставляет каждой букве симметричную ей букву алфавита.

### 30. Число словами (десятки)

```python
def tens(n):
    names = {1: "один", 2: "два", 3: "три", 4: "четыре", 5: "пять",
             6: "шесть", 7: "семь", 8: "восемь", 9: "девять"}
    tens_names = {2: "двадцать", 3: "тридцать", 4: "сорок", 5: "пятьдесят",
                  6: "шестьдесят", 7: "семьдесят", 8: "восемьдесят", 9: "девяносто"}
    d, u = divmod(n, 10)
    parts = []
    if d:
        parts.append(tens_names[d])
    if u:
        parts.append(names[u])
    return " ".join(parts) if parts else "ноль"

print(tens(42))  # двадцать два... нет: 42 → сорок два
print(tens(7))   # семь
```

---

## Мини-проект 1: Игра «Угадай число»

Программа загадывает число от 1 до 100, пользователь угадывает с подсказками «больше/меньше». Считаем попытки.

```python
import random

secret = random.randint(1, 100)
attempts = 0
print("Я загадал число от 1 до 100.")

while True:
    user = int(input("Твоя догадка: "))
    attempts += 1
    if user < secret:
        print("Больше!")
    elif user > secret:
        print("Меньше!")
    else:
        print(f"Угадал за {attempts} попыток!")
        break
```

**Развитие идеи:** ограничить число попыток, добавить проверку ввода (`try/except`), режим «компьютер угадывает твоё число» (бинарный поиск).

---

## Мини-проект 2: Консольный to-do менеджер

Простейший список задач с командами: добавить, показать, удалить, выход.

```python
tasks = []

while True:
    cmd = input("> ").strip().lower()
    if cmd == "выход":
        break
    elif cmd == "показать":
        for i, t in enumerate(tasks, 1):
            print(f"{i}. {t}")
        if not tasks:
            print("Список пуст")
    elif cmd == "добавить":
        tasks.append(input("Новая задача: "))
    elif cmd == "удалить":
        idx = int(input("Номер: ")) - 1
        if 0 <= idx < len(tasks):
            removed = tasks.pop(idx)
            print(f"Удалено: {removed}")
        else:
            print("Нет такой задачи")
    else:
        print("Команды: показать / добавить / удалить / выход")
```

**Развитие идеи:** хранить с приоритетом, сохранять в файл, пометка «сделано».

---

## Мини-проект 3: Анализатор текста

Считает слова, буквы, уникальные слова, находит самое длинное слово.

```python
def analyze(text):
    words = text.lower().split()
    letters = [ch for ch in text.lower() if ch.isalpha()]
    return {
        "слов": len(words),
        "букв": len(letters),
        "уникальных слов": len(set(words)),
        "самое длинное слово": max(words, key=len),
    }

text = "В лесу родилась ёлочка, в лесу она росла."
for k, v in analyze(text).items():
    print(f"{k}: {v}")

# слов: 8, букв: 31, уникальных слов: 7, самое длинное: «родилась» или «ёлочка,» — зависит от
# чистки: чтобы убрать запятую, добавьте .strip(".,!?;:")
```

**Развитие идеи:** чтение текста из файла, гистограмма частот, топ-5 слов.

---

## Разбор решений: что здесь используется

| Задача | Ключевые приёмы |
|---|---|
| 9-12 | циклы, `str()`/`int()`, `%` и `//`, остатки |
| 13 | булевы списки, вложенные циклы, срезы |
| 14 | `index()`, `%` по длине алфавита, список → строка |
| 15 | стек (список) и словарь пар |
| 16 | сравнения без `max()`/`min()` |
| 17 | `Counter`-идея на словаре, сортировка по ключу |
| 18 | два указателя |
| 19 | хеш-таблица (словарь) |
| 20-25 | comprehension, `yield`, срезы, `sorted` |
| 26-30 | `any`, `all`, `isalnum`, `divmod`, `str.maketrans` |

---

## Чек-лист самопроверки

- [ ] Пишу с отступами в 4 пробела
- [ ] Использую f-строки вместо конкатенации
- [ ] Не изменяю список во время его обхода
- [ ] Внимателен к типу из `input()` — это всегда строка
- [ ] Использую `enumerate` вместо `range(len(...))`
- [ ] В функциях не использую изменяемые значения по умолчанию
- [ ] Проверяю деление на ноль
- [ ] Сравниваю значения через `==`, а не `is`
- [ ] Строки не изменяются на месте — сохраняю результат
- [ ] Комментирую только сложные места
- [ ] Сначала решаю сам, затем сверяюсь с решениями выше

---

*Конец практики Unit 1. Далее: Unit 2 — структуры данных (словари, множества, генераторы, файлы).*
