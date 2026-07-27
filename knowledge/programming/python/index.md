# Python — Полный конспект

## Введение

Python — интерпретируемый, высокоуровневый язык программирования, созданный Гвидо ван Россумом в 1991 году. Философия: читаемость, простота, батарейки в комплекте (batteries included).

**Версии:** Python 3.x (3.13 — актуальная на 2026). Python 2 умер в 2020.

**Области:** веб (Django, FastAPI), data science (NumPy, Pandas), ML/AI (PyTorch, TensorFlow), автоматизация, DevOps, игры.

---

## 1. Установка и среда

```bash
# Установка на Ubuntu/Debian
sudo apt update && sudo apt install python3 python3-pip python3-venv

# Проверка
python3 --version

# Виртуальное окружение
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

**Менеджеры пакетов:**
- **pip** — стандартный
- **uv** — ультрабыстрый (Rust-based)
- **poetry** — современный с зависимостями
- **conda** — data science

---

## 2. Типы данных

### 2.1 Числа

```python
a = 42          # int — произвольной точности
b = 3.14        # float — IEEE 754 (64-bit)
c = 1 + 2j      # complex
d = 0b1010      # binary (10)
e = 0xFF        # hex (255)
f = 1_000_000   # читаемость (подчёркивания)

# Операции
10 / 3    # 3.333... (честное деление)
10 // 3   # 3 (целочисленное)
10 % 3    # 1 (остаток)
2 ** 10   # 1024 (степень)
```

### 2.2 Строки

```python
s1 = "hello"
s2 = 'world'
s3 = """multi
line"""
s4 = f"value is {42}"         # f-строки
s5 = r"raw\nstring"           # сырые строки (regex, пути)

# Методы
s = "  Hello, World!  "
s.lower()           # "  hello, world!  "
s.upper()           # "  HELLO, WORLD!  "
s.strip()           # "Hello, World!"
s.split(",")        # ["Hello", " World!"]
",".join(["a","b"]) # "a,b"
s.replace("Hello", "Hi")  # "  Hi, World!  "
s.startswith("  He")      # True
"abc" in s                 # True
len(s)                     # 17

# Индексация и срезы
s = "Python"
s[0]    # "P"
s[-1]   # "n"
s[1:4]  # "yth"
s[:3]   # "Pyt"
s[3:]   # "hon"
s[::-1] # "nohtyP" (реверс)
```

### 2.3 Списки (list)

```python
nums = [1, 2, 3, 4, 5]
nums.append(6)            # [1,2,3,4,5,6]
nums.extend([7, 8])       # [1,2,3,4,5,6,7,8]
nums.insert(0, 0)         # [0,1,2,3,4,5,6,7,8]
nums.pop()                # 8, nums = [0..7]
nums.pop(0)               # 0, nums = [1..7]
nums.remove(3)            # [1,2,4,5,6,7]
nums.sort()               # in-place
nums.sort(reverse=True)
sorted(nums)              # новый список
nums.reverse()
nums.index(5)             # индекс элемента
nums.count(2)             # кол-во вхождений

# List comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]
# [0, 4, 16, 36, 64]
```

### 2.4 Кортежи (tuple) — неизменяемые

```python
point = (3, 4)
x, y = point            # распаковка
singleton = (42,)       # один элемент — обязательна запятая
```

### 2.5 Словари (dict)

```python
d = {"name": "Alice", "age": 30, "city": "Tokyo"}
d["name"]               # "Alice"
d.get("name")           # "Alice"
d.get("country", "N/A") # "N/A" (безопасно)
d["job"] = "engineer"   # добавление
d.update({"age": 31})   # обновление
del d["city"]           # удаление
d.pop("age")            # 30, удаляет
d.keys()                # dict_keys(["name", "job"])
d.values()              # dict_values(["Alice", "engineer"])
d.items()               # dict_items([("name","Alice"), ("job","engineer")])

