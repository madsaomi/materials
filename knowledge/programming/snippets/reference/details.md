# Code Snippets — Микро-детали и расширенные решения

## 1. Python — продвинутые сниппеты

### 1.1 Асинхронный LIFO-пул соединений

```python
import asyncio
from typing import Optional

class AsyncConnectionPool:
    def __init__(self, factory, max_size=10):
        self._factory = factory
        self._max_size = max_size
        self._pool = []
        self._size = 0
        self._waiters = []
    
    async def acquire(self) -> object:
        if self._pool:
            return self._pool.pop()
        
        if self._size < self._max_size:
            conn = await self._factory()
            self._size += 1
            return conn
        
        fut = asyncio.get_event_loop().create_future()
        self._waiters.append(fut)
        return await fut
    
    async def release(self, conn):
        if self._waiters:
            waiter = self._waiters.pop(0)
            waiter.set_result(conn)
        else:
            self._pool.append(conn)
```

### 1.2 Трансформер для пайплайна данных

```python
from typing import Any, Callable, Iterable, TypeVar

T = TypeVar('T')
U = TypeVar('U')

class Pipeline:
    def __init__(self, source: Iterable):
        self._source = iter(source)
        self._stages = []
    
    def map(self, fn: Callable[[Any], Any]) -> 'Pipeline':
        self._stages.append(('map', fn))
        return self
    
    def filter(self, fn: Callable[[Any], bool]) -> 'Pipeline':
        self._stages.append(('filter', fn))
        return self
    
    def take(self, n: int) -> 'Pipeline':
        self._stages.append(('take', n))
        return self
    
    def collect(self) -> list:
        result = []
        count = 0
        for item in self._source:
            ok = True
            for stage_type, stage_fn in self._stages:
                if stage_type == 'filter' and not stage_fn(item):
                    ok = False
                    break
                elif stage_type == 'map':
                    item = stage_fn(item)
                elif stage_type == 'take':
                    if count >= stage_fn:
                        return result
            if ok:
                result.append(item)
                count += 1
        return result

# Usage:
result = (
    Pipeline(range(100))
    .filter(lambda x: x % 2 == 0)
    .map(lambda x: x * 10)
    .take(5)
    .collect()
)  # [0, 20, 40, 60, 80]
```

---

## 2. Go — продвинутые сниппеты

### 2.1 Чан-генератор с отменой

```go
package main

import "context"

func IntGen(ctx context.Context, numbers ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range numbers {
            select {
            case out <- n:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}

func Square(ctx context.Context, in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            select {
            case out <- n * n:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}

func main() {
    ctx := context.Background()
    nums := IntGen(ctx, 1, 2, 3, 4, 5)
    squares := Square(ctx, nums)
    for s := range squares {
        println(s)
    }
}
```

### 2.2 WaitGroup с таймаутом

```go
package main

import (
    "context"
    "sync"
    "time"
)

type WaitGroupWithTimeout struct {
    sync.WaitGroup
}

func (wg *WaitGroupWithTimeout) WaitWithTimeout(d time.Duration) bool {
    c := make(chan struct{})
    go func() {
        defer close(c)
        wg.Wait()
    }()
    select {
    case <-c:
        return false // normal completion
    case <-time.After(d):
        return true // timeout
    }
}
```

### 2.3 Fan-out, Fan-in паттерн

```go
func FanOut(in <-chan int, n int) []<-chan int {
    outs := make([]<-chan int, n)
    for i := 0; i < n; i++ {
        out := make(chan int)
        go func() {
            defer close(out)
            for v := range in {
                out <- v
            }
        }()
        outs[i] = out
    }
    return outs
}

func FanIn(chs ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for _, ch := range chs {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }
    go func() {
        wg.Wait()
        close(out)
    }()
    return out
}
```

---

## 3. JavaScript — продвинутые сниппеты

### 3.1 state machine

