# Python — Unit 3: Проекты

## Проект 1: Банковский счёт

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance  # приватный
    
    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            return f"Внесено {amount}. Баланс: {self.__balance}"
        return "Сумма должна быть > 0"
    
    def withdraw(self, amount):
        if 0 < amount <= self.__balance:
            self.__balance -= amount
            return f"Снято {amount}. Баланс: {self.__balance}"
        return "Недостаточно средств"
    
    @property
    def balance(self):
        return self.__balance

acc = BankAccount("Алиса", 1000)
print(acc.deposit(500))    # 1500
print(acc.withdraw(200))   # 1300
print(acc.balance)         # 1300
```

## Проект 2: TODO-list

```python
import json, os

class TodoList:
    def __init__(self, db="todo.json"):
        self.db = db
        self.tasks = self._load()
    
    def _load(self):
        if os.path.exists(self.db):
            with open(self.db, "r") as f:
                return json.load(f)
        return []
    
    def _save(self):
        with open(self.db, "w") as f:
            json.dump(self.tasks, f, indent=2)
    
    def add(self, title):
        self.tasks.append({"title": title, "done": False})
        self._save()
    
    def done(self, idx):
        if 0 <= idx < len(self.tasks):
            self.tasks[idx]["done"] = True
            self._save()
    
    def show(self):
        if not self.tasks:
            print("Нет задач")
            return
        for i, t in enumerate(self.tasks):
            status = "✓" if t["done"] else " "
            print(f"{i+1}. [{status}] {t['title']}")
    
    def delete(self, idx):
        if 0 <= idx < len(self.tasks):
            self.tasks.pop(idx)
            self._save()

todo = TodoList()
todo.add("Выучить Python")
todo.add("Сделать проект")
todo.show()
```

## Проект 3: Web-парсер

```python
import requests
from bs4 import BeautifulSoup
import csv

# pip install requests beautifulsoup4

def parse_quotes():
    url = "http://quotes.toscrape.com"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    
    quotes = []
    for q in soup.find_all("div", class_="quote"):
        text = q.find("span", class_="text").text
        author = q.find("small", class_="author").text
        quotes.append({"text": text, "author": author})
    
    with open("quotes.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "author"])
        writer.writeheader()
        writer.writerows(quotes)
    
    print(f"Сохранено {len(quotes)} цитат")
```

## Ответы на задачи

1. BankAccount — см. проект 1
2. `def logger(func): def wrapper(*a, **kw): print(f"Call {func.__name__}"); return func(*a, **kw); return wrapper`
3. `def primes(): n=2; while True: if all(n%i for i in range(2, int(n**0.5)+1)): yield n; n+=1`
4. `class Employee(Person): def __init__(self, n, a, sal): super().__init__(n, a); self.salary = sal`
5. `from collections import Counter; def freq(lst): return dict(Counter(lst))`