# Dict comprehension
squares = {x: x**2 for x in range(5)}
# {0:0, 1:1, 2:4, 3:9, 4:16}

# Merging (3.9+)
d1 = {"a": 1}
d2 = {"b": 2}
merged = d1 | d2  # {"a":1, "b":2}
```

### 2.6 Множества (set)

```python
s = {1, 2, 3, 3, 3}   # {1, 2, 3}
s.add(4)
s.remove(2)            # KeyError если нет
s.discard(10)          # не ошибётся
a = {1, 2, 3}
b = {3, 4, 5}
a | b   # объединение {1,2,3,4,5}
a & b   # пересечение {3}
a - b   # разность {1,2}
a ^ b   # симметричная разность {1,2,4,5}
```

### 2.7 None

```python
x = None
if x is None:
    print("nothing")
if x is not None:
    print("something")
```

### 2.8 Boolean

```python
True, False
bool(0)     # False
bool("")    # False
bool([])    # False
bool(None)  # False
bool(42)    # True
bool("hi")  # True
```

---

## 3. Операторы

```python
# Арифметические
+, -, *, /, //, %, **

# Сравнения
==, !=, >, <, >=, <=
  # Цепочки: 1 < x < 10

# Логические
and, or, not

# Побитовые
&, |, ^, ~, <<, >>

# Присваивания
=, +=, -=, *=, /=, //=, %=, **=

# Identity
is, is not

# Membership
in, not in

# Walrus (3.8+)
if (n := len(s)) > 5:
    print(f"длинный, {n} символов")
```

---

## 4. Управляющие конструкции

### 4.1 Условия

```python
if x > 0:
    print("positive")
elif x == 0:
    print("zero")
else:
    print("negative")

# Тернарный
result = "yes" if x > 0 else "no"

# Match-case (3.10+)
match status:
    case 200:
        print("OK")
    case 404:
        print("Not Found")
    case _:
        print("Unknown")
```

### 4.2 Циклы

```python
# for
for i in range(10):
    print(i)  # 0..9

for i in range(2, 10, 3):
    print(i)  # 2, 5, 8

for idx, val in enumerate(["a","b","c"]):
    print(idx, val)

for key, val in d.items():
    print(key, val)

# while
while x > 0:
    x -= 1

# break, continue, else
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            break
    else:
        print(n, "is prime")  # else выполняется, если break НЕ сработал
```

---

## 5. Функции

```python
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

# Аргументы
def func(a, b, *args, c=10, **kwargs):
    print(a, b)      # позиционные
    print(args)      # кортеж доп. позиционных
    print(c)         # keyword-only (после * или *args)
    print(kwargs)    # словарь именованных

func(1, 2, 3, 4, c=99, x=10, y=20)
# 1 2
# (3, 4)
# 99
# {'x': 10, 'y': 20}

# Распаковка
nums = [1, 2, 3]
func(*nums)          # a=1, b=2, args=(3,)
d = {"c": 50, "x": 7}
func(1, 2, **d)

# Лямбды
sq = lambda x: x**2
sorted(pairs, key=lambda x: x[1])

# Декораторы
def timer(f):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = f(*args, **kwargs)
        print(f"{f.__name__}: {time.time()-start:.3f}s")
        return result
    return wrapper

@timer
def slow_func():
    import time
    time.sleep(1)

# Генераторы
def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

f = fib()
[next(f) for _ in range(10)]  # [0,1,1,2,3,5,8,13,21,34]
```

---

## 6. ООП (Object-Oriented Programming)

```python
class Animal:
    species: str = "unknown"
    
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
    
    def speak(self) -> str:
        return "..."
    
    @classmethod
    def create_unknown(cls, name: str):
        return cls(name, 0)
    
    @staticmethod
    def is_adult(age: int) -> bool:
        return age >= 2
    
    @property
    def human_years(self) -> int:
        return self.age * 7
    
    def __repr__(self) -> str:
        return f"{self.name} ({self.age})"

