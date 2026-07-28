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
