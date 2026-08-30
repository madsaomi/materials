# Python — Unit 1: Основы синтаксиса

## 1. Переменные и типы

```python
# Динамическая типизация
name = "Алиса"        # str
age = 25              # int
height = 1.75         # float
is_student = True     # bool

# type() — узнать тип
print(type(name))     # <class 'str'>
```

## 2. Ввод и вывод

```python
name = input("Как тебя зовут? ")
print(f"Привет, {name}!")
```

## 3. Условные операторы

```python
age = int(input("Сколько лет? "))
if age >= 18:
    print("Взрослый")
elif age >= 13:
    print("Подросток")
else:
    print("Ребёнок")
```

## 4. Циклы

```python
# for
for i in range(5):
    print(i)           # 0 1 2 3 4

# while
count = 0
while count < 3:
    print(count)
    count += 1
```

## 5. Списки

```python
fruits = ["яблоко", "банан", "апельсин"]
fruits.append("груша")        # добавить
fruits[0]                     # первый элемент
len(fruits)                   # длина
for f in fruits:
    print(f)
```

## 6. Функции

```python
def greet(name):
    return f"Привет, {name}!"

print(greet("Мир"))  # Привет, Мир!
```

## 7. Строки

```python
s = "Hello, World!"
s.upper()          # HELLO, WORLD!
s.lower()          # hello, world!
s.split(",")       # ['Hello', ' World!']
s.replace("Hello", "Hi")  # Hi, World!
s.strip()          # удалить пробелы
```

## 8. Задачи

1. Напишите программу, которая запрашивает имя и возраст, выводит приветствие
2. Напишите функцию, принимающую два числа и возвращающую их сумму
3. Создайте список чисел от 1 до 10, выведите только чётные  
4. Напишите программу, проверяющую, является ли число простым

---

## 9. Числа и арифметика

### 9.1 Виды чисел

```python
a = 42            # int — целое, произвольной точности
b = 3.14          # float — вещественное (IEEE 754, 64 бита)
c = 1 + 2j        # complex — комплексное (j — мнимая единица)
d = 1_000_000     # подчёркивание для читаемости
big = 10 ** 100   # целое любого размера
```

Вещественные числа хранятся не точно:

```python
print(0.1 + 0.2)              # 0.30000000000000004
print(round(0.1 + 0.2, 2))    # 0.3

# для денег и точных расчётов — decimal
from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))  # 0.3

# для дробей — fractions
from fractions import Fraction
print(Fraction(1, 3) + Fraction(1, 6))  # 1/2
```

### 9.2 Арифметические операторы

| Оператор | Название | Пример | Результат |
|---|---|---|---|
| `+` | сложение | `7 + 3` | `10` |
| `-` | вычитание | `7 - 3` | `4` |
| `*` | умножение | `7 * 3` | `21` |
| `/` | деление (всегда float) | `7 / 2` | `3.5` |
| `//` | целочисленное деление (вниз) | `7 // 2`; `-7 // 2` | `3`; `-4` |
| `%` | остаток от деления | `7 % 3` | `1` |
| `**` | возведение в степень | `2 ** 10` | `1024` |
| `abs(x)` | модуль числа | `abs(-5)` | `5` |
| `divmod(a, b)` | (частное, остаток) | `divmod(7, 3)` | `(2, 1)` |
| `pow(x, y)` | степень | `pow(2, 10)` | `1024` |

Особенности `//` и `%` с отрицательными числами:

```python
print(7 // 3)     # 2  (2*3+1=7)
print(-7 // 3)    # -3 (деление «вниз»)
print(7 % 3)      # 1
print(-7 % 3)     # 2  (остаток положительный)
print(divmod(-7, 3))  # (-3, 2)
```

### 9.3 Системы счисления

```python
print(0b1010)   # 10  — двоичная
print(0o17)     # 15  — восьмеричная
print(0xFF)     # 255 — шестнадцатеричная

print(bin(10))     # '0b1010'
print(oct(15))     # '0o17'
print(hex(255))    # '0xff'
print(int("ff", 16))  # 255
print(int("1010", 2)) # 10
```

### 9.4 Приоритет операторов

| Приоритет | Операторы |
|---|---|
| 1 (высший) | `**` |
| 2 | унарные `+x`, `-x`, `~x` |
| 3 | `*`, `/`, `//`, `%` |
| 4 | `+`, `-` |
| 5 | `<<`, `>>` (побитовый сдвиг) |
| 6 | `&` (побитовое И) |
| 7 | `^` (исключающее ИЛИ) |
| 8 | `|` (побитовое ИЛИ) |
| 9 | сравнения `==`, `!=`, `<`, `>`, `<=`, `>=`, `is`, `in` |
| 10 | `not` |
| 11 | `and` |
| 12 (низший) | `or` |

