# Python — Микро-детали

## 1. Gotchas и подводные камни

### 1.1 Мутабельные дефолтные аргументы

```python
def add_item(item, lst=[]):  # 🚫 Опасность!
    lst.append(item)
    return lst

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2] — баг!

# ✅ Правильно:
def add_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

### 1.2 Замыкание в цикле

```python
funcs = []
for i in range(3):
    funcs.append(lambda: i)  # 🚫

for f in funcs:
    print(f())  # 2, 2, 2

# ✅ Правильно:
funcs = [lambda x=i: x for i in range(3)]
```

### 1.3 Отложенная оценка генераторов

```python
def create_multipliers():
    return [lambda x: i * x for i in range(5)]

# Каждая лямбда видит i = 4 (последнее значение)
for m in create_multipliers():
    print(m(2))  # 8, 8, 8, 8, 8
```

### 1.4 Цепочки сравнений

```python
# Работает как в математике, не как в других языках:
if 1 < x < 10:  # ✅ 1 < x and x < 10

5 == 5 == 5  # True
5 == 5 == 6  # False
(5 == 5) == 6  # True! (первое == True, True == 1, 1 != 6... подождите)
```

### 1.5 is vs ==

```python
a = 256
b = 256
a is b  # True (CPython кеширует -5..256)

a = 257
b = 257
a is b  # False!

# None, True, False — всегда singletons:
x is None
```

### 1.6 Распаковка с *

```python
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2,3,4], last=5

*all, = range(5)  # all = [0,1,2,3,4] (запятая обязательна!)
[*range(5)]  # [0,1,2,3,4]
{*range(5)}  # {0,1,2,3,4}
```

### 1.7 Срез с шагом — копия?

```python
a = [1, 2, 3]
b = a[:]     # поверхностная копия
c = a        # ссылка на тот же объект
d = a[::-1]  # реверс [3,2,1]

a[1] = 99
print(a, b, c)  # [1,99,3] [1,2,3] [1,99,3]
```

### 1.8 Исключения в finally

```python
def clean():
    try:
        raise ValueError("original")
    finally:
        return "override"
        # Возврат в finally ПОДАВЛЯЕТ исключение!
        
clean()  # "override", ValueError проглочен
```

---

## 2. Производительность

### 2.1 Что быстрее

| Операция | Время (отн.) | Примечание |
|----------|-------------|------------|
| `x in set` | O(1) | vs list O(n) |
| `x in list` | O(n) | — |
| `list.append` | O(1) | амортизировано |
| `list.insert(0)` | O(n) | сдвигает все элементы |
| `deque.appendleft` | O(1) | collections.deque |
| `str +=` | O(n²) | создаёт новую строку |
| `list +=` | O(n) | extend |
| `"".join(list)` | O(n) | ✅ оптимально |
| `for i in range(n)` | 1x | Python 3 range — ленивый |
| `while i < n` | ~2x | медленнее for |
| `@property` | ~5x | медленнее прямого доступа |
| `__slots__` | ~30% памяти | без __dict__ |
| `locals()` lookup | ~10% | быстрее globals() |

### 2.2 Измерение времени

```python
import timeit

# Строка
timeit.timeit('"-".join(str(n) for n in range(100))', number=10000)

# Функция
def fast():
    return ",".join(map(str, range(100)))

timeit.timeit(fast, number=10000)

# %timeit в IPython/Jupyter
```

### 2.3 GIL (Global Interpreter Lock)

```python
# GIL блокирует CPython — только 1 поток за раз на Python-код
# I/O-bound → threading (GIL отпускается на I/O)
# CPU-bound → multiprocessing (отдельные процессы)

# Пример: CPU-bound с multiprocessing
from multiprocessing import Pool

def square(n):
    return n ** 2

with Pool() as pool:
    results = pool.map(square, range(1000000))

# I/O-bound с asyncio
import asyncio

async def fetch(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def main():
    tasks = [fetch(f"https://api.example.com/{i}") for i in range(100)]
    return await asyncio.gather(*tasks)
```

---

## 3. Скрытые возможности

### 3.1 Ellipsis (...)

```python
# Placeholder
def todo():
    ...  # то же что pass, but more explicit

# Type hint для кортежа переменной длины
def process(data: tuple[int, ...]) -> None: ...

# Многомерные срезы (numpy)
import numpy as np
arr[..., 0]  # все строки, первый столбец

# TypedDict с optional
class MyDict(TypedDict, total=False):
    name: str
    age: int
```

### 3.2 Walrus operator (:=) — нюансы

```python
# ✅ Хорошо
if (match := re.search(pattern, text)):
    print(match.group())

if (n := len(items)) > 10:
    print(f"много: {n}")

# 🚫 Нельзя:
# a := 1  — ошибка (глобально без скобок)
# f(x := y)  — ошибка (в позиционном аргументе)

# ✅ В comprehension:
[result for x in data if (result := f(x)) is not None]
```

### 3.3 Расширенная распаковка (3.10+)

```python
# PEP 634 — Match case со сложными паттернами
match point:
    case (0, 0):
        print("origin")
    case (0, y):
        print(f"x=0, y={y}")
    case (x, 0):
        print(f"y=0, x={x}")
    case (x, y):
        print(f"({x},{y})")

# Захват вложенных атрибутов
match user:
    case User(name=name, age=age):
        print(f"{name} is {age}")
```

### 3.4 ZoneInfo (3.9+)

```python
from zoneinfo import ZoneInfo
from datetime import datetime

# Часовые пояса без pytz!
dt = datetime(2024, 3, 15, tzinfo=ZoneInfo("Asia/Tokyo"))
dt.astimezone(ZoneInfo("Europe/Moscow"))
```

### 3.5 functools — недооценённые

```python
from functools import partial, singledispatch, wraps, cache

# Partial
base36 = partial(int, base=36)
base36("1z")  # 71

# Singledispatch (overloading по типу первого аргумента)
@singledispatch
def process(arg):
    raise NotImplementedError

@process.register(int)
def _(arg):
    return arg * 2

@process.register(str)
def _(arg):
    return arg.upper()

@process.register(list)
def _(arg):
    return [process(x) for x in arg]

# @cache (3.9+) — автоматическая мемоизация
@cache
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)
```

---

## 4. Datetime — частые ошибки

```python
from datetime import datetime, timezone, timedelta

