# Web Development Snippets

Общие сниппеты для веб-разработки: fetch API, CORS, JWT, rate limiting. Код на Python, Go, JavaScript.

---

## 1. HTTP-клиенты и Fetch API

### 1.1 Fetch с retry и timeout (JavaScript)

```javascript
async function fetchWithRetry(url, options = {}) {
    const { retries = 3, timeout = 10000, backoff = 1000, ...fetchOptions } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response;
        } catch (err) {
            if (attempt === retries) throw err;
            const delay = backoff * Math.pow(2, attempt - 1);
            console.warn(`Попытка ${attempt} не удалась, повтор через ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
        }
    }
}

// Использование
const data = await fetchWithRetry("https://api.example.com/data", {
    retries: 5,
    timeout: 5000,
    headers: { "Authorization": "Bearer token123" },
});
const json = await data.json();
```

### 1.2 HTTP-клиент на Python (requests + retry)

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session(retries=3, backoff_factor=0.5, timeout=30):
    session = requests.Session()
    retry_strategy = Retry(
        total=retries,
        backoff_factor=backoff_factor,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS", "POST", "PUT"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    session.headers.update({"User-Agent": "MyApp/1.0"})
    return session

session = create_session()
response = session.get("https://api.example.com/data", timeout=30)
data = response.json()
```

### 1.3 HTTP-клиент на Go (с context)

```go
package httpclient

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type Client struct {
    HTTPClient *http.Client
}

func NewClient(timeout time.Duration) *Client {
    return &Client{
        HTTPClient: &http.Client{
            Timeout: timeout,
            Transport: &http.Transport{
                MaxIdleConns:        100,
                MaxIdleConnsPerHost: 100,
                IdleConnTimeout:     90 * time.Second,
            },
        },
    }
}

func (c *Client) Get(ctx context.Context, url string, headers map[string]string) ([]byte, error) {
    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, fmt.Errorf("создание запроса: %w", err)
    }
    for k, v := range headers {
        req.Header.Set(k, v)
    }
    resp, err := c.HTTPClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("выполнение запроса: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode >= 400 {
        return nil, fmt.Errorf("статус %d", resp.StatusCode)
    }

    var buf []byte
    _, err = fmt.Fscan(resp.Body, &buf)
    return buf, nil
}

func GetJSON[T any](ctx context.Context, client *Client, url string) (T, error) {
    var result T
    data, err := client.Get(ctx, url, nil)
    if err != nil {
        return result, err
    }
    err = json.Unmarshal(data, &result)
    return result, err
}
```

---

## 2. CORS (Cross-Origin Resource Sharing)

### 2.1 CORS middleware на Go

```go
package middleware

import "net/http"

func CORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        w.Header().Set("Access-Control-Expose-Headers", "Content-Length, X-Request-Id")
        w.Header().Set("Access-Control-Allow-Credentials", "true")
        w.Header().Set("Access-Control-Max-Age", "86400")

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusNoContent)
            return
        }

        next.ServeHTTP(w, r)
    })
}

// Использование
handler := CORS(mux)
```

### 2.2 CORS middleware на FastAPI (Python)

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
    max_age=600,
)

# Ручная проверка Origin
@app.middleware("http")
async def custom_cors(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content=None, status_code=204)
    else:
        response = await call_next(request)

    origin = request.headers.get("origin")
    if origin and origin in ["http://localhost:3000", "https://myapp.com"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"

    return response
```

### 2.3 CORS для Express.js

```javascript
const cors = require("cors");

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ["http://localhost:3000", "https://myapp.com"];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS не разрешён"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
};

app.use(cors(corsOptions));
```

---

## 3. JWT-аутентификация

### 3.1 JWT на Python (PyJWT)

```python
import jwt
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# FastAPI middleware
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    return payload

# Эндпоинт входа
@app.post("/login")
def login(username: str, password: str):
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Неверные данные")
    access_token = create_access_token({"sub": user.username, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.username})
    return {"access_token": access_token, "refresh_token": refresh_token}
```

### 3.2 JWT на Go

```go
package auth

