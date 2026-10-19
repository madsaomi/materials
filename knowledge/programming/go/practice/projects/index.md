# Go — Проекты

10 проектов на Go: от простого HTTP-сервера до микросервиса с goroutines. Каждый — с рабочим кодом и структурой.

---

## Проект 1: Простой HTTP-сервер

**Уровень:** Начинающий  
**Стек:** net/http, html/template  
**Время:** 2-3 часа

### Описание

Минимальный веб-сервер с шаблонами HTML, статическими файлами и маршрутами.

### Структура

```
simple-server/
├── main.go
├── go.mod
├── templates/
│   ├── index.html
│   └── about.html
└── static/
    └── style.css
```

### Ключевой код

```go
package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"time"
)

type PageData struct {
	Title   string
	Message string
	Items   []string
}

var templates = template.Must(template.ParseGlob("templates/*.html"))

func renderTemplate(w http.ResponseWriter, tmpl string, data PageData) {
	err := templates.ExecuteTemplate(w, tmpl+".html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	data := PageData{
		Title:   "Главная",
		Message: "Добро пожаловать на Go-сервер!",
		Items:   []string{"Go", "HTTP", "Templates", "Static files"},
	}
	renderTemplate(w, "index", data)
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
	data := PageData{
		Title:   "О проекте",
		Message: "Простой HTTP-сервер на Go",
	}
	renderTemplate(w, "about", data)
}

func loggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next(w, r)
		log.Printf("%s %s %s %v", r.Method, r.URL.Path, r.RemoteAddr, time.Since(start))
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func main() {
	http.HandleFunc("/", loggingMiddleware(indexHandler))
	http.HandleFunc("/about", loggingMiddleware(aboutHandler))

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	fmt.Println("Сервер запущен на http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### Шаблон templates/index.html

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>{{.Title}}</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <h1>{{.Title}}</h1>
    <p>{{.Message}}</p>
    <ul>
        {{range .Items}}
        <li>{{.}}</li>
        {{end}}
    </ul>
</body>
</html>
```

### Запуск

```bash
go mod init simple-server
go run main.go
# http://localhost:8080
```

### Следующие шаги

- chi или gorilla/mux для маршрутизации
- Middleware для аутентификации
- WebSocket для real-time
- Graceful shutdown

---

## Проект 2: CLI-утилита (grep/replace)

**Уровень:** Начинающий-Средний  
**Стек:** flag, os, regexp, io  
**Время:** 3-4 часа

### Описание

Клон grep: поиск по файлам с регулярными выражениями, подсветка совпадений, рекурсивный обход.

### Структура

```
gogrep/
├── main.go
├── search/
│   ├── search.go
│   └── search_test.go
├── go.mod
└── go.sum
```

### Ключевой код

```go
// search/search.go
package search

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

type Result struct {
	File    string
	LineNum int
	Line    string
	Match   string
}

type Options struct {
	Pattern     string
	Regex       bool
	IgnoreCase  bool
	MaxResults  int
	ShowLineNum bool
	ColorOutput bool
}

func SearchFile(path string, opts Options) ([]Result, error) {
	re, err := compilePattern(opts.Pattern, opts.Regex, opts.IgnoreCase)
	if err != nil {
		return nil, fmt.Errorf("невалидный паттерн: %w", err)
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var results []Result
	scanner := bufio.NewScanner(file)
	lineNum := 0

	for scanner.Scan() {
		lineNum++
		line := scanner.Text()
		match := re.FindString(line)
		if match != "" {
			results = append(results, Result{
				File:    path,
				LineNum: lineNum,
				Line:    line,
				Match:   match,
			})
			if opts.MaxResults > 0 && len(results) >= opts.MaxResults {
				return results, nil
			}
		}
	}
	return results, scanner.Err()
}

func SearchDir(dir string, opts Options) ([]Result, error) {
	var allResults []Result
	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			if info != nil && info.Name() == ".git" {
				return filepath.SkipDir
			}
			return nil
		}
		results, err := SearchFile(path, opts)
		if err == nil {
			allResults = append(allResults, results...)
		}
		return nil
	})
	return allResults, err
}

func compilePattern(pattern string, useRegex, ignoreCase bool) (*regexp.Regexp, error) {
	flags := ""
	if ignoreCase {
		flags = "(?i)"
	}
	if useRegex {
		return regexp.Compile(flags + pattern)
	}
	return regexp.Compile(flags + regexp.QuoteMeta(pattern))
}

func FormatResult(r Result, color bool) string {
	if color {
		return fmt.Sprintf(
			"\033[36m%s\033[0m:\033[33m%d\033[0m: %s",
			r.File, r.LineNum, highlightMatch(r.Line, r.Match, color),
		)
	}
	return fmt.Sprintf("%s:%d: %s", r.File, r.LineNum, r.Line)
}

func highlightMatch(line, match string, color bool) string {
	if !color {
		return line
	}
	colored := fmt.Sprintf("\033[31;1m%s\033[0m", match)
	return strings.Replace(line, match, colored, 1)
}
```

