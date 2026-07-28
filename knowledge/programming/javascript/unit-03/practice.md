# JavaScript — Unit 3: Проекты

## Проект 1: Memoize

```javascript
function memoize(fn) {
    const cache = new Map()
    return function(...args) {
        const key = JSON.stringify(args)
        if (cache.has(key)) {
            console.log("из кэша")
            return cache.get(key)
        }
        const result = fn(...args)
        cache.set(key, result)
        console.log("вычислено")
        return result
    }
}

const slowFib = n => n < 2 ? n : slowFib(n-1) + slowFib(n-2)
const fastFib = memoize(n => n < 2 ? n : fastFib(n-1) + fastFib(n-2))

console.time("slow"); console.log(slowFib(40)); console.timeEnd("slow")
console.time("fast"); console.log(fastFib(40)); console.timeEnd("fast")
```

## Проект 2: Observable

```javascript
class Observable {
    constructor() {
        this.subscribers = new Set()
    }
    subscribe(fn) {
        this.subscribers.add(fn)
        return () => this.subscribers.delete(fn)
    }
    notify(data) {
        this.subscribers.forEach(fn => fn(data))
    }
}

// Usage
const store = new Observable()
const unsubscribe = store.subscribe(data => {
    console.log("Получено:", data)
})

store.notify("hello")  // Получено: hello
store.notify({x: 42})  // Получено: {x: 42}
unsubscribe()
store.notify("никто не получит")  // тишина
```

## Проект 3: Debounce + Throttle

```javascript
function debounce(fn, delay = 300) {
    let timer
    return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(() => fn.apply(this, args), delay)
    }
}

function throttle(fn, limit = 300) {
    let inThrottle = false
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

// Пример: поиск
const searchInput = document.getElementById("search")
searchInput.addEventListener("input", debounce(async (e) => {
    const results = await fetch(`/api/search?q=${e.target.value}`)
    console.log(await results.json())
}, 500))
```

## Ответы

1. См. проект Memoize
2. `class Observable { constructor() { this.subs = new Set() } subscribe(fn) { this.subs.add(fn); return () => this.subs.delete(fn) } notify(d) { this.subs.forEach(fn => fn(d)) } }`
3. См. код ниже
4. См. debounce выше
