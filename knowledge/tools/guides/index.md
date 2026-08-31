# Инструменты — Гайды

Шпаргалки по основным инструментам разработки.

---

## 📁 Git

```bash
# Конфигурация
git config --global user.name "madsaomi13"
git config --global user.email "madsaomi13@gmail.com"

# Работа с репозиторием
git init                  # новый репо
git clone <url>           # клонировать
git add .                 # добавить всё
git commit -m "msg"       # коммит
git push origin main      # запушить
git pull                  # стянуть изменения

# Ветки
git branch <name>         # создать ветку
git checkout <name>       # переключиться
git checkout -b <name>    # создать + переключиться
git merge <branch>        # слить ветку

# Отмена
git reset HEAD~1          # отменить последний коммит
git stash                 # спрятать изменения
git stash pop             # достать изменения

# Просмотр
git log --oneline         # история
git status                # состояние
git diff                  # изменения
```

## 🔑 SSH

```bash
# Создать ключ
ssh-keygen -t ed25519 -C "madsaomi13@gmail.com"
ssh-add ~/.ssh/id_ed25519

# Скопировать публичный ключ
cat ~/.ssh/id_ed25519.pub
# Добавить на GitHub → Settings → SSH Keys

# Проверка
ssh -T git@github.com
```

## 🐍 Python

```bash
# Виртуальное окружение
python3 -m venv venv
source venv/bin/activate        # Linux/Mac
# .\venv\Scripts\activate       # Windows
pip install -r requirements.txt
pip freeze > requirements.txt

# Установка
pip install flask requests beautifulsoup4
pip install --upgrade pip

# Запуск
python script.py
python -m flask run
```

## 🟢 Node.js

```bash
# Установка через nvm
nvm install --lts
nvm use --lts
nvm alias default lts

# Проект
npm init -y
npm install express axios
npm install -D typescript
npm run dev

# Глобальные пакеты
npm install -g nodemon ts-node
```

## 🐳 Docker

```bash
# Базовые команды
docker ps                    # запущенные контейнеры
docker ps -a                 # все контейнеры
docker images                # образы
docker pull <image>          # скачать образ
docker rmi <image>           # удалить образ

# Запуск
docker run -it ubuntu /bin/bash
docker run -d -p 8080:80 nginx
docker exec -it <container> /bin/sh

# Dockerfile
# FROM python:3.11
# WORKDIR /app
# COPY . .
# RUN pip install -r requirements.txt
# CMD ["python", "app.py"]

docker build -t myapp .
docker compose up -d
docker compose down
```

## 📟 tmux

```bash
tmux new -s <name>        # новый сеанс
tmux attach -t <name>     # подключиться
tmux ls                   # список сеансов
tmux kill-session -t <name>

# Внутри tmux (Ctrl+b)
# c       — новое окно
# n/p     — след/пред окно
# %       — разделить вертикально
# "       — разделить горизонтально
# стрелки — переключение между панелями
# d       — отключиться (detach)
# [       — режим прокрутки (PgUp/PgDn)
```

## 📝 Vim

```bash
# Режимы
i         — вставка (Insert)
Esc       — нормальный режим
v         — визуальный режим
:         — командная строка

# Навигация
h/j/k/l   — ←/↓/↑/→
w/b       — слово вперёд/назад
0/$       — начало/конец строки
gg/G      — начало/конец файла

# Редактирование
x         — удалить символ
dd        — удалить строку
yy        — копировать строку
p         — вставить
u         — отменить
Ctrl+r    — повторить

# Поиск и замена
/pattern  — поиск
n/N       — следующий/предыдущий
:%s/old/new/g — замена по всему файлу

# Файлы
:w        — сохранить
:q        — выход
:wq       — сохранить и выйти
:q!       — выйти без сохранения
:e file   — открыть файл
```

## 🔧 Прочее

```bash
# curl
curl -X GET https://api.github.com
curl -X POST -d '{"key":"value"}' -H "Content-Type: application/json" <url>

# jq (парсинг JSON)
curl api.github.com | jq '.name'
curl api.github.com | jq '.[] | {name, id}'

# grep
grep -r "pattern" .          # рекурсивный поиск
grep -rn "pattern" --include="*.py"

# find
find . -name "*.py"          # найти все .py файлы
find . -type f -size +1M     # файлы > 1MB

# rsync
rsync -avz ./src/ user@host:/dest/
```

