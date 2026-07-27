# Code Snippets — Полезные сниппеты

Реальные примеры кода, которые можно скопировать и использовать.

---

## 1. Python

### 1.1 Декоратор таймера

```python
import time
import functools

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end-start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
```

### 1.2 Кеш с TTL

```python
import time
from functools import wraps

def ttl_cache(seconds: int):
    def decorator(func):
        cache = {}
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(kwargs.items()))
            if key in cache:
                value, timestamp = cache[key]
                if time.time() - timestamp < seconds:
                    return value
            result = func(*args, **kwargs)
            cache[key] = (result, time.time())
            return result
        return wrapper
    return decorator

@ttl_cache(30)
def get_expiry_data():
    return expensive_query()
```

### 1.3 Singleton (thread-safe)

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
```

### 1.4 LRU Cache (с нуля)

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.capacity = capacity
    
    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    
    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
```

### 1.5 Async Rate Limiter

```python
import asyncio
from collections import deque
import time

class RateLimiter:
    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self.calls = deque()
    
    async def acquire(self):
        now = time.monotonic()
        while self.calls:
            if now - self.calls[0] > self.period:
                self.calls.popleft()
            else:
                break
        if len(self.calls) >= self.max_calls:
            wait = self.period - (now - self.calls[0])
            await asyncio.sleep(wait)
        self.calls.append(time.monotonic())
```

### 1.6 FastAPI with async DB

```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import models, schemas

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

app = FastAPI()

async def get_db():
    async with async_session() as session:
        yield session

@app.get("/items/{item_id}")
async def read_item(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.get(models.Item, item_id)
    if not result:
        raise HTTPException(status_code=404)
    return result
```

---

## 2. Go

### 2.1 Graceful Shutdown

```go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    srv := &http.Server{Addr: ":8080"}
    
    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatal(err)
        }
    }()
    
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit
    
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal(err)
    }
}
```

### 2.2 Concurrent Worker Pool

```go
package main

import (
    "fmt"
    "sync"
)

type Pool struct {
    jobs    chan func()
    wg      sync.WaitGroup
}

func NewPool(size int) *Pool {
    p := &Pool{jobs: make(chan func(), 100)}
    for i := 0; i < size; i++ {
        go func(id int) {
            for job := range p.jobs {
                fmt.Printf("worker %d running\n", id)
                job()
            }
        }(i)
    }
    return p
}

func (p *Pool) Add(job func()) {
    p.wg.Add(1)
    p.jobs <- func() {
        defer p.wg.Done()
        job()
    }
}

func (p *Pool) Wait() {
    close(p.jobs)
    p.wg.Wait()
}

// Usage
func main() {
    pool := NewPool(5)
    for i := 0; i < 20; i++ {
        i := i
        pool.Add(func() {
            fmt.Println("job", i)
        })
    }
    pool.Wait()
}
```

### 2.3 Generic Stack

```go
package stack

type Stack[T any] struct {
    items []T
}

func New[T any]() *Stack[T] {
    return &Stack[T]{}
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}

func (s *Stack[T]) Peek() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    return s.items[len(s.items)-1], true
}

func (s *Stack[T]) IsEmpty() bool {
    return len(s.items) == 0
}
```

### 2.4 HTTP Client with Retry

```go
package main

import (
    "fmt"
    "net/http"
    "time"
    "math/rand"
)

type Client struct {
    client  *http.Client
    retries int
    backoff time.Duration
}

func NewClient(retries int, backoff time.Duration) *Client {
    return &Client{
        client:  &http.Client{Timeout: 10 * time.Second},
        retries: retries,
        backoff: backoff,
    }
}

func (c *Client) Get(url string) (*http.Response, error) {
    var resp *http.Response
    var err error
    
    for i := 0; i <= c.retries; i++ {
        resp, err = c.client.Get(url)
        if err == nil && resp.StatusCode < 500 {
            return resp, nil
        }
        if resp != nil {
            resp.Body.Close()
        }
        
        if i < c.retries {
            jitter := time.Duration(rand.Int63n(int64(c.backoff)))
            time.Sleep(c.backoff + jitter)
            c.backoff *= 2
        }
    }
    return nil, fmt.Errorf("request failed after %d retries: %w", c.retries, err)
}
```

### 2.5 Middleware Chain

```go
package main

import "net/http"

type Middleware func(http.Handler) http.Handler

func Chain(h http.Handler, middlewares ...Middleware) http.Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        h = middlewares[i](h)
    }
    return h
}

func Logger(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        println(r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
    })
}

func Auth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Header.Get("Authorization") == "" {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
        next.ServeHTTP(w, r)
    })
}

func main() {
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("hello"))
    })
    
    http.Handle("/", Chain(handler, Logger, Auth))
    http.ListenAndServe(":8080", nil)
}
```

---

## 3. JavaScript

### 3.1 Deep Clone

```javascript
function deepClone(obj, seen = new WeakMap()) {
    if (obj === null || typeof obj !== 'object') return obj
    if (seen.has(obj)) return seen.get(obj)
    
    if (obj instanceof Date) return new Date(obj)
    if (obj instanceof RegExp) return new RegExp(obj)
    if (obj instanceof Map) {
        const clone = new Map()
        seen.set(obj, clone)
        obj.forEach((v, k) => clone.set(k, deepClone(v, seen)))
        return clone
    }
    if (obj instanceof Set) {
        const clone = new Set()
        seen.set(obj, clone)
        obj.forEach(v => clone.add(deepClone(v, seen)))
        return clone
    }
    
    const clone = Array.isArray(obj) ? [] : {}
    seen.set(obj, clone)
    
    for (const key of Object.keys(obj)) {
        clone[key] = deepClone(obj[key], seen)
    }
    for (const sym of Object.getOwnPropertySymbols(obj)) {
        clone[sym] = deepClone(obj[sym], seen)
    }
    
    return clone
}
```