class Dog(Animal):
    species = "canine"
    
    def speak(self) -> str:
        return "Woof!"

class Cat(Animal):
    species = "feline"
    
    def speak(self) -> str:
        return "Meow!"

dog = Dog("Rex", 3)
print(dog.speak())     # Woof!
print(dog.human_years) # 21

# Магические методы
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def __repr__(self):
        return f"V({self.x},{self.y})"
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __len__(self):
        return int((self.x**2 + self.y**2)**0.5)

# Abstract base classes
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass
    
    @abstractmethod
    def perimeter(self) -> float:
        pass
```

---

## 7. Стандартная библиотека

### 7.1 Работа с файлами

```python
# Чтение
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
    lines = f.readlines()

# Запись
with open("file.txt", "w") as f:
    f.write("hello\n")
    f.writelines(["line1\n", "line2\n"])

# Пути
from pathlib import Path
p = Path("/home/user/file.txt")
p.name          # "file.txt"
p.stem          # "file"
p.suffix        # ".txt"
p.parent        # /home/user
p.exists()      # bool
p.is_file()     # bool
p.mkdir(parents=True, exist_ok=True)
p.read_text()   # всё содержимое
p.write_text("hello")
```

### 7.2 Коллекции

```python
from collections import Counter, defaultdict, deque, namedtuple

# Counter
Counter("abracadabra")
# Counter({'a':5, 'b':2, 'r':2, 'c':1, 'd':1})

# defaultdict
dd = defaultdict(int)
dd["a"] += 1  # не KeyError

# deque
d = deque([1,2,3], maxlen=5)
d.append(4)
d.appendleft(0)

# namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)  # 3 4
```

### 7.3 Дата и время

```python
from datetime import datetime, date, timedelta

now = datetime.now()
today = date.today()

d = datetime(2024, 3, 15, 14, 30)
d.strftime("%Y-%m-%d %H:%M")     # "2024-03-15 14:30"
datetime.fromisoformat("2024-03-15T14:30:00")

delta = timedelta(days=7, hours=3)
future = now + delta
```

### 7.4 JSON

```python
import json

data = {"name": "Alice", "scores": [1, 2, 3]}
s = json.dumps(data, indent=2, ensure_ascii=False)
obj = json.loads(s)

with open("data.json") as f:
    obj = json.load(f)
```

### 7.5 Регулярные выражения

```python
import re

pattern = r"\b[A-Z][a-z]+\b"
text = "Hello World! 42 cats."
matches = re.findall(pattern, text)     # ["Hello", "World"]

m = re.search(r"(\d+)\s+(\w+)", text)
if m:
    print(m.group(0))   # "42 cats"
    print(m.group(1))   # "42"
    print(m.group(2))   # "cats"

re.sub(r"\d+", "NUM", text)  # "Hello World! NUM cats."
re.split(r"\s+", text)       # ["Hello","World!","42","cats."]
```

### 7.6 OS and sys

```python
import os, sys

os.getcwd()           # текущая директория
os.listdir(".")       # список файлов
os.environ["HOME"]    # переменные окружения
os.path.join("a", "b")  # "a/b"
sys.argv              # аргументы командной строки
sys.exit(0)           # выход
```

### 7.7 Многопоточность и асинхронность

```python
# threading
import threading

def worker(n):
    print(f"Thread {n}")