# 🚫 Наивное время — ошибки с переводами часов
dt = datetime(2024, 3, 15, 14, 30)

# ✅ Всегда указывать timezone
dt_aware = datetime(2024, 3, 15, 14, 30, tzinfo=timezone.utc)

# Парсинг
# 🚫 dt.strptime("%Y-%m-%d", s) — медленно для больших данных
# ✅ datetime.fromisoformat(s) — быстрее (3.7+)

# Разница между aware и naive
naive = datetime(2024, 1, 1)
aware = datetime(2024, 1, 1, tzinfo=timezone.utc)
naive - aware  # TypeError!
```

---

## 5. Питонические паттерны

### 5.1 EAFP vs LBYL

```python
# LBYL (Look Before You Leap) — if проверки
if "key" in d and isinstance(d["key"], int):
    value = d["key"]
    
# EAFP (Easier to Ask Forgiveness than Permission) ✅ Pythonic
try:
    value = d["key"]
    result = 100 / value
except (KeyError, TypeError, ZeroDivisionError):
    value = 0
```

### 5.2 Контекстный менеджер с группой (3.11+)

```python
# Старый способ
with open("a.txt") as a, open("b.txt") as b:
    ...

# 3.10+
with (
    open("a.txt") as a,
    open("b.txt") as b,
    open("c.txt") as c,
):
    ...

# 3.11+ — ExceptionGroup
try:
    with (
        open("a.txt") as a,
        open("b.txt") as b,
    ):
        ...
except* FileNotFoundError as eg:
    for err in eg.exceptions:
        print(f"not found: {err.filename}")
```

### 5.3 sentinel для None

```python
_sentinel = object()

def get_value(key, default=_sentinel):
    d = {"a": 1}
    if key in d:
        return d[key]
    if default is _sentinel:
        raise KeyError(key)
    return default
```

---

## 6. Модули — тонкости импорта

### 6.1 Циклические импорты

```python
# a.py
from b import y
x = 1

# b.py
from a import x  # 🚫 ImportError!

# Решение 1: отложенный импорт
def get_x():
    from a import x
    return x

# Решение 2: импорт внутри функции
```

### 6.2 `__all__`

```python
# module.py
__all__ = ["public_func", "PublicClass"]

def public_func(): ...
def _private_func(): ...  # не попадёт в from module import *

class PublicClass: ...
```

### 6.3 `__name__ == "__main__"`

```python
if __name__ == "__main__":
    main()
# Может быть False при запуске как модуль:
# python -m mymodule
```

---

## 7. Магические методы — редко используемые

| Метод | Назначение | Пример |
|-------|-----------|--------|
| `__bool__` | bool(obj) | def __bool__(self): return len(self) > 0 |
| `__format__` | f"{obj:spec}" | def __format__(self, spec): ... |
| `__del__` | деструктор | def __del__(self): file.close() |
| `__index__` | для индексов | def __index__(self): return self.value |
| `__length_hint__` | оценка длины | generator.__length_hint__() |
| `__fspath__` | путь ФС | def __fspath__(self): return self.path |
| `__init_subclass__` | при создании подкласса | class Base: def __init_subclass__(cls): ... |
| `__set_name__` | при создании атрибута | descriptor.__set_name__(owner, name) |
| `__class_getitem__` | Generic[T] | def __class_getitem__(cls, item): ... |

---

## 8. Типизация — продвинутые приёмы

```python
# Self (3.11+)
from typing import Self

class MyClass:
    @classmethod
    def create(cls) -> Self:
        return cls()

    def copy(self) -> Self:
        ...

# LiteralString (3.11+) — не просто str
from typing import LiteralString

def execute(sql: LiteralString) -> None:
    # гарантированно не SQL injection
    ...

# Never (3.11+) — функция не возвращает
from typing import Never, NoReturn

def stop() -> Never:
    raise SystemExit(1)

# TypeVar с ограничениями
from typing import TypeVar
from collections.abc import Iterable

T = TypeVar("T", bound=Iterable)

# Dataclass transform (3.11+)
# @dataclass_transform() — декоратор для кастомных dataclass-подобных
```

---

## 9. Файловый ввод-вывод — продвинутые техники

```python
# mmap — memory-mapped files для больших файлов
import mmap
with open("large.bin", "r+b") as f:
    with mmap.mmap(f.fileno(), 0) as mm:
        print(mm[:100])
        mm.find(b"pattern")

# tempfile — временные файлы
import tempfile
with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
    f.write("temp data")
    print(f.name)

# io.StringIO — строковый поток
from io import StringIO
buf = StringIO()
print("hello", file=buf)
buf.getvalue()  # "hello\n"
```

---

*Микро-детали Python. Дополняется.*