### 3.2 Custom Event Emitter

```javascript
class EventEmitter {
    constructor() {
        this.events = new Map()
    }
    
    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set())
        }
        this.events.get(event).add(listener)
        return () => this.off(event, listener)
    }
    
    off(event, listener) {
        this.events.get(event)?.delete(listener)
    }
    
    emit(event, ...args) {
        this.events.get(event)?.forEach(listener => {
            try {
                listener(...args)
            } catch (err) {
                console.error('listener error:', err)
            }
        })
    }
    
    once(event, listener) {
        const wrapper = (...args) => {
            this.off(event, wrapper)
            listener(...args)
        }
        return this.on(event, wrapper)
    }
    
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event)
        } else {
            this.events.clear()
        }
    }
}
```

### 3.3 Pipe / Compose

```javascript
// Pipe (слева направо)
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x)

// Compose (справа налево)
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x)

// Usage
const double = x => x * 2
const increment = x => x + 1
const toString = x => String(x)

const processNumber = pipe(double, increment, toString)
processNumber(5) // "11"

const processNumber2 = compose(toString, increment, double)
processNumber2(5) // "11"
```

### 3.4 Observer Pattern (замыкания)

```javascript
function createObservable(initialValue) {
    let value = initialValue
    const observers = new Set()
    
    return {
        get value() {
            return value
        },
        set value(newValue) {
            if (newValue !== value) {
                value = newValue
                observers.forEach(fn => fn(value))
            }
        },
        subscribe(fn) {
            observers.add(fn)
            return () => observers.delete(fn)
        }
    }
}

// Usage
const state = createObservable(0)
const unsub = state.subscribe(v => console.log('changed:', v))
state.value = 1  // "changed: 1"
state.value = 2  // "changed: 2"
unsub()
```

### 3.5 Promise Pool (ограничение конкурентности)

```javascript
async function promisePool(tasks, concurrency) {
    const results = []
    const executing = new Set()
    
    for (const [index, task] of tasks.entries()) {
        const p = Promise.resolve().then(() => task())
        results[index] = p
        executing.add(p)
        
        const clean = () => executing.delete(p)
        p.then(clean, clean)
        
        if (executing.size >= concurrency) {
            await Promise.race(executing)
        }
    }
    
    return Promise.all(results)
}

// Usage
const tasks = Array.from({ length: 10 }, (_, i) => 
    () => fetch(`https://api.example.com/item/${i}`)
)
const results = await promisePool(tasks, 3)
```

### 3.6 React Custom Hook: useLocalStorage

```javascript
import { useState, useCallback } from 'react'

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch {
            return initialValue
        }
    })
    
    const setValue = useCallback((value) => {
        const valueToStore = value instanceof Function 
            ? value(storedValue) 
            : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
    }, [key, storedValue])
    
    return [storedValue, setValue]
}
```

---

## 4. Утилиты

### 4.1 Rate Limiter (общий)

```python
# Python (декоратор)
import time
from functools import wraps

def rate_limit(max_per_second):
    min_interval = 1.0 / max_per_second
    def decorator(func):
        last_called = [0.0]
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            if elapsed < min_interval:
                time.sleep(min_interval - elapsed)
            last_called[0] = time.time()
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

### 4.2 Retry with Backoff

```python
# Python
import time
import random
from functools import wraps

def retry(max_retries=3, base_delay=1, backoff=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        delay = base_delay * (backoff ** attempt)
                        delay += random.uniform(0, delay * 0.1)
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator
```

### 4.3 Throttle

```javascript
// JavaScript
function throttle(fn, limit) {
    let inThrottle = false
    let lastArgs = null
    let lastThis = null
    
    return function(...args) {
        if (inThrottle) {
            lastArgs = args
            lastThis = this
            return
        }
        
        fn.apply(this, args)
        inThrottle = true
        
        setTimeout(() => {
            inThrottle = false
            if (lastArgs) {
                fn.apply(lastThis, lastArgs)
                lastArgs = lastThis = null
            }
        }, limit)
    }
}
```

### 4.4 Debounce

```javascript
function debounce(fn, delay) {
    let timer = null
    
    return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(() => fn.apply(this, args), delay)
    }
}
```

---

## 5. Команды CLI

### 5.1 Docker

```bash
# Clean all stopped containers and unused images
docker system prune -a --volumes

# Run postgres
docker run -d --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:16

# Run redis
docker run -d --name redis -p 6379:6379 redis:7

# Build multi-stage
docker build -t myapp:latest --target production .
```

### 5.2 Git

```bash
# Amend last commit (don't push if rebased)
git commit --amend --no-edit

# Split a commit
git reset HEAD~  # files unstaged, changes kept
git add -p       # stage parts
git commit -m "part 1"
git add -p       # rest
git commit -m "part 2"

# Interactive rebase
git rebase -i HEAD~5

# Stash with message
git stash push -m "wip: refactoring"
git stash list
git stash pop stash@{1}
```

### 5.3 Linux

```bash
# Find largest files
du -ah / | sort -rh | head -20

# Monitor logs
tail -f /var/log/syslog | grep ERROR

# Process by port
lsof -i :8080

# Disk usage by directory
ncdu /

# Watch command every second
watch -n 1 "ps aux | sort -nrk 3 | head"
```

---

*Раздел будет пополняться по мере накопления полезных сниппетов.*