threads = []
for i in range(5):
    t = threading.Thread(target=worker, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

# asyncio (3.5+)
import asyncio

async def fetch_data(url):
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    tasks = [fetch_data(f"url{i}") for i in range(3)]
    results = await asyncio.gather(*tasks)
    print(results)

asyncio.run(main())

# concurrent.futures
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as ex:
    futures = [ex.submit(worker, i) for i in range(10)]
```

### 7.8 Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger(__name__)
logger.info("started")
logger.warning("something's off")
logger.error("failed")
```

---

## 8. Обработка ошибок

```python
try:
    x = 1 / 0
except ZeroDivisionError as e:
    print(f"error: {e}")
except (ValueError, TypeError):
    print("bad value")
else:
    print("no errors")  # выполняется, если не было исключения
finally:
    print("always runs") 

# Создание своих исключений
class MyError(Exception):
    def __init__(self, message: str, code: int):
        super().__init__(message)
        self.code = code

raise MyError("something broke", 42)

# Контекстные менеджеры
class ManagedResource:
    def __enter__(self):
        print("acquire")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("release")
        return False  # если True — исключение подавляется
```

---

## 9. Типизация (type hints)

```python
from typing import Optional, Union, List, Dict, Tuple, Set, Any, Callable, TypeVar, Generic

def process(items: List[int | str]) -> Optional[str]:
    if not items:
        return None
    return str(items[0])

T = TypeVar("T")

def first(items: List[T]) -> T:
    return items[0]

class Stack(Generic[T]):
    def __init__(self):
        self._items: List[T] = []
    
    def push(self, item: T) -> None:
        self._items.append(item)
    
    def pop(self) -> T:
        return self._items.pop()

# TypedDict
from typing import TypedDict

class Person(TypedDict):
    name: str
    age: int

p: Person = {"name": "Alice", "age": 30}

# Literal
from typing import Literal

def set_mode(mode: Literal["read", "write", "append"]) -> None: ...

# Protocol (structural subtyping)
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

def render(obj: Drawable) -> None:
    obj.draw()
```

---

## 10. Data Science стек

### 10.1 NumPy

```python
import numpy as np

arr = np.array([1, 2, 3, 4, 5])
arr.shape       # (5,)
arr.reshape(5, 1)

zeros = np.zeros((3, 4))
ones = np.ones((2, 3))
eyes = np.eye(4)
rand = np.random.randn(1000)

# Broadcasting
a = np.array([[1,2,3],[4,5,6]])
b = np.array([10,20,30])
a + b  # [[11,22,33],[14,25,36]]

# Индексация
arr[arr > 2]   # boolean indexing
np.where(arr > 2, arr, 0)

# Линейная алгебра
np.dot(a, b)
np.linalg.inv(a)
np.linalg.eig(a)
```

### 10.2 Pandas

```python
import pandas as pd

# Series
s = pd.Series([1, 2, 3], index=["a", "b", "c"])

# DataFrame
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "age": [25, 30, 35],
    "city": ["NYC", "Tokyo", "London"]
})

df.head()             # первые 5 строк
df.describe()         # статистика
df.info()             # типы и пропуски
df["name"]            # колонка
df[["name", "age"]]   # несколько колонок
df.iloc[0]            # по индексу
df.loc[0]             # по label
df.query("age > 25")  # фильтр
df.groupby("city")["age"].mean()
df.sort_values("age", ascending=False)
df.isnull().sum()
df.dropna()
df.fillna(0)

# Чтение
pd.read_csv("data.csv")
pd.read_excel("data.xlsx")
pd.read_json("data.json")
pd.read_sql("SELECT * FROM table", conn)
```

### 10.3 Matplotlib & Seaborn

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Линейный график
plt.figure(figsize=(10, 6))
plt.plot(x, y, label="sin(x)", linewidth=2)
plt.xlabel("X")
plt.ylabel("Y")
plt.title("Sine Wave")
plt.legend()
plt.grid(True)
plt.show()

# Гистограмма
plt.hist(data, bins=50, alpha=0.7, edgecolor="black")
plt.show()

# Seaborn (статистические графики)
sns.set_theme()
sns.scatterplot(data=df, x="age", y="salary", hue="city")
sns.boxplot(data=df, x="city", y="age")
sns.heatmap(correlation_matrix, annot=True, cmap="coolwarm")
```

---

## 11. Веб-разработка

### 11.1 FastAPI

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    in_stock: bool = True

items_db: List[Item] = []

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id >= len(items_db):
        raise HTTPException(404, "Item not found")
    return items_db[item_id]

@app.post("/items")
def create_item(item: Item):
    items_db.append(item)
    return {"id": len(items_db) - 1, **item.model_dump()}
```

### 11.2 Requests

```python
import requests

r = requests.get("https://api.github.com", timeout=10)
r.status_code               # 200
r.json()                    # dict
r.headers["Content-Type"]

requests.post(url, json={"key": "value"})
requests.put(url, data={"file": open("f.txt")})
requests.delete(url)
```

---

## 12. Тестирование

```python
# pytest
# pip install pytest

import pytest

def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0

# Фикстуры
@pytest.fixture
def data():
    return {"a": 1, "b": 2}

def test_with_fixture(data):
    assert data["a"] + data["b"] == 3

# Параметризация
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0)
])
def test_param(a, b, expected):
    assert add(a, b) == expected

# unittest
import unittest

class TestMath(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)
    
    def test_divide(self):
        with self.assertRaises(ZeroDivisionError):
            1 / 0
```

---

## 13. Полезные библиотеки

| Библиотека | Назначение |
|-----------|-----------|
| FastAPI / Django / Flask | Веб-фреймворки |
| SQLAlchemy / Django ORM | ORM |
| Pydantic | Валидация данных |
| pytest | Тестирование |
| mypy | Статическая типизация |
| ruff / black / flake8 | Линтеры и форматтеры |
| asyncio / trio / anyio | Асинхронность |
| httpx | HTTP клиент (async) |
| Celery / arq | Очереди задач |
| Redis / aioredis | Кеш |
| SQLite / psycopg2 / asyncpg | Базы данных |
| alembic | Миграции |
| Docker / docker-py | Контейнеры |
| rich / textual | TUI / вывод |
| click / typer | CLI |
| PyTorch / TensorFlow | ML/DL |
| scikit-learn | ML |
| Polars / DuckDB | Data processing |

---

## 14. Продвинутые темы

### 14.1 Дескрипторы

```python
class Validated:
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        if not isinstance(value, (int, float)):
            raise TypeError("must be numeric")
        obj.__dict__[self.name] = value

class Point:
    x = Validated()
    y = Validated()
```

### 14.2 Метаклассы

```python
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class DBConnection(metaclass=SingletonMeta):
    pass

# Python 3.12+: @override
# Python 3.11+: Self type
```

### 14.3 Паттерны проектирования

```python
# Singleton
class Singleton:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

# Factory
class AnimalFactory:
    @staticmethod
    def create(animal_type: str) -> Animal:
        if animal_type == "dog":
            return Dog("unnamed", 0)
        elif animal_type == "cat":
            return Cat("unnamed", 0)
        raise ValueError(f"unknown: {animal_type}")

# Observer
class EventEmitter:
    def __init__(self):
        self._listeners = []
    
    def on(self, callback):
        self._listeners.append(callback)
    
    def emit(self, *args, **kwargs):
        for cb in self._listeners:
            cb(*args, **kwargs)
```

### 14.4 Конкурентность и параллелизм

```python
# GIL — Global Interpreter Lock
# CPU-bound → multiprocessing
# I/O-bound → threading or asyncio

import multiprocessing as mp

def square(n):
    return n * n

with mp.Pool(4) as pool:
    results = pool.map(square, range(1000))

# subprocess
import subprocess
result = subprocess.run(["ls", "-la"], capture_output=True, text=True)
print(result.stdout)
```

---

## 15. Pythonic идиомы

```python
# Swap
a, b = b, a

# Chain сравнений
if 0 < x < 10: ...

# Распаковка
first, *middle, last = [1, 2, 3, 4, 5]

# zip
for a, b in zip(list1, list2):
    pass

# enumerate
for i, v in enumerate(collection):
    pass

# Обработка нескольких исключений
try:
    ...
except (ValueError, TypeError) as e:
    ...

# Словарь для switch
switch = {
    "add": lambda a, b: a + b,
    "sub": lambda a, b: a - b,
}
result = switch.get(op, lambda a, b: None)(a, b)

# Игнорирование значения
_, important = (1, 2)

# Условное выражение в списке
[x if x > 0 else 0 for x in nums]

# Ровно один раз (3.8+ walrus)
if (match := pattern.search(text)) is not None:
    print(match.group())
```

---

## 16. Производительность

```python
# Используйте локальные переменные
def slow():
    import math
    for i in range(1_000_000):
        math.sqrt(i)

def fast():
    from math import sqrt
    for i in range(1_000_000):
        sqrt(i)

# Избегайте + для строк
"".join(["a", "b", "c"])  # быстрее чем "a" + "b" + "c"

# Используйте set для in
items = set(large_list)  # O(1) vs O(n)

# Генераторы вместо списков
sum(x**2 for x in range(1_000_000))  # меньше памяти

# __slots__ для классов
class Lightweight:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

# C extensions
# Cython, mypyc, numba, C extensions
```

---

## 17. Экосистема

### 17.1 Менеджеры проектов

```bash
# pip + venv (классика)
python3 -m venv .venv
source .venv/bin/activate
pip install requests

# pip freeze > requirements.txt
# pip install -r requirements.txt

# Poetry (современный)
poetry new myproject
poetry add requests
poetry install

# UV (ультрабыстрый)
uv venv
uv pip install requests
```

### 17.2 Линтеры и форматтеры

```bash
# ruff (быстрейший)
pip install ruff
ruff check .
ruff format .

# mypy (статическая типизация)
mypy src/

# pre-commit
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.x.x
    hooks:
      - id: ruff
      - id: ruff-format
```

### 17.3 CI/CD

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.13"
      - run: pip install -r requirements.txt
      - run: ruff check .
      - run: mypy src/
      - run: pytest
```

---

## 18. Полезные команды

```bash
python3 -c "import this"         # The Zen of Python
python3 -m http.server 8000      # простой HTTP сервер
python3 -m json.tool file.json   # форматирование JSON
python3 -m pdb script.py         # дебаггер
python3 -m cProfile script.py    # профилирование
python3 -m venv .venv            # виртуальное окружение
```

---

## 19. Ресурсы

- **docs.python.org** — официальная документация
- **Real Python (realpython.com)** — туториалы
- **PyCrumbs (pycrumbs.info)** — дорожная карта
- **Python Enhancement Proposals (PEPs)** — стандарты языка
- **Awesome Python (github.com/vinta/awesome-python)** — список библиотек
- **Exercism Python Track** — практика
- **LeetCode / Codewars** — алгоритмы

---

## 20. Практические упражнения

### 20.1 Базовые

1. Напишите функцию, которая проверяет, является ли строка палиндромом.
2. Напишите генератор чисел Фибоначчи.
3. Напишите декоратор для логирования вызовов функций.
4. Реализуйте свой контекстный менеджер.
5. Напишите функцию, которая находит все простые числа до N (решето Эратосфена).

### 20.2 Средние

1. Реализуйте LRU-кеш (Least Recently Used).
2. Напишите CLI утилиту через `click` или `argparse`.
3. Реализуйте Producer-Consumer с threading.
4. Напишите веб-скрапер с asyncio + aiohttp.
5. Реализуйте свой декоратор с аргументами.

### 20.3 Продвинутые

1. Напишите ORM-подобную библиотеку с метаклассами.
2. Реализуйте паттерн Visitor через декораторы.
3. Напишите декоратор для rate limiting.
4. Реализуйте Event Loop на колбэках.
5. Напишите декоратор @memoize с TTL.

---
*Полный конспект Python. Регулярно дополняется.*