```python
print(2 + 3 * 4)    # 14  (* раньше +)
print((2 + 3) * 4)  # 20  (скобки меняют порядок)
print(2 ** 3 ** 2)  # 512 (** вычисляется справа налево: 3**2=9, 2**9)
print(-2 ** 2)      # -4  (минус унарный, применяется после степени)
```

---

## 10. Строки — продвинутое

### 10.1 Четыре способа записи строк

```python
s1 = "одинарные кавычки внутри 'этих'"
s2 = 'и наоборот "такие"'
s3 = """многострочная
строка"""
s4 = r"C:\Users\data\file.txt"   # raw-строка: \ не экранирует
s5 = f"переменная s1 = {s1}"     # f-строка — интерполяция
```

### 10.2 Индексация и срезы

```python
word = "Python"
# P y t h o n
# 0 1 2 3 4 5
word[0]    # 'P'
word[-1]   # 'n'
```

| Срез | Результат | Пояснение |
|---|---|---|
| `s[1:4]` | `"yth"` | от 1 до 3 включительно |
| `s[:3]` | `"Pyt"` | от начала |
| `s[3:]` | `"hon"` | до конца |
| `s[::2]` | `"Pto"` | каждый второй |
| `s[::-1]` | `"nohtyP"` | переворот строки |
| `s[1::2]` | `"yh"` | с шагом 2 от индекса 1 |

Срезы никогда не дают IndexError (границы обрезаются автоматически):

```python
print("abc"[5:])    # '' — просто пустая строка
print("abc"[-100:]) # 'abc'
```

### 10.3 Методы строк

| Метод | Назначение | Пример |
|---|---|---|
| `upper()` / `lower()` | регистр | `"Hi".upper()` → `"HI"` |
| `capitalize()` | первая буква | `"hi".capitalize()` → `"Hi"` |
| `title()` | слова с большой | `"hi world".title()` → `"Hi World"` |
| `strip()` | убрать пробелы по краям | `" a ".strip()` → `"a"` |
| `split(sep)` | в список | `"a,b".split(",")` → `["a","b"]` |
| `join(список)` | из списка в строку | `",".join(["a","b"])` → `"a,b"` |
| `replace(a, b)` | замена | `"aa".replace("a","b")` → `"bb"` |
| `find(sub)` | индекс или `-1` | `"abc".find("b")` → `1` |
| `index(sub)` | индекс или ValueError | `"abc".index("z")` → ошибка |
| `count(sub)` | число вхождений | `"aab".count("a")` → `2` |
| `startswith(pre)` | начинается с? | `"abc".startswith("ab")` → `True` |
| `endswith(suf)` | заканчивается на? | `"abc".endswith("bc")` → `True` |
| `isdigit()` | только цифры? | `"123".isdigit()` → `True` |
| `isalpha()` | только буквы? | `"abc".isalpha()` → `True` |
| `isalnum()` | буквы и цифры? | `"a1".isalnum()` → `True` |
| `isspace()` | только пробелы? | `" ".isspace()` → `True` |
| `zfill(n)` | дополнить нулями | `"42".zfill(5)` → `"00042"` |

### 10.4 Форматирование строк

```python
name, age = "Алиса", 25

# f-строки — предпочтительный способ (3.6+)
print(f"Имя: {name}, возраст: {age}")
print(f"Рост: {1.75:.2f} м")        # 1.75
print(f"Доля: {0.25:.0%}")          # 25%
print(f"Число: {42:5}")             # выравнивание по ширине 5
print(f"{name:*<10}")               # Алиса***** (влево, заполнитель *)
print(f"{name:*>10}")               # *****Алиса (вправо)
print(f"{name:*^10}")               # **Алиса*** (по центру)

# .format() — способ до f-строк
print("{} и {}".format("a", "b"))
print("{1} и {0}".format("a", "b"))  # b и a — по индексу

# старый %-стиль (из C)
print("%s %d лет" % (name, age))
```

### 10.5 Приёмы работы со строками

```python
text = "  Hello, world! Hello, Python!  "

# чистим и делим на слова
words = text.strip().lower().split()
print(words)  # ['hello,', 'world!', 'hello,', 'python!']

# удалить знаки препинания
import re
clean = re.sub(r"[^\w\s]", "", text.lower())
print(clean.split())  # ['hello', 'world', 'hello', 'python']

# проверка палиндрома одной строкой
print("топот" == "топот"[::-1])     # True

# число вхождений подстроки
print("ababa".count("aba"))         # 1 (непересекающиеся)

# символ <-> код
print(ord("А"))     # 1040
print(chr(1040 + 1))  # 'Б'
```

