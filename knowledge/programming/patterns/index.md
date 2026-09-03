# Паттерны проектирования — Справочник

15+ паттернов GoF с примерами на Python, Go, JavaScript. Описание, когда использовать, аналогия из жизни.

---

## Категории паттернов

| Категория | Паттерны | Назначение |
|-----------|----------|------------|
| **Порождающие** | Singleton, Factory, Builder, Prototype, Abstract Factory | Создание объектов |
| **Структурные** | Adapter, Decorator, Proxy, Facade, Composite, Bridge | Состав объектов |
| **Поведенческие** | Observer, Strategy, Command, Iterator, Template Method, State | Взаимодействие объектов |

---

# Порождающие паттерны (Creational)

---

## 1. Singleton — Одиночка

**Аналогия:** Президент страны — в любой момент времени только один.

**Когда использовать:**

- Логгер, пул соединений, кеш конфигурации
- Единственное точка доступа к ресурсу
- Ленивая инициализация

**Python:**

```python
import threading

class Singleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "_initialized"):
            self._initialized = True
            self.data = {}

# Использование
s1 = Singleton()
s2 = Singleton()
assert s1 is s2  # True — тот же объект
```

**Go:**

```go
package singleton

import "sync"

type Singleton struct {
    data map[string]interface{}
}

var (
    instance *Singleton
    once     sync.Once
)

func GetInstance() *Singleton {
    once.Do(func() {
        instance = &Singleton{
            data: make(map[string]interface{}),
        }
    })
    return instance
}
```

**JavaScript:**

```javascript
class Singleton {
    constructor() {
        if (Singleton.instance) {
            return Singleton.instance;
        }
        this.data = {};
        Singleton.instance = this;
    }
}

const s1 = new Singleton();
const s2 = new Singleton();
console.log(s1 === s2); // true
```

---

## 2. Factory — Фабрика

**Аналогия:** Автомат с напитками — выбираешь кнопку, получаешь продукт.

**Когда использовать:**

- Много типов объектов, логика создания сложна
- Необходимо инкапсулировать создание
- Работа с интерфейсами/абстракциями

**Python:**

```python
from abc import ABC, abstractmethod

class Transport(ABC):
    @abstractmethod
    def deliver(self) -> str: ...

class Truck(Transport):
    def deliver(self) -> str:
        return "Доставка по дороге"

class Ship(Transport):
    def deliver(self) -> str:
        return "Доставка по морю"

class Airplane(Transport):
    def deliver(self) -> str:
        return "Доставка по воздуху"

class TransportFactory:
    _creators = {
        "truck": Truck,
        "ship": Ship,
        "airplane": Airplane,
    }

    @classmethod
    def create(cls, transport_type: str) -> Transport:
        creator = cls._creators.get(transport_type)
        if not creator:
            raise ValueError(f"Неизвестный тип: {transport_type}")
        return creator()

    @classmethod
    def register(cls, name: str, creator):
        cls._creators[name] = creator

# Использование
transport = TransportFactory.create("ship")
print(transport.deliver())  # "Доставка по морю"
```

**Go:**

```go
package factory

type Transport interface {
    Deliver() string
}

type Truck struct{}
func (t Truck) Deliver() string { return "Доставка по дороге" }

type Ship struct{}
func (s Ship) Deliver() string { return "Доставка по морю" }

func CreateTransport(t string) Transport {
    switch t {
    case "truck":
        return Truck{}
    case "ship":
        return Ship{}
    default:
        panic("неизвестный тип")
    }
}
```

**JavaScript:**

```javascript
class Car {
    drive() { return "Едет по дороге"; }
}
class Boat {
    drive() { return "Плывёт по воде"; }
}
class Airplane {
    drive() { return "Летит в небе"; }
}

class TransportFactory {
    static create(type) {
        const classes = { car: Car, boat: Boat, airplane: Airplane };
        if (!classes[type]) throw new Error("Неизвестный тип");
        return new classes[type]();
    }
}

const vehicle = TransportFactory.create("boat");
console.log(vehicle.drive()); // "Плывёт по воде"
```

---

## 3. Builder — Строитель

**Аналогия:** Заказ в ресторане — пошагово выбираешь компоненты.

**Когда использовать:**

- Объект имеет много параметров, часть опциональна
- Конструктор с 10+ параметрами
- Чтение/сборка из конфигов

