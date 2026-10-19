# Алгоритмы и структуры данных — Справочник

Реализации на Python, Go, JavaScript. Каждый алгоритм: описание, сложность, код.

---

## Big-O Нотация

Справочник временной и пространственной сложности.

| Алгоритм | Лучшее | Среднее | Худшее | Память |
|-----------|--------|---------|--------|--------|
| O(1) | O(1) | O(1) | O(1) | Константа |
| O(log n) | O(log n) | O(log n) | O(log n) | O(1) |
| O(n) | O(n) | O(n) | O(n) | O(1) |
| O(n log n) | O(n log n) | O(n log n) | O(n log n) | O(n) |
| O(n²) | O(n²) | O(n²) | O(n²) | O(1) |
| O(2ⁿ) | O(2ⁿ) | O(2ⁿ) | O(2ⁿ) | O(n) |
| O(n!) | O(n!) | O(n!) | O(n!) | O(n) |

**Как выбрать алгоритм:**

```
n < 10     → O(n!) допустимо (brute force)
n < 100    → O(n³) нормально
n < 1000   → O(n²) приемлемо
n < 1M     → O(n log n) нужно
n > 1M     → O(n) или O(log n) обязательно
```

---

## Сортировки

### 1. Bubble Sort — Пузырьковая сортировка

**Сложность:** O(n²) время, O(1) память  
**Стабильная:** Да  
**Когда использовать:** Обучение, маленькие массивы, почти отсортированные данные

```python
# Python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
```

```go
// Go
func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped {
            break
        }
    }
    return arr
}
```

```javascript
// JavaScript
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}
```

---

### 2. Selection Sort — Сортировка выбором

**Сложность:** O(n²) время, O(1) память  
**Стабильная:** Нет  
**Когда использовать:** Минимум перестановок, ограниченная память

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
```

```go
func selectionSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIdx] {
                minIdx = j
            }
        }
        arr[i], arr[minIdx] = arr[minIdx], arr[i]
    }
    return arr
}
```

```javascript
function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}
```

---

### 3. Insertion Sort — Сортировка вставками

**Сложность:** O(n²) время, O(1) память  
**Стабильная:** Да  
**Когда использовать:** Почти отсортированные данные, онлайн-алгоритм, маленькие массивы

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
```

```go
func insertionSort(arr []int) []int {
    for i := 1; i < len(arr); i++ {
        key := arr[i]
        j := i - 1
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
    return arr
}
```

```javascript
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}
```

---

### 4. Quick Sort — Быстрая сортировка