---

## 🐧 Linux (база)

```bash
# Навигация
pwd; ls -la; cd /path; mkdir -p a/b; rmdir dir; rm -rf dir
cp -r src dst; mv old new; touch file; cat file; less file; head -20 file; tail -20 file

# Права
chmod 755 file; chmod +x script.sh; chown user:group file
ls -l  # -rwxr-xr-x

# Процессы
ps aux | grep python; top; htop; kill -9 <pid>; jobs; fg; bg; nohup ./app &
systemctl status nginx; journalctl -u nginx -f

# Сеть
ping google.com; curl -I https://example.com; wget https://example.com/file.zip
ss -tulpn; netstat -tulpn; ip a; hostname -I

# Поиск и текст
grep -R "TODO" --include="*.py" .; sed -n '1,20p' file; awk '{print $1}' file | sort | uniq -c
cut -d',' -f1 file.csv; tr ',' '\n' < file; xargs -I{} echo {}

# Архивы
tar -czf arch.tar.gz dir/; tar -xzf arch.tar.gz; zip -r arch.zip dir/; unzip arch.zip
```

### 🔍 Примеры Linux

```bash
# Найти большие файлы >100M
find . -type f -size +100M -exec ls -lh {} \;

# Заменить во всех .md "old" -> "new"
find . -name "*.md" -exec sed -i 's/old/new/g' {} \;

# Следить за логом
tail -f /var/log/syslog | grep ERROR

# Cron
crontab -e
# 0 3 * * * /usr/bin/python3 /path/backup.py >> /var/log/backup.log 2>&1
```

---

## 💻 VS Code

```bash
# Горячие клавиши
Ctrl+P         # быстрый переход к файлу
Ctrl+Shift+P   # палитра команд
Ctrl+`         # терминал
Ctrl+B         # боковая панель
Ctrl+/         # комментировать
Alt+Shift+F    # форматировать
F2             # переименовать символ
Ctrl+D         # следующее вхождение
Ctrl+Shift+L   # все вхождения
Ctrl+G         # перейти к строке

# Расширения must-have
code --install-extension ms-python.python
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension GitHub.copilot

# settings.json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "files.autoSave": "onFocusChange",
  "python.linting.pylintEnabled": true
}

# tasks.json (запуск тестов)
{
  "version": "2.0.0",
  "tasks": [{ "label": "test", "type": "shell", "command": "pytest -q" }]
}
```

---

## 🌿 GitHub CLI (`gh`)

```bash
# Установка
brew install gh  # Mac
sudo apt install gh  # Linux

# Авторизация
gh auth login
gh auth status

# Репо
gh repo create myapp --public --clone
gh repo view --web
gh repo clone madsaomi/materials

# PR
gh pr create --title "feat: ..." --body "desc" --base main
gh pr list; gh pr view 123; gh pr checks 123; gh pr merge 123 --squash
gh pr diff 123 | less

# Issues
gh issue create --title "bug: ..." --label bug
gh issue list; gh issue view 42; gh issue close 42

# Actions
gh run list; gh run view <id>; gh run rerun <id>
gh workflow list; gh workflow run deploy.yml
```

---

## 🔄 Make & Task

```bash
# Makefile
.PHONY: test lint run
test:
	pytest -q
lint:
	ruff check . && mypy .
run:
	python -m app

# Использование
make test; make lint; make run -j4

# Task (go-task)
# Taskfile.yml
version: '3'
tasks:
  dev:
    cmds: [npm run dev]
  build:
    cmds: [npm run build]
  test:
    cmds: [pytest -q]
# task dev; task build
```

---

## 📦 Python: Poetry & pipenv

```bash
# Poetry
curl -sSL https://install.python-poetry.org | python3 -
poetry new myapp; poetry init; poetry add requests; poetry add --group dev pytest
poetry install; poetry shell; poetry run python app.py
poetry show --tree; poetry update

# pipenv
pip install pipenv
pipenv install requests; pipenv install --dev pytest
pipenv shell; pipenv run python app.py
pipenv lock; pipenv graph

# pyenv (версии Python)
pyenv install 3.11.6; pyenv global 3.11.6; pyenv local 3.11.6
python --version
```

---

## 🐍 Python: отладка и профилирование

```bash
# pdb
python -m pdb script.py
# (pdb) n - next, s - step, c - continue, l - list, p var

