# Python — Unit 3: Упражнения и проекты

> **Цель блока:** закрепить ООП, декораторы, генераторы и работу со стандартной библиотекой через практические задачи и мини-проекты.
>
> Структура: базовые упражнения → средний уровень → продвинутые → мини-проект → решения.

---

## 1. Базовые упражнения

### 1.1 Класс BankAccount

**Задача:** создайте класс `BankAccount` с методами `deposit`, `withdraw` и свойством `balance`. Обработайте некорректные суммы.

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance

    @property
    def balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Сумма должна быть > 0")
        self.__balance += amount
        return f"Внесено {amount}. Баланс: {self.__balance}"

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Сумма должна быть > 0")
        if amount > self.__balance:
            raise ValueError("Недостаточно средств")
        self.__balance -= amount
        return f"Снято {amount}. Баланс: {self.__balance}"

acc = BankAccount("Алиса", 1000)
print(acc.deposit(500))    # Внесено 500. Баланс: 1500
print(acc.withdraw(200))   # Снято 200. Баланс: 1300
print(acc.balance)         # 1300
```

### 1.2 Декоратор-логгер

**Задача:** напишите декоратор, который логирует имя вызываемой функции и её результат (с `@wraps`).

```python
from functools import wraps

def logger(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"[LOG] {func.__name__}() -> {result}")
        return result
    return wrapper

@logger
def add(a, b):
    return a + b

print(add(2, 3))   # [LOG] add() -> 5
```

### 1.3 Генератор простых чисел

**Задача:** напишите генератор бесконечной последовательности простых чисел.

```python
def primes():
    n = 2
    while True:
        if all(n % i for i in range(2, int(n**0.5) + 1)):
            yield n
        n += 1

p = primes()
print([next(p) for _ in range(10)])   # [2,3,5,7,11,13,17,19,23,29]
```

### 1.4 Наследование Employee от Person

**Задача:** создайте класс `Person`, затем `Employee` с зарплатой и бонусом.

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Привет, я {self.name}!"

class Employee(Person):
    def __init__(self, name, age, salary):
        super().__init__(name, age)
        self.salary = salary

    def __str__(self):
        return f"{self.name}, зарплата {self.salary}"

e = Employee("Олег", 30, 100_000)
print(e.greet())   # Привет, я Олег!
print(e)           # Олег, зарплата 100000
```

### 1.5 Counter для частоты

**Задача:** используйте `Counter` для подсчёта частоты слов в предложении, верните топ-N.

```python
from collections import Counter

def top_words(text, n=3):
    words = text.lower().split()
    return Counter(words).most_common(n)

text = "кот и пёс и кот и мышь"
print(top_words(text))   # [('и', 3), ('кот', 2), ('пёс', 1)]
```

### 1.6 Перегрузка операторов для Vector

**Задача:** реализуйте класс `Vector3` с `__add__`, `__sub__`, `__mul__` (скаляр и вектор), `__abs__`.

```python
import math

class Vector3:
    def __init__(self, x, y, z):
        self.x, self.y, self.z = x, y, z

    def __add__(self, other):
        return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other):
        return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)

    def __mul__(self, other):
        if isinstance(other, Vector3):  # скалярное произведение
            return (self.x * other.x + self.y * other.y + self.z * other.z)
        return Vector3(self.x * other, self.y * other, self.z * other)  # на число

    def __abs__(self):
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)

    def __repr__(self):
        return f"V({self.x},{self.y},{self.z})"

a = Vector3(1, 2, 3)
b = Vector3(4, 5, 6)
print(a + b)      # V(5,7,9)
print(a * b)      # 32 (скалярное)
print(a * 2)      # V(2,4,6)
print(abs(a))     # 3.741...
```

### 1.7 Свойство с валидацией

**Задача:** класс `Product` с `price`, которое нельзя сделать отрицательным.

```python
class Product:
    def __init__(self, name, price):
        self.name = name
        self._price = 0
        self.price = price   # через сеттер

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("Цена не может быть < 0")
        self._price = value

p = Product("Ноутбук", 1000)
p.price = 1200
print(p.price)   # 1200
# p.price = -5   # ValueError
```