import (
    "errors"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("your-secret-key")

type Claims struct {
    UserID   int    `json:"user_id"`
    Username string `json:"username"`
    Role     string `json:"role"`
    jwt.RegisteredClaims
}

func GenerateToken(userID int, username, role string, expiration time.Duration) (string, error) {
    claims := Claims{
        UserID:   userID,
        Username: username,
        Role:     role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func ValidateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{},
        func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, errors.New("невалидный метод подписи")
            }
            return jwtSecret, nil
        },
    )
    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(*Claims)
    if !ok || !token.Valid {
        return nil, errors.New("невалидный токен")
    }

    return claims, nil
}
```

### 3.3 JWT middleware на Go

```go
func JWTAuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, `{"error":"token required"}`, http.StatusUnauthorized)
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        claims, err := ValidateToken(tokenString)
        if err != nil {
            http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
            return
        }

        ctx := context.WithValue(r.Context(), "user", claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 3.4 JWT на JavaScript (клиент)

```javascript
class AuthClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.accessToken = localStorage.getItem("accessToken");
        this.refreshToken = localStorage.getItem("refreshToken");
    }

    async login(username, password) {
        const res = await fetch(`${this.baseURL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) throw new Error("Ошибка входа");
        const data = await res.json();
        this.setTokens(data.access_token, data.refresh_token);
        return data;
    }

    setTokens(access, refresh) {
        this.accessToken = access;
        this.refreshToken = refresh;
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
    }

    async request(url, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (this.accessToken) {
            headers["Authorization"] = `Bearer ${this.accessToken}`;
        }

        let res = await fetch(url, { ...options, headers });

        // Если токен истёк — обновить
        if (res.status === 401 && this.refreshToken) {
            const refreshed = await this.refresh();
            if (refreshed) {
                headers["Authorization"] = `Bearer ${this.accessToken}`;
                res = await fetch(url, { ...options, headers });
            }
        }

        return res;
    }

    async refresh() {
        try {
            const res = await fetch(`${this.baseURL}/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: this.refreshToken }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            this.setTokens(data.access_token, data.refresh_token);
            return true;
        } catch {
            this.logout();
            return false;
        }
    }

    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }
}
```

---

## 4. Rate Limiting

### 4.1 Token Bucket (Python)

```python
import time
import threading

class TokenBucket:
    def __init__(self, rate: int, capacity: int):
        self.rate = rate          # токенов в секунду
        self.capacity = capacity  # максимум токенов
        self.tokens = capacity
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def _refill(self):
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_refill = now

    def allow(self) -> bool:
        with self.lock:
            self._refill()
            if self.tokens >= 1:
                self.tokens -= 1
                return True
            return False

# Использование в FastAPI
from fastapi import Request, HTTPException

buckets = {}

def get_limiter(request: Request) -> TokenBucket:
    ip = request.client.host
    if ip not in buckets:
        buckets[ip] = TokenBucket(rate=10, capacity=20)  # 10 req/s, burst 20
    return buckets[ip]

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    limiter = get_limiter(request)
    if not limiter.allow():
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    return await call_next(request)
```

### 4.2 Rate Limiter на Go

```go
package middleware

import (
    "net/http"
    "sync"
    "time"
)

type RateLimiter struct {
    mu       sync.Mutex
    clients  map[string]*clientInfo
    rate     int
    burst    int
}

type clientInfo struct {
    tokens    float64
    lastCheck time.Time
}

func NewRateLimiter(rate, burst int) *RateLimiter {
    rl := &RateLimiter{
        clients: make(map[string]*clientInfo),
        rate:    rate,
        burst:   burst,
    }
    go rl.cleanup()
    return rl
}

func (rl *RateLimiter) cleanup() {
    ticker := time.NewTicker(time.Minute)
    for range ticker.C {
        rl.mu.Lock()
        now := time.Now()
        for ip, info := range rl.clients {
            if now.Sub(info.lastCheck) > 5*time.Minute {
                delete(rl.clients, ip)
            }
        }
        rl.mu.Unlock()
    }
}

func (rl *RateLimiter) Allow(ip string) bool {
    rl.mu.Lock()
    defer rl.mu.Unlock()

    now := time.Now()
    info, exists := rl.clients[ip]
    if !exists {
        rl.clients[ip] = &clientInfo{tokens: float64(rl.burst - 1), lastCheck: now}
        return true
    }

    elapsed := now.Sub(info.lastCheck).Seconds()
    info.tokens = min(float64(rl.burst), info.tokens+elapsed*float64(rl.rate))
    info.lastCheck = now

    if info.tokens >= 1 {
        info.tokens--
        return true
    }
    return false
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ip := r.RemoteAddr
        if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
            ip = forwarded
        }

        if !rl.Allow(ip) {
            w.Header().Set("Retry-After", "60")
            http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

### 4.3 Rate Limiter на JavaScript

```javascript
class RateLimiter {
    constructor(rate, burst) {
        this.rate = rate;
        this.burst = burst;
        this.clients = new Map();
        this.cleanup();
    }

    allow(key) {
        const now = Date.now();
        let info = this.clients.get(key);

        if (!info) {
            info = { tokens: this.burst - 1, lastCheck: now };
            this.clients.set(key, info);
            return true;
        }

        const elapsed = (now - info.lastCheck) / 1000;
        info.tokens = Math.min(this.burst, info.tokens + elapsed * this.rate);
        info.lastCheck = now;

        if (info.tokens >= 1) {
            info.tokens--;
            return true;
        }
        return false;
    }

    cleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, info] of this.clients) {
                if (now - info.lastCheck > 5 * 60 * 1000) {
                    this.clients.delete(key);
                }
            }
        }, 60000);
    }
}