# ipdb
pip install ipdb; python -m ipdb script.py

# logging
import logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(message)s')
logging.debug("value=%s", x)

# cProfile
python -m cProfile -s cumtime script.py
python -m cProfile -o prof.out script.py && python -m pstats prof.out

# line_profiler
pip install line_profiler
@profile
def foo(): ...
kernprof -l -v script.py

# memory
pip install memory-profiler
mprof run script.py; mprof plot
```

---

## 🟩 Node: pnpm, yarn, npx

```bash
# pnpm (быстрее npm)
npm install -g pnpm
pnpm install; pnpm add express; pnpm add -D typescript; pnpm dev

# yarn
npm install -g yarn
yarn; yarn add lodash; yarn add --dev jest; yarn dev

# npx (запуск без установки)
npx create-react-app myapp
npx tsc --init; npx eslint --init

# nvm (переключение Node)
nvm ls; nvm use 18; nvm install 20; node -v

# package.json скрипты
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint ."
  }
}
```

---

## 🐳 Docker: продвинутый

```bash
# Многоступенчатый Dockerfile
# Dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# BuildKit
DOCKER_BUILDKIT=1 docker build -t myapp .

# Networks
docker network create mynet
docker run -d --network mynet --name db postgres
docker run -d --network mynet -p 3000:3000 myapp

# Volumes
docker volume create pgdata
docker run -d -v pgdata:/var/lib/postgresql/data postgres
docker volume ls; docker volume rm pgdata

# Compose (docker-compose.yml)
version: '3.8'
services:
  web:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
    env_file: .env
  db:
    image: postgres:15
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_PASSWORD: secret
volumes:
  pgdata:

# Команды compose
docker compose up -d --build
docker compose logs -f web
docker compose exec db psql -U postgres
docker compose down -v
```

---

## ☸️ Kubernetes (k8s) — шпаргалка

```bash
# Контекст
kubectl cluster-info; kubectl get nodes; kubectl config get-contexts
kubectl config use-context mycluster

# Под и деплой
kubectl get pods -A; kubectl get deployments; kubectl get svc
kubectl apply -f deployment.yml
kubectl scale deployment myapp --replicas=3
kubectl rollout status deployment/myapp
kubectl rollout undo deployment/myapp

# Логи и отладка
kubectl logs -f pod/myapp-xyz
kubectl exec -it pod/myapp-xyz -- /bin/sh
kubectl describe pod myapp-xyz
kubectl port-forward svc/myapp 8080:80

# Манифест (deployment.yml)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2
  selector:
    matchLabels: {app: myapp}
  template:
    metadata: {labels: {app: myapp}}
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports: [{containerPort: 3000}]
        env:
        - name: NODE_ENV
          value: production
```

---

## 🔁 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3.11'}
      - uses: actions/setup-node@v4
        with: {node-version: 20}
      - run: pip install -r requirements.txt
      - run: pytest -q
      - run: npm ci && npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t myapp .
      - run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USER }}" --password-stdin
      - run: docker push myapp:latest
```

```bash
# Локальный прогон act
# https://github.com/nektos/act
act -l; act push -j test
```

---

## 🧪 Тестирование

```bash
# pytest
pytest -q; pytest -k test_login -v; pytest --cov=. --cov-report=html
pytest --maxfail=1 --disable-warnings

# jest / vitest
npm test; npm test -- -t "adds" --watch
npx jest --coverage

# Playwright
npx playwright test; npx playwright test --headed; npx playwright show-report

# k6 (нагрузка)
k6 run --vus 50 --duration 30s script.js
```

---

## 🔐 Секреты и окружение

```bash
# .env
DATABASE_URL=postgres://user:pass@localhost:5432/db
JWT_SECRET=supersecret
API_KEY=...

# dotenv
# Python: pip install python-dotenv
# from dotenv import load_dotenv; load_dotenv()

# direnv
echo 'export API_KEY=...' > .envrc; direnv allow

# sops (шифрование)
sops --encrypt --age age1... secrets.yml > secrets.enc.yml
sops --decrypt secrets.enc.yml

# GitHub Secrets
gh secret set API_KEY --body "value" --repo madsaomi/materials
```

---

## 🌐 Nginx

