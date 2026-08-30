# Python — Unit 2: Задачи

Практика по структурам данных. Структура файла:

- Разбор задач из `syntax.md` (5 задач с готовыми решениями)
- 25 упражнений с решениями по темам: словари, множества, компрехеншены, lambda/функции, файлы, ошибки
- Мини-проект: «Анализатор текста»
- Мини-проект: «Заметки (CLI)» (базовый, для прогрева)
- Чек-лист для проверки знаний

---

## Задачи на словари

```python
# 1. Счётчик символов
text = "hello world"
counter = {}
for ch in text:
    counter[ch] = counter.get(ch, 0) + 1
print(counter)

# 2. Инвертирование словаря
d = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in d.items()}
print(inverted)  # {1: 'a', 2: 'b', 3: 'c'}

# 3. Группировка по ключу
data = [("фрукт", "яблоко"), ("фрукт", "банан"), ("овощ", "морковь")]
groups = {}
for key, val in data:
    groups.setdefault(key, []).append(val)
print(groups)  # {'фрукт': ['яблоко', 'банан'], 'овощ': ['морковь']}
```

---

## Задачи на файлы

```python
# 4. Копирование файла
with open("source.txt", "r") as src, open("dest.txt", "w") as dst:
    dst.write(src.read())

# 5. Поиск в файле
query = input("Поиск: ")
with open("data.txt", "r") as f:
    for i, line in enumerate(f, 1):
        if query.lower() in line.lower():
            print(f"Строка {i}: {line.strip()}")

# 6. CSV парсер
csv_data = """name,age,city
Алиса,25,Москва
Борис,30,СПб"""
lines = csv_data.split("\n")
headers = lines[0].split(",")
result = [dict(zip(headers, line.split(","))) for line in lines[1:]]
print(result)
```

---

## Мини-проект: Заметки (CLI)

```python
import json, os

DB = "notes.json"

def load():
    if os.path.exists(DB):
        with open(DB, "r") as f:
            return json.load(f)
    return []

def save(notes):
    with open(DB, "w") as f:
        json.dump(notes, f, indent=2, ensure_ascii=False)

def main():
    notes = load()
    while True:
        cmd = input("\n(add/list/del/quit): ").strip()
        if cmd == "add":
            text = input("Заметка: ")
            notes.append({"text": text, "done": False})
            save(notes)
        elif cmd == "list":
            for i, n in enumerate(notes, 1):
                status = "✓" if n["done"] else " "
                print(f"{i}. [{status}] {n['text']}")
        elif cmd == "del":
            i = int(input("Номер: ")) - 1
            if 0 <= i < len(notes):
                notes.pop(i)
                save(notes)
        elif cmd == "quit":
            break

if __name__ == "__main__":
    main()
```

---

## Ответы

1. `{n: n**2 for n in numbers}`
2. `[x for x in range(1, 51) if x % 2 == 0]`
3. `sum(1 for _ in open("file.txt"))`
4. `sorted(strings, key=lambda s: len(s))`

---

## Разбор задач из syntax.md

### Задача 1. Функция: список → словарь {число: квадрат}

```python
def to_squares(numbers):
    return {n: n**2 for n in numbers}

print(to_squares([1, 2, 3]))   # {1: 1, 2: 4, 3: 9}

# Вариант циклом (для новичков)
def to_squares_loop(numbers):
    result = {}
    for n in numbers:
        result[n] = n**2
    return result
```

Разбор: dict comprehension — ключ `n`, значение `n**2`. Если числа повторяются, более поздний ключ перезапишет более ранний.

### Задача 2. Все чётные от 1 до 50

```python
evens = [x for x in range(1, 51) if x % 2 == 0]
print(evens)   # [2, 4, 6, ..., 50]

# Компактнее: range можно стартовать с чётного
evens2 = list(range(2, 51, 2))
print(evens2 == evens)   # True
```

### Задача 3. Считать строки в файле

```python
# Короткий вариант
count = sum(1 for _ in open("file.txt", encoding="utf-8"))
print("Строк:", count)

# Надёжный вариант с with
with open("file.txt", "r", encoding="utf-8") as f:
    count = 0
    for _ in f:
        count += 1
print("Строк:", count)
```

### Задача 4. Сортировка строк по длине через lambda