### 1.8 Контекстный менеджер

**Задача:** реализуйте контекстный менеджер, который красиво выводит время выполнения блока.

```python
import time

class TimeIt:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.perf_counter() - self.start
        print(f"Выполнено за {elapsed:.4f} с")
        return False

with TimeIt():
    sum(range(1_000_000))
```

---

## 2. Средний уровень

### 2.1 Декоратор с аргументами @retry

**Задача:** напишите декоратор `@retry(n)`, который повторяет вызов функции до `n` раз при исключении.

```python
import random
from functools import wraps

def retry(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last = e
            raise last
        return wrapper
    return decorator

@retry(3)
def flaky():
    if random.random() < 0.7:
        raise ValueError("не повезло")
    return "удача!"

print(flaky())
```

### 2.2 Генератор пагинации

**Задача:** генератор, который разбивает большой список на страницы заданного размера.

```python
def paginate(items, page_size):
    for i in range(0, len(items), page_size):
        yield items[i:i + page_size]

data = list(range(20))
for page in paginate(data, 6):
    print(page)
# [0..5], [6..11], [12..17], [18,19]
```

### 2.3 Абстрактный класс Shape

**Задача:** абстрактный `Shape` с `area` и `perimeter`, подклассы `Circle` и `Square`.

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self): ...
    @abstractmethod
    def perimeter(self): ...

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self): return math.pi * self.r**2
    def perimeter(self): return 2 * math.pi * self.r

class Square(Shape):
    def __init__(self, side):
        self.side = side
    def area(self): return self.side**2
    def perimeter(self): return 4 * self.side

shapes = [Circle(2), Square(3)]
for s in shapes:
    print(f"{s.__class__.__name__}: {s.area():.2f} / {s.perimeter():.2f}")
```

### 2.4 LRU-кеш вручную

**Задача:** реализуйте декоратор мемоизации с ограничением размера кеша.

```python
from functools import wraps

def memoize(maxsize=100):
    cache = {}
    def decorator(func):
        @wraps(func)
        def wrapper(*args):
            if args in cache:
                return cache[args]
            result = func(*args)
            if len(cache) >= maxsize:
                cache.pop(next(iter(cache)))
            cache[args] = result
            return result
        return wrapper
    return decorator

@memoize(maxsize=64)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(100))
```

### 2.5 Множественное наследование (Mixin)

**Задача:** добавьте поведение через миксины: `SerializableMixin` и `ReprMixin`.

```python
import json

class ReprMixin:
    def __repr__(self):
        return f"{self.__class__.__name__}({vars(self)})"

class SerializableMixin:
    def to_json(self):
        return json.dumps(self.__dict__, ensure_ascii=False)

class User(ReprMixin, SerializableMixin):
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("Аня", 25)
print(repr(u))      # User({'name': 'Аня', 'age': 25})
print(u.to_json())  # {"name": "Аня", "age": 25}
```

### 2.6 Работа с файлами через pathlib

**Задача:** обход директории, подсчёт всех файлов с расширением `.py`.

```python
from pathlib import Path

def count_py(directory):
    path = Path(directory)
    return sum(1 for p in path.rglob("*.py") if p.is_file())

def list_files(directory):
    return [str(p) for p in Path(directory).iterdir() if p.is_file()]

print(list_files("."))
print("Python-файлов:", count_py("."))
```

### 2.7 Обработка ошибок при работе с БД

**Задача:** обёртка с повторными попытками и логированием.

```python
import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

def db_operation():
    raise ConnectionError("сеть недоступна")

def safe_call(func, retries=3):
    for i in range(retries):
        try:
            return func()
        except Exception as e:
            logging.warning(f"Попытка {i+1}: {e}")
    raise RuntimeError("операция не удалась")

# safe_call(db_operation)
```

---

## 3. Продвинутые упражнения

### 3.1 Одиночка (Singleton) через метакласс

**Задача:** реализуйте Singleton с помощью метакласса и проверьте, что все экземпляры совпадают.

```python
class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Config(metaclass=SingletonMeta):
    def __init__(self):
        self.settings = {}