**Python:**

```python
class QueryBuilder:
    def __init__(self):
        self._table = ""
        self._conditions = []
        self._order_by = ""
        self._limit = 0
        self._fields = ["*"]

    def table(self, name: str) -> "QueryBuilder":
        self._table = name
        return self

    def select(self, *fields: str) -> "QueryBuilder":
        self._fields = list(fields)
        return self

    def where(self, condition: str) -> "QueryBuilder":
        self._conditions.append(condition)
        return self

    def order_by(self, field: str, desc: bool = False) -> "QueryBuilder":
        self._order_by = f"{field} {'DESC' if desc else 'ASC'}"
        return self

    def limit(self, n: int) -> "QueryBuilder":
        self._limit = n
        return self

    def build(self) -> str:
        query = f"SELECT {', '.join(self._fields)} FROM {self._table}"
        if self._conditions:
            query += " WHERE " + " AND ".join(self._conditions)
        if self._order_by:
            query += f" ORDER BY {self._order_by}"
        if self._limit:
            query += f" LIMIT {self._limit}"
        return query

# Использование
sql = (
    QueryBuilder()
    .table("users")
    .select("id", "name", "email")
    .where("age > 18")
    .where("active = true")
    .order_by("name")
    .limit(10)
    .build()
)
# SELECT id, name, email FROM users WHERE age > 18 AND active = true ORDER BY name ASC LIMIT 10
```

**JavaScript:**

```javascript
class HttpRequestBuilder {
    constructor(url) {
        this._url = url;
        this._method = "GET";
        this._headers = {};
        this._body = null;
        this._timeout = 5000;
    }

    method(m) { this._method = m; return this; }
    header(k, v) { this._headers[k] = v; return this; }
    body(b) { this._body = b; return this; }
    timeout(t) { this._timeout = t; return this; }

    build() {
        return {
            url: this._url,
            method: this._method,
            headers: this._headers,
            body: this._body,
            timeout: this._timeout,
        };
    }
}

const req = new HttpRequestBuilder("https://api.example.com/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .body({ name: "Alice" })
    .timeout(10000)
    .build();
```

---

# Структурные паттерны (Structural)

---

## 4. Adapter — Адаптер

**Аналогия:** Перехватное устройство — подключает USB-C к старому порту.

**Когда использовать:**

- Интеграция с унаследованным кодом
- Обёртка над несовместимым интерфейсом
- Конвертация данных между форматами

**Python:**

```python
class OldPrinter:
    def print_old(self, text: str) -> str:
        return f"[OLD] {text}"

class ModernPrinter:
    def print_modern(self, text: str, color: str = "black") -> str:
        return f"[{color.upper()}] {text}"

class PrinterAdapter:
    """Адаптирует OldPrinter к интерфейсу ModernPrinter."""
    def __init__(self, old_printer: OldPrinter):
        self._printer = old_printer

    def print_modern(self, text: str, color: str = "black") -> str:
        return self._printer.print_old(text)

# Использование
old = OldPrinter()
adapter = PrinterAdapter(old)
print(adapter.print_modern("Привет"))  # [OLD] Привет
```

**JavaScript:**

```javascript
class OldApi {
    getData(callback) {
        setTimeout(() => callback(null, { result: 42 }), 100);
    }
}

class NewApi {
    async fetchData() {
        return { value: 42 };
    }
}

class ApiAdapter {
    constructor(oldApi) { this.api = oldApi; }
    async fetchData() {
        return new Promise((resolve, reject) => {
            this.api.getData((err, data) => {
                if (err) reject(err);
                else resolve({ value: data.result });
            });
        });
    }
}
```

---

## 5. Decorator — Декоратор

**Аналогия:** Украшения на ёлке — добавляют функциональность без изменения основы.

**Когда использовать:**

- Добавление поведения без наследования
- Цепочка обёрток (логирование, кеширование, аутентификация)
- Открытые/закрытые принципы

**Python:**

```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__}: {elapsed:.4f}s")
        return result
    return wrapper

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Попытка {attempt + 1} не удалась: {e}")
                    time.sleep(delay)
        return wrapper
    return decorator

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Вызов {func.__name__}({args}, {kwargs})")
        result = func(*args, **kwargs)
        print(f"Результат: {result}")
        return result
    return wrapper

@timer
@retry(max_attempts=3)
@log_calls
def process_data(data):
    time.sleep(0.1)
    return [x * 2 for x in data]
```