```python
strings = ["python", "c", "rust", "go", "java"]
by_len = sorted(strings, key=lambda s: len(s))
print(by_len)   # ['c', 'go', 'java', 'rust', 'python']

# Та же длина — сохраняется исходный порядок (стабильность сортировки)
# Если нужны равные длины по алфавиту:
by_len_name = sorted(strings, key=lambda s: (len(s), s))
print(by_len_name)   # ['c', 'go', 'java', 'rust', 'python']
```

### Задача 5. Калькулятор с обработкой ошибок

```python
def calculator():
    print("Калькулятор. Введите 'exit' для выхода.")
    while True:
        raw = input("Пример (например: 10 / 3): ").strip()
        if raw.lower() == "exit":
            break
        try:
            a, op, b = raw.split()
            a, b = float(a), float(b)
        except ValueError:
            print("Непонятный ввод. Формат: число оператор число")
            continue
        try:
            if op == "+":    result = a + b
            elif op == "-":  result = a - b
            elif op == "*":  result = a * b
            elif op == "/":  result = a / b
            else:            raise ValueError(f"неизвестный оператор {op}")
        except ZeroDivisionError:
            print("Деление на ноль!")
            continue
        except ValueError as e:
            print("Ошибка:", e)
            continue
        print(f"{a} {op} {b} = {result}")

if __name__ == "__main__":
    calculator()
```

---

## Упражнения по темам (25 с решениями)

### Словари: упражнения 1–6

**1. Частоты символов.** Подсчитайте, сколько раз встречается каждый символ.

```python
text = "программирование"
freq = {}
for ch in text:
    freq[ch] = freq.get(ch, 0) + 1
print(freq)   # {'п':1,'р':3,'о':2,'г':1,'а':1,'м':2,'и':1,'в':1,'н':1,'е':1}
```

**2. Словарь из двух списков.** Соберите `{имя: возраст}`.

```python
names = ["Аня", "Боря", "Вера"]
ages = [25, 30, 28]
people = dict(zip(names, ages))
print(people)   # {'Аня': 25, 'Боря': 30, 'Вера': 28}
```

**3. Инверсия словаря.** Поменяйте ключи и значения местами (значения уникальны).

```python
d = {"apple": 1, "pear": 2, "plum": 3}
inverted = {v: k for k, v in d.items()}
print(inverted)   # {1: 'apple', 2: 'pear', 3: 'plum'}
```

**4. Частоты слов в предложении.**

```python
sentence = "кот и кот спит а пёс и пёс лает"
words = sentence.split()
counter = {}
for w in words:
    counter[w] = counter.get(w, 0) + 1
print(sorted(counter.items(), key=lambda x: -x[1]))
# [('и', 2), ('кот', 2), ('пёс', 2), ('спит', 1), ('а', 1)]
```

**5. Группировка по категории.** Сгруппируйте список по ключу.

```python
items = [
    ("напиток", "чай"), ("напиток", "кофе"),
    ("еда", "суп"), ("еда", "хлеб"), ("напиток", "сок"),
]
menu = {}
for cat, item in items:
    menu.setdefault(cat, []).append(item)
print(menu)
# {'напиток': ['чай', 'кофе', 'сок'], 'еда': ['суп', 'хлеб']}
```

**6. Топ по рейтингу.** Отсортируйте словарь по значениям (убывание).

```python
scores = {"Иван": 12, "Аня": 25, "Пётр": 8, "Оля": 25}
top = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
print(top)   # [('Аня', 25), ('Оля', 25), ('Иван', 12), ('Пётр', 8)]
# Кстати: max(scores, key=scores.get) → 'Аня'
```

### Множества: упражнения 7–10

**7. Уникальные слова без потери порядка.**

```python
words = ["да", "нет", "да", "стоп", "нет", "иди"]
seen = set()
ordered = []
for w in words:
    if w not in seen:
        seen.add(w)
        ordered.append(w)
print(ordered)   # ['да', 'нет', 'стоп', 'иди']
# set(words) не подойдёт — порядок не сохранится
```

**8. Общие элементы двух списков.**

```python
a = [1, 2, 3, 4, 5]
b = [4, 5, 6, 7]
common = sorted(set(a) & set(b))
print(common)   # [4, 5]
```

**9. Элементы только в первом списке.**

```python
a = [1, 2, 3]
b = [2, 3, 4]
only_a = list(set(a) - set(b))
print(only_a)   # [1]
```

**10. Уникальные буквы строки (в алфавитном порядке).**