```go
// main.go
package main

import (
	"flag"
	"fmt"
	"os"
	"gogrep/search"
)

func main() {
	opts := search.Options{}
	flag.StringVar(&opts.Pattern, "pattern", "", "Шаблон поиска")
	flag.BoolVar(&opts.Regex, "regex", false, "Регулярные выражения")
	flag.BoolVar(&opts.IgnoreCase, "ignore-case", false, "Без учёта регистра")
	flag.IntVar(&opts.MaxResults, "max", 0, "Максимум результатов")
	flag.BoolVar(&opts.ColorOutput, "color", true, "Цветной вывод")
	flag.Parse()

	if opts.Pattern == "" {
		fmt.Fprintln(os.Stderr, "Использование: gogrep -pattern <шаблон> [файл/директория]")
		os.Exit(1)
	}

	target := "."
	if flag.NArg() > 0 {
		target = flag.Arg(0)
	}

	results, err := search.SearchDir(target, opts)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Ошибка: %v\n", err)
		os.Exit(1)
	}

	for _, r := range results {
		fmt.Println(search.FormatResult(r, opts.ColorOutput))
	}
	fmt.Fprintf(os.Stderr, "\nНайдено совпадений: %d\n", len(results))
}
```

### Следующие шаги

- Флаг `-c` для подсчёта совпадений
- Флаг `-l` для вывода только имён файлов
- Поддержка бинарных файлов
- Пакетная замена (clone sed)

---

## Проект 3: Чат-сервер (goroutines + channels)

**Уровень:** Средний  
**Стек:** net, sync, goroutines, channels  
**Время:** 5-7 часов

### Описание

TCP чат-сервер с поддержкой множества пользователей. Каждое соединение — отдельная goroutine. Бродкаст через channel.

### Структура

```
chat-server/
├── main.go
├── client/
│   └── client.go
├── hub/
│   └── hub.go
└── go.mod
```

### Ключевой код

```go
// hub/hub.go
package hub

import (
	"log"
	"sync"
)

type Message struct {
	Sender  string
	Content string
	Type    string
}

type Client struct {
	Hub    *Hub
	Name   string
	SendCh chan Message
	connCh chan Message
	quit   chan struct{}
}

type Hub struct {
	clients    map[*Client]struct{}
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]struct{}),
		broadcast:  make(chan Message, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = struct{}{}
			h.mu.Unlock()
			h.broadcast <- Message{
				Type:    "system",
				Content: client.Name + " присоединился к чату",
			}
			log.Printf("[+] %s подключился (всего: %d)", client.Name, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.SendCh)
			}
			h.mu.Unlock()
			h.broadcast <- Message{
				Type:    "system",
				Content: client.Name + " покинул чат",
			}

		case msg := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.SendCh <- msg:
				default:
					close(client.SendCh)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Broadcast(msg Message) { h.broadcast <- msg }
func (h *Hub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
func (h *Hub) Register(c *Client)   { h.register <- c }
func (h *Hub) Unregister(c *Client) { h.unregister <- c }
```

```go
// client/client.go
package client

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"strings"
	"time"

	"chat-server/hub"
)

type Client struct {
	hub    *hub.Hub
	name   string
	conn   net.Conn
	sendCh chan hub.Message
	quit   chan struct{}
}

func NewClient(conn net.Conn, h *hub.Hub) *Client {
	return &Client{
		hub:    h,
		conn:   conn,
		sendCh: make(chan hub.Message, 256),
		quit:   make(chan struct{}),
	}
}

func (c *Client) Handle() {
	defer c.Close()
	c.Write([]byte("Введите ваше имя: "))
	scanner := bufio.NewScanner(c.conn)
	if scanner.Scan() {
		c.name = strings.TrimSpace(scanner.Text())
		if c.name == "" {
			c.name = fmt.Sprintf("User_%d", time.Now().UnixNano()%10000)
		}
	} else {
		return
	}

	c.hub.Register(c)
	c.Write([]byte(fmt.Sprintf("Добро пожаловать, %s!\n", c.name)))
	go c.readLoop()
	c.writeLoop()
}

func (c *Client) readLoop() {
	defer func() {
		c.hub.Unregister(c)
		close(c.quit)
	}()
	scanner := bufio.NewScanner(c.conn)
	scanner.Buffer(make([]byte, 4096), 4096)
	for scanner.Scan() {
		text := strings.TrimSpace(scanner.Text())
		if text == "" {
			continue
		}
		switch {
		case text == "/quit":
			c.Write([]byte("До свидания!\n"))
			return
		case text == "/users":
			c.Write([]byte(fmt.Sprintf("Онлайн: %d\n", c.hub.ClientCount())))
		default:
			c.hub.Broadcast(hub.Message{
				Sender: c.name, Content: text, Type: "message",
			})
		}
	}
}

func (c *Client) writeLoop() {
	for {
		select {
		case msg, ok := <-c.sendCh:
			if !ok {
				return
			}
			prefix := ""
			if msg.Type == "system" {
				prefix = "* "
			} else {
				prefix = fmt.Sprintf("<%s> ", msg.Sender)
			}
			c.Write([]byte(prefix + msg.Content + "\n"))
		case <-c.quit:
			return
		}
	}
}

func (c *Client) Write(data []byte) error {
	_, err := c.conn.Write(data)
	return err
}

func (c *Client) Close() { c.conn.Close() }
```