c1 = Config()
c2 = Config()
print(c1 is c2)   # True
```

### 3.2 Дескриптор для валидации

**Задача:** дескриптор, который проверяет тип и диапазон.

```python
class Bounded:
    def __init__(self, lo, hi):
        self.lo, self.hi = lo, hi

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)

    def __set__(self, obj, value):
        if not (self.lo <= value <= self.hi):
            raise ValueError(f"{self.name} вне [{self.lo},{self.hi}]")
        obj.__dict__[self.name] = value

class Score:
    value = Bounded(0, 100)

s = Score()
s.value = 85
print(s.value)   # 85
# s.value = 200  # ValueError
```

### 3.3 Пул потоков с ThreadPoolExecutor

**Задача:** параллельное возведение в квадрат через пул потоков.

```python
from concurrent.futures import ThreadPoolExecutor

def square(n):
    return n * n

with ThreadPoolExecutor(max_workers=4) as ex:
    results = list(ex.map(square, range(10)))

print(results)   # [0,1,4,9,16,25,36,49,64,81]
```

### 3.4 Асинхронная загрузка

**Задача:** asyncio + aiohttp для параллельной загрузки нескольких URL.

```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return resp.status

async def main(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, u) for u in urls]
        return await asyncio.gather(*tasks)

# asyncio.run(main(["https://example.com"] * 3))
```

### 3.5 Паттерн Observer

**Задача:** система событий, где несколько подписчиков реагируют на события.

```python
class EventEmitter:
    def __init__(self):
        self._listeners = []

    def on(self, callback):
        self._listeners.append(callback)
        return self

    def emit(self, *args, **kwargs):
        for cb in self._listeners:
            cb(*args, **kwargs)

em = EventEmitter()
em.on(lambda e: print(f"Логгер: {e}"))
em.on(lambda e: print(f"Алерт: {e}!"))
em.emit("событие")
```

### 3.6 Декоратор rate limiter

**Задача:** ограничьте количество вызовов функции в секунду.

```python
import time
from functools import wraps

def rate_limit(per_second=1):
    interval = 1.0 / per_second
    last = [0.0]
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            wait = max(0, last[0] + interval - now)
            if wait:
                time.sleep(wait)
            last[0] = time.time()
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(per_second=2)
def ping():
    print("ping")

for _ in range(4):
    ping()
```

---

## 4. Мини-проект: Менеджер задач (Task Manager)

Цель: комплексный проект, объединяющий ООП, наследование, dataclass, декораторы, работу с JSON и CLI.

```python
import json
import os
from dataclasses import dataclass, field
from datetime import datetime
from functools import wraps

# --- Логирование ---
def log_action(func):
    @wraps(func)
    def wrapper(self, *args, **kwargs):
        result = func(self, *args, **kwargs)
        print(f"[{datetime.now():%H:%M:%S}] {func.__name__}: {result or ''}")
        return result
    return wrapper

# --- Модель задачи ---
@dataclass
class Task:
    id: int
    title: str
    done: bool = False
    priority: int = 1
    created: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self):
        return {"id": self.id, "title": self.title, "done": self.done,
                "priority": self.priority, "created": self.created}

    @classmethod
    def from_dict(cls, d):
        return cls(d["id"], d["title"], d["done"], d["priority"], d["created"])

# --- Репозиторий (хранение) ---
class TaskRepository:
    def __init__(self, path="tasks.json"):
        self.path = path
        self._load()

    def _load(self):
        if os.path.exists(self.path):
            with open(self.path, encoding="utf-8") as f:
                self.tasks = [Task.from_dict(d) for d in json.load(f)]
        else:
            self.tasks = []

    def _save(self):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump([t.to_dict() for t in self.tasks], f, ensure_ascii=False, indent=2)

