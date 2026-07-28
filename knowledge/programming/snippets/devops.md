# DevOps Snippets

Docker Compose, CI/CD (GitHub Actions), Nginx, systemd, мониторинг. Готовые конфиги и паттерны.

---

## 1. Docker Compose

### 1.1 Полный стек (Web + DB + Redis + Nginx)

```yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: myapp
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "8000:8000"
    volumes:
      - ./uploads:/app/uploads
      - app_logs:/app/logs
    networks:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 128M

  db:
    image: postgres:16-alpine
    container_name: myapp-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    networks:
      - backend

  nginx:
    image: nginx:alpine
    container_name: myapp-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_files:/app/static:ro
    depends_on:
      - app
    networks:
      - backend

volumes:
  pgdata:
  redisdata:
  app_logs:
  static_files:

networks:
  backend:
    driver: bridge
```

### 1.2 Dockerfile (Python FastAPI)

```dockerfile
# Dockerfile
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Код
COPY . .

# Непривилегированный пользователь
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 1.3 Dockerfile (Go)

```dockerfile
# Сборка
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

# Запуск
FROM scratch
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

### 1.4 Docker Compose — Development

```yaml
# docker-compose.dev.yml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DEBUG=1
      - DATABASE_URL=postgresql://postgres:secret@db:5432/myapp
    ports:
      - "8000:8000"
      - "5678:5678"  # debugpy
    command: uvicorn main:app --reload --host 0.0.0.0

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  adminer:
    image: adminer
    ports:
      - "8080:8080"

volumes:
  pgdata:
```

---

## 2. GitHub Actions CI/CD

### 2.1 Python проект

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: "pip"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint
        run: |
          ruff check .
          mypy .

      - name: Test
        env:
          DATABASE_URL: sqlite:///test.db
        run: |
          pytest --cov=app --cov-report=xml -v

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: coverage.xml

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: registry.example.com/myapp:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/myapp
            docker compose pull
            docker compose up -d --remove-orphans
```

### 2.2 Go проект

```yaml
# .github/workflows/go-ci.yml
name: Go CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version: "1.22"

      - name: Vet
        run: go vet ./...

      - name: Lint
        uses: golangci/golangci-lint-action@v4

      - name: Test
        run: go test -race -coverprofile=coverage.out ./...

      - name: Build
        run: go build -o /dev/null .
```

### 2.3 JavaScript проект

```yaml
# .github/workflows/js-ci.yml
name: JS CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

---

## 3. Nginx Configuration

### 3.1 Reverse Proxy + Static

```nginx
# nginx/nginx.conf
worker_processes auto;
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time';

    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream
    upstream app {
        least_conn;
        server app:8000;
    }

    server {
        listen 80;
        server_name localhost;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name myapp.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;

        # Static files
        location /static/ {
            alias /app/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 30s;
            proxy_connect_timeout 10s;
        }

        # Login (строгий rate limit)
        location /api/auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # SPA fallback
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Gzip
        gzip on;
        gzip_vary on;
        gzip_proxied any;
    }
}
```

### 3.2 Nginx для WebSocket

```nginx
location /ws/ {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 86400;
}
```

---

## 4. systemd Service Files

### 4.1 Python приложение

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My Python App
After=network.target postgresql.service redis.service
Requires=postgresql.service redis.service

[Service]
Type=exec
User=appuser
Group=appuser
WorkingDirectory=/opt/myapp
Environment=PATH=/opt/myapp/venv/bin
EnvironmentFile=/opt/myapp/.env
ExecStart=/opt/myapp/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
TimeoutStartSec=30
TimeoutStopSec=30

# Security
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/opt/myapp/logs /opt/myapp/uploads
PrivateTmp=yes

# Resources
LimitNOFILE=65535
MemoryMax=1G
CPUQuota=200%

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=myapp

[Install]
WantedBy=multi-user.target
```

### 4.2 Go приложение

```ini
# /etc/systemd/system/goapp.service
[Unit]
Description=Go Application
After=network.target

[Service]
Type=simple
User=goapp
Group=goapp
ExecStart=/opt/goapp/server
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

# Environment
EnvironmentFile=/opt/goapp/.env

[Install]
WantedBy=multi-user.target
```

### 4.3 Timer (cron-like)

```ini
# /etc/systemd/system/backup.service
[Unit]
Description=Database Backup

[Service]
Type=oneshot
ExecStart=/opt/scripts/backup.sh
User=backup