```go
// main.go
package main

import (
	"fmt"
	"log"
	"net"
	"chat-server/client"
	"chat-server/hub"
)

func main() {
	h := hub.NewHub()
	go h.Run()

	listener, err := net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatalf("Ошибка запуска: %v", err)
	}
	defer listener.Close()

	fmt.Println("Чат-сервер запущен на :8080")
	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("Ошибка подключения: %v", err)
			continue
		}
		go client.NewClient(conn, h).Handle()
	}
}
```

### Архитектура

```
┌──────────┐     TCP      ┌──────────┐
│ Client 1 │─────────────▶│          │
└──────────┘              │          │
┌──────────┐     TCP      │   Hub    │
│ Client 2 │─────────────▶│(goroutine)│
└──────────┘              │          │
┌──────────┐     TCP      │          │
│ Client 3 │─────────────▶│          │
└──────────┘              └──────────┘
```

### Следующие шаги

- WebSocket-версия для браузера
- История сообщений (последние N)
- Комнаты/каналы
- Аутентификация по токену

---

## Проект 4: Файловый процессор

**Уровень:** Средний  
**Стек:** io, os, sync, filepath  
**Время:** 4-5 часов

### Описание

Многопоточный обработчик файлов: подсчёт строк, слов, поиск по содержимому. Worker pool для параллельной обработки.

### Ключевой код

```go
// processor/processor.go
package processor

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
)

type Stats struct {
	FilesProcessed atomic.Int64
	LinesCount     atomic.Int64
	WordsCount     atomic.Int64
	BytesCount     atomic.Int64
	ErrorsCount    atomic.Int64
}

type Task struct {
	Path     string
	Action   string
	Pattern  string
	OutputCh chan<- string
}

type Processor struct {
	tasks   chan Task
	wg      sync.WaitGroup
	stats   Stats
	workers int
}

func NewProcessor(workers int) *Processor {
	if workers <= 0 {
		workers = runtime.NumCPU()
	}
	return &Processor{
		tasks:   make(chan Task, 100),
		workers: workers,
	}
}

func (p *Processor) Start() {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go p.worker()
	}
}

func (p *Processor) Stop() {
	close(p.tasks)
	p.wg.Wait()
}

func (p *Processor) Submit(task Task) {
	p.tasks <- task
}

func (p *Processor) worker() {
	defer p.wg.Done()
	for task := range p.tasks {
		switch task.Action {
		case "count":
			p.processCount(task)
		case "search":
			p.processSearch(task)
		}
	}
}

func (p *Processor) processCount(task Task) {
	file, err := os.Open(task.Path)
	if err != nil {
		p.stats.ErrorsCount.Add(1)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	words := 0
	for scanner.Scan() {
		p.stats.LinesCount.Add(1)
		words += len(strings.Fields(scanner.Text()))
	}
	p.stats.WordsCount.Add(int64(words))
	p.stats.FilesProcessed.Add(1)

	if task.OutputCh != nil {
		task.OutputCh <- fmt.Sprintf("%s: lines=%d words=%d",
			task.Path, p.stats.LinesCount.Load(), p.stats.WordsCount.Load())
	}
}

func (p *Processor) processSearch(task Task) {
	file, err := os.Open(task.Path)
	if err != nil {
		p.stats.ErrorsCount.Add(1)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lineNum := 0
	for scanner.Scan() {
		lineNum++
		line := scanner.Text()
		if strings.Contains(line, task.Pattern) {
			if task.OutputCh != nil {
				task.OutputCh <- fmt.Sprintf("%s:%d: %s", task.Path, lineNum, line)
			}
		}
	}
	p.stats.FilesProcessed.Add(1)
}

func ScanDirectory(root string, extensions []string) ([]string, error) {
	var files []string
	extSet := make(map[string]bool)
	for _, ext := range extensions {
		extSet[ext] = true
	}
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if len(extensions) == 0 || extSet[filepath.Ext(path)] {
			files = append(files, path)
		}
		return nil
	})
	return files, err
}
```