**JavaScript:**

```javascript
function withLogging(fn) {
    return function (...args) {
        console.log(`Вызов ${fn.name}(${args})`);
        const result = fn.apply(this, args);
        console.log(`Результат: ${result}`);
        return result;
    };
}

function withTiming(fn) {
    return function (...args) {
        const start = performance.now();
        const result = fn.apply(this, args);
        console.log(`${fn.name}: ${(performance.now() - start).toFixed(2)}ms`);
        return result;
    };
}

function withCache(fn) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

const process = withLogging(withTiming(function process(data) {
    return data.map(x => x * 2);
}));
```

---

## 6. Proxy — Прокси

**Аналогия:** Секретарь руководителя — фильтрует вызовы, проверяет права.

**Когда использовать:**

- Ленивая загрузка (виртуальный прокси)
- Кеширование
- Проверка доступа
- Логирование вызовов

**Python:**

```python
class CachedDB:
    def __init__(self, db):
        self._db = db
        self._cache = {}

    def get(self, key):
        if key in self._cache:
            print(f"Кеш: {key}")
            return self._cache[key]
        value = self._db.query(key)
        self._cache[key] = value
        return value

    def set(self, key, value):
        self._cache.pop(key, None)
        self._db.insert(key, value)

    def delete(self, key):
        self._cache.pop(key, None)
        self._db.delete(key)

class RateLimitProxy:
    def __init__(self, service, limit=100, window=60):
        self._service = service
        self._calls = {}
        self._limit = limit
        self._window = window

    def __getattr__(self, name):
        method = getattr(self._service, name)

        def wrapper(*args, **kwargs):
            import time
            now = time.time()
            caller = kwargs.get("caller", "default")
            calls = self._calls.get(caller, [])
            calls = [t for t in calls if now - t < self._window]
            if len(calls) >= self._limit:
                raise RuntimeError(f"Rate limit exceeded for {caller}")
            calls.append(now)
            self._calls[caller] = calls
            return method(*args, **kwargs)

        return wrapper
```

**JavaScript:**

```javascript
class ReactiveObj {
    constructor(obj) {
        this._obj = obj;
        this._listeners = new Map();
        return new Proxy(this, {
            get(target, prop) {
                if (prop.startsWith("_")) return target._obj[prop];
                return target._obj[prop];
            },
            set(target, prop, value) {
                const old = target._obj[prop];
                target._obj[prop] = value;
                if (old !== value && target._listeners.has(prop)) {
                    target._listeners.get(prop).forEach((fn) => fn(value, old));
                }
                return true;
            }
        });
    }

    on(prop, callback) {
        if (!this._listeners.has(prop)) {
            this._listeners.set(prop, []);
        }
        this._listeners.get(prop).push(callback);
    }
}

const user = new ReactiveObj({ name: "Alice", age: 30 });
user.on("age", (newVal, oldVal) => {
    console.log(`Возраст: ${oldVal} → ${newVal}`);
});
user.age = 31; // "Возраст: 30 → 31"
```

---

# Поведенческие паттерны (Behavioral)

---

## 7. Observer — Наблюдатель

**Аналогия:** Подписка на YouTube — подписчики получают уведомления о новом видео.

**Когда использовать:**

- Событийная архитектура
- Уведомления, push-сообщения
- Модель-Представление (MVC)

**Python:**

```python
from typing import Callable, Any

class EventEmitter:
    def __init__(self):
        self._listeners: dict[str, list[Callable]] = {}

    def on(self, event: str, callback: Callable) -> None:
        self._listeners.setdefault(event, []).append(callback)

    def off(self, event: str, callback: Callable) -> None:
        if event in self._listeners:
            self._listeners[event] = [cb for cb in self._listeners[event] if cb != callback]

    def emit(self, event: str, *args: Any, **kwargs: Any) -> None:
        for callback in self._listeners.get(event, []):
            callback(*args, **kwargs)

# Использование
emitter = EventEmitter()

def on_user_created(user):
    print(f"Отправить приветственное письмо: {user['email']}")

def on_user_created_log(user):
    log(f"Создан пользователь: {user['name']}")

emitter.on("user_created", on_user_created)
emitter.on("user_created", on_user_created_log)
emitter.emit("user_created", {"name": "Alice", "email": "alice@example.com"})
```

