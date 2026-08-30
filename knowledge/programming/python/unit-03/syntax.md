# Python — Unit 3: ООП и продвинутые темы

> **Тема юнита:** объектно-ориентированное программирование (классы, объекты, наследование, полиморфизм, инкапсуляция, магические методы), декораторы, генераторы и итераторы, работа со стандартной библиотекой, модули и пакеты, обработка ошибок на практике.
>
> **Цель:** после юнита вы умеете проектировать классы, строить иерархии наследования, писать декораторы и генераторы, уверенно пользоваться stdlib для реальных задач.

---

## 1. Классы и объекты

Класс — это «чертёж» объекта. Объект (экземпляр) — конкретный экземпляр класса с собственными данными.

```python
class Person:
    # Классовый атрибут — общий для всех экземпляров
    species = "human"

    def __init__(self, name, age):      # конструктор (инициализатор)
        self.name = name                # атрибут экземпляра
        self.age = age

    def greet(self):                    # метод
        return f"Привет, я {self.name}!"

    def __str__(self):                  # удобное строковое представление
        return f"{self.name} ({self.age})"

p = Person("Алиса", 25)                 # создание объекта
print(p.greet())    # Привет, я Алиса!
print(p)            # Алиса (25)
print(p.species)    # human
print(Person.species)  # human — доступен и через класс
```

### 1.1 self и __init__

- `self` — ссылка на текущий экземпляр. Первый параметр любого метода.
- `__init__` — вызывается автоматически при создании объекта. Не возвращает значение.
- Атрибуты, созданные внутри `__init__`, принадлежат экземпляру.

### 1.2 Атрибуты класса vs экземпляра

| Атрибут класса | Атрибут экземпляра |
|---|---|
| Объявляется на уровне класса | Объявляется внутри `self.имя` или динамически |
| Общий для всех объектов | Свой для каждого объекта |
| Изменение видно всем объектам | Изменение затрагивает только один объект |
| `Person.species` | `p.name` |

```python
class Config:
    debug = False
    version = "1.0"

Config.debug                     # False
Config.debug = True              # меняем для всех
c1 = Config()
c2 = Config()
print(c1.debug, c2.debug)        # True True
```

---

## 2. Наследование

Наследование позволяет классу-потомку (подклассу) переиспользовать и расширять поведение родителя.

```python
class Student(Person):
    def __init__(self, name, age, major):
        super().__init__(name, age)     # вызов конструктора родителя
        self.major = major

    def study(self):
        return f"{self.name} учит {self.major}"

    def greet(self):                     # переопределение (override)
        return super().greet() + f" Специализация: {self.major}"

s = Student("Боб", 20, "CS")
print(s.greet())    # Привет, я Боб! Специализация: CS
print(s.study())    # Боб учит CS
```

- `super()` — возвращает прокси-объект родителя. Полезен для вызова `__init__` и переопределённых методов.
- `issubclass(Student, Person)` → `True`
- `isinstance(s, Person)` → `True` (наследники тоже подходят)

### 2.1 Типы наследования

| Тип | Описание | Пример |
|-----|----------|--------|
| Простое | один предок → один потомок | `class Student(Person)` |
| Многоуровневое | цепочка A → B → C | `A` ← `B` ← `C` |
| Множественное | несколько предков | `class C(A, B)` |
| Иерархическое | один предок, много потомков | `Person` → `Student`, `Employee` |

### 2.2 Множественное наследование и MRO

Порядок разрешения методов (MRO, Method Resolution Order) — алгоритм C3-линеаризации.

```python
class A:
    def who(self): return "A"

class B(A):
    def who(self): return "B"

class C(A):
    def who(self): return "C"

class D(B, C):
    pass

print(D().who())   # B — берётся первый из MRO
print(D.__mro__)   # (D, B, C, A, object)
```

---

## 3. Полиморфизм

Полиморфизм — одинаковая структура вызова, разное поведение.

```python
class Dog(Animal):
    def speak(self): return "Woof!"

class Cat(Animal):
    def speak(self): return "Meow!"

for animal in [Dog("Rex", 3), Cat("Tom", 2)]:
    print(animal.speak())   # Woof! / Meow!
```

В Python работает «утиная типизация»: важно не то, кем объект является, а то, что он умеет делать.