```go
// main.go
package main

import (
	"flag"
	"fmt"
	"os"
	"time"
	"file-processor/processor"
)

func main() {
	action := flag.String("action", "count", "Действие: count, search")
	pattern := flag.String("pattern", "", "Шаблон для поиска")
	workers := flag.Int("workers", 4, "Количество воркеров")
	flag.Parse()

	if flag.NArg() == 0 {
		fmt.Fprintf(os.Stderr, "Использование: file-processor -action <action> <файл/директория>\n")
		os.Exit(1)
	}

	target := flag.Arg(0)
	files, err := processor.ScanDirectory(target, nil)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Ошибка: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Найдено файлов: %d\n", len(files))
	proc := processor.NewProcessor(*workers)
	proc.Start()

	start := time.Now()
	outputCh := make(chan string, 100)
	go func() {
		for msg := range outputCh {
			fmt.Println(msg)
		}
	}()

	for _, file := range files {
		proc.Submit(processor.Task{
			Path:     file,
			Action:   *action,
			Pattern:  *pattern,
			OutputCh: outputCh,
		})
	}

	proc.Stop()
	close(outputCh)
	stats := proc.stats

	fmt.Printf("\n=== Статистика ===\n")
	fmt.Printf("Файлов: %d\n", stats.FilesProcessed.Load())
	fmt.Printf("Строк:  %d\n", stats.LinesCount.Load())
	fmt.Printf("Слов:   %d\n", stats.WordsCount.Load())
	fmt.Printf("Ошибок: %d\n", stats.ErrorsCount.Load())
	fmt.Printf("Время:  %v\n", time.Since(start))
}
```

### Следующие шаги

- Паттерн Fan-out/Fan-in
- Ограничение памяти (streaming)
- Режим watch (в реальном времени)
- Интерфейс с progress bar

---

## Проект 5: REST API на Go

**Уровень:** Средний-Продвинутый  
**Стек:** net/http, encoding/json, sync, testing  
**Время:** 6-8 часов

### Описание

REST API для управления задачами. CRUD, JWT-аутентификация, middleware, rate limiting, graceful shutdown.

### Структура

```
go-tasks-api/
├── main.go
├── handlers/
│   └── tasks.go
├── middleware/
│   └── ratelimit.go
├── models/
│   └── task.go
├── store/
│   └── memory.go
└── main_test.go
```

### Ключевой код

```go
// models/task.go
package models

import "time"

type Task struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Done        bool      `json:"done"`
	Priority    string    `json:"priority"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
}

type UpdateTaskRequest struct {
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	Done        *bool   `json:"done,omitempty"`
	Priority    *string `json:"priority,omitempty"`
}
```

```go
// store/memory.go
package store

import (
	"fmt"
	"sync"
	"time"
	"go-tasks-api/models"
)

type MemoryStore struct {
	mu     sync.RWMutex
	tasks  map[int]models.Task
	nextID int
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{tasks: make(map[int]models.Task), nextID: 1}
}

func (s *MemoryStore) Create(req models.CreateTaskRequest) models.Task {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	task := models.Task{
		ID: s.nextID, Title: req.Title, Description: req.Description,
		Priority: req.Priority, CreatedAt: now, UpdatedAt: now,
	}
	s.tasks[task.ID] = task
	s.nextID++
	return task
}

func (s *MemoryStore) Get(id int) (models.Task, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	task, ok := s.tasks[id]
	if !ok {
		return models.Task{}, fmt.Errorf("задача %d не найдена", id)
	}
	return task, nil
}

func (s *MemoryStore) List() []models.Task {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]models.Task, 0, len(s.tasks))
	for _, task := range s.tasks {
		result = append(result, task)
	}
	return result
}

func (s *MemoryStore) Update(id int, req models.UpdateTaskRequest) (models.Task, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	task, ok := s.tasks[id]
	if !ok {
		return models.Task{}, fmt.Errorf("задача %d не найдена", id)
	}
	if req.Title != nil {
		task.Title = *req.Title
	}
	if req.Description != nil {
		task.Description = *req.Description
	}
	if req.Done != nil {
		task.Done = *req.Done
	}
	if req.Priority != nil {
		task.Priority = *req.Priority
	}
	task.UpdatedAt = time.Now()
	s.tasks[id] = task
	return task, nil
}

func (s *MemoryStore) Delete(id int) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.tasks[id]; !ok {
		return fmt.Errorf("задача %d не найдена", id)
	}
	delete(s.tasks, id)
	return nil
}
```

```go
// middleware/ratelimit.go
package middleware

import (
	"net/http"
	"sync"
	"time"
)

type RateLimiter struct {
	clients map[string]*ClientInfo
	mu      sync.Mutex
	limit   int
	window  time.Duration
}

type ClientInfo struct {
	Count     int
	ResetTime time.Time
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		clients: make(map[string]*ClientInfo),
		limit:   limit,
		window:  window,
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		rl.mu.Lock()
		client, exists := rl.clients[ip]
		if !exists || time.Now().After(client.ResetTime) {
			rl.clients[ip] = &ClientInfo{Count: 1, ResetTime: time.Now().Add(rl.window)}
			rl.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}
		client.Count++
		if client.Count > rl.limit {
			rl.mu.Unlock()
			w.Header().Set("Retry-After", "60")
			http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
			return
		}
		rl.mu.Unlock()
		next.ServeHTTP(w, r)
	})
}
```

```go
// handlers/tasks.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"go-tasks-api/models"
	"go-tasks-api/store"
)