**Go:**

```go
package observer

type Event struct {
    Name    string
    Payload interface{}
}

type Observer func(Event)

type EventEmitter struct {
    listeners map[string][]Observer
}

func New() *EventEmitter {
    return &EventEmitter{listeners: make(map[string][]Observer)}
}

func (e *EventEmitter) On(event string, fn Observer) {
    e.listeners[event] = append(e.listeners[event], fn)
}

func (e *EventEmitter) Emit(event string, payload interface{}) {
    evt := Event{Name: event, Payload: payload}
    for _, fn := range e.listeners[event] {
        go fn(evt)
    }
}
```

**JavaScript:**

```javascript
class EventEmitter {
    constructor() { this._listeners = {}; }

    on(event, fn) {
        (this._listeners[event] = this._listeners[event] || []).push(fn);
        return () => this.off(event, fn);
    }

    off(event, fn) {
        this._listeners[event] = (this._listeners[event] || []).filter(f => f !== fn);
    }

    emit(event, ...args) {
        (this._listeners[event] || []).forEach(fn => fn(...args));
    }
}

const bus = new EventEmitter();
const unsub = bus.on("data", (d) => console.log("Получено:", d));
bus.emit("data", { id: 1 });
unsub(); // отписка
```

---

## 8. Strategy — Стратегия

**Аналогия:** Навигатор —可以选择 разные маршруты (быстрый, короткий, без платных дорог).

**Когда использовать:**

- Много алгоритмов для одной задачи
- Выбор алгоритма во время выполнения
- Устранение условных операторов

**Python:**

```python
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: list) -> list: ...

class BubbleSortStrategy(SortStrategy):
    def sort(self, data):
        arr = data[:]
        n = len(arr)
        for i in range(n):
            for j in range(0, n - i - 1):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        return arr

class QuickSortStrategy(SortStrategy):
    def sort(self, data):
        if len(data) <= 1:
            return data
        pivot = data[len(data) // 2]
        left = [x for x in data if x < pivot]
        mid = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + mid + self.sort(right)

class Sorter:
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy):
        self._strategy = strategy

    def sort(self, data: list) -> list:
        return self._strategy.sort(data)

sorter = Sorter(QuickSortStrategy())
print(sorter.sort([3, 1, 4, 1, 5, 9]))

sorter.set_strategy(BubbleSortStrategy())
print(sorter.sort([3, 1, 4, 1, 5, 9]))
```

**JavaScript:**

```javascript
class PricingStrategy {
    static REGULAR = "regular";
    static PREMIUM = "premium";
    static VIP = "vip";

    static strategies = {
        regular: (price) => price,
        premium: (price) => price * 0.9,
        vip: (price) => price * 0.8,
    };

    static calculate(price, type) {
        const fn = this.strategies[type] || this.strategies.regular;
        return fn(price);
    }
}

console.log(PricingStrategy.calculate(100, "regular")); // 100
console.log(PricingStrategy.calculate(100, "vip"));     // 80
```

---

## 9. Command — Команда

**Аналогия:** Пульт телевизора — каждая кнопка = команда, можно отменить.

**Когда использовать:**

- Undo/Redo
- История операций
- Отложенные вычисления
- Транзакции

**Python:**