```javascript
class FiniteStateMachine {
    constructor(initial, transitions) {
        this.state = initial
        this.transitions = transitions
        this.listeners = new Map()
    }
    
    transition(action) {
        const currentTransitions = this.transitions[this.state]
        if (!currentTransitions) return false
        
        const nextState = currentTransitions[action]
        if (!nextState) return false
        
        const prevState = this.state
        this.state = nextState
        this.emit('transition', { from: prevState, to: nextState, action })
        this.emit(`enter:${nextState}`, { from: prevState, action })
        this.emit(`leave:${prevState}`, { to: nextState, action })
        return true
    }
    
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event).add(handler)
        return () => this.listeners.get(event).delete(handler)
    }
    
    emit(event, data) {
        this.listeners.get(event)?.forEach(h => h(data))
    }
}

// Usage:
const fsm = new FiniteStateMachine('idle', {
    idle: { start: 'running' },
    running: { pause: 'paused', stop: 'idle' },
    paused: { resume: 'running', stop: 'idle' }
})

fsm.on('transition', ({ from, to }) => console.log(`${from} → ${to}`))
fsm.transition('start')  // idle → running
fsm.transition('pause')  // running → paused
```

### 3.2 Async Batch Processor

```javascript
async function asyncBatchProcessor(items, batchSize, concurrency) {
    const results = []
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const batchResults = await Promise.all(
            Array.from({ length: concurrency }, async () => {
                while (batch.length > 0) {
                    const item = batch.shift()
                    return await process(item)
                }
            })
        )
        results.push(...batchResults.flat())
    }
    return results
}

// Usage:
async function process(items) {
    return asyncBatchProcessor(items, 10, 3)
}
```

### 3.3 Dependency Injection контейнер

```javascript
class Container {
    constructor() {
        this.services = new Map()
        this.instances = new Map()
        this.factories = new Map()
    }
    
    register(name, definition, { singleton = true } = {}) {
        if (typeof definition === 'function') {
            if (singleton) {
                this.services.set(name, definition)
            } else {
                this.factories.set(name, definition)
            }
        } else {
            this.instances.set(name, definition)
        }
    }
    
    resolve(name) {
        if (this.instances.has(name)) {
            return this.instances.get(name)
        }
        if (this.services.has(name)) {
            const instance = this.services.get(name)(this)
            this.instances.set(name, instance)
            return instance
        }
        if (this.factories.has(name)) {
            return this.factories.get(name)(this)
        }
        throw new Error(`Service ${name} not found`)
    }
}

// Usage:
const container = new Container()
container.register('db', () => new Database(container.resolve('config')))
container.register('config', { host: 'localhost', port: 5432 })
container.register('userService', (c) => new UserService(c.resolve('db')))
```

---

## 4. Алгоритмические сниппеты

### 4.1 QuickSort (Python)

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
```

### 4.2 Binary Search (Go)

```go
func BinarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid := low + (high-low)/2
        if arr[mid] == target {
            return mid
        }
        if arr[mid] < target {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    return -1
}
```

### 4.3 Ленивая последовательность Фибоначчи (JS)

```javascript
function* fibonacci() {
    let a = 0n, b = 1n
    while (true) {
        yield a
        [a, b] = [b, a + b]
    }
}

const fib = fibonacci()
Array.from({ length: 100 }, () => fib.next().value)
// 0, 1, 1, 2, 3, 5, 8, 13... (100 чисел БигИнт)
```

---

## 5. CLI утилиты

### 5.1 Progress Bar (Python)

```python
import sys
import shutil

class Progress:
    def __init__(self, total, prefix='', width=None):
        self.total = total
        self.prefix = prefix
        self.width = width or shutil.get_terminal_size().columns - 20
    
    def update(self, current):
        filled = int(self.width * current // self.total)
        bar = '█' * filled + '░' * (self.width - filled)
        pct = current / self.total * 100
        sys.stdout.write(f'\r{self.prefix} |{bar}| {pct:.1f}%')
        sys.stdout.flush()
        if current == self.total:
            sys.stdout.write('\n')
```

### 5.2 Colored Output (Go)

```go
package main

import "fmt"

const (
    Reset   = "\033[0m"
    Red     = "\033[31m"
    Green   = "\033[32m"
    Yellow  = "\033[33m"
    Blue    = "\033[34m"
    Purple  = "\033[35m"
    Cyan    = "\033[36m"
    White   = "\033[37m"
    Bold    = "\033[1m"
)

func Color(text, color string) string {
    return color + text + Reset
}

func main() {
    fmt.Println(Color("Error!", Red))
    fmt.Println(Color("Success!", Green))
    fmt.Println(Color("Warning!", Yellow))
    fmt.Println(Bold + "Bold text" + Reset)
}
```

---

*Микро-детали кода. Дополняется.*