```python
class Duck:
    def quack(self): return "quack"

class PersonQuacker:
    def quack(self): return "Люди тоже крякают"

def make_sound(obj):
    return obj.quack()      # нужен только метод quack

print(make_sound(Duck()))
print(make_sound(PersonQuacker()))
```

---

## 4. Инкапсуляция

Контроль доступа к данным через приватные атрибуты и свойства.

| Синтаксис | Наличие | Доступ |
|-----------|---------|--------|
| `name` | публичный | свободно |
| `_name` | защищённый | по соглашению (внутри класса и наследников) |
| `__name` | приватный | name mangling — `_ClassName__name` |

```python
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance   # приватный (name mangling)

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
        return self.__balance

    @property
    def balance(self):
        return self.__balance

a = Account("Алиса", 1000)
print(a.balance)          # 1000 (через свойство)
# print(a.__balance)      # AttributeError!
print(a._Account__balance)  # 1000 (обход — так делать не надо)
```

### 4.1 Свойства (property)

`@property` превращает метод в атрибут с геттером/сеттером/делейтером.

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Радиус не может быть < 0")
        self._radius = value

    @radius.deleter
    def radius(self):
        del self._radius

    @property
    def area(self):
        return 3.14 * self._radius ** 2

c = Circle(5)
c.radius = 10           # сеттер
print(c.area)           # 314.0
```

---

## 5. Магические (dunder) методы

Специальные методы с двойным подчёркиванием, управляющие поведением объектов.

| Метод | Вызывается при |
|-------|----------------|
| `__init__(self, ...)` | создании объекта |
| `__str__` | `str(obj)`, `print(obj)` |
| `__repr__` | представлении для разработчика, репле |
| `__len__` | `len(obj)` |
| `__getitem__` | `obj[key]` |
| `__setitem__` | `obj[key] = value` |
| `__add__` | `obj1 + obj2` |
| `__eq__` | `obj1 == obj2` |
| `__lt__` | `obj1 < obj2` |
| `__call__` | `obj()` |
| `__enter__ / __exit__` | контекстном менеджере (`with`) |
| `__iter__ / __next__` | итерировании |

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):
        return f"V({self.x},{self.y})"

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __len__(self):
        return int((self.x**2 + self.y**2)**0.5)

    def __call__(self, scale):
        return Vector(self.x * scale, self.y * scale)

v1 = Vector(3, 4)
v2 = Vector(1, 2)
print(v1 + v2)    # V(4,6)
print(v1 == Vector(3, 4))  # True
print(len(v1))    # 5 (математическое округление)
print(v1(2))      # V(6,8) — объект вызывается как функция
```

---

## 6. Classmethod, staticmethod, property

| Декоратор | Принимает | Назначение |
|-----------|-----------|------------|
| `@staticmethod` | без self/cls | вспомогательная функция внутри класса |
| `@classmethod` | `cls` (класс) | фабричные методы, работа с атрибутами класса |
| `@property` | self | вычисляемые/защищённые атрибуты |

```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):
        return cls((f - 32) * 5 / 9)   # фабричный метод

    @staticmethod
    def to_fahrenheit(c):
        return c * 9 / 5 + 32

    @property
    def kelvin(self):
        return self.celsius + 273.15

t = Temperature(25)
t2 = Temperature.from_fahrenheit(77)   # 25°C
print(Temperature.to_fahrenheit(25))   # 77.0
print(t.kelvin)                        # 298.15
```

---

## 7. Абстрактные классы и протоколы

### 7.1 ABC (Abstract Base Classes)

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

    @abstractmethod
    def perimeter(self):
        pass