```python
from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self) -> None: ...

    @abstractmethod
    def undo(self) -> None: ...

class TextEditor:
    def __init__(self):
        self.text = ""

    def insert(self, position, text):
        self.text = self.text[:position] + text + self.text[position:]

    def delete(self, position, length):
        deleted = self.text[position:position + length]
        self.text = self.text[:position] + self.text[position + length:]
        return deleted

class InsertCommand(Command):
    def __init__(self, editor, position, text):
        self.editor = editor
        self.position = position
        self.text = text

    def execute(self):
        self.editor.insert(self.position, self.text)

    def undo(self):
        self.editor.delete(self.position, len(self.text))

class DeleteCommand(Command):
    def __init__(self, editor, position, length):
        self.editor = editor
        self.position = position
        self.length = length
        self.deleted = ""

    def execute(self):
        self.deleted = self.editor.delete(self.position, self.length)

    def undo(self):
        self.editor.insert(self.position, self.deleted)

class CommandHistory:
    def __init__(self):
        self._history = []
        self._redo_stack = []

    def execute(self, command: Command):
        command.execute()
        self._history.append(command)
        self._redo_stack.clear()

    def undo(self):
        if self._history:
            cmd = self._history.pop()
            cmd.undo()
            self._redo_stack.append(cmd)

    def redo(self):
        if self._redo_stack:
            cmd = self._redo_stack.pop()
            cmd.execute()
            self._history.append(cmd)

editor = TextEditor()
history = CommandHistory()

history.execute(InsertCommand(editor, 0, "Привет"))
history.execute(InsertCommand(editor, 6, " мир"))
print(editor.text)  # "Привет мир"

history.undo()
print(editor.text)  # "Привет"

history.redo()
print(editor.text)  # "Привет мир"
```

**JavaScript:**

```javascript
class CommandManager {
    constructor() { this.history = []; this.redoStack = []; }

    execute(command) {
        command.execute();
        this.history.push(command);
        this.redoStack = [];
    }

    undo() {
        const cmd = this.history.pop();
        if (cmd) { cmd.undo(); this.redoStack.push(cmd); }
    }

    redo() {
        const cmd = this.redoStack.pop();
        if (cmd) { cmd.execute(); this.history.push(cmd); }
    }
}

class AddItemCommand {
    constructor(list, item) { this.list = list; this.item = item; }
    execute() { this.list.push(this.item); }
    undo() { this.list.pop(); }
}

const list = [];
const manager = new CommandManager();
manager.execute(new AddItemCommand(list, "item1"));
console.log(list); // ["item1"]
manager.undo();
console.log(list); // []
```

---

## 10. Template Method — Шаблонный метод

**Аналогия:** Рецепт — структура одна, ингредиенты разные.

**Когда использовать:**

- Общий алгоритм с вариациями отдельных шагов
- Фреймворки (Django, Rails)
- Единый каркас, разная логика

**Python:**

```python
from abc import ABC, abstractmethod

class DataMiner(ABC):
    def mine(self, path: str) -> dict:
        data = self.extract(path)
        parsed = self.parse(data)
        filtered = self.filter(parsed)
        analysis = self.analyze(filtered)
        report = self.report(analysis)
        return report

    @abstractmethod
    def extract(self, path: str) -> str: ...

    @abstractmethod
    def parse(self, data: str) -> list: ...

    def filter(self, data: list) -> list:
        return [d for d in data if d is not None]

    def analyze(self, data: list) -> dict:
        return {"count": len(data), "items": data}

    def report(self, analysis: dict) -> str:
        return f"Найдено: {analysis['count']} записей"

class CSVMiner(DataMiner):
    def extract(self, path):
        with open(path) as f:
            return f.read()

    def parse(self, data):
        return [line.split(",") for line in data.strip().split("\n") if line]

class JSONMiner(DataMiner):
    def extract(self, path):
        with open(path) as f:
            return f.read()

    def parse(self, data):
        import json
        return json.loads(data)
```

**JavaScript:**

```javascript
class Game {
    start() {
        this.initialize();
        this.play();
        this.finish();
    }

    initialize() { console.log("Инициализация..."); }
    finish() { console.log("Игра окончена"); }

    play() { throw new Error("Реализуйте play()"); }
}

class Chess extends Game {
    initialize() {
        super.initialize();
        console.log("Расстановка шахматных фигур");
    }

    play() { console.log("Партия в шахматы"); }
}

class Football extends Game {
    initialize() {
        super.initialize();
        console.log("Разминка команд");
    }

    play() { console.log("Матч по футболу"); }
}
```

---

## 11. State — Состояние

**Аналогия:** Автомат — в зависимости от состояния (ожидание, ввод, выдача) по-разному реагирует.

**Когда использовать:**

- Объект меняет поведение в зависимости от состояния
- FSM (конечные автоматы)
- Тележка покупок, заказ, media player

**Python:**