// Express middleware
const limiter = new RateLimiter(10, 20);

function rateLimitMiddleware(req, res, next) {
    if (!limiter.allow(req.ip)) {
        return res.status(429).json({ error: "Rate limit exceeded" });
    }
    next();
}
```

---

## 5. WebSocket

### 5.1 WebSocket-сервер на Go

```go
package main

import (
    "log"
    "net/http"
    "sync"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool { return true },
}

type Hub struct {
    clients    map[*websocket.Conn]bool
    broadcast  chan []byte
    mu         sync.RWMutex
}

func NewHub() *Hub {
    return &Hub{
        clients:   make(map[*websocket.Conn]bool),
        broadcast: make(chan []byte, 256),
    }
}

func (h *Hub) Run() {
    for msg := range h.broadcast {
        h.mu.RLock()
        for client := range h.clients {
            if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
                client.Close()
                delete(h.clients, client)
            }
        }
        h.mu.RUnlock()
    }
}

func wsHandler(hub *Hub) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        conn, err := upgrader.Upgrade(w, r, nil)
        if err != nil {
            log.Printf("upgrade error: %v", err)
            return
        }

        hub.mu.Lock()
        hub.clients[conn] = true
        hub.mu.Unlock()

        defer func() {
            hub.mu.Lock()
            delete(hub.clients, conn)
            hub.mu.Unlock()
            conn.Close()
        }()

        for {
            _, msg, err := conn.ReadMessage()
            if err != nil {
                break
            }
            hub.broadcast <- msg
        }
    }
}

func main() {
    hub := NewHub()
    go hub.Run()
    http.HandleFunc("/ws", wsHandler(hub))
    log.Println("WS сервер на :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### 5.2 WebSocket клиент с reconnect (JavaScript)

```javascript
class WSClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.handlers = new Map();
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("WS подключён");
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                const handler = this.handlers.get(msg.type);
                if (handler) handler(msg.payload);
            } catch (err) {
                console.error("Parse error:", err);
            }
        };

        this.ws.onclose = () => {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                console.log(`Переподключение через ${delay}ms...`);
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, delay);
            }
        };

        this.ws.onerror = (err) => console.error("WS error:", err);
    }

    on(type, handler) {
        this.handlers.set(type, handler);
    }

    send(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    }

    close() {
        this.maxReconnectAttempts = 0;
        this.ws?.close();
    }
}
```

---

## 6. Middleware Patterns

### 6.1 Python ASGI middleware

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - start
        response.headers["X-Process-Time"] = f"{elapsed:.4f}"
        return response

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        import uuid
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
```

### 6.2 Go middleware chain

```go
package middleware

import (
    "log"
    "net/http"
    "time"
)

type Middleware func(http.Handler) http.Handler

func Chain(handler http.Handler, middlewares ...Middleware) http.Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        handler = middlewares[i](handler)
    }
    return handler
}

func Logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func RecoverPanic(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("panic: %v", err)
                http.Error(w, "Internal Server Error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

// Использование
handler := Chain(mux, Logging, RecoverPanic, CORS)
```

---

## 7. Content Security Policy (CSP)

```python
# FastAPI CSP middleware
@app.middleware("http")
async def csp_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.example.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' https://fonts.gstatic.com; "
        "connect-src 'self' https://api.example.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

```javascript
// Express.js CSP
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.example.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.example.com"],
    },
}));
```
