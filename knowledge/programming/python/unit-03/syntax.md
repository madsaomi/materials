# Python — Unit 3: ООП и продвинутые темы

## Классы и объекты

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Привет, я {self.name}!"

    def __str__(self):
        return f"{self.name} ({self.age})"

p = Person("Алиса", 25)
print(p.greet())    # Привет, я Алиса!
print(p)            # Алиса (25)
```

## Наследование

```python
class Student(Person):
    def __init__(self, name, age, major):
        super().__init__(name, age)
        self.major = major
    
    def study(self):
        return f"{self.name} учит {self.major}"

s = Student("Боб", 20, "CS")
print(s.greet())    # Привет, я Боб!
print(s.study())    # Боб учит CS
```

## Декораторы

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

# property
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def area(self):
        return 3.14 * self._radius ** 2
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Радиус не может быть < 0")
        self._radius = value
```

## Модули и пакеты

```python
# mymodule.py
def hello():
    print("Hello!")

# main.py
import mymodule
mymodule.hello()

# from ... import
from math import sqrt, pi
from datetime import datetime
import json, os, sys, re
```

## Итераторы и генераторы

```python
def fibonacci(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

for n in fibonacci(100):
    print(n)

# Генераторные выражения
sum_sq = sum(x**2 for x in range(10))
```

## Стандартная библиотека

```python
import os, sys, json, re, math
from collections import Counter, defaultdict
from itertools import chain, groupby
from functools import lru_cache

# Counter
text = "hello world"
print(Counter(text))  # {'l': 3, 'o': 2, ...}

# lru_cache
@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
```

## Задачи

1. Создайте класс BankAccount с методами deposit, withdraw, balance
2. Напишите декоратор, логирующий вызов функции
3. Напишите генератор простых чисел
4. Создайте класс-наследник от Person — Employee с зарплатой
5. Напишите функцию, использующую Counter для подсчёта частоты