class Rect(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h

    def area(self): return self.w * self.h
    def perimeter(self): return 2 * (self.w + self.h)

# Shape()  # TypeError: нельзя создать экземпляр абстрактного класса
print(Rect(3, 4).area())   # 12
```

### 7.2 Protocol (структурная типизация)

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

def render(obj: Drawable) -> None:
    obj.draw()
```

---

## 8. Декораторы

Декоратор — функция, которая принимает функцию и возвращает новую (обёртку). Используется для расширения поведения без изменения исходного кода.

```python
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__}: {time.time()-start:.3f}s")
        return result
    return wrapper

@timer
def slow_function():
    sum(range(10**6))

slow_function()
```

### 8.1 Декоратор с аргументами

```python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say():
    print("hi")

say()   # hi hi hi
```

### 8.2 @wraps для сохранения метаданных

```python
from functools import wraps

def logger(func):
    @wraps(func)                    # сохраняет __name__, __doc__ и т.д.
    def wrapper(*args, **kwargs):
        print(f"Call {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@logger
def add(a, b):
    """Складывает два числа."""
    return a + b

print(add.__name__)   # "add" (без @wraps было бы "wrapper")
print(add.__doc__)    # "Складывает два числа."
```

### 8.3 Встроенные декораторы и functools

| Декоратор | Назначение |
|-----------|------------|
| `@staticmethod` | статический метод |
| `@classmethod` | метод класса |
| `@property` | свойство |
| `@lru_cache` | кеширование результата |
| `@wraps` | сохранение метаданных |
| `@singledispatch` | перегрузка по типу |
| `@dataclass` | сокращённое создание классов |

---

## 9. Итераторы и генераторы

### 9.1 Итераторы

Объект с методами `__iter__` (возвращает себя) и `__next__` (следующий элемент, иначе StopIteration).

```python
class Countdown:
    def __init__(self, start):
        self.n = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

for x in Countdown(3):
    print(x)   # 3 2 1
```

### 9.2 Генераторы

Генератор — функция с `yield`. Сохраняет состояние между вызовами.

```python
def fibonacci(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

for n in fibonacci(100):
    print(n)
```

- `yield` — выдаёт значение и приостанавливает выполнение.
- `send()` — передаёт значение внутрь генератора.
- `throw()` — бросает исключение внутри генератора.
- Генераторные выражения: `(x**2 for x in range(10))`.

```python
sum_sq = sum(x**2 for x in range(10))   # 285

# send
def counter():
    n = 0
    while True:
        received = yield n
        n = received if received is not None else n + 1

c = counter()
next(c)          # 0
c.send(10)       # 10
```

### 9.3 Характеристики генераторов

| Свойство | Значение |
|----------|----------|
| Память | маленькая (ленивые вычисления) |
| Скорость | быстрее для больших данных |
| Одноразовость | после исчерпания StopIteration |
| iter() | выдаёт сам себя |
| tip | работают с бесконечными последовательностями |

---

## 10. Модули и пакеты

### 10.1 Модуль

```python
# mymodule.py
def hello():
    print("Hello!")
VALUE = 42
```

```python
# main.py
import mymodule
mymodule.hello()
print(mymodule.VALUE)

# from ... import
from math import sqrt, pi
from datetime import datetime
import json, os, sys, re
```

### 10.2 Пакет

Пакет — папка с файлом `__init__.py`.

```
mypackage/
    __init__.py
    math_utils.py
    string_utils.py
```

```python
from mypackage import math_utils
from mypackage.math_utils import add
```

### 10.3 __name__ == "__main__"

```python
def main():
    print("Запускаюсь как скрипт")

if __name__ == "__main__":
    main()   # выполняется только при прямом запуске
```

### 10.4 Концепция модулей

| Конструкция | Что импортируется |
|-------------|-------------------|
| `import math` | модуль |
| `from math import sqrt` | один объект |
| `from math import *` | всё (не рекомендуется) |
| `import math as m` | с псевдонимом |
| `if __name__ == "__main__"` | контроль прямого запуска |

---

## 11. Стандартная библиотека (stdlib)

### 11.1 Коллекции

```python
import os, sys, json, re, math
from collections import Counter, defaultdict, deque, namedtuple
from itertools import chain, groupby, product
from functools import lru_cache

# Counter — подсчёт частот
text = "hello world"
print(Counter(text))   # Counter({'l': 3, 'o': 2, 'h': 1, ...})

# defaultdict — значение по умолчанию
dd = defaultdict(list)
dd["a"].append(1)
dd["a"].append(2)      # автоматически создан список

# namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)        # 3 4
```

### 11.2 functools.lru_cache

```python
@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

print(fib(100))   # очень быстро благодаря кешу
```

### 11.3 Модули по категориям

| Модуль | Назначение |
|--------|------------|
| `os` | работа с ОС, пути, env |
| `sys` | интерпретатор, argv, exit |
| `json` | JSON сериализация |
| `re` | регулярные выражения |
| `math` | математика (float) |
| `random` | случайные числа |
| `datetime` | даты и время |
| `pathlib` | современная работа с путями |
| `collections` | расширенные контейнеры |
| `itertools` | комбинаторные итераторы |
| `functools` | функции высшего порядка |
| `csv` | работа с CSV |
| `logging` | логирование |
| `argparse` | CLI аргументы |
| `sqlite3` | встроенная БД |

---

## 12. Обработка ошибок и исключений

### 12.1 try/except/else/finally

```python
try:
    x = int("abc")        # ValueError
except ValueError as e:
    print(f"Ошибка: {e}")
except (TypeError, KeyError):
    print("Другая ошибка")
else:
    print("Ошибок не было")
finally:
    print("Выполнится всегда")
```

### 12.2 Собственные исключения

```python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        super().__init__(f"Недостаточно средств: есть {balance}, нужно {amount}")
        self.balance = balance
        self.amount = amount

raise InsufficientFundsError(100, 500)
```

### 12.3 raise / assert

```python
def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("Делить на ноль нельзя")
    return a / b

assert divide(10, 2) == 5   # проверка-утверждение
```

### 12.4 Иерархия исключений

| Исключение | Когда |
|------------|-------|
| `ValueError` | неверное значение |
| `TypeError` | неверный тип |
| `KeyError` | нет ключа в словаре |
| `IndexError` | нет индекса в списке |
| `ZeroDivisionError` | деление на ноль |
| `AttributeError` | нет атрибута |
| `FileNotFoundError` | нет файла |
| `OSError` | ошибка ОС |

---

## 13. Контекстные менеджеры (with)

Автоматическое освобождение ресурсов.

```python
class ManagedFile:
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        self.f = open(self.name, "w")
        return self.f

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.f.close()
        print("Закрыл файл")

with ManagedFile("data.txt") as f:
    f.write("hello")
# даже при ошибке файл закроется

# контекст-менеджер из модуля contextlib
from contextlib import contextmanager

@contextmanager
def managed(name):
    f = open(name, "w")
    try:
        yield f
    finally:
        f.close()
        print("Закрыл через contextmanager")
```

---

## 14. Dataclasses

Сокращённое описание классов данных.

```python
from dataclasses import dataclass, field

@dataclass
class Book:
    title: str
    author: str
    year: int = 2020
    tags: list = field(default_factory=list)

b = Book("Война и мир", "Толстой")
print(b)          # Book(title='Война и мир', author='Толстой', year=2020, tags=[])
print(b.year)     # 2020
b.tags.append("классика")

# @dataclass(frozen=True) — неизменяемые
# @dataclass(order=True) — сравнение
```

| Атрибут dataclass | Назначение |
|-------------------|------------|
| `frozen=True` | неизменяемость |
| `order=True` | методы `<`, `<=`, ... |
| `repr=False` | отключить repr |
| `field(default_factory=...)` | изменяемые значения по умолчанию |

---

## 15. Дескрипторы и метаклассы (углублённо)

### 15.1 Дескрипторы

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
            raise TypeError("должно быть числом")
        obj.__dict__[self.name] = value

class Point:
    x = Validated()
    y = Validated()

p = Point()
p.x = 5        # ок
# p.x = "no"   # TypeError
```

### 15.2 Метаклассы

```python
class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class DBConnection(metaclass=SingletonMeta):
    pass

a = DBConnection()
b = DBConnection()
print(a is b)   # True — один и тот же объект
```

---

## 16. Паттерны проектирования (ООП)

### 16.1 Singleton

```python
class Singleton:
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

### 16.2 Factory

```python
class AnimalFactory:
    @staticmethod
    def create(animal_type):
        if animal_type == "dog":
            return Dog("unnamed", 0)
        elif animal_type == "cat":
            return Cat("unnamed", 0)
        raise ValueError(f"unknown: {animal_type}")
```

### 16.3 Observer

```python
class EventEmitter:
    def __init__(self):
        self._listeners = []

    def on(self, callback):
        self._listeners.append(callback)

    def emit(self, *args, **kwargs):
        for cb in self._listeners:
            cb(*args, **kwargs)
```

### 16.4 Сводная таблица паттернов

| Паттерн | Назначение | Тип |
|---------|------------|-----|
| Singleton | один экземпляр на процесс | порождающий |
| Factory | создание объектов по типу | порождающий |
| Builder | пошаговое создание сложного объекта | порождающий |
| Adapter | совмещение несовместимых интерфейсов | структурный |
| Decorator | расширение поведения | структурный |
| Observer | уведомление подписчиков | поведенческий |
| Strategy | смена алгоритма на лету | поведенческий |
| Command | инкапсуляция действия | поведенческий |

---

## 17. Сравнение ООП в Python и других языков

| Черта | Python | Java/C++ | Особенность |
|-------|--------|----------|-------------|
| Инкапсуляция | по соглашению | строгие модификаторы | Python мягче |
| Множественное наследование | есть | нет (Java) | C3 линеаризация |
| Перегрузка операторов | dunder-методы | операторы в C++ | Python через методы |
| Интерфейсы | ABC/Protocol | interface | в Python абстрактные классы |
| Статическая типизация | ty hints (опционально) | обязательна | mypy |
| Зачем класс | структурирование данных | обязательная модель | в Python часто хватает dict/dataclass |

---

## 18. Реальные примеры использования ООП

### 18.1 ORM-подобная модель

```python
class Model:
    table = ""
    def __init__(self, **kwargs):
        self.attrs = kwargs

    @classmethod
    def all(cls):
        return [cls(**row) for row in fake_db.get(cls.table, [])]

    def save(self):
        fake_db.setdefault(self.table, []).append(self.attrs)

class User(Model):
    table = "users"
```

### 18.2 Декоратор для логирования вызовов

```python
from functools import wraps

def log_call(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[LOG] {func.__name__}({args}, {kwargs})")
        return func(*args, **kwargs)
    return wrapper

@log_call
def add(a, b):
    return a + b

print(add(2, 3))   # [LOG] add((2, 3), {})
```

---

## 19. Задачи

1. Создайте класс BankAccount с методами deposit, withdraw, balance.
2. Напишите декоратор, логирующий вызов функции.
3. Напишите генератор простых чисел.
4. Создайте класс-наследник от Person — Employee с зарплатой.
5. Напишите функцию, использующую Counter для подсчёта частоты.
6. Реализуйте вектор с перегрузкой `__add__`, `__mul__`, `__abs__`.
7. Напишите абстрактный класс Shape и подклассы Circle, Square.
8. Реализуйте контекстный менеджер с `__enter__/__exit__`.
9. Создайте dataclass для описания товара с полями.
10. Напишите декоратор с аргументами (например, `@retry(n)`).

---

## 20. Типичные ошибки (15+)

1. **Забыли `self`** в первом параметре метода → `TypeError: ... takes 1 positional argument but 2 were given`.
2. **Забыли `super().__init__`** в наследнике → атрибуты родителя не инициализированы.
3. **Изменяемый объект по умолчанию** в аргументе функции → баги с общим списком. Используйте `None`.
4. **Изменяемый `default_factory`** в dataclass → общие списки между объектами. Решение: `field(default_factory=list)`.
5. **Попытка напрямую обратиться к `__priv`** → AttributeError (нужно понимать name mangling).
6. **`return` в `__init__`** → TypeError.
7. **Забыли `return` в геттере `@property`** → возвращается `None`.
8. **Сеттер без `@x.setter`** → нельзя присвоить свойству.
9. **Имя декоратора без `@`** — применяется вручную, легко перепутать.
10. **Генератор «съедается» один раз** — повторный `for` не даст результата.
11. **`while True` без `yield`-остановки** — бесконечный генератор нередко логическая ошибка.
12. **Импорт `from module import *`** засоряет namespace.
13. **Модификация списка во время итерации** → пропуск элементов.
14. **Использование `==` для сравнения с `None`** вместо `is`.
15. **Забыли `@wraps`** → потеря `__name__`, `__doc__`, что ломает дебаг и доки.
16. **Множественное наследование без понимания MRO** → неожиданный вызов метода.
17. **Обращение к атрибуту класса через self при изменении** — меняется только у экземпляра.

---

## 21. Вопросы для собеседования

**1. Что такое `self` в Python?**
`self` — ссылка на текущий экземпляр класса. Передаётся первым параметром метода. Не является ключевым словом — можно назвать иначе, но по конвенции используют `self`.

**2. Разница между методом класса, статическим методом и методом экземпляра?**
Метод экземпляра принимает `self` и работает с данными объекта. `@classmethod` принимает `cls` (класс) и может менять атрибуты класса, используется как фабрика. `@staticmethod` не принимает ни `self`, ни `cls` — просто функция внутри класса.

**3. Что такое магические методы? Приведите примеры.**
Это методы с двойным подчёркиванием (`__init__`, `__str__`, `__add__`, `__len__`), перехватывающие определённые операции языка. Например, `__add__` определяет поведение оператора `+`.

**4. Что такое MRO и как он вычисляется?**
MRO — порядок разрешения методов. Вычисляется алгоритмом C3-линеаризации. Доступен как `Class.__mro__`. Определяет, какой метод вызовется при множественном наследовании.

**5. Что такое декоратор?**
Декоратор — функция, принимающая другую функцию (или класс) и возвращающая обёртку, расширяющую поведение. Записывается с `@`.

**6. Разница между `yield` и `return`?**
`return` завершает функцию и возвращает значение. `yield` приостанавливает выполнение генератора, сохраняет состояние; при следующем `next()` выполнение продолжается.

**7. Что такое инкапсуляция и как она реализована в Python?**
Скрытие внутреннего состояния. В Python — через соглашения (`_`), name mangling (`__`), свойства `@property` и приватные атрибуты.

**8. Что делает `super()`?**
Возвращает прокси-объект для вызова методов родительского класса. Ключев для `__init__` наследников и кооперативного множественного наследования.

**9. Разница между `is` и `==`?**
`==` сравнивает значения (`__eq__`), `is` сравнивает идентичность объектов (адрес в памяти).

**10. Что такое генераторное выражение?**
Компактная форма генератора в скобках: `(x*2 for x in range(10))`. Ленивое, в отличие от list comprehension, которое строит список целиком.

**11. Как сбалансировать приватность и доступность в Python?**
Использовать публичные методы и `@property`, `_` для внутренних, `__` для настоящей защиты от случайного переопределения.

**12. Что такое name mangling?**
Преобразование `__name` в `_Class__name` для предотвращения случайных конфликтов при наследовании.

**13. Когда использовать dataclass вместо обычного класса?**
Когда класс — просто контейнер данных без (или с простой) логикой. Dataclass автогенерирует `__init__`, `__repr__`, `__eq__`.

**14. Что такое контекстный менеджер?**
Объект с `__enter__/__exit__`, использующийся с `with` для гарантированного освобождения ресурсов (файлы, соединения, блокировки).

**15. Чем ООП в Python отличается от Java?**
В Python нет принудительной инкапсуляции и строгой типизации, есть утиная типизация, multiple inheritance, data class и динамическое добавление атрибутов. Java более строгий и явный.

---

## 22. Глоссарий

| Термин | Определение |
|--------|-------------|
| **Класс** | шаблон (чертёж) для создания объектов |
| **Объект (экземпляр)** | конкретный объект, созданный по классу |
| **Атрибут** | данные объекта (переменная) |
| **Метод** | функция, принадлежащая объекту |
| **Конструктор** | `__init__` — инициализация объекта |
| **self** | ссылка на текущий экземпляр |
| **Наследование** | создание класса на основе другого |
| **Переопределение** | замена метода родителя в потомке |
| **Полиморфизм** | одинаковый вызов, разное поведение |
| **Инкапсуляция** | сокрытие внутренних данных |
| **MRO** | порядок разрешения методов |
| **super()** | доступ к методам родителя |
| **Декоратор** | расширение поведения функции |
| **Генератор** | функция с `yield` |
| **Итератор** | объект с `__iter__/__next__` |
| **dunder-метод** | магический метод с `__` |
| **property** | вычисляемое/защищённое свойство |
| **classmethod** | метод класса с `cls` |
| **staticmethod** | статический метод |
| **ABC** | абстрактный базовый класс |
| **Protocol** | структурный интерфейс |
| **Dataclass** | сокращённый класс данных |
| **Context manager** | объект для `with` |
| **Вызов исключения** | `raise` |
| **Name mangling** | преобразование `__name` |
| **Утиная типизация** | способность по поведению, а не типу |

---
*Unit 3: ООП и продвинутые темы. См. [practice.md](practice.md) с упражнениями и проектами.*