# --- Сервис ---
class TaskManager:
    def __init__(self, repo):
        self.repo = repo

    @log_action
    def add(self, title, priority=1):
        task = Task(id=len(self.repo.tasks) + 1, title=title, priority=priority)
        self.repo.tasks.append(task)
        self.repo._save()
        return task

    @log_action
    def complete(self, task_id):
        task = self._find(task_id)
        if task:
            task.done = True
            self.repo._save()
        return task

    @log_action
    def delete(self, task_id):
        task = self._find(task_id)
        if task:
            self.repo.tasks.remove(task)
            self.repo._save()
        return task

    def _find(self, task_id):
        return next((t for t in self.repo.tasks if t.id == task_id), None)

    def list(self, only_pending=False):
        tasks = [t for t in self.repo.tasks if not t.done] if only_pending else self.repo.tasks
        tasks.sort(key=lambda t: (-t.priority, t.created))
        for t in tasks:
            status = "✓" if t.done else " "
            print(f"[{status}] #{t.id} (p{t.priority}) {t.title}")
        return len(tasks)

    def stats(self):
        total = len(self.repo.tasks)
        done = sum(1 for t in self.repo.tasks if t.done)
        return {"total": total, "done": done, "pending": total - done}

def main():
    manager = TaskManager(TaskRepository())
    while True:
        print("\nКоманды: add <title> [priority] | done <id> | del <id> | list | pending | stats | exit")
        cmd = input("> ").strip().split()
        if not cmd:
            continue
        action = cmd[0].lower()
        try:
            if action == "add":
                title = " ".join(cmd[1:-1]) or "Без названия"
                priority = int(cmd[-1]) if cmd[-1].isdigit() else 1
                manager.add(title, priority)
            elif action == "done":
                manager.complete(int(cmd[1]))
            elif action == "del":
                manager.delete(int(cmd[1]))
            elif action == "list":
                manager.list()
            elif action == "pending":
                manager.list(only_pending=True)
            elif action == "stats":
                print(manager.stats())
            elif action == "exit":
                break
            else:
                print("Неизвестная команда")
        except (ValueError, IndexError):
            print("Неверный ввод")

if __name__ == "__main__":
    main()
```

### Разбор мини-проекта

| Компонент | Что реализовано |
|-----------|-----------------|
| `Task` | dataclass с авто-полями и сериализацией |
| `TaskRepository` | загрузка/сохранение в JSON |
| `TaskManager` | бизнес-логика с декоратором логирования |
| `@log_action` | декоратор для журналирования |
| CLI | командный интерфейс в `main()` |
| Хранение | постоянство данных между запусками |

---

## 5. Ответы на задачи из syntax.md

1. **BankAccount** — см. упражнение 1.1.
2. **Декоратор-логгер** — см. упражнение 1.2.
3. **Генератор простых чисел** — см. упражнение 1.3.
4. **Employee(Person)** — см. упражнение 1.4.
5. **Counter для частоты** — см. упражнение 1.5.

```python
# 6. Вектор с __add__, __mul__, __abs__ — см. 1.6
# 7. Абстрактный Shape — см. 2.3
# 8. Контекстный менеджер — см. 1.8
# 9. dataclass товара
from dataclasses import dataclass

@dataclass
class Item:
    name: str
    price: float
    qty: int = 1

# 10. @retry(n) — см. 2.1
```

---

## 6. Проверочные вопросы (self-check)

1. Объясните разницу между атрибутом класса и атрибутом экземпляра.
2. Зачем нужен `super().__init__()` в наследнике?
3. Что произойдёт при обращении к приватному атрибуту `__x` извне класса?
4. Почему генератор нельзя «прокрутить» дважды?
5. В чём польза `@lru_cache` и когда его нельзя применять?
6. Что делает `@property` вместе с сеттером?
7. Как работает `yield` в плане управления потоком?
8. Чем контекстный менеджер лучше ручного `open()/close()`?

---

## 7. Критерии самопроверки мини-проекта

| Критерий | Баллы |
|----------|-------|
| Классы спроектированы корректно (инкапсуляция) | 1 |
| Наследование / миксины использованы осмысленно | 1 |
| Декоратор логирования работает | 1 |
| Данные сохраняются в JSON | 1 |
| CLI обрабатывает ошибки ввода | 1 |
| TODO добавление/завершение/удаление работают | 1 |
| Код читаемый, без дублирования | 1 |
| **Итого** | **7** |

---
*Unit 3: практика. Вернуться к [syntax.md](syntax.md).*