---

## 11. Списки — продвинутое

### 11.1 Методы списков

| Метод | Назначение | Пример |
|---|---|---|
| `append(x)` | добавить в конец | `[1].append(2)` → `[1, 2]` |
| `extend(list)` | добавить все элементы | `[1].extend([2,3])` → `[1,2,3]` |
| `insert(i, x)` | вставить на позицию | `[1,3].insert(1,2)` → `[1,2,3]` |
| `remove(x)` | удалить первый такой | `[1,2,1].remove(1)` → `[2,1]` |
| `pop([i])` | удалить и вернуть | `[1,2].pop()` → `2` |
| `clear()` | очистить список | `[1].clear()` → `[]` |
| `index(x)` | индекс первого вхождения | `[1,2].index(2)` → `1` |
| `count(x)` | количество вхождений | `[1,2,1].count(1)` → `2` |
| `sort()` | сортировка (in-place) | `[3,1,2].sort()` → `[1,2,3]` |
| `reverse()` | разворот (in-place) | `[1,2].reverse()` → `[2,1]` |
| `copy()` | копия списка | `[1,2].copy()` → `[1,2]` |

Отличие `sort()` от `sorted()`: первый изменяет список и возвращает `None`, второй возвращает новый список.

### 11.2 Копирование — важное предупреждение

```python
a = [1, 2, 3]
b = a            # b ссылается на ТОТ ЖЕ список
b.append(4)
print(a)         # [1, 2, 3, 4] — a изменился!

c = a.copy()     # независимая копия
c.append(5)
print(a, c)      # [1,2,3,4] [1,2,3,4,5]

# copy.copy() vs copy.deepcopy()
import copy
nested = [[1, 2], [3, 4]]
shallow = copy.copy(nested)      # копия «одного уровня»
deep = copy.deepcopy(nested)     # полная копия

shallow[0][0] = 99
print(nested)   # [[99, 2], [3, 4]] — вложенный список общий!
deep[0][0] = 1
print(nested)   # [[99, 2], [3, 4]] — deep не затронул исходник
```

### 11.3 Списковые включения (list comprehension)

```python
# [выражение for элемент in итерируемый if условие]
squares = [x ** 2 for x in range(5)]       # [0,1,4,9,16]
evens = [x for x in range(20) if x % 2 == 0]
pairs = [(a, b) for a in "AB" for b in [1, 2]]
# [('A',1),('A',2),('B',1),('B',2)]

# матрица 3x3
matrix = [[0] * 3 for _ in range(3)]
print(matrix)  # [[0, 0, 0], [0, 0, 0], [0, 0, 0]]

# flatten — развернуть вложенный список
flat = [x for row in [[1,2],[3,4]] for x in row]  # [1,2,3,4]

# тернарное выражение внутри
nums = [-2, 5, -1, 8]
print([x if x > 0 else 0 for x in nums])   # [0,5,0,8]
```

### 11.4 Вложенные списки и матрицы

```python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
print(matrix[1][2])   # 6

# обход по строкам
for row in matrix:
    print(" ".join(str(x) for x in row))

# транспонирование
transposed = [list(row) for row in zip(*matrix)]
print(transposed)  # [[1,4,7],[2,5,8],[3,6,9]]
```

---

## 12. Кортежи и распаковка

```python
point = (3, 4)
x, y = point          # распаковка
a, b = b, a           # обмен значений
first, *rest = [1, 2, 3, 4]          # first=1, rest=[2,3,4]
first, *middle, last = [1,2,3,4,5]   # first=1, middle=[2,3,4], last=5

# кортеж неизменяем, но может содержать изменяемые объекты
t = ([1], 2)
t[0].append(3)
print(t)              # ([1, 3], 2)

# кортеж как ключ словаря
routes = {(10, 20): "дом", (30, 40): "парк"}

# одноэлементный кортеж требует запятую
single = (42,)
print(type((42)))     # <class 'int'>  — не кортеж!
print(type((42,)))    # <class 'tuple'>
```

```python
# распаковка в цикле
points = [(1, 2), (3, 4), (5, 6)]
for x, y in points:
    print(x + y)      # 3 7 11

# пропуск ненужных значений
_, important = (1, 2)
print(important)      # 2
```

---

## 13. Словари — продвинутое

### 13.1 Методы словаря