```python
text = "ананас"
letters = sorted(set(text))
print(letters)   # ['а', 'н', 'с']
print("".join(letters))   # 'анс'
```

### Компрехеншены: упражнения 11–14

**11. Квадраты чётных чисел от 0 до 19.**

```python
sq = [x**2 for x in range(20) if x % 2 == 0]
print(sq)   # [0, 4, 16, 36, 64, 100, 144, 196, 256, 324]
```

**12. Таблица умножения 5×5.**

```python
table = [[i * j for j in range(1, 6)] for i in range(1, 6)]
for row in table:
    print(row)
# [1, 2, 3, 4, 5]
# [2, 4, 6, 8, 10]
# [3, 6, 9, 12, 15]
# [4, 8, 12, 16, 20]
# [5, 10, 15, 20, 25]
```

**13. Заменить отрицательные числа на 0.**

```python
nums = [5, -1, 3, -8, 0, 7]
fixed = [n if n > 0 else 0 for n in nums]
print(fixed)   # [5, 0, 3, 0, 0, 7]
```

**14. Длины слов одним выражением + отфильтровать короткие.**

```python
words = ["кот", "питон", "код", "программирование"]
lengths = [len(w) for w in words if len(w) > 3]
print(lengths)   # [5, 16]
```

### Lambda, map, filter, reduce: упражнения 15–18

**15. Сортировка списка словарей по полю `"price"`.**

```python
items = [
    {"name": "книга", "price": 700},
    {"name": "ручка", "price": 40},
    {"name": "тетрадь", "price": 150},
]
bought = sorted(items, key=lambda it: it["price"])
print([it["name"] for it in bought])   # ['ручка', 'тетрадь', 'книга']
```

**16. Строки цифр в числа (map).**

```python
raw = ["1", "25", "300"]
nums = list(map(int, raw))
print(sum(nums))   # 326
```

**17. Оставить делители числа 12 (filter).**

```python
numbers = list(range(1, 13))
divisors = list(filter(lambda x: 12 % x == 0, numbers))
print(divisors)   # [1, 2, 3, 4, 6, 12]
```

**18. Произведение всех чисел (reduce).**

```python
from functools import reduce
nums = [2, 3, 4]
product = reduce(lambda a, b: a * b, nums)
print(product)   # 24
```

### Файлы: упражнения 19–22

**19. Копирование файла построчно (для больших файлов).**

```python
with open("in.txt", "r", encoding="utf-8") as src, \
     open("out.txt", "w", encoding="utf-8") as dst:
    for line in src:
        dst.write(line)
```

**20. Поиск строк по ключевому слову с номером строки.**

```python
word = "python"
with open("notes.txt", "r", encoding="utf-8") as f:
    found = [(i, line.strip()) for i, line in enumerate(f, 1)
             if word.lower() in line.lower()]
for num, text in found:
    print(f"{num}: {text}")
```

**21. Статистика файла: строки, слова, символы.**

```python
with open("text.txt", "r", encoding="utf-8") as f:
    text = f.read()
lines = text.count("\n") + 1
words = len(text.split())
chars = len(text)
print(f"строк: {lines}, слов: {words}, символов: {chars}")
```

**22. Сохранение и загрузка данных в JSON.**

```python
import json

library = [
    {"title": "Мастер и Маргарита", "year": 1967},
    {"title": "1984", "year": 1949},
]

with open("library.json", "w", encoding="utf-8") as f:
    json.dump(library, f, ensure_ascii=False, indent=2)

with open("library.json", "r", encoding="utf-8") as f:
    again = json.load(f)

print(again[0]["title"])   # Мастер и Маргарита
```

### Обработка ошибок: упражнения 23–25

**23. Безопасный ввод числа (цикл до успеха).**

```python
def ask_number(prompt="Число: "):
    while True:
        raw = input(prompt)
        try:
            return float(raw)
        except ValueError:
            print("Это не число, попробуйте ещё раз.")

x = ask_number()
print("Ввели:", x)
```

**24. Обработка отсутствующего файла.**

```python
try:
    with open("нет_такого.txt", "r", encoding="utf-8") as f:
        data = f.read()
except FileNotFoundError:
    print("Файл не найден — создадим дефолтные данные.")
    data = ""

print(len(data))
```

**25. Правильная обработка сложной операции.**

