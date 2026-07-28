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