| Метод | Назначение | Пример |
|---|---|---|
| `get(k)` | значение или `None` | `d.get("x")` |
| `get(k, dflt)` | значение или умолчание | `d.get("x", 0)` |
| `pop(k)` | удалить и вернуть | `d.pop("x")` |
| `popitem()` | удалить последнюю пару | `d.popitem()` |
| `setdefault(k, v)` | значение, если нет — записать `v` | `d.setdefault("x", 1)` |
| `update(d2)` | обновить из другого словаря | `d.update({"a": 1})` |
| `keys()` | ключи | `d.keys()` |
| `values()` | значения | `d.values()` |
| `items()` | пары (ключ, значение) | `d.items()` |
| `clear()` | очистить | `d.clear()` |
| `fromkeys(seq, v)` | словарь из ключей | `dict.fromkeys(["a","b"], 0)` |

### 13.2 Слияние и comprehension

```python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
merged = d1 | d2            # 3.9+: {'a':1,'b':3,'c':4}
print({**d1, **d2})         # то же, до 3.9

# подсчёт частот символов
text = "abracadabra"
freq = {}
for ch in text:
    freq[ch] = freq.get(ch, 0) + 1
print(freq)  # {'a':5,'b':2,'r':2,'c':1,'d':1}

# словарь как «switch»
def operate(a, b, op):
    actions = {
        "+": a + b,
        "-": a - b,
        "*": a * b,
    }
    return actions.get(op, None)

print(operate(2, 3, "*"))   # 6
```

### 13.3 Сохраняется ли порядок?

```python
# с Python 3.7 словарь сохраняет порядок вставки
d = {}
d["первый"] = 1
d["второй"] = 2
print(list(d))  # ['первый', 'второй']

# сортировка словаря по значениям
scores = {"Аня": 5, "Борис": 8, "Витя": 6}
top = sorted(scores, key=scores.get, reverse=True)
print(top)  # ['Борис', 'Витя', 'Аня']
```

---

## 14. Множества — продвинутое

```python
a = {1, 2, 3, 4}
b = {3, 4, 5}

a | b      # объединение        {1,2,3,4,5}
a & b      # пересечение        {3,4}
a - b      # разность           {1,2}
a ^ b      # симметрич. разность {1,2,5}
a <= b     # a — подмножество b? False
2 in a     # True

# генерация множества → уникальность
nums = [3, 1, 2, 3, 1]
print(set(nums))     # {1, 2, 3}

# frozenset — неизменяемое множество (может быть ключом)
fs = frozenset({1, 2, 3})
d = {fs: "значение"}

# добавление/удаление
s = {1, 2}
s.add(3)          # {1,2,3}
s.discard(100)    # нет ошибки, если элемента нет
# s.remove(100)   # KeyError!
s.pop()           # удаляет произвольный элемент
```

---

## 15. Преобразование типов

| Функция | Назначение | Пример |
|---|---|---|
| `int(x)` | в целое | `int("42")` → `42` |
| `float(x)` | в вещественное | `float("3.5")` → `3.5` |
| `str(x)` | в строку | `str(42)` → `"42"` |
| `bool(x)` | в булево | `bool("")` → `False` |
| `list(iterable)` | в список | `list("abc")` → `["a","b","c"]` |
| `tuple(iterable)` | в кортеж | `tuple([1,2])` → `(1,2)` |
| `set(iterable)` | во множество | `set([1,1])` → `{1}` |
| `dict(pairs)` | в словарь | `dict([("a",1)])` → `{"a":1}` |
| `ord(ch)` | символ → код | `ord("A")` → `65` |
| `chr(code)` | код → символ | `chr(65)` → `"A"` |
| `repr(x)` | отладочная строка | `repr("a")` → `"'a'"` |

```python
# типичные ловушки
print(int("abc"))     # ValueError — нельзя
print(int("3.5"))     # ValueError — нужен float() сначала
print(float("3.5"))   # 3.5
print(bool("False"))  # True — непустая строка!
print(bool(""))       # False
```

---

## 16. Условные операторы — продвинутое

### 16.1 Тернарный оператор

```python
age = 20
status = "взрослый" if age >= 18 else "ребёнок"

# вложенные тернарники (лучше избегать)
kind = ("ребёнок" if age < 13 else
        "подросток" if age < 18 else
        "взрослый")
```

### 16.2 Цепочки сравнений

```python
x = 7
print(1 < x < 10)     # True
print(1 < x < 7)      # False (7 < 7 — ложь)
print(x == 7 == 7)    # True

# короткая проверка диапазона
if 0 <= x <= 100:
    print("в диапазоне")
```

### 16.3 match-case (Python 3.10+)

```python
command = input("Команда: ")

match command:
    case "start":
        print("Запуск...")
    case "stop":
        print("Остановка...")
    case "quit" | "exit":
        print("Выход")
    case _:
        print("Неизвестная команда")
```

Структурное сопоставление с образцом:

```python
def describe(value):
    match value:
        case 0:
            return "ноль"
        case [x, y]:
            return f"пара чисел: {x} и {y}"
        case {"name": n, "age": a} if a >= 18:
            return f"взрослый {n}"
        case _:
            return "что-то другое"

print(describe([1, 2]))                            # пара чисел: 1 и 2
print(describe({"name": "Аня", "age": 20}))        # взрослый Аня
print(describe({"name": "Витя", "age": 15}))       # что-то другое
```

---

## 17. Циклы — продвинутое

### 17.1 break, continue, else

```python
# break — досрочный выход
for i in range(10):
    if i == 3:
        break
    print(i, end=" ")   # 0 1 2
print()

# continue — пропустить итерацию
for i in range(6):
    if i % 2 == 0:
        continue
    print(i, end=" ")   # 1 3 5
print()

# else у цикла — выполняется, если НЕ было break
for n in range(2, 10):
    for d in range(2, n):
        if n % d == 0:
            break
    else:
        print(n, end=" ")   # 2 3 5 7 — простые числа
print()
```

### 17.2 while и бесконечные циклы

```python
# while-else: else выполняется после обычного завершения
count = 0
while count < 3:
    count += 1
else:
    print("цикл завершён")  # печатается

# выход по условию
while True:
    line = input("Скажи 'стоп': ")
    if line.lower() == "стоп":
        break
```

### 17.3 zip и enumerate

```python
names = ["Аня", "Боря", "Витя"]
ages = [20, 22, 19]

for name, age in zip(names, ages):
    print(f"{name}: {age}")

for i, name in enumerate(names, start=1):
    print(f"{i}. {name}")

# zip останавливается по самому короткому списку
print(list(zip([1, 2, 3], "ab")))   # [(1,'a'), (2,'b')]
```

---

## 18. Функции — продвинутое

### 18.1 Виды параметров

| Вид | Запись | Пример вызова |
|---|---|---|
| Позиционные | `def f(a, b, c)` | `f(1, 2, 3)` |
| Именованные | `def f(a, b)` | `f(b=2, a=1)` |
| По умолчанию | `def f(a, b=10)` | `f(1)` |
| `*args` — лишние позиционные | `def f(*args)` | `f(1,2,3)` |
| `**kwargs` — лишние именованные | `def f(**kwargs)` | `f(x=1, y=2)` |
| keyword-only (только именованные) | `def f(*, a)` | `f(a=1)` |

```python
def show(a, b, *args, c, **kwargs):
    print("a, b:", a, b)
    print("args:", args)      # кортеж
    print("c:", c)            # keyword-only
    print("kwargs:", kwargs)  # словарь

show(1, 2, 3, 4, c=5, x=6, y=7)
# a, b: 1 2
# args: (3, 4)
# c: 5
# kwargs: {'x': 6, 'y': 7}
```

### 18.2 Передача и распаковка аргументов

```python
nums = [1, 2, 3]
def add3(a, b, c):
    return a + b + c
print(add3(*nums))            # 6

d = {"a": 1, "b": 2, "c": 3}
print(add3(**d))              # 6

# суммирование произвольного числа чисел
def total(*nums):
    return sum(nums)
print(total(1, 2, 3, 4))      # 10
```

### 18.3 lambda и функции высшего порядка

```python
square = lambda x: x ** 2     # анонимная функция

nums = [1, 4, 3, 2]
print(sorted(nums, key=lambda x: -x))        # по убыванию
words = ["bb", "a", "ccc"]
print(sorted(words, key=len))                # по длине

# map — применить ко всем элементам
print(list(map(lambda x: x * 2, [1, 2, 3])))   # [2,4,6]

# filter — оставить подходящие
print(list(filter(lambda x: x % 2 == 0, range(10))))  # [0,2,4,6,8]
```

Лучшая практика: lambda хороша для простых выражений; для сложной логики — обычная `def`.

### 18.4 Области видимости

```python
# LEGB: Local → Enclosing → Global → Built-in
x = "global"          # модульный уровень (global)

def outer():
    x = "enclosing"   # охватывающая функция
    def inner():
        x = "local"   # локальная переменная
        print(x)      # local
    inner()
    print(x)          # enclosing
outer()
print(x)              # global

# global — доступ к глобальной переменной для записи
count = 0
def inc():
    global count
    count += 1
inc(); inc()
print(count)          # 2

# nonlocal — доступ к переменной охватывающей функции
def make_counter():
    count = 0
    def add():
        nonlocal count
        count += 1
        return count
    return add

counter = make_counter()
print(counter())      # 1
print(counter())      # 2
```

### 18.5 Рекурсия

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))   # 120

