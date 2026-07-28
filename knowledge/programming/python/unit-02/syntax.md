# Python — Unit 2: Структуры данных

## Словари

```python
person = {
    "name": "Алиса",
    "age": 25,
    "city": "Москва"
}
print(person["name"])       # Алиса
person["job"] = "инженер"   # добавить
for k, v in person.items():
    print(f"{k}: {v}")

# get() — безопасный доступ
print(person.get("phone", "Нет номера"))
```

## Множества

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a & b)   # пересечение: {3, 4}
print(a | b)   # объединение: {1, 2, 3, 4, 5, 6}
print(a - b)   # разность: {1, 2}
```

## Генераторы списков

```python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
matrix = [[i*j for j in range(5)] for i in range(5)]
```

## Lambda-функции

```python
add = lambda a, b: a + b
print(add(3, 5))  # 8

numbers = [1, 5, 2, 8, 3]
sorted_nums = sorted(numbers, key=lambda x: -x)
print(sorted_nums)  # [8, 5, 3, 2, 1]
```

## Работа с файлами

```python
# Чтение
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
    lines = f.readlines()

# Запись
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Hello, World!\n")

# with — автоматически закрывает файл
```

## Обработка ошибок

```python
try:
    x = int(input("Число: "))
    result = 10 / x
    print(result)
except ValueError:
    print("Это не число!")
except ZeroDivisionError:
    print("На ноль делить нельзя!")
else:
    print("Всё хорошо!")
finally:
    print("Блок выполняется всегда")
```

## Задачи

1. Напишите функцию, принимающую список чисел и возвращающую словарь {число: квадрат}
2. Напишите генератор списка для всех чётных чисел от 1 до 50
3. Напишите программу, читающую файл и считающую количество строк
4. Используя lambda, отсортируйте список строк по длине
5. Напишите калькулятор с обработкой ошибок (деление на 0, некорректный ввод)