```python
from abc import ABC, abstractmethod

class State(ABC):
    @abstractmethod
    def handle(self, context) -> None: ...

class IdleState(State):
    def handle(self, context):
        print("Ожидание... Переключение в режим работы")
        context.state = WorkingState()

class WorkingState(State):
    def handle(self, context):
        print("Работаю... Завершаю")
        context.state = DoneState()

class DoneState(State):
    def handle(self, context):
        print("Готово!")
        context.state = IdleState()

class Machine:
    def __init__(self):
        self.state = IdleState()

    def process(self):
        self.state.handle(self)

machine = Machine()
machine.process()  # Ожидание... Переключение в режим работы
machine.process()  # Работаю... Завершаю
machine.process()  # Готово!
```

**JavaScript:**

```javascript
class TrafficLight {
    constructor() {
        this.states = {
            red: { next: "green", duration: 5000 },
            green: { next: "yellow", duration: 3000 },
            yellow: { next: "red", duration: 1000 },
        };
        this.current = "red";
        this.timer = null;
    }

    transition() {
        const state = this.states[this.current];
        console.log(`Свет: ${this.current}`);
        this.current = state.next;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.transition(), state.duration);
    }

    start() { this.transition(); }
}

const light = new TrafficLight();
light.start();
```

---

## 12. Iterator — Итератор

**Аналогия:** Пульт от телевизора — переключает каналы по одному.

**Python:**

```python
class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

class BinaryTree:
    def __init__(self, root):
        self.root = root

    def __iter__(self):
        return self._inorder(self.root)

    def _inorder(self, node):
        if node:
            yield from self._inorder(node.left)
            yield node.value
            yield from self._inorder(node.right)

tree = BinaryTree(Node(1, Node(2, Node(4), Node(5)), Node(3)))
for val in tree:
    print(val, end=" ")  # 4 2 5 1 3
```

**JavaScript:**

```javascript
class Range {
    constructor(start, end, step = 1) {
        this.start = start;
        this.end = end;
        this.step = step;
    }

    [Symbol.iterator]() {
        let current = this.start;
        const end = this.end;
        const step = this.step;
        return {
            next() {
                if (current <= end) {
                    const value = current;
                    current += step;
                    return { value, done: false };
                }
                return { done: true };
            }
        };
    }
}

for (const n of new Range(1, 10, 2)) {
    console.log(n); // 1, 3, 5, 7, 9
}
```

---

## 13. Facade — Фасад

**Аналогия:** Ресепшн отеля — один звонок, а за кулисами десятки служб.

**Когда использовать:**

- Упрощение сложного API
- Интеграция с legacy-системой
- Единая точка входа

**Python:**

```python
class AudioSystem:
    def on(self): print("Аудио включено")
    def set_volume(self, v): print(f"Громкость: {v}")

class VideoSystem:
    def on(self): print("Видео включено")
    def set_resolution(self, r): print(f"Разрешение: {r}")

class LightingSystem:
    def dim(self, level): print(f"Свет: {level}%")

class HomeTheaterFacade:
    def __init__(self):
        self.audio = AudioSystem()
        self.video = VideoSystem()
        self.lighting = LightingSystem()

    def watch_movie(self, name):
        print(f"\n--- Подготовка к просмотру: {name} ---")
        self.lighting.dim(30)
        self.video.on()
        self.video.set_resolution("4K")
        self.audio.on()
        self.audio.set_volume(70)
        print("--- Фильм начинается ---\n")

    def end_movie(self):
        print("--- Завершение ---")
        self.lighting.dim(100)
        self.audio.set_volume(0)

theater = HomeTheaterFacade()
theater.watch_movie("Inception")
theater.end_movie()
```

---

## 14. Chain of Responsibility — Цепочка обязанностей

**Аналогия:** Конвейер — каждая станция выполняет свою операцию.

**Python:**

```python
from abc import ABC, abstractmethod
from typing import Optional

class Handler(ABC):
    def __init__(self):
        self._next: Optional[Handler] = None

    def set_next(self, handler: "Handler") -> "Handler":
        self._next = handler
        return handler

    def handle(self, request: dict) -> Optional[str]:
        if self._next:
            return self._next.handle(request)
        return None

class AuthHandler(Handler):
    def handle(self, request):
        if not request.get("token"):
            return "Ошибка: нет токена"
        print("Аутентификация: OK")
        return super().handle(request)

class RateLimitHandler(Handler):
    def __init__(self, limit=100):
        super().__init__()
        self.limit = limit
        self.calls = 0

    def handle(self, request):
        self.calls += 1
        if self.calls > self.limit:
            return "Ошибка: rate limit"
        print(f"Rate limit: {self.calls}/{self.limit}")
        return super().handle(request)

class ValidationHandler(Handler):
    def handle(self, request):
        if not request.get("data"):
            return "Ошибка: нет данных"
        print("Валидация: OK")
        return super().handle(request)

auth = AuthHandler()
rate = RateLimitHandler()
validation = ValidationHandler()
auth.set_next(rate).set_next(validation)

result = auth.handle({"token": "abc", "data": "hello"})
print(f"Результат: {result}")
```