def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

print(power(2, 8))    # 256
```

Ограничения рекурсии:

```python
import sys
print(sys.getrecursionlimit())   # 1000 по умолчанию
# factorial(2000) → RecursionError
# для глубоких вычислений используйте цикл
```

### 18.6 Замыкания (closures)

```python
def multiplier(factor):
    """Возвращает функцию, умножающую на factor."""
    def multiply(x):
        return x * factor
    return multiply

double = multiplier(2)
triple = multiplier(3)
print(double(10))    # 20
print(triple(10))    # 30
```

### 18.7 Аннотации типов (type hints)

```python
def greet(name: str, times: int = 1) -> str:
    return name * times

# аннотации не проверяются интерпретатором — это документация
# для человека, для IDE и для mypy
print(greet("Ан", 3))   # АнАнАн

age: int = 25
scores: list[int] = [4, 5, 3]
```

### 18.8 Строки документации (docstrings)

```python
def add(a, b):
    """Возвращает сумму a и b.

    >>> add(2, 3)
    5
    """
    return a + b

print(add.__doc__)   # текст документации
help(add)            # интерактивная справка
```

---

## 19. Обработка ошибок

### 19.1 try / except / else / finally

```python
try:
    n = int(input("Число: "))
    result = 10 / n
except ValueError:
    print("Это не число!")
except ZeroDivisionError as e:
    print(f"Ошибка: {e}")
else:
    print(f"10 / {n} = {result}")   # только если не было ошибки
finally:
    print("Всегда выполняется")     # освобождение ресурсов
```

### 19.2 Типовые исключения

| Исключение | Когда возникает |
|---|---|
| `SyntaxError` | опечатка в синтаксисе |
| `NameError` | имя переменной не определено |
| `TypeError` | операция с несовместимым типом |
| `ValueError` | значение не подходит |
| `IndexError` | индекс за границами списка |
| `KeyError` | ключа нет в словаре |
| `AttributeError` | у объекта нет атрибута |
| `ZeroDivisionError` | деление на ноль |
| `FileNotFoundError` | файл не найден |
| `UnboundLocalError` | локальная переменная до присваивания |
| `StopIteration` | итератор исчерпан |
| `KeyboardInterrupt` | нажат Ctrl+C |
| `MemoryError` | мало памяти |
| `ImportError` | не удалось импортировать модуль |

### 19.3 Свой класс исключений

```python
class NegativeValueError(Exception):
    def __init__(self, value, message="значение не должно быть отрицательным"):
        super().__init__(message)
        self.value = value

def sqrt(x):
    if x < 0:
        raise NegativeValueError(x)
    return x ** 0.5

try:
    sqrt(-4)
except NegativeValueError as e:
    print(f"Ошибка: {e} (было {e.value})")
```

### 19.4 assert и отладка

```python
# assert — быстрая проверка инвариантов (отключается флагом -O)
def add(a, b):
    assert isinstance(a, int) and isinstance(b, int), "только целые"
    return a + b

print(add(2, 3))      # 5
```

---

## 20. Полезные встроенные функции

| Функция | Назначение | Пример |
|---|---|---|
| `print(*args)` | вывод | `print("a", "b", sep="-")` |
| `input(prompt)` | ввод строки | `input("> ")` |
| `len(x)` | длина | `len([1,2])` → `2` |
| `type(x)` | тип объекта | `type(1)` → `<class 'int'>` |
| `range(a, b, s)` | последовательность | `list(range(3))` → `[0,1,2]` |
| `enumerate(x)` | (индекс, элемент) | |
| `zip(a, b)` | склейка списков | |
| `map(f, x)` | применить функцию | |
| `filter(f, x)` | отфильтровать | |
| `sorted(x)` | новый отсортированный список | `sorted([2,1])` → `[1,2]` |
| `reversed(x)` | обратный итератор | `list(reversed([1,2]))` → `[2,1]` |
| `sum(x)` | сумма | `sum([1,2,3])` → `6` |
| `min(x)` / `max(x)` | минимум/максимум | `min(3, 1, 2)` → `1` |
| `abs(x)` | модуль | `abs(-3)` → `3` |
| `round(x, n)` | округление | `round(2.5)` → `2` |
| `all(x)` | все истинны? | `all([1,1])` → `True` |
| `any(x)` | хоть одна истина? | `any([0,1])` → `True` |
| `isinstance(x, T)` | проверка типа | `isinstance("a", str)` → `True` |
| `id(x)` | адрес объекта | `id([])` |
| `hash(x)` | хеш-код | `hash("a")` |
| `iter(x)` / `next(it)` | итератор | |
| `repr(x)` | отладочное представление | |
| `help(x)` | справка | `help(len)` |
| `dir(x)` | атрибуты объекта | `dir(str)` |

```python
# типичные комбинации
data = [3, 1, 4, 1, 5]
print(sorted(set(data)))            # [1, 3, 4, 5]
print(sum(x**2 for x in data))      # 52
print(any(x > 4 for x in data))     # True
print(all(x > 0 for x in data))     # True
```

---

## 21. Типичные ошибки

Самые частые ошибки новичков — с объяснением и правильным вариантом.

### 21.1 Изменяемый список по умолчанию

```python
def append_item(item, lst=[]):
    lst.append(item)
    return lst

