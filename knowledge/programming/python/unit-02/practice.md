# Python — Unit 2: Задачи

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

## Ответы

1. `{n: n**2 for n in numbers}`
2. `[x for x in range(1, 51) if x % 2 == 0]`
3. `sum(1 for _ in open("file.txt"))`
4. `sorted(strings, key=lambda s: len(s))`