type TaskHandler struct {
	store *store.MemoryStore
}

func NewTaskHandler(s *store.MemoryStore) *TaskHandler {
	return &TaskHandler{store: s}
}

func (h *TaskHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch {
	case r.Method == http.MethodGet && r.URL.Path == "/tasks":
		h.list(w, r)
	case r.Method == http.MethodPost && r.URL.Path == "/tasks":
		h.create(w, r)
	case r.Method == http.MethodGet && strings.HasPrefix(r.URL.Path, "/tasks/"):
		h.get(w, r)
	case r.Method == http.MethodPut && strings.HasPrefix(r.URL.Path, "/tasks/"):
		h.update(w, r)
	case r.Method == http.MethodDelete && strings.HasPrefix(r.URL.Path, "/tasks/"):
		h.delete(w, r)
	default:
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	}
}

func (h *TaskHandler) list(w http.ResponseWriter, r *http.Request) {
	tasks := h.store.List()
	json.NewEncoder(w).Encode(tasks)
}

func (h *TaskHandler) create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
		return
	}
	if req.Title == "" {
		http.Error(w, `{"error":"title required"}`, http.StatusBadRequest)
		return
	}
	task := h.store.Create(req)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

func (h *TaskHandler) get(w http.ResponseWriter, r *http.Request) {
	id, err := h.extractID(r)
	if err != nil {
		http.Error(w, `{"error":"invalid id"}`, http.StatusBadRequest)
		return
	}
	task, err := h.store.Get(id)
	if err != nil {
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(task)
}

func (h *TaskHandler) update(w http.ResponseWriter, r *http.Request) {
	id, err := h.extractID(r)
	if err != nil {
		http.Error(w, `{"error":"invalid id"}`, http.StatusBadRequest)
		return
	}
	var req models.UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid json"}`, http.StatusBadRequest)
		return
	}
	task, err := h.store.Update(id, req)
	if err != nil {
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(task)
}

func (h *TaskHandler) delete(w http.ResponseWriter, r *http.Request) {
	id, err := h.extractID(r)
	if err != nil {
		http.Error(w, `{"error":"invalid id"}`, http.StatusBadRequest)
		return
	}
	if err := h.store.Delete(id); err != nil {
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *TaskHandler) extractID(r *http.Request) (int, error) {
	parts := strings.Split(r.URL.Path, "/")
	return strconv.Atoi(parts[len(parts)-1])
}
```

```go
// main.go
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"go-tasks-api/handlers"
	"go-tasks-api/middleware"
	"go-tasks-api/store"
)

func main() {
	taskStore := store.NewMemoryStore()
	taskHandler := handlers.NewTaskHandler(taskStore)
	limiter := middleware.NewRateLimiter(100, time.Minute)

	mux := http.NewServeMux()
	mux.Handle("/tasks", taskHandler)
	mux.Handle("/tasks/", taskHandler)

	handler := limiter.Middleware(mux)

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGTERM)

	go func() {
		fmt.Println("API запущен на http://localhost:8080")
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("Ошибка: %v", err)
		}
	}()

	<-done
	fmt.Println("\nЗавершение работы...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Ошибка завершения: %v", err)
	}
	fmt.Println("Сервер остановлен")
}
```

```go
// main_test.go
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"go-tasks-api/handlers"
	"go-tasks-api/models"
	"go-tasks-api/store"
)

func TestCreateAndGetTask(t *testing.T) {
	s := store.NewMemoryStore()
	h := handlers.NewTaskHandler(s)

	body, _ := json.Marshal(models.CreateTaskRequest{Title: "Тест", Priority: "high"})
	req := httptest.NewRequest("POST", "/tasks", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("ожидался 201, получен %d", w.Code)
	}

	var created models.Task
	json.NewDecoder(w.Body).Decode(&created)
	if created.Title != "Тест" {
		t.Errorf("ожидался 'Тест', получен '%s'", created.Title)
	}
}
```

### Следующие шаги

- PostgreSQL хранилище (pgx)
- JWT middleware
- Swagger/OpenAPI документация
- Docker image

---

## Проект 6: CLI-менеджер задач

**Уровень:** Средний  
**Стек:** cobra, bbolt  
**Время:** 4-6 часов

### Описание

CLI для управления задачами с持久ным хранением, фильтрацией, экспортом в JSON.

### Ключевой код

```go
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
	"github.com/spf13/cobra"
	bolt "go.etcd.io/bbolt"
)

type Task struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Done      bool      `json:"done"`
	Priority  string    `json:"priority"`
	CreatedAt time.Time `json:"created_at"`
}

var db *bolt.DB

func initDB() {
	var err error
	db, err = bolt.Open("tasks.db", 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Ошибка БД: %v\n", err)
		os.Exit(1)
	}
}

var rootCmd = &cobra.Command{
	Use:   "task",
	Short: "CLI-менеджер задач",
}