print(append_item(1))   # [1]
print(append_item(2))   # [1, 2] — список общий!
```

Исправление:

```python
def append_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print(append_item(1))   # [1]
print(append_item(2))   # [2]
```

### 21.2 `==` вместо `is` (или наоборот)

```python
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)   # True  — значения равны
print(a is b)   # False — это разные объекты
```

Правило: `==` сравнивает значения, `is` — идентичность объектов (тот же `id`).

### 21.3 Индекс за пределами списка

```python
fruits = ["яблоко", "банан"]
print(fruits[2])   # IndexError

# проверка перед доступом
if len(fruits) > 2:
    print(fruits[2])
```

### 21.4 `input()` всегда возвращает строку

```python
age = int(input("Возраст: "))   # без int() → TypeError: str + int
print(age + 1)
```

### 21.5 Изменение списка во время обхода

```python
nums = [1, 2, 2, 3]
for x in nums:
    if x % 2 == 0:
        nums.remove(x)
print(nums)   # [1, 2, 3] — не все двойки удалены!
```

Исправление — обходите копию или стройте новый список:

```python
nums = [1, 2, 2, 3]
nums = [x for x in nums if x % 2 == 1]
print(nums)   # [1, 3]
```

### 21.6 Строки не изменяются на месте

```python
s = "hello"
s.upper()      # вернуло 'HELLO', но s осталась 'hello'
```

Нужен результат: `s = s.upper()`.

### 21.7 Деление на ноль

```python
# x = 10 / 0   # ZeroDivisionError
denom = 0
result = 10 / denom if denom != 0 else None
```

### 21.8 Опечатка: `=` вместо `==`

```python
# if x = 5:    # SyntaxError — присваивание в условии
if x == 5:     # правильно
```

### 21.9 UnboundLocalError из-за области видимости

```python
count = 0
def inc():
    count += 1    # UnboundLocalError: count не объявлен global

def inc_fixed():
    global count
    count += 1
```

### 21.10 Сравнение float «на равенство»

```python
print(0.1 + 0.2 == 0.3)   # False (0.30000000000000004)

# сравнивайте с допуском
if abs((0.1 + 0.2) - 0.3) < 1e-9:
    print("равны")
```

### 21.11 Забытая запятая в кортеже

```python
t = (42)      # int, не кортеж
t2 = (42,)    # кортеж
```

### 21.12 Поверхностная копия вложенных структур

`copy()` не копирует вложенные списки — см. раздел 11.2. Нужен `copy.deepcopy()`.

### 21.13 `range(len(x))` вместо `enumerate`

```python
words = ["а", "б", "в"]
for i in range(len(words)):      # работает, но...
    print(i, words[i])

for i, w in enumerate(words):    # короче и понятнее
    print(i, w)
```

### 21.14 Бесконечный цикл while

```python
i = 0
while i < 5:
    print(i)      # забыли i += 1 → вечный цикл
```

### 21.15 Игнорирование регистра и пробелов

```python
answer = input("Да/Нет: ")
if answer.lower().strip() == "да":   # правильно
```

### 21.16 Приоритет `and`/`or`

```python
print(True or False and False)   # True (and приоритетнее than or)
# читается как True or (False and False)
```

### 21.17 Передача списка в функцию меняет оригинал

```python
def add_one(lst):
    lst.append(1)   # меняет исходный список!

nums = [0]
add_one(nums)
print(nums)   # [0, 1]

# если нужно не менять — работайте с копией: lst = lst[:]
```

### 21.18 `print()` вместо `return`

```python
def get_x():
    print(42)     # печатает, но функция возвращает None
# если нужен результат для использования — return
```

### 21.19 Ошибка отступов

```python
if True:
print("hi")    # IndentationError: expected an indented block
```

### 21.20 Переменная определена только в одной ветке

```python
if False:
    x = 10