# /etc/systemd/system/backup.timer
[Unit]
Description=Daily Backup Timer

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Активация
sudo systemctl enable --now backup.timer
sudo systemctl list-timers
```

---

## 5. Мониторинг

### 5.1 Prometheus метрики (Python/FastAPI)

```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from prometheus_client.registry import REGISTRY
from fastapi import FastAPI, Request
from fastapi.responses import Response
import time

app = FastAPI()

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "Request latency",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
)

ACTIVE_REQUESTS = Gauge(
    "http_active_requests",
    "Active requests"
)

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    ACTIVE_REQUESTS.inc()
    start = time.perf_counter()
    try:
        response = await call_next(request)
        elapsed = time.perf_counter() - start
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(elapsed)
        return response
    finally:
        ACTIVE_REQUESTS.dec()

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(REGISTRY), media_type="text/plain")

@app.get("/health")
def health():
    return {"status": "ok"}
```

### 5.2 docker-compose с мониторингом

```yaml
# docker-compose.monitoring.yml
version: "3.9"

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
    ports:
      - "9100:9100"
    command:
      - "--path.procfs=/host/proc"
      - "--path.sysfs=/host/sys"

volumes:
  grafana_data:
```

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "myapp"
    static_configs:
      - targets: ["app:8000"]
    metrics_path: "/metrics"

  - job_name: "node"
    static_configs:
      - targets: ["node-exporter:9100"]
```

### 5.3 Алерты (Prometheus rules)

```yaml
# prometheus/alerts.yml
groups:
  - name: app_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate"
          description: "Error rate > 5% for 5 minutes"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency"
          description: "P95 latency > 2s"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service down"
```

---

## 6. Полезные bash-скрипты

### 6.1 Deploy script

```bash
#!/bin/bash
set -euo pipefail

APP_DIR="/opt/myapp"
BACKUP_DIR="/opt/backups"
COMPOSE_FILE="docker-compose.yml"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== Деплой $DATE ==="

# Бэкап БД
echo "Бэкап базы данных..."
docker compose -f $COMPOSE_FILE exec -T db pg_dump -U postgres myapp > "$BACKUP_DIR/db_$DATE.sql"

# Пул нового образа
echo "Обновление образов..."
docker compose -f $COMPOSE_FILE pull

# Обновление
echo "Перезапуск сервисов..."
docker compose -f $COMPOSE_FILE up -d --remove-orphans

# Очистка
echo "Очистка старых образов..."
docker image prune -f

# Проверка здоровья
echo "Проверка здоровья..."
sleep 10
if curl -sf http://localhost:8000/health > /dev/null; then
    echo "✅ Деплой завершён успешно"
else
    echo "❌ Сервис не отвечает, откат..."
    docker compose -f $COMPOSE_FILE rollback
    exit 1
fi
```

### 6.2 Backup script

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL
docker exec myapp-db pg_dump -U postgres myapp | gzip > "$BACKUP_DIR/pg_$DATE.sql.gz"

# Redis
docker exec myapp-redis redis-cli BGSAVE
docker cp myapp-redis:/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Файлы
tar czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /opt/myapp/uploads/

# Удаление старых бэкапов
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.rdb" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Бэкап завершён: $DATE"
```

### 6.3 Log rotation

```bash
# /etc/logrotate.d/myapp
/opt/myapp/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 appuser appuser
    sharedscripts
    postrotate
        docker kill --signal=USR1 myapp 2>/dev/null || true
    endscript
}
```

---

## 7. SSL/TLS (Let's Encrypt)

```bash
# Установка certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d myapp.com -d www.myapp.com

# Автообновление
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Проверка
sudo certbot renew --dry-run
```

```nginx
# Автообновление через Nginx
server {
    listen 80;
    server_name myapp.com;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}
```

---

## 8. Environment Variables

### 8.1 .env.example

```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=change-me-in-production
JWT_SECRET=another-secret-key
ALLOWED_ORIGINS=http://localhost:3000,https://myapp.com
LOG_LEVEL=INFO
DEBUG=false
```

### 8.2 Loading env (Python)

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str
    JWT_SECRET: str
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

---

## Шпаргалка

| Инструмент | Назначение | Команда |
|------------|-----------|---------|
| Docker Compose | Мультиконтейнер | `docker compose up -d` |
| GitHub Actions | CI/CD | workflow в `.github/workflows/` |
| Nginx | Reverse proxy | конфиг в `/etc/nginx/` |
| systemd | Сервисы | `systemctl start/stop/enable` |
| Prometheus | Метрики | scrape endpoint |
| Grafana | Дашборды | web UI на :3001 |
| certbot | SSL | `certbot --nginx` |
| logrotate | Ротация логов | `/etc/logrotate.d/` |