```bash
# /etc/nginx/sites-available/myapp
server {
  listen 80;
  server_name example.com;
  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  location /static/ {
    alias /var/www/static/;
    expires 30d;
  }
}
# sudo nginx -t && sudo systemctl reload nginx
# certbot
sudo certbot --nginx -d example.com
```

---

## 🔍 Отладка сети

```bash
# curl подробно
curl -v https://example.com
curl -X POST -H "Authorization: Bearer TOKEN" -d '{"a":1}' https://api.example.com

# httpie (удобнее curl)
http GET example.com
http POST example.com name=John age:=30

# websocat (websocket)
websocat wss://echo.websocket.org

# Wireshark / tcpdump
sudo tcpdump -i any port 3000 -w capture.pcap
```

---

## 📊 Мониторинг

```bash
# htop, glances
htop; glances

# Prometheus + Grafana (docker)
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3000:3000 grafana/grafana

# Loki (логи)
# Promtail -> Loki -> Grafana

# Sentry
# pip install sentry-sdk
# sentry_sdk.init(dsn="...")

# uptime
uptime; free -h; df -h; du -sh * | sort -h | tail -20
```

---

## 🧹 Форматирование и линтинг

```bash
# Python
black .; isort .; ruff check . --fix; mypy .; flake8

# JS/TS
npx prettier --write .; npx eslint . --fix

# pre-commit
pip install pre-commit
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
pre-commit install; pre-commit run --all-files
```

---

## 🗃️ Базы данных

```bash
# psql
psql -U postgres -h localhost -d mydb
\dt; \d table; SELECT * FROM users LIMIT 10;
pg_dump mydb > dump.sql; psql mydb < dump.sql

# sqlite
sqlite3 db.sqlite "SELECT * FROM users;"
sqlite3 db.sqlite .dump > dump.sql

# redis
redis-cli
> SET foo bar; GET foo; KEYS *; FLUSHALL
redis-cli --scan --pattern "user:*"

# mongo
mongosh
> db.users.find({age: {$gt: 20}}).limit(5)
> db.users.aggregate([{$group: {_id: "$city", count: {$sum:1}}}])
```

---

## 🔧 Полезные однослойники

```bash
# Найти и убить процесс на порту 3000
lsof -ti:3000 | xargs kill -9

# Пакетно переименовать .txt -> .md
for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# Скачать сайт рекурсивно
wget --mirror --convert-links --page-requisites https://example.com

# Сгенерить QR в терминале
qrencode -t ANSI "https://example.com"

# Показать погоду
curl wttr.in/Moscow

# Бенчмарк диска
dd if=/dev/zero of=test bs=64k count=16k conv=fdatasync; rm test
```

---

*Гайды — шпаргалки. Август 2026. PR welcome.*


---

## 🎨 FFmpeg & ImageMagick

```bash
# FFmpeg — конвертация
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac output.mp4
ffmpeg -i input.mp4 -ss 00:00:10 -t 00:00:05 -c copy clip.mp4
ffmpeg -i input.mp4 -vf scale=1280:720 -c:a copy 720p.mp4
ffmpeg -i video.mp4 -vn -c:a mp3 audio.mp3
ffmpeg -f concat -i list.txt -c copy merged.mp4
# list.txt:
# file 'a.mp4'
# file 'b.mp4'

# Извлечь кадры
ffmpeg -i video.mp4 -vf fps=1 thumb%03d.jpg

# Склеить аудио + картинка -> видео
ffmpeg -loop 1 -i image.jpg -i audio.mp3 -c:v libx264 -tune stillimage -c:a aac -shortest out.mp4

# ImageMagick
convert input.jpg -resize 800x600 -quality 85 output.jpg
convert input.png -resize 256x256 favicon.png
montage *.jpg -tile 3x3 -geometry +5+5 collage.jpg
convert -delay 100 -loop 0 *.png anim.gif
identify image.jpg; exiftool image.jpg
```

---

## 📦 Архиваторы и передача

```bash
# 7z
7z a arch.7z dir/; 7z x arch.7z; 7z l arch.7z

# rsync продвинутый
rsync -avz --delete --exclude='.git' --exclude='node_modules' ./src/ user@host:/app/
rsync -avz --progress bigfile.zip user@host:/tmp/

# scp / sftp
scp file.txt user@host:/tmp/
scp -r dir/ user@host:/tmp/
sftp user@host
# sftp> put file.txt; get file.txt; ls; cd /tmp

# rclone (облака)
rclone copy ./data remote:bucket --progress
rclone sync ./data remote:bucket --dry-run
```