---

## 15. Mediator — Посредник

**Аналогия:** Диспетчер аэропорта — координирует все рейсы.

**Python:**

```python
class ChatRoom:
    def __init__(self):
        self.users = {}

    def register(self, user):
        self.users[user.name] = user
        user.room = self

    def send(self, message, from_user):
        for name, user in self.users.items():
            if user != from_user:
                user.receive(message, from_user.name)

class User:
    def __init__(self, name):
        self.name = name
        self.room = None

    def send(self, message):
        self.room.send(message, self)

    def receive(self, message, from_name):
        print(f"[{self.name}] от {from_name}: {message}")

room = ChatRoom()
alice = User("Alice")
bob = User("Bob")
charlie = User("Charlie")

room.register(alice)
room.register(bob)
room.register(charlie)

alice.send("Всем привет!")
# [Bob] от Alice: Всем привет!
# [Charlie] от Alice: Всем привет!
```

---

## 16. Composite — Компоновщик

**Аналогия:** Файловая система — файлы и папки, папки содержат файлы и другие папки.

**Python:**

```python
from abc import ABC, abstractmethod

class Component(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def render(self, indent=0) -> str: ...

    @abstractmethod
    def size(self) -> int: ...

class File(Component):
    def __init__(self, name, size):
        super().__init__(name)
        self._size = size

    def render(self, indent=0):
        return "  " * indent + f"📄 {self.name} ({self._size}B)"

    def size(self):
        return self._size

class Directory(Component):
    def __init__(self, name):
        super().__init__(name)
        self.children = []

    def add(self, *components):
        self.children.extend(components)
        return self

    def render(self, indent=0):
        lines = ["  " * indent + f"📁 {self.name}/"]
        for child in self.children:
            lines.append(child.render(indent + 1))
        return "\n".join(lines)

    def size(self):
        return sum(c.size() for c in self.children)

root = Directory("root")
src = Directory("src")
src.add(File("main.py", 500), File("utils.py", 200))
root.add(src, File("README.md", 100))
print(root.render())
print(f"Общий размер: {root.size()}B")
```

---

## Шпаргалка по паттернам

| Паттерн | Категория | Аналогия | Когда использовать |
|---------|-----------|----------|-------------------|
| Singleton | Порождающий | Президент | Единственный экземпляр |
| Factory | Порождающий | Автомат | Создание без указания класса |
| Builder | Порождающий | Заказ в ресторане | Сложные объекты пошагово |
| Adapter | Структурный | Перехватное устройство | Несовместимые интерфейсы |
| Decorator | Стуктурный | Украшения | Добавление поведения |
| Proxy | Структурный | Секретарь | Контроль доступа |
| Observer | Поведенческий | Подписка | Уведомления |
| Strategy | Поведенческий | Навигатор | Выбор алгоритма |
| Command | Поведенческий | Пульт ТВ | Undo/Redo |
| Template | Поведенческий | Рецепт | Общий каркас |
| State | Поведенческий | Автомат | FSM |
| Iterator | Поведенческий | Пульт каналов | Обход коллекции |
| Facade | Структурный | Ресепшн | Упрощение API |
| Chain | Поведенческий | Конвейер | Цепочка обработки |
| Mediator | Поведенческий | Диспетчер | Координация объектов |
| Composite | Структурный | Файловая система | Дерево объектов |

**Принципы:**

1. **Программирование к интерфейсам**, а не к реализации
2. **Принцип открытости/закрытости** — расширяем, не модифицируем
3. **Принцип единственной ответственности** — одна задача
4. **Принцип подстановки Барбары Лисков** — наследование должно быть безопасным
5. **Принцип инверсии зависимостей** — зависимости от абстракций, не реализаций