var addCmd = &cobra.Command{
	Use:   "add [название]",
	Short: "Добавить задачу",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		priority, _ := cmd.Flags().GetString("priority")
		err := db.Update(func(tx *bolt.Tx) error {
			bucket, _ := tx.CreateBucketIfNotExists([]byte("tasks"))
			id, _ := bucket.NextSequence()
			task := Task{
				ID: int(id), Title: args[0], Priority: priority, CreatedAt: time.Now(),
			}
			data, _ := json.Marshal(task)
			return bucket.Put([]byte(fmt.Sprintf("%d", id)), data)
		})
		if err != nil {
			fmt.Fprintf(os.Stderr, "Ошибка: %v\n", err)
			return
		}
		fmt.Println("Задача добавлена")
	},
}

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "Показать задачи",
	Run: func(cmd *cobra.Command, args []string) {
		showDone, _ := cmd.Flags().GetBool("all")
		db.View(func(tx *bolt.Tx) error {
			bucket := tx.Bucket([]byte("tasks"))
			if bucket == nil {
				fmt.Println("Нет задач")
				return nil
			}
			return bucket.ForEach(func(k, v []byte) error {
				var task Task
				json.Unmarshal(v, &task)
				if !showDone && task.Done {
					return nil
				}
				status := "○"
				if task.Done {
					status = "✓"
				}
				fmt.Printf("  %s #%d [%s] %s\n", status, task.ID, task.Priority, task.Title)
				return nil
			})
		})
	},
}

func main() {
	initDB()
	defer db.Close()
	addCmd.Flags().StringP("priority", "p", "medium", "Приоритет")
	listCmd.Flags().BoolP("all", "a", false, "Показать все")
	rootCmd.AddCommand(addCmd, listCmd)
	rootCmd.Execute()
}
```

### Следующие шаги

- Команда `export` в JSON/CSV
- Интерактивный режим (survey)
- Приоритеты с цветами

---

## Проект 7: WebSocket-сервер

**Уровень:** Средний-Продвинутый  
**Стек:** gorilla/websocket, sync  
**Время:** 5-6 часов

### Описание

WebSocket-сервер для real-time уведомлений. Клиенты подключаются и получают события.

### Ключевой код

```go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Event struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
	Time    time.Time   `json:"time"`
}

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	sendCh chan []byte
	quit   chan struct{}
}

type Hub struct {
	clients    map[*Client]struct{}
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]struct{}),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = struct{}{}
			h.mu.Unlock()
			log.Printf("Клиент подключён (всего: %d)", len(h.clients))
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.sendCh)
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.sendCh <- message:
				default:
					close(client.sendCh)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		event := Event{Type: "message", Payload: json.RawMessage(message), Time: time.Now()}
		data, _ := json.Marshal(event)
		c.hub.broadcast <- data
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() { ticker.Stop(); c.conn.Close() }()
	for {
		select {
		case message, ok := <-c.sendCh:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			w.Close()
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			c.conn.WriteMessage(websocket.PingMessage, nil)
		case <-c.quit:
			return
		}
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Ошибка upgrade: %v", err)
		return
	}
	client := &Client{hub: hub, conn: conn, sendCh: make(chan []byte, 256), quit: make(chan struct{})}
	hub.register <- client
	go client.writePump()
	go client.readPump()
}