---

## 🧭 tmux — продвинутый

```bash
# Конфиг ~/.tmux.conf
set -g mouse on
set -g history-limit 50000
bind r source-file ~/.tmux.conf \; display "Reloaded"
set -g status-bg colour235
set -g status-fg colour136

# Сессии
tmux new -s dev -d
tmux send-keys -t dev "npm run dev" C-m
tmux attach -t dev
tmux ls; tmux kill-server

# Окна и панели — мышь и клавиатура
# Ctrl+b + , — переименовать окно
# Ctrl+b + w — список окон
# Ctrl+b + z — зум панели
# Ctrl+b + { / } — двигать панель
# Ctrl+b + ! — панель в окно
```

---

## 🐚 Zsh & Oh My Zsh

```bash
# Установка
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# Плагины ~/.zshrc
plugins=(git zsh-autosuggestions zsh-syntax-highlighting docker)
# Темы
ZSH_THEME="agnoster"

# Алиасы
alias gs='git status -sb'
alias gl='git log --oneline --graph --all -15'
alias dc='docker compose'
alias k='kubectl'
alias ll='ls -la --color'

# fzf (поиск)
# Ctrl+R — история, Ctrl+T — файлы, Alt+C — cd
```

---

## 🔒 GPG & SSH — продвинутый

```bash
# GPG
gpg --full-generate-key  # RSA 4096
gpg --list-secret-keys --keyid-format LONG
gpg --armor --export <keyid> > pub.asc
echo "test" | gpg --clearsign

# SSH config ~/.ssh/config
Host github
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  AddKeysToAgent yes

Host prod
  HostName 1.2.3.4
  User deploy
  Port 2222
  IdentityFile ~/.ssh/prod_ed25519

# ssh-copy-id
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host
```

---

## 🧰 Makefile — продвинутый

```makefile
# Переменные и условности
APP := myapp
PORT ?= 3000
ENV ?= dev

ifeq ($(ENV),prod)
  FLAGS := --optimize
else
  FLAGS := --debug
endif

# Цели
build:
	docker build -t $(APP):$(ENV) .

run:
	docker run -p $(PORT):3000 $(APP):$(ENV)

test:
	pytest -q

lint:
	ruff check . && mypy .

deploy: test
	./deploy.sh $(ENV)

clean:
	rm -rf dist/ build/ .pytest_cache/
```

---

## 📝 Markdown — шпаргалка

```markdown
# H1 ## H2 ### H3
**жирный** *курсив* ~~зачёркнуто~~ `код`
[ссылка](https://example.com) ![картинка](img.jpg)
- список
1. нумерованный
> цитата
| a | b |
|---|---|
| 1 | 2 |
- [x] задача
---
`inline code`

\`\`\`python
print("hi")
\`\`\`
```

---

## 🔎 Регулярки (regex) — мини-гайд

```bash
# Базовые
.       # любой символ
^ $     # начало/конец
\d \w \s # цифра/буква/пробел
* + ? {2,4} # повторения
[abc] [a-z] [^0-9] # классы
(a|b)   # или
\b     # граница слова

# Примеры
# email: ^[\w.+-]+@[\w-]+\.[a-z]{2,}$
# grep -P (Perl)
grep -P "^\d{4}-\d{2}-\d{2}" file
# sed
echo "a1b2" | sed -E 's/[0-9]+/NUM/g'  # aNUMbNUM
```

---

## 🐍 Python — сниппеты

```python
# list/dict comprehension
squares = [x*x for x in range(10) if x%2==0]
invert = {v:k for k,v in d.items()}

# dataclass
from dataclasses import dataclass
@dataclass
class User:
    name: str
    age: int = 0

# context manager
from contextlib import contextmanager
@contextmanager
def open_file(path):
    f=open(path)
    try: yield f
    finally: f.close()

# argparse
import argparse
p=argparse.ArgumentParser()
p.add_argument('--port', type=int, default=3000)
args=p.parse_args()

# requests
import requests
r=requests.get("https://api.github.com", timeout=10)
r.raise_for_status()
print(r.json())

# asyncio
import asyncio
async def fetch():
    await asyncio.sleep(1)
    return 42
asyncio.run(fetch())
```

---

*Расширенные гайды — 1000+ строк. Август 2026.*