**Сложность:** O(n log n) среднее, O(n²) худшее, O(1) память  
**Стабильная:** Нет  
**Когда использовать:** Универсальный, быстрый на практике

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# In-place версия
def quick_sort_inplace(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort_inplace(arr, low, pi - 1)
        quick_sort_inplace(arr, pi + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

```go
func quickSort(arr []int, low, high int) {
    if low < high {
        pi := partition(arr, low, high)
        quickSort(arr, low, pi-1)
        quickSort(arr, pi+1, high)
    }
}

func partition(arr []int, low, high int) int {
    pivot := arr[high]
    i := low - 1
    for j := low; j < high; j++ {
        if arr[j] <= pivot {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1
}
```

```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}
```

---

### 5. Merge Sort — Сортировка слиянием

**Сложность:** O(n log n) все случаи, O(n) память  
**Стабильная:** Да  
**Когда использовать:** Стабильная сортировка, связные списки, внешняя сортировка

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

```go
func mergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    mid := len(arr) / 2
    left := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])
    return merge(left, right)
}

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i])
            i++
        } else {
            result = append(result, right[j])
            j++
        }
    }
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}
```

```javascript
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i), right.slice(j));
}
```

---

### 6. Heap Sort — Пирамидальная сортировка

**Сложность:** O(n log n) все случаи, O(1) память  
**Стабильная:** Нет  
**Когда использовать:** Гарантированная O(n log n), минимальная память

```python
def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr

def heapify(arr, n, i):
    largest = i
    l, r = 2 * i + 1, 2 * i + 2
    if l < n and arr[l] > arr[largest]:
        largest = l
    if r < n and arr[r] > arr[largest]:
        largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
```

```go
func heapSort(arr []int) []int {
    n := len(arr)
    for i := n/2 - 1; i >= 0; i-- {
        heapify(arr, n, i)
    }
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    }
    return arr
}

func heapify(arr []int, n, i int) {
    largest := i
    l, r := 2*i+1, 2*i+2
    if l < n && arr[l] > arr[largest] {
        largest = l
    }
    if r < n && arr[r] > arr[largest] {
        largest = r
    }
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
    }
}
```

```javascript
function heapSort(arr) {
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}
```

---

### 7. Counting Sort

**Сложность:** O(n + k) время, O(k) память, k — макс. значение  
**Стабильная:** Да  
**Когда использовать:** Целые числа в диапазоне, линейная сортировка

```python
def counting_sort(arr):
    if not arr:
        return arr
    max_val = max(arr)
    min_val = min(arr)
    range_val = max_val - min_val + 1
    count = [0] * range_val
    output = [0] * len(arr)

    for num in arr:
        count[num - min_val] += 1

    for i in range(1, len(count)):
        count[i] += count[i - 1]

    for num in reversed(arr):
        output[count[num - min_val] - 1] = num
        count[num - min_val] -= 1

    return output
```

---

## Поиск

### 1. Binary Search — Бинарный поиск

**Сложность:** O(log n) время, O(1) память  
**Условие:** Отсортированный массив

```python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

# Рекурсивный
def binary_search_recursive(arr, target, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, high)
    else:
        return binary_search_recursive(arr, target, low, mid - 1)
```

```go
func binarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid := (low + high) / 2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }
    return -1
}
```

```javascript
function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
```

---

### 2. Linear Search — Линейный поиск

**Сложность:** O(n) время, O(1) память  
**Когда использовать:** Неотсортированные данные, проверка существования

```python
def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1
```

---

## Графовые алгоритмы

### 1. BFS — Breadth-First Search (Поиск в ширину)

**Сложность:** O(V + E) время, O(V) память  
**Когда использовать:** Найти кратчайший путь в невзвешенном графе, проверка связности

```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    order = []

    while queue:
        vertex = queue.popleft()
        order.append(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

def bfs_shortest_path(graph, start, end):
    visited = {start}
    queue = deque([(start, [start])])
    while queue:
        vertex, path = queue.popleft()
        if vertex == end:
            return path
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None
```

```go
func bfs(graph map[int][]int, start int) []int {
    visited := make(map[int]bool)
    queue := []int{start}
    visited[start] = true
    var order []int

    for len(queue) > 0 {
        vertex := queue[0]
        queue = queue[1:]
        order = append(order, vertex)
        for _, neighbor := range graph[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
    return order
}
```

```javascript
function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    visited.add(start);
    const order = [];

    while (queue.length) {
        const vertex = queue.shift();
        order.push(vertex);
        for (const neighbor of graph[vertex]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return order;
}
```

---

### 2. DFS — Depth-First Search (Поиск в глубину)

**Сложность:** O(V + E) время, O(V) память  
**Когда использовать:** Проверка связности, топологическая сортировка, поиск циклов

```python
def dfs_recursive(graph, vertex, visited=None):
    if visited is None:
        visited = set()
    visited.add(vertex)
    order = [vertex]
    for neighbor in graph[vertex]:
        if neighbor not in visited:
            order.extend(dfs_recursive(graph, neighbor, visited))
    return order

def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    order = []
    while stack:
        vertex = stack.pop()
        if vertex not in visited:
            visited.add(vertex)
            order.append(vertex)
            stack.extend(reversed(graph[vertex]))
    return order
```

```go
func dfs(graph map[int][]int, start int) []int {
    visited := make(map[int]bool)
    var order []int

    var dfsVisit func(int)
    dfsVisit = func(v int) {
        visited[v] = true
        order = append(order, v)
        for _, neighbor := range graph[v] {
            if !visited[neighbor] {
                dfsVisit(neighbor)
            }
        }
    }
    dfsVisit(start)
    return order
}
```

```javascript
function dfs(graph, start) {
    const visited = new Set();
    const order = [];

    function visit(vertex) {
        visited.add(vertex);
        order.push(vertex);
        for (const neighbor of graph[vertex]) {
            if (!visited.has(neighbor)) visit(neighbor);
        }
    }
    visit(start);
    return order;
}
```

---

## Структуры данных

### 1. Динамический массив (ArrayList)

```python
class ArrayList:
    def __init__(self, capacity=10):
        self._data = [None] * capacity
        self._size = 0
        self._capacity = capacity

    def __len__(self):
        return self._size

    def __getitem__(self, index):
        if index < 0 or index >= self._size:
            raise IndexError("Index out of range")
        return self._data[index]

    def append(self, value):
        if self._size == self._capacity:
            self._resize(self._capacity * 2)
        self._data[self._size] = value
        self._size += 1

    def insert(self, index, value):
        if self._size == self._capacity:
            self._resize(self._capacity * 2)
        for i in range(self._size, index, -1):
            self._data[i] = self._data[i - 1]
        self._data[index] = value
        self._size += 1

    def remove(self, index):
        for i in range(index, self._size - 1):
            self._data[i] = self._data[i + 1]
        self._size -= 1
        if self._size < self._capacity // 4:
            self._resize(self._capacity // 2)

    def _resize(self, new_capacity):
        new_data = [None] * new_capacity
        for i in range(self._size):
            new_data[i] = self._data[i]
        self._data = new_data
        self._capacity = new_capacity
```

---

### 2. Связный список (Linked List)

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self._size = 0

    def __len__(self):
        return self._size

    def prepend(self, value):
        node = Node(value)
        node.next = self.head
        self.head = node
        self._size += 1

    def append(self, value):
        node = Node(value)
        if not self.head:
            self.head = node
        else:
            current = self.head
            while current.next:
                current = current.next
            current.next = node
        self._size += 1

    def delete(self, value):
        if not self.head:
            return
        if self.head.value == value:
            self.head = self.head.next
            self._size -= 1
            return
        current = self.head
        while current.next:
            if current.next.value == value:
                current.next = current.next.next
                self._size -= 1
                return
            current = current.next

    def find(self, value):
        current = self.head
        while current:
            if current.value == value:
                return current
            current = current.next
        return None

    def to_list(self):
        result = []
        current = self.head
        while current:
            result.append(current.value)
            current = current.next
        return result
```

---

### 3. Стек (Stack)

```python
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._items[-1]

    def is_empty(self):
        return len(self._items) == 0

    def __len__(self):
        return len(self._items)
```

---

### 4. Очередь (Queue)

```python
from collections import deque

class Queue:
    def __init__(self):
        self._items = deque()

    def enqueue(self, item):
        self._items.append(item)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self._items.popleft()

    def peek(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self._items[0]

    def is_empty(self):
        return len(self._items) == 0

    def __len__(self):
        return len(self._items)
```

---

### 5. Двоичное дерево поиска (BST)

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, value):
        self.root = self._insert(self.root, value)

    def _insert(self, node, value):
        if node is None:
            return TreeNode(value)
        if value < node.value:
            node.left = self._insert(node.left, value)
        elif value > node.value:
            node.right = self._insert(node.right, value)
        return node

    def search(self, value):
        return self._search(self.root, value)

    def _search(self, node, value):
        if node is None or node.value == value:
            return node
        if value < node.value:
            return self._search(node.left, value)
        return self._search(node.right, value)

    def inorder(self):
        result = []
        self._inorder(self.root, result)
        return result

    def _inorder(self, node, result):
        if node:
            self._inorder(node.left, result)
            result.append(node.value)
            self._inorder(node.right, result)

    def delete(self, value):
        self.root = self._delete(self.root, value)

    def _delete(self, node, value):
        if node is None:
            return node
        if value < node.value:
            node.left = self._delete(node.left, value)
        elif value > node.value:
            node.right = self._delete(node.right, value)
        else:
            if node.left is None:
                return node.right
            if node.right is None:
                return node.left
            min_node = self._find_min(node.right)
            node.value = min_node.value
            node.right = self._delete(node.right, min_node.value)
        return node

    def _find_min(self, node):
        while node.left:
            node = node.left
        return node
```

---

### 6. Хеш-таблица (Hash Map)

```python
class HashMap:
    def __init__(self, capacity=16, load_factor=0.75):
        self._capacity = capacity
        self._load_factor = load_factor
        self._size = 0
        self._buckets = [[] for _ in range(capacity)]

    def _hash(self, key):
        return hash(key) % self._capacity

    def put(self, key, value):
        if self._size / self._capacity > self._load_factor:
            self._resize()
        idx = self._hash(key)
        bucket = self._buckets[idx]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        self._size += 1

    def get(self, key):
        idx = self._hash(key)
        for k, v in self._buckets[idx]:
            if k == key:
                return v
        raise KeyError(key)

    def delete(self, key):
        idx = self._hash(key)
        bucket = self._buckets[idx]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self._size -= 1
                return
        raise KeyError(key)

    def contains(self, key):
        idx = self._hash(key)
        return any(k == key for k, _ in self._buckets[idx])

    def _resize(self):
        old_buckets = self._buckets
        self._capacity *= 2
        self._buckets = [[] for _ in range(self._capacity)]
        self._size = 0
        for bucket in old_buckets:
            for key, value in bucket:
                self.put(key, value)

    def keys(self):
        return [k for bucket in self._buckets for k, _ in bucket]

    def values(self):
        return [v for bucket in self._buckets for _, v in bucket]

    def __len__(self):
        return self._size
```

---

### 7. Куча (Min-Heap)

```python
class MinHeap:
    def __init__(self):
        self._data = []

    def push(self, value):
        self._data.append(value)
        self._bubble_up(len(self._data) - 1)

    def pop(self):
        if not self._data:
            raise IndexError("Heap is empty")
        min_val = self._data[0]
        last = self._data.pop()
        if self._data:
            self._data[0] = last
            self._sink_down(0)
        return min_val

    def peek(self):
        if not self._data:
            raise IndexError("Heap is empty")
        return self._data[0]

    def _bubble_up(self, idx):
        while idx > 0:
            parent = (idx - 1) // 2
            if self._data[idx] < self._data[parent]:
                self._data[idx], self._data[parent] = self._data[parent], self._data[idx]
                idx = parent
            else:
                break

    def _sink_down(self, idx):
        n = len(self._data)
        while True:
            smallest = idx
            left = 2 * idx + 1
            right = 2 * idx + 2
            if left < n and self._data[left] < self._data[smallest]:
                smallest = left
            if right < n and self._data[right] < self._data[smallest]:
                smallest = right
            if smallest == idx:
                break
            self._data[idx], self._data[smallest] = self._data[smallest], self._data[idx]
            idx = smallest

    def __len__(self):
        return len(self._data)
```

---

### 8. Три (Trie)

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end

    def starts_with(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True

    def autocomplete(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        results = []
        self._collect(node, prefix, results)
        return results

    def _collect(self, node, prefix, results):
        if node.is_end:
            results.append(prefix)
        for char, child in node.children.items():
            self._collect(child, prefix + char, results)
```

---

## Алгоритмы на графах

### Топологическая сортировка (Kahn's Algorithm)

```python
from collections import deque

def topological_sort_kahn(graph):
    in_degree = {v: 0 for v in graph}
    for v in graph:
        for neighbor in graph[v]:
            in_degree[neighbor] = in_degree.get(neighbor, 0) + 1

    queue = deque([v for v in in_degree if in_degree[v] == 0])
    result = []

    while queue:
        vertex = queue.popleft()
        result.append(vertex)
        for neighbor in graph.get(vertex, []):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(result) != len(in_degree):
        raise ValueError("Graph has a cycle")
    return result
```

### Dijkstra — Кратчайший путь

```python
import heapq

def dijkstra(graph, start):
    distances = {v: float("inf") for v in graph}
    distances[start] = 0
    previous = {v: None for v in graph}
    pq = [(0, start)]

    while pq:
        dist, vertex = heapq.heappop(pq)
        if dist > distances[vertex]:
            continue
        for neighbor, weight in graph[vertex]:
            new_dist = dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = vertex
                heapq.heappush(pq, (new_dist, neighbor))

    return distances, previous

def get_path(previous, end):
    path = []
    current = end
    while current is not None:
        path.append(current)
        current = previous[current]
    return path[::-1]
```

---

## Сравнение сортировок

| Алгоритм | Лучшее | Среднее | Худшее | Память | Стабильная |
|-----------|--------|---------|--------|--------|------------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Да |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | Нет |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Да |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | Нет |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Да |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | Нет |
| Counting | O(n + k) | O(n + k) | O(n + k) | O(k) | Да |

**Выбор сортировки:**

- **Маленькие данные (<50):** Insertion sort
- **Универсальный:** Quick sort (средний случай)
- **Стабильная:** Merge sort
- **Ограничена память:** Heap sort
- **Целые числа:** Counting/Radix sort
- **Почти отсортированные:** Insertion sort или Timsort (Python/JS встроенный)