func main() {
	hub := NewHub()
	go hub.Run()
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})
	log.Println("WebSocket сервер на :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### Тестовый клиент (JS)

```html
<script>
const ws = new WebSocket("ws://localhost:8080/ws");
ws.onmessage = (e) => console.log("Получено:", JSON.parse(e.data));
ws.onopen = () => ws.send(JSON.stringify({text: "Привет!"}));
</script>
```

### Следующие шаги

- Channel/комнаты
- История событий (Redis)
- Аутентификация по JWT

---

## Проект 8: Клон Docker (контейнеры)

**Уровень:** Продвинутый  
**Стек:** syscall, namespaces, cgroups  
**Время:** 10-15 часов

### Описание

Упрощённая модель контейнера: изоляция через Linux namespaces, ограничение ресурсов через cgroups.

### Ключевой код

```go
// container/container.go
package container

import (
	"fmt"
	"os"
	"os/exec"
	"syscall"
)

type Config struct {
	Image    string
	Command  []string
	Memory   int64
	CPUShare int64
	Hostname string
	RootFS   string
}

func Run(cfg Config) error {
	fmt.Printf("Запуск контейнера: %s %v\n", cfg.Image, cfg.Command)
	args := cfg.Command
	if len(args) == 0 {
		args = []string{"/bin/sh"}
	}

	cmd := exec.Command("/proc/self/exe", append([]string{"child"}, args...)...)
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Cloneflags: syscall.CLONE_NEWUTS | syscall.CLONE_NEWPID |
			syscall.CLONE_NEWNS | syscall.CLONE_NEWNET,
	}
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if cfg.Hostname != "" {
		cmd.SysProcAttr.Hostname = cfg.Hostname
	}
	return cmd.Run()
}

func SetupCgroups(pid int, cfg Config) error {
	path := fmt.Sprintf("/sys/fs/cgroup/mycontainer/%d", pid)
	os.MkdirAll(path, 0755)
	if cfg.Memory > 0 {
		writeFile(path+"/memory.max", fmt.Sprintf("%d", cfg.Memory))
	}
	writeFile(path+"/cgroup.procs", fmt.Sprintf("%d", pid))
	return nil
}

func writeFile(path, content string) {
	os.WriteFile(path, []byte(content), 0644)
}
```

```go
// main.go
package main

import (
	"fmt"
	"os"
	"strconv"
	"mini-docker/container"
	"syscall"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("mini-docker <run> [command]")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "run":
		cfg := container.Config{
			Image:    "alpine",
			Command:  os.Args[2:],
			Memory:   100 * 1024 * 1024,
			CPUShare: 512,
			Hostname: "container-" + strconv.Itoa(os.Getpid()),
			RootFS:   "/var/lib/mini-docker/rootfs",
		}
		if err := container.Run(cfg); err != nil {
			fmt.Fprintf(os.Stderr, "Ошибка: %v\n", err)
		}
	case "child":
		fmt.Println("Контейнер запущен (PID 1)")
		fmt.Printf("Hostname: %s\n", func() string { n, _ := os.Hostname(); return n }())
		syscall.Exec("/bin/sh", []string{"/bin/sh"}, os.Environ())
	}
}
```

### Следующие шаги

- OverlayFS для слоёв
- Сетевой мост (bridge)
- Pull образов из registry
- CLI с флагами

---

## Проект 9: Распределённый rate limiter

**Уровень:** Продвинутый  
**Стек:** Redis, sync, time  
**Время:** 5-7 часов

### Описание

Rate limiter с алгоритмами Token Bucket, Sliding Window, Fixed Window. Поддержка распределённых инстансов через Redis.

### Ключевой код

```go
// ratelimit/token_bucket.go
package ratelimit

import (
	"context"
	"time"
	"github.com/redis/go-redis/v9"
)

type Limiter interface {
	Allow(ctx context.Context, key string) (bool, error)
	Reset(ctx context.Context, key string) error
}

type TokenBucket struct {
	rdb       *redis.Client
	rate      int64
	burst     int64
	keyPrefix string
}

func NewTokenBucket(rdb *redis.Client, rate, burst int64) *TokenBucket {
	return &TokenBucket{rdb: rdb, rate: rate, burst: burst, keyPrefix: "rl:tb:"}
}

const tokenBucketScript = `
local key = KEYS[1]
local rate = tonumber(ARGV[1])
local burst = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(data[1]) or burst
local last_refill = tonumber(data[2]) or now
local elapsed = now - last_refill
local new_tokens = math.min(burst, tokens + elapsed * rate)
if new_tokens >= 1 then
    redis.call('HMSET', key, 'tokens', new_tokens - 1, 'last_refill', now)
    redis.call('EXPIRE', key, math.ceil(burst / rate) * 2)
    return 1
end
return 0
`

func (tb *TokenBucket) Allow(ctx context.Context, key string) (bool, error) {
	fullKey := tb.keyPrefix + key
	now := time.Now().UnixMicro()
	result, err := tb.rdb.Eval(ctx, tokenBucketScript,
		[]string{fullKey}, tb.rate, tb.burst, now,
	).Int()
	if err != nil {
		return false, err
	}
	return result == 1, nil
}

func (tb *TokenBucket) Reset(ctx context.Context, key string) error {
	return tb.rdb.Del(ctx, tb.keyPrefix+key).Err()
}

type FixedWindow struct {
	rdb       *redis.Client
	window    time.Duration
	limit     int64
	keyPrefix string
}

func NewFixedWindow(rdb *redis.Client, window time.Duration, limit int64) *FixedWindow {
	return &FixedWindow{rdb: rdb, window: window, limit: limit, keyPrefix: "rl:fw:"}
}

func (fw *FixedWindow) Allow(ctx context.Context, key string) (bool, error) {
	now := time.Now()
	windowStart := now.Truncate(fw.window)
	fullKey := fw.keyPrefix + key + ":" + windowStart.Format("20060102150405")
	count, err := fw.rdb.Incr(ctx, fullKey).Result()
	if err != nil {
		return false, err
	}
	if count == 1 {
		fw.rdb.Expire(ctx, fullKey, fw.window+time.Second)
	}
	return count <= fw.limit, nil
}

func (fw *FixedWindow) Reset(ctx context.Context, key string) error {
	return fw.rdb.Del(ctx, fw.keyPrefix+key).Err()
}
```

### Следующие шаги

- Multi-key rate limiting
- Прокси-режим (reverse proxy)
- Dashboard для метрик

---

## Проект 10: Микросервис с gRPC

**Уровень:** Продвинутый  
**Стек:** gRPC, protobuf, interceptors  
**Время:** 8-10 часов

### Описание

gRPC-сервис для управления пользователями. Streaming, interceptors, deadline propagation.

### Структура

```
grpc-users/
├── proto/
│   └── users.proto
├── server/
│   └── server.go
├── client/
│   └── client.go
└── go.mod
```

### Ключевой код

```protobuf
// proto/users.proto
syntax = "proto3";
package users;
option go_package = "grpc-users/proto";

service UserService {
    rpc CreateUser(CreateUserRequest) returns (User);
    rpc GetUser(GetUserRequest) returns (User);
    rpc ListUsers(ListUsersRequest) returns (stream User);
}

message User {
    int32 id = 1;
    string name = 2;
    string email = 3;
    string role = 4;
    int64 created_at = 5;
}

message CreateUserRequest {
    string name = 1;
    string email = 2;
    string role = 3;
}

message GetUserRequest {
    int32 id = 1;
}

message ListUsersRequest {
    int32 page = 1;
    int32 per_page = 2;
}
```

```go
// server/server.go
package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"sync"
	"time"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	pb "grpc-users/proto"
)

type server struct {
	pb.UnimplementedUserServiceServer
	mu    sync.RWMutex
	users map[int32]*pb.User
	nextID int32
}

func newServer() *server {
	return &server{users: make(map[int32]*pb.User), nextID: 1}
}

func (s *server) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.User, error) {
	if req.Name == "" {
		return nil, status.Error(codes.InvalidArgument, "name required")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	user := &pb.User{
		Id: s.nextID, Name: req.Name, Email: req.Email,
		Role: req.Role, CreatedAt: time.Now().Unix(),
	}
	s.users[user.Id] = user
	s.nextID++
	log.Printf("Создан: %s (ID: %d)", user.Name, user.Id)
	return user, nil
}

func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	user, ok := s.users[req.Id]
	if !ok {
		return nil, status.Errorf(codes.NotFound, "user %d not found", req.Id)
	}
	return user, nil
}

func (s *server) ListUsers(req *pb.ListUsersRequest, stream pb.UserService_ListUsersServer) error {
	s.mu.RLock()
	defer s.mu.RUnlock()
	page := req.Page
	if page < 1 {
		page = 1
	}
	perPage := req.PerPage
	if perPage < 1 {
		perPage = 10
	}
	start := (page - 1) * perPage
	count := 0
	for _, user := range s.users {
		if count >= start && count < start+perPage {
			if err := stream.Send(user); err != nil {
				return err
			}
		}
		count++
		if count >= start+perPage {
			break
		}
	}
	return nil
}

func loggingInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	start := time.Now()
	resp, err := handler(ctx, req)
	log.Printf("gRPC: %s %v %v", info.FullMethod, time.Since(start), err)
	return resp, err
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Ошибка: %v", err)
	}
	srv := grpc.NewServer(grpc.UnaryInterceptor(loggingInterceptor))
	pb.RegisterUserServiceServer(srv, newServer())
	fmt.Println("gRPC сервер на :50051")
	log.Fatal(srv.Serve(lis))
}
```

```go
// client/client.go
package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	pb "grpc-users/proto"
)

func main() {
	conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Подключение: %v", err)
	}
	defer conn.Close()
	client := pb.NewUserServiceClient(conn)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	user, err := client.CreateUser(ctx, &pb.CreateUserRequest{Name: "Алексей", Email: "a@b.com", Role: "admin"})
	if err != nil {
		log.Fatalf("Создание: %v", err)
	}
	fmt.Printf("Создан: ID=%d Name=%s\n", user.Id, user.Name)

	stream, err := client.ListUsers(ctx, &pb.ListUsersRequest{Page: 1, PerPage: 5})
	if err != nil {
		log.Fatalf("Список: %v", err)
	}
	fmt.Println("\nСписок:")
	for {
		u, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("Чтение: %v", err)
		}
		fmt.Printf("  #%d %s <%s>\n", u.Id, u.Name, u.Email)
	}
}
```

### Запуск

```bash
protoc --go_out=. --go-grpc_out=. proto/users.proto
go run server/server.go
go run client/client.go
```

### Следующие шаги

- Metadata-based аутентификация
- Interceptor для JWT
- Health checking
- Tracing (OpenTelemetry)

---

## Рекомендации

| Уровень | Проекты | Ключевые навыки |
|---------|---------|-----------------|
| Начинающий | HTTP-сервер, CLI | net/http, flag, template |
| Средний | Чат, Файловый процессор, CLI-задачи, WebSocket | goroutines, channels, sync, bolt |
| Средний+ | REST API, Rate limiter | middleware, testing, Redis |
| Продвинутый | Docker-контейнеры, gRPC | syscall, namespaces, protobuf |

**Советы:**

1. Всегда используйте `go mod init` и `go mod tidy`
2. Обрабатывайте ошибки явно — не игнорируйте `err`
3. Используйте `context.Context` для отмены и таймаутов
4. Пишите тесты с `httptest` для HTTP-обработчиков
5. Используйте `sync.RWMutex` для конкурентного доступа к данным