```python
def safe_divide_with_split(raw):
    """Вход: '10 / 3' или '10/0'. Возвращает результат или None."""
    try:
        a, op, b = raw.replace(" ", "").split("/")
        return float(a) / float(b)
    except ValueError:
        print("Формат: 'a / b'")
        return None
    except ZeroDivisionError:
        print("Деление на ноль!")
        return None

print(safe_divide_with_split("10 / 4"))   # 2.5
print(safe_divide_with_split("5 / 0"))    # Деление на ноль! None
```

---

## Мини-проект: Анализатор текста

CLI-утилита, которая читает текстовый файл и строит отчёт: число строк и слов, уникальные слова, топ-N самых частых слов, частоты символов. Собираем элементы юнита: файлы, словари, множества, компрехеншены, lambda, `Counter`, обработка ошибок.

### Этап 1. Чтение и базовые метрики

```python
from collections import Counter

def read_text(path):
    """Читает файл; при ошибке возвращает пустую строку."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print(f"Файл {path} не найден.")
        return ""

def normalize(text):
    """Нижний регистр + замена не-буквенных символов пробелом."""
    return "".join(ch.lower() if ch.isalpha() else " " for ch in text)
```

### Этап 2. Анализ

```python
def analyze(text):
    if not text:
        return {}
    clean = normalize(text)
    words = clean.split()
    chars = [ch for ch in text if ch.isalpha()]

    return {
        "строк": text.count("\n") + 1,
        "слов_всего": len(words),
        "уникальных_слов": len(set(words)),
        "символов": len(chars),
        "частоты_слов": Counter(words),
        "частоты_букв": Counter(chars),
    }
```

### Этап 3. Отчёт

```python
def top(stat, n=5):
    return stat["частоты_слов"].most_common(n)

def write_report(stat, path, n=5):
    lines = [
        "=== ОТЧЁТ ПО ТЕКСТУ ===",
        f"Строк: {stat['строк']}",
        f"Всего слов: {stat['слов_всего']}",
        f"Уникальных слов: {stat['уникальных_слов']}",
        f"Символов (без пробелов): {stat['символов']}",
        f"\nТоп-{n} самых частых слов:",
    ]
    for word, count in top(stat, n):
        lines.append(f"  {word:15s} — {count}")
    lines.append("\nСамые частые буквы:")
    for ch, count in stat["частоты_букв"].most_common(3):
        lines.append(f"  '{ch}' — {count}")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def main():
    src = input("Путь к файлу: ").strip()
    stat = analyze(read_text(src))
    if not stat:
        print("Нечего анализировать.")
        return
    write_report(stat, "report.txt")
    print(f"Готово! Отчёт: report.txt (топ-5 слов — {top(stat)})")

if __name__ == "__main__":
    main()
```

### Этап 4. Проверка на демо-тексте

```python
demo = """Кот сидел на окне.
Кот смотрел на улицу.
Пёс бежал мимо дома."""
stat = analyze(demo)
print(stat["уникальных_слов"])            # 9
print(stat["частоты_слов"].most_common(2))  # [('кот', 2), ('на', 2)]
```

Что тренирует проект: функции с `docstring`, `try/except`, генераторные выражения, `Counter`, `set` для уникальности, запись отчёта, `f-строки` с выравниванием.

---

## Чек-лист перед Unit 3

Пройдитесь по пунктам — если хотя бы два «нет», вернитесь к соответствующим секциям:

| № | Проверка | Где смотреть |
|---|---|---|
| 1 | Могу написать `{ч: ч**2 for ч in ...}` без подсматривания | syntax §3 |
| 2 | Знаю разницу `sort()` / `sorted()`, `remove` / `pop` | syntax §10, §18 |
| 3 | Могу посчитать частоты слов двумя способами | practice №4, syntax §8 |
| 4 | Понимаю, зачем `with` и `encoding="utf-8"` | syntax §5, §14 |
| 5 | Могу перехватить и классифицировать ошибки ввода | practice №23–25 |
| 6 | Объясню сложность `in` для list vs set | syntax §17 |
| 7 | Могу сделать глубокую копию и знаю, когда она нужна | syntax §9 |
| 8 | Напишу sort по двум критериям через key-кортеж | syntax §10 |
| 9 | Знаю, что `input()` возвращает строку и всегда приводится вручную | syntax §18 |
| 10 | Могу сохранить данные в JSON и загрузить обратно | syntax §14, practice №22 |

---

*Дальше — Unit 3: ООП и продвинутые темы, где структуры данных станут «кирпичиками» для классов и генераторов.*