print(x)   # NameError: name 'x' is not defined
```

---

## 22. Вопросы для собеседования (с ответами)

1. **Чем список отличается от кортежа?**  
   Кортеж неизменяем, список изменяем. Кортеж занимает меньше памяти, может быть ключом словаря. Список имеет больше методов.

2. **В чём разница между `==` и `is`?**  
   `==` сравнивает значения объектов, `is` — идентичность (один ли это объект в памяти).

3. **Что такое `*args` и `**kwargs`?**  
   `*args` собирает лишние позиционные аргументы в кортеж, `**kwargs` — именованные в словарь.

4. **Что такое изменяемые и неизменяемые типы?**  
   Изменяемые: list, dict, set. Неизменяемые: int, float, str, tuple, frozenset.

5. **Что такое декоратор?**  
   Функция, которая принимает функцию и возвращает обёртку — для логирования, измерения времени, проверки прав.

6. **Что такое GIL?**  
   Global Interpreter Lock — блокировка в CPython, позволяющая только одному потоку исполнять байт-код одновременно. Для CPU-задач используют multiprocessing, для I/O — asyncio/threading.

7. **Почему list comprehension быстрее обычного цикла?**  
   Включение компилируется в более оптимизированный байт-код (как бы встроенный цикл), короче и читабельнее.

8. **Что возвращает `range`?**  
   Ленивую последовательность. `range(5)` → 0..4, `range(2, 10, 3)` → 2, 5, 8.

9. **Как поменять значения двух переменных?**  
   `a, b = b, a` — распаковка кортежа.

10. **Что такое генератор и `yield`?**  
    Функция с `yield` возвращает итератор по требованию, не храня все значения в памяти.

11. **В чём отличие `//` от `/`?**  
    `/` всегда возвращает float, `//` — целочисленное деление «вниз» (floor).

12. **Как обрабатываются исключения?**  
    `try/except/else/finally`. `except` ловит ошибки, `else` — если не было исключения, `finally` — всегда.

13. **Зачем нужны виртуальные окружения?**  
    Для изоляции зависимостей между проектами: `python -m venv venv`.

14. **Что такое замыкание (closure)?**  
    Вложенная функция, захватывающая переменные из внешней функции (см. раздел 18.6).

15. **Как работает срез с шагом -1?**  
    `s[::-1]` переворачивает строку/список. Общая форма `s[start:stop:step]`.

16. **Что такое PEP 8?**  
    Официальное руководство по стилю Python: 4 пробела на отступ, snake_case для имён и т.д.

17. **Что такое «truthy» и «falsy» значения?**  
    В Python в условиях можно использовать любые объекты. Falsy: `0`, `0.0`, `""`, `[]`, `{}`, `set()`, `None`. Всё остальное — truthy.

---

## 23. Глоссарий терминов

| Термин | Определение |
|---|---|
| **Идентификатор** | имя переменной, функции и т.д. (буквы, цифры, `_`, не с цифры) |
| **Переменная** | имя, ссылающееся на объект в памяти |
| **Объект** | данные с типом и идентификатором |
| **Литерал** | значение прямо в коде: `42`, `"строка"`, `[1,2]` |
| **Мутабельный** | изменяемый объект (list, dict, set) |
| **Иммутабельный** | неизменяемый объект (int, str, tuple) |
| **Срез** | подпоследовательность `s[a:b:step]` |
| **Итерация** | один проход цикла |
| **Итератор** | объект, отдающий элементы по одному |
| **Кортеж** | неизменяемая последовательность |
| **Словарь** | отображение «ключ → значение» |
| **Множество** | коллекция уникальных элементов |
| **Выражение (expression)** | код, дающий значение: `2 + 2` |
| **Оператор (statement)** | инструкция: `if`, `for`, `def` |
| **Функция** | именованный блок кода с параметрами |
| **Аргумент** | значение при вызове функции |
| **Параметр** | имя в определении функции |
| **lambda** | анонимная функция-выражение |
| **Декоратор** | функция, оборачивающая другую функцию |
| **Генератор** | функция с `yield`, возвращающая итератор |
| **Замыкание** | вложенная функция с захватом переменных |
| **Рекурсия** | вызов функции самой себя |
| **Исключение** | событие ошибки, обрабатываемое try/except |
| **Трассировка (traceback)** | отчёт об ошибке со стеком вызовов |
| **Тернарный оператор** | `a if условие else b` |
| **f-строка** | строка с интерполяцией `f"{выражение}"` |
| **type hint** | аннотация типа после `:` / `->` |
| **PEP 8** | официальное руководство по стилю |
| **GIL** | глобальная блокировка интерпретатора |
| **Область видимости** | где переменная доступна (LEGB) |
| **Unpacking** | распаковка последовательности в переменные |

---

*Unit 1 завершён. Практика и мини-проекты — в unit-01/practice.md.*