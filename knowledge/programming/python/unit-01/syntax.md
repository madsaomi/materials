# Python — Unit 1: Основы синтаксиса

## Переменные и типы

```python
# Динамическая типизация
name = "Алиса"        # str
age = 25              # int
height = 1.75         # float
is_student = True     # bool

# type() — узнать тип
print(type(name))     # <class 'str'>
```

## Ввод и вывод

```python
name = input("Как тебя зовут? ")
print(f"Привет, {name}!")
```

## Условные операторы

```python
age = int(input("Сколько лет? "))
if age >= 18:
    print("Взрослый")
elif age >= 13:
    print("Подросток")
else:
    print("Ребёнок")
```

## Циклы

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

## Списки

```python
fruits = ["яблоко", "банан", "апельсин"]
fruits.append("груша")        # добавить
fruits[0]                     # первый элемент
len(fruits)                   # длина
for f in fruits:
    print(f)
```

## Функции

```python
def greet(name):
    return f"Привет, {name}!"

print(greet("Мир"))  # Привет, Мир!
```

## Строки

```python
s = "Hello, World!"
s.upper()          # HELLO, WORLD!
s.lower()          # hello, world!
s.split(",")       # ['Hello', ' World!']
s.replace("Hello", "Hi")  # Hi, World!
s.strip()          # удалить пробелы
```

## Задачи

1. Напишите программу, которая запрашивает имя и возраст, выводит приветствие
2. Напишите функцию, принимающую два числа и возвращающую их сумму
3. Создайте список чисел от 1 до 10, выведите только чётные  
4. Напишите программу, проверяющую, является ли число простым
