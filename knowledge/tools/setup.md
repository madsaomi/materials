# Инструменты и настройка базы знаний

Настройка для удобной работы с базой: Obsidian, VSCode, Git, автоматизация.

---

## 1. Obsidian

### 1.1 Почему Obsidian

- **Локальные файлы** — всё лежит в папке `knowledge/`, не привязаны к платформе
- **Markdown** — единый формат, читается везде
- **Граф** — визуализация связей между заметками
- **Backlinks** — автоматические обратные ссылки
- **Плагины** — тысячи community плагинов
- **Бесплатно** — для личного использования

### 1.2 Структура в Obsidian

```
knowledge/
├── index.md                    ← Домашняя страница (MOC)
├── languages/
│   ├── japanese.md
│   ├── chinese.md
│   └── korean.md
├── programming/
│   ├── python.md
│   ├── go.md
│   └── javascript.md
├── philosophy/
│   ├── eastern.md
│   └── western.md
├── books/
│   ├── read.md
│   ├── wishlist.md
│   └── notes.md
```

### 1.3 Рекомендуемые плагины

| Плагин | Назначение |
|--------|-----------|
| **Dataview** | SQL-подобные запросы по заметкам (таблицы, списки) |
| **Templater** | Шаблоны для новых заметок |
| **Quick Add** | Быстрое добавление записей |
| **Excalidraw** | Рисование диаграмм и схем |
| **Kanban** | Доски для планирования | 
| **Calendar** | Ежедневные заметки |
| **Spaced Repetition** | SRS повторение (Anki в Obsidian) |
| **Obsidian Git** | Автоматический commit/push по расписанию |
| **Tag Wrangler** | Управление тегами |
| **Outliner** | Работа с индентацией |
| **Paste URL into selection** | Вставка ссылок из буфера |

### 1.4 Шаблоны

**Шаблон для заметки о книге (Templater):**
```markdown
---
created: <% tp.date.now() %>
author: <% tp.system.prompt("Author") %>
rating: 
status: unread
tags: book
---

# <% tp.file.title %>

## О чём книга


## Ключевые идеи


## Цитаты


## Рецензия
```

**Шаблон для языковой заметки:**
```markdown
---
created: <% tp.date.now() %>
language: <% tp.system.suggester(["Japanese", "Chinese", "Korean"]) %>
tags: language/vocabulary
---

# <% tp.file.title %>

## Слово / Выражение
- **Язык:** 
- **Значение:** 
- **Чтение:** 
- **Пример:** 

## Заметки
```

### 1.5 Dataview запросы

```dataview
# Все книги со статусом "читать"
TABLE author, rating
FROM "knowledge/books"
WHERE status = "to-read"
SORT rating DESC

# Все заметки по японскому
TABLE language
FROM "knowledge/languages/japanese"
SORT file.name ASC

# Количество заметок по каждому языку
TABLE length(rows) AS count
FROM "knowledge/languages"
GROUP BY language
```

---

## 2. VSCode

### 2.1 Плагины для работы с Markdown

| Плагин | Назначение |
|--------|-----------|
| **Markdown All in One** | Форматирование, оглавление, сниппеты |
| **Markdown Preview Enhanced** | Превью с графиками, mermaid |
| **Foam** | Навигация (backlinks, граф) |
| **YAML** | Подсветка YAML frontmatter |
| **Spell Checker** | Проверка орфографии |
| **GitLens** | Git интерактивный (blame, history) |
| **Remote - SSH** | Работа на сервере |

### 2.2 Settings для Markdown

```json
// settings.json
{
  "editor.wordWrap": "on",
  "editor.minimap.enabled": false,
  "markdown.preview.breaks": true,
  "[markdown]": {
    "editor.defaultFormatter": "yzhang.markdown-all-in-one"
  },
  "git.autofetch": true,
  "files.autoSave": "onFocusChange"
}
```

---

## 3. Git workflow

### 3.1 Ежедневный автоматический push

```bash
# script: daily-sync.sh
cd /path/to/materials
git add -A
git commit -m "daily: $(date +%Y-%m-%d)" || true
git push
```

**Cron (ежедневно в 20:00):**
```cron
0 20 * * * /path/to/daily-sync.sh
```

### 3.2 Obsidian Git (plugin)

- Установить плагин **Obsidian Git**
- Настроить auto-commit каждые N минут (например, 30)
- Auto-pull при старте
- Всё автоматически сохраняется в Git

### 3.3 Полезные команды

```bash
# Статус
git status --short

# Смотреть изменения
git diff --stat

# Последние коммиты
git log --oneline -10

# Откатить файл
git checkout -- path/to/file.md
```

---

## 4. Навигация

### 4.1 Search (VSCode)

- `Ctrl+P` — поиск файлов
- `Ctrl+Shift+F` — поиск по содержимому (regex)
- `@` — поиск по заголовкам внутри файла
- `#` — поиск по символам

### 4.2 Теги

Рекомендуемая система тегов:
- `#language/japanese`, `#language/chinese`, `#language/korean`
- `#programming/python`, `#programming/go`, `#programming/javascript`
- `#philosophy/eastern`, `#philosophy/western`
- `#book/fiction`, `#book/nonfiction`, `#book/philosophy`
- `#status/learning`, `#status/complete`, `#status/todo`
- `#type/note`, `#type/reference`, `#type/snippet`

### 4.3 MOC (Map of Content)

Главная `knowledge/index.md` — точка входа:
```markdown
# База знаний

## Languages
- [[japanese|Японский]]
- [[chinese|Китайский]]
- [[korean|Корейский]]

## Programming
- [[python|Python]]
- [[go|Go]]
- [[javascript|JavaScript]]

## Philosophy
- [[eastern|Восточная]]
- [[western|Западная]]

## Books
- [[read|Прочитанные]]
- [[wishlist|Вишлист]]
- [[notes|Заметки]]
```

---

## 5. Markdown стиль

```markdown
# Заголовок 1
## Заголовок 2
### Заголовок 3

- список
- список

1. нумерованный
2. список

**жирный**
*курсив*
~~зачёркнутый~~
`код`
> цитата

| Таблица | Колонка 2 |
|---------|-----------|
| данные  | данные    |

[Ссылка](url)
![Картинка](url)

---
<-- горизонтальная линия

- [ ] чекбокс
- [x] сделано
```

---

## 6. Резервное копирование

База хранится в Git на GitHub — это уже бэкап. Дополнительно:

```bash
# Ручной экспорт всей базы
tar -czf knowledge-backup-$(date +%Y%m%d).tar.gz knowledge/

# Автоматический бэкап на внешний диск (cron)
0 3 * * 0 tar -czf /backup/knowledge-$(date +%Y%m%d).tar.gz /path/to/knowledge/
```

---

## 7. Работа на мобильном

- **Obsidian Mobile** (iOS/Android) — редактирование на телефоне
- **GitJournal** — быстрые заметки → Git
- **Working Copy** (iOS) — Git клиент
- **Termux** (Android) — терминал с Git

---

## 8. Настройка нового компьютера 🖥️

Пошаговый чек-лист развёртывания машины «с нуля». Логика: сначала ОС, потом базовая среда, потом разработка, потом утилиты. Не торопиться — шаг за шагом.

### 8.1 Этап 0. До переустановки ⚠️

Прежде чем стирать диск:

- [ ] Закоммитить и запушить все репозитории (`git status` в каждом)
- [ ] Синхронизировать Obsidian (Obsidian Git → push)
- [ ] Экспортировать пароли из менеджера (или убедиться, что master-пароль в памяти)
- [ ] Собрать SSH-ключи: `.ssh/id_ed25519` и `.ssh/id_ed25519.pub`
- [ ] Собрать конфиги: `~/.gitconfig`, `~/.bashrc` / `~/.zshrc`, `settings.json` VSCode
- [ ] Сделать полный бэкап по правилу 3-2-1 (см. раздел 12)
- [ ] Записать список установленного ПО — поможет чек-лист раздела 14

> 💡 Даже если просто обновляешься до новой ОС, прогони этот список. Забытый SSH-ключ = не пушится ничего.

### 8.2 ОС

| ОС | Как ставить | Нюансы |
|----|-------------|--------|
| **Windows** | ISO с официального сайта, Rufus → USB | Учитывай Windows Hello (биометрия). После установки: включить BitLocker |
| **macOS** | App Store / восстановление через сеть | APFS + FileVault включается при первом запуске |
| **Linux (Ubuntu/Debian)** | ISO → USB (Rufus / balenaEtcher) | LUKS-шифрование на этапе разметки диска. Выбрать демон-сетевой (networkd) |

Первое после установки системы:
1. Обновить систему (Windows Update / `sudo apt update && sudo apt upgrade -y`)
2. Включить шифрование диска (BitLocker / FileVault / LUKS)
3. Настроить учётку (без microsoft-зависимостей, если можно)
4. Проверить появление обновлений драйверов

### 8.3 Базовая среда 🧰

Слой 1 — всё, с чем работаешь руками:

| Компонент | Windows | macOS | Linux |
|-----------|---------|-------|-------|
| **Терминал** | Windows Terminal + PowerShell 7 | iTerm2 / встроенный Terminal | Kitty / Alacritty / встроенный |
| **Шелл** | PowerShell 7 / Git Bash | zsh + oh-my-zsh | zsh + oh-my-zsh / fish |
| **Редактор** | VSCode / Neovim | VSCode / Neovim | VSCode / Neovim |
| **Браузер** | Firefox / Edge / Brave | Firefox / Safari | Firefox / Chromium |
| **Менеджер паролей** | KeePassXC / Bitwarden | Bitwarden | KeePassXC / Bitwarden |
| **Заметки** | Obsidian | Obsidian | Obsidian |

Установка через пакетный менеджер (быстрее, чем с сайтов):

```bash
# Windows: winget (встроен в Windows 11)
winget install Microsoft.WindowsTerminal
winget install Microsoft.PowerShell
winget install Microsoft.VisualStudioCode
winget install Mozilla.Firefox
winget install obsidian.obsidian

# macOS: Homebrew
brew install --cask visual-studio-code firefox obsidian bitwarden
brew install --cask iterm2

# Linux: apt (Ubuntu/Debian)
sudo apt install -y vscode firefox
sudo snap install obsidian
```

> 📦 Правило: **всё через менеджер пакетов**, кроме случаев, когда ПО ставится только установщиком (например, некоторые VPN-клиенты).

### 8.4 Разработка: Git + SSH 🔑

```bash
# 1. Установить Git (пример: Ubuntu)
sudo apt install -y git

# 2. Настроить идентичность — обязательно!
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 3. Сгенерировать SSH-ключ (ed25519 — современный стандарт)
ssh-keygen -t ed25519 -C "you@example.com"

# 4. Добавить публичный ключ на GitHub/Settings/SSH keys
cat ~/.ssh/id_ed25519.pub

# 5. Проверить подключение
ssh -T git@github.com
# → "Hi Your Name! You've successfully authenticated..."
```

Настройка `.gitconfig` по вкусу:

```ini
[user]
    name = Your Name
    email = you@example.com
[init]
    defaultBranch = main
[core]
    editor = code --wait
[push]
    autoSetupRemote = true
[alias]
    s = status --short
    l = log --oneline --graph
    c = commit -m
```

### 8.5 Языки и менеджеры пакетов 🧑‍💻

| Язык | Runtime | Менеджер пакетов | Установка |
|------|---------|-------------------|-----------|
| **Go** | go | (встроен в модуль) | `winget install GoLang.Go` / `brew install go` / `apt install golang` |
| **Python** | python | pip + venv / uv | скачать с python.org (галка «Add to PATH»!) или `winget install Python.Python.3.12` |
| **Rust** | rustc/cargo | cargo | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **Node.js** | node | npm → pnpm | `winget install OpenJS.NodeJS.LTS` / nvm → `nvm install --lts` |

Рекомендации по управлению версиями:

- **Python**: никогда не ставить глобально пакеты через pip. Всегда виртуальное окружение:
  ```bash
  python -m venv .venv
  source .venv/bin/activate      # Linux/macOS
  .venv\Scripts\activate         # Windows (PowerShell)
  pip install -U pip
  ```
- **Node**: использовать `nvm` (node version manager) — переключение версий:
  ```bash
  nvm install --lts
  nvm use --lts
  npm i -g pnpm   # pnpm быстрее npm
  ```
- **Rust**: обновление через `rustup update` (не вручную!)
- **Go**: менеджер версий не обязателен — `go install golang.org/dl/go1.22.0@latest` если нужно несколько версий

### 8.6 Утилиты 🛠️

```
# Кроссплатформенные must-have
curl, wget            — сетевые запросы
jq                    — JSON в консоли
ripgrep (rg)          — быстрый поиск в файлах
fd                    — быстрый find
fzf                   — нечёткий поиск по истории/файлам
bat                   — cat с подсветкой
git, gh               — Git + GitHub CLI
htop / btop           — мониторинг процессов
tmux (Linux/macOS)    — терминальные сессии
```

Установка через пакетный менеджер (примеры):

```bash
# macOS
brew install jq ripgrep fd fzf bat gh tmux

# Ubuntu
sudo apt install -y jq ripgrep fd-find fzf bat gh tmux

# Windows (winget)
winget install jqlang.jq BurntSushi.ripgrep.MSVC sharkdp.fd cli.github.cli xterm.htop
```

### 8.7 Чек-лист быстрого старта ✅

После установки всего — прогони тест окружения (раздел 14), но базово это выглядит так:

- [ ] Терминал открывается и работает
- [ ] `git version` отвечает
- [ ] `ssh -T git@github.com` пускает без пароля (ключ добавлен)
- [ ] Менеджер паролей разблокирован
- [ ] Obsidian открывает папку `knowledge/`
- [ ] Go/Python/Rust/Node запускают `hello world` (раздел 14.3)

---

## 9. Пайплайн разработки 🔄

Здесь — что делать, когда начинаешь новый проект: от репозитория до «оно запускается».

### 9.1 Настройка репозитория на GitHub

**Через CLI (`gh`):**
```bash
mkdir my-project && cd my-project
git init
# ...создать файлы (см. ниже)...

# Создать репозиторий на GitHub и запушить
gh repo create my-project --public --source . --push
```

**Через веб-интерфейс:**
1. New repository → имя, описание, License/README/.gitignore сразу при создании
2. `git remote add origin git@github.com:USER/my-project.git`
3. `git add -A && git commit -m "init" && git push -u origin main`

### 9.2 README.md — лицо проекта

Минимальный шаблон:

```markdown
# my-project

Одно предложение о том, что это и зачем.

## Установка
```bash
# команды, чтобы поставить
pnpm install
```

## Использование
```bash
pnpm dev
# открыть http://localhost:3000
```

## Структура
- `src/` — исходники
- `tests/` — тесты

## Лицензия
MIT
```

> 💡 README пишется **до** того, как проект станет популярным: самому себе через 3 месяца тоже понадобится.

### 9.3 .gitignore — что НЕ коммитить

```gitignore
# Зависимости
node_modules/
venv/
.venv/
vendor/
target/

# Билды и кэш
dist/
build/
*.pyc
__pycache__/
.cache/

# Окружение и секреты
.env
.env.*
!*.env.example
*.key
*.pem

# IDE и ОС
.vscode/
.idea/
.DS_Store
Thumbs.db

# Логи
*.log
```

> 🔐 Секреты в Git не попадают **никогда**. Даже в приватный репозиторий. `.env` всегда в `.gitignore`, примеры — в `.env.example`.

### 9.4 LICENSE

- Для личных/публичных проектов по умолчанию — **MIT**
- GitHub: проще всего выбрать лицензию прямо при создании репозитория
- Или добавить файл `LICENSE` с текстом MIT-лицензии (год, твоё имя)

### 9.5 CI — автоматизация проверок (GitHub Actions)

Пример для Node-проекта `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

Идеи для CI:

| Проект | Инструмент | Запуск |
|--------|-----------|--------|
| Python | `ruff check .` + `pytest` | `pip install -r requirements-dev.txt` |
| Go | `go vet ./...` + `go test ./...` | `golangci-lint run` |
| Rust | `cargo clippy -D warnings` + `cargo test` | `rustfmt --check` |
| Node | `eslint .` + `vitest/jest` | `pnpm lint && pnpm test` |

### 9.6 Локальная разработка: pre-commit и линтеры 🧹

**pre-commit** — хуки, которые гоняются перед каждым коммитом:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

Установка:

```bash
pip install pre-commit
pre-commit install          # установить хуки в репозиторий
pre-commit run --all-files  # прогнать один раз
```

Стандартные линтеры по языку:

| Язык | Линтер/форматтер | Команда |
|------|------------------|---------|
| Python | ruff | `ruff check .` |
| Python | black (форматтер) | `black .` |
| Go | gofmt + golangci-lint | `gofmt -l .` |
| Rust | rustfmt + clippy | `cargo clippy -- -D warnings` |
| JS/TS | eslint + prettier | `npx eslint .` |

### 9.7 Деплой: первые шаги 🚀

«Деплой» = опубликовать приложение, чтобы его видел не только локальный компьютер.

| Способ | Для чего | Как |
|--------|----------|-----|
| **GitHub Pages** | статика, демо | Включить Pages в настройках репо, публиковать из ветки `main` или через Actions |
| **Vercel / Netlify** | frontend | Push → авто-деплой. Подключить репозиторий на сайте |
| **Хостинг с SSH (VPS)** | бэкенд, базы | `rsync` файлы → `systemd` сервис |
| **Docker** | переносимость | `docker build -t app .` → `docker run -p` |

Минимальный rsync-деплой на VPS:

```bash
# собрать и перенести
rsync -avz --delete ./dist/ user@server:/var/www/app/

# перезапустить сервис
ssh user@server "sudo systemctl restart app"
```

> 🧭 Деплой для персональных проектов не обязан быть большим. Рабочий минимум: **статика → Pages/Netlify**, **сервис → VPS + systemd**.

---

## 10. Окружение для изучения языков 🌏

Как устроена программная среда под изучение японского/китайского/корейского и как она связана с этой базой. Отдельные разборы инструментов — в `details.md`.

### 10.1 Anki — настройка колоды

Anki = карточки с интервальным повторением (SRS). Ставится на все ОС, синхронизация через AnkiWeb.

**Важные настройки (Tools → Preferences):**
- **Daily new cards limit**: 20 для языка — много, 10 — норм, 5 — спокойный темп
- **Maximum reviews/day**: 200 (чтобы не копить долги)
- Включить **FSRS-планировщик** (новый алгоритм интервалов, точнее классического)

**Структура колод для языка:**

```
Японский
├── Кана (хирагана, катакана)
├── Лексика_1K
├── Лексика_2K
├── Грамматика
├── Кандзи
└── Предложения (из LingQ/чтения)
```

> 💡 Маленьких колод много — лучше одной гигантской: проще увидеть, что не успеваешь.

### 10.2 Anki — интервалы повторения

Классические настройки интервалов (Deck → Options):

| Настройка | Значение | Смысл |
|-----------|----------|-------|
| Starting ease | 250% | начальный множитель интервала |
| Interval modifier | 100% | глобальный замедлитель/ускоритель |
| New interval | 30% | интервал после «забыл» |
| Maximum interval | 365 дней | не уводить в бесконечность |

Расписание при новых карточках:
- Начальный интервал: **1 день** (покажи завтра)
- После успеха: 1 → 3 → 8 → 20 → 50 → 90 → 180 → 365 (примерно)
- FSRS подстраивает интервалы под твою статистику автоматически

Правила здоровой работы:
- Интервалы **не трогать** каждый день; конфигурация меняется редко
- Если тонешь в долгах — снижай *new cards*, а не убегай от реviews
- Пропущенный день ≠ катастрофа: FSRS сам «скостит» просроченное

### 10.3 Anki — add-ons

| Add-on | Код | Назначение |
|--------|-----|-----------|
| **AnkiConnect** | `2055492159` | программный доступ (интеграция с LingQ, словарями) |
| **Ajatt-Tools** | `2112374373` | целый набор для изучения языков (распознавание, термины) |
| **Recognition** | `452030702` | подчёркивание известных слов в аниме/тексте (елишь) |
| **Review Heatmap** | `1771074083` | тепловая карта активности, мотивация не срывать серию |
| **No "Don't forget" button** | `1615864958` | убрать соблазн облегчать себе жизнь |

Установка: Инструменты → Дополнения → Получить аддоны → вставить код → Перезапустить.

### 10.4 LingQ / Immersion

**LingQ** — платформа иммерсийного чтения/аудирования:
- Импортируешь тексты (статьи, субтитры, книги), читаешь и кликаешь незнакомые слова
- Слова становятся «линками» — LingQ ведёт словарь, показывает их по мере накопления
- Режим **SRS** в LingQ можно отключить, если карточки делаешь в Anki

**Immersion (AJATT-подход):**
```
Иммерсия = простое потребление понятного контента
  1. Контент (YouTube, Netflix, манга) — бо́льшая часть
  2. Активное чтение (LingQ/словари) — меньшее
  3. Повторение (Anki) — минимальное, но регулярное
```

Советы:
- **Anki** — только узнавание (распознавание) слова, а не «сделай перевод»
- Майнкрафт правил: 70% иммерсии на уровень чуть выше текущего, чтобы непрестанно пересекаться с уже знакомым?
- 🔁 Связь: новые слова из LingQ → экспорт в Anki (через AnkiConnect или вручную) → контекст остаётся в заметках базы

### 10.5 Словари

| API/сайт | Язык | Для чего |
|----------|------|----------|
| **Jisho** | японский | основной EN→JP словарь |
| **有道 (Youdao)** | китайский | zh словарь + распознавание иероглифов |
| **NAVER Dictionary** | корейский/японский | лучший для актуальных слов |
| **Wiktionary** | все | этимология, чтения, примеры |
| **AnkiConnect + dictio** | — | автоподстановка определения в карточку |

Совет: один основной словарь на язык. Много вкладок = мало эффективности.

### 10.6 Связь с языковым разделом базы 📚

Всё это должно сходиться в `knowledge/languages/*`:

```
languages/
├── japanese.md     ← план, ресурсы, прогресс
├── chinese.md
└── korean.md
```

- Заметки по словам [1.2] — это «живой словарь» базы; Anki — та же информация в виде карточек
- Канбан/таск для языков: модуль «читать N страниц», «новые 20 слов»
- Мета-данные: `language: japanese`, `tags: language/vocabulary` — по ним Dataview строит списки

Шаблон языковой заметки уже в [1.4]. Если дублируешь карточку в Anki — добавь в линк-ссылку `[[japanese word]]`, чтобы не потерять контекст.

---

## 11. Окружение для Obsidian-хранилища 🗂️

Дополнение к разделу 1 — про современные рекомендации именно для этого хранилища.

### 11.1 Рекомендуемые плагины (дополнено)

| Плагин | Зачем именно тут |
|--------|------------------|
| **Obsidian Git** | синхронизация базы через GitHub, см. [11.4] |
| **Dataview** | таблицы «все книги», «слова по языку» |
| **Templater** | шаблоны заметок, [1.4] |
| **Quick Add** | быстрое «добавить слово/книгу» без лишних кликов |
| **Spaced Repetition** | SRS для кандзи/слов прямо в Obsidian |
| **Calendar** + **Periodic Notes** | ежедневные заметки-логи |
| **Excalidraw** | схемы, карта японского алфавита, связи |
| **Tag Wrangler** | управление тегами в большом хранилище |
| **Recent Files** | быстрый возврат к текущим заметкам |
| **Word Count** | считать слова по языку (мотивация) |

### 11.2 Шаблоны

Папка `knowledge/_templates/` — общий `frontmatter`:

```markdown
---
created: <% tp.date.now("YYYY-MM-DD") %>
status: learning
tags: 
---
```

Принципы:
- Все шаблоны в одной папке `_templates/`, чтобы базу не мусорить
- Frontmatter обязателен: по нему строятся Dataview-запросы
- Global-hotkey «Empty note» (Ctrl+N) — простая заметка без шаблона

### 11.3 Горячие клавиши

| Действие | Хоткей |
|----------|--------|
| Быстрая заметка (Quick Note) | `Ctrl+Shift+N` |
| Новый файл в папке | `Ctrl+N` |
| Палитра команд | `Ctrl+P` (в Obsidian — по умолчанию) |
| Открыть ссылку/бэклинг | `Ctrl+Click` |
| Режим чтения/редактирования | `Ctrl+E` |
| Выделение жирным/курсивом | `Ctrl+B` / `Ctrl+I` |
| Вставка wiki-ссылки | `[[` |
| Поиск по хранилищу | `Ctrl+Shift+F` |

### 11.4 Синхронизация Git + Obsidian 🪄

Как связать хранилище с GitHub:

```
1. Репозиторий (private) на GitHub: knowledge
2. Obsidian открывает папку как Vault
3. Плагин Obsidian Git:
   - auto-commit interval: 30 минут
   - auto-pull: при старте
   - commit message: "obsidian: {{date}}"
4. SSH-ключи на машине + GitHub (для обеих: desktop и mobile — если нужно)
```

Ветки и конфликты: если правишь с двух устройств, конфликт возможен. Obsidian Git их показывает маркерами `<<<<<<< HEAD` — разрешай вручную (см. details.md).

> 🔍 Если конфликты часты — сделай это правилом: **на телефоне редко и маленькими заметками**, на компьютере — основная работа.

### 11.5 Настройка под эту базу

- Структура папок уже в разделе 1.2; новые вложения — `knowledge/_assets/` (не в корень!)
- Мусор сортировать еженедельно: заметки без тегов, битые ссылки (`Unlinked files`)
- Полная архивация базы — раздел 6
- Посмотреть связность: **Graph view**, цветной по языкам (палитра по тегам)

---

## 12. Безопасность 🔐

### 12.1 Резервные копии

База в Git = бэкап **истории** (все версии файлов). Но Git не спасает от:
- потери всех веток сразу (rar-фейл локального диска)
- удаления приватного репозитория
- ошибочного `git push --force`

Правило: **не меньше двух частей с данными + одна вне дома**.

### 12.2 Правило 3-2-1

> 📌 **3** копии данных · **2** разных носителя · **1** копия вне дома

| Копия | Пример |
|-------|--------|
| Кустоящая (рабочая) | файлы на ноутбуке |
| Локальный бэкап | внешний диск / второй PC |
| Внешний бэкап | GitHub (rent), облако (Drive/Dropbox), NAS родительского дома |

Схема для этой базы:

```
Рабочая копия ──> GitHub (репозиторий, вне дома ✅)
      │
      └──> Внешний диск (еженедельный tar.gz, [6])
              └──> (по желанию) облако с шифрованием
```

Автоматизация локального бэкапа:

```bash
# Windows: robocopy в планировщике
robocopy C:\path\to\knowledge E:\backup\knowledge /MIR /R:2 /W:5

# macOS/Linux: rsync + cron
rsync -av --delete ~/knowledge/ /backup/knowledge/
```

### 12.3 Шифрование диска 💾

| ОС | Инструмент | Как включить |
|----|------------|--------------|
| Windows | **BitLocker** | Настройки → Конфиденциальность → Шифрование устройства; работает на Pro, для Home — `manage-bde` |
| macOS | **FileVault** | Системные настройки → Конфиденциальность → FileVault → включить |
| Linux | **LUKS** | при установке ОС; включить уже после — сложнее |

Правила:
- Включить **сразу** после установки системы
- Ключ/пароль от шифрования — записать в менеджер паролей или бумагу (не в файл репо!)
- BitLocker recovery key — сохранить в аккаунте Microsoft **и** отдельно

### 12.4 Менеджеры паролей

| Сфера | Лучший выбор | Почему |
|-------|--------------|--------|
| Простота для новичка | **Bitwarden** | бесплатно, кроссплатформенно, опенсорс |
| Полный контроль (твой конспект) | **KeePassXC** | база — файл `.kdbx`, без облака |
| Если всё в экосистеме Apple | Sierra в iCloud Keychain | встроено, не нужен VPN-пароль для всего |

Практика:
- Уникальный пароль на каждую площадку (менеджер сам предлагает 20+ символов)
- Master-пароль — самый длинный и запоминаемый, менять не нужно часто
- Менеджер хранит: логины, ключи API, бэкап-пароль, recovery keys

### 12.5 Двухфакторка (2FA) 📱

| Сфера | Какой TOTP | Примечание |
|-------|-----------|------------|
| GitHub | **2FA обязательно** | привязать к app (не SMS) |
| Email-аккаунты | включить | email = точка восстановления всех паролей |
| Банки/платежи | app или ключ | не все поддерживают приложения |

Где хранить коды: в менеджере паролей рядом с логином, или отдельно — Aegis (Android), Ente Auth, и т.д. SMS — только за неимением лучшего (SIM-своп).

### 12.6 VPN 🛡️

Зачем нужен именно тебе:
- публичный Wi-Fi (кофейни, поезда) — защита от перехвата
- обход геоблокировки при иммерсии (когда хочется смотреть контент из другой страны — анон VPN-провайдеры хорошо справляются)
- скрытие IP от универсальной рекламы

Выбор:
| Фактор | Критерий |
|--------|----------|
| Логи | не хранить логи — принципальный пункт |
| Протокол | WireGuard (быстрее и новее OpenVPN) |
| Стоимость | 3-5$ в месяц — разумно; бесплатные лучше обходить |

> ⚠️ VPN ≠ анонимность. Это защита соединения и смена гео, не больше.

---

## 13. Автоматизация 🤖

Всё, что делаешь руками чаще трёх раз — кандидат на скрипт.

### 13.1 Скрипты повседневной автоматизации

**Личная задача базы — «ежедневный sync» уже есть (раздел 3).** Плюс полезно:

```bash
# new-note.sh — создать заметку с шаблоном и открыть в Obsidian
#!/usr/bin/env bash
TITLE="${1:-$(date +%Y-%m-%d)}"
FOLDER="${2:-daily}"
mkdir -p "knowledge/$FOLDER"
FILE="knowledge/$FOLDER/$TITLE.md"
[ -f "$FILE" ] || echo "---
created: $(date +%Y-%m-%d)
status: learning
---
" > "$FILE"
code "$FILE"
```

```bash
# backup.sh — всё в одно: git push + архив на диск
#!/usr/bin/env bash
set -euo pipefail
cd ~/knowledge
git add -A && git commit -m "daily: $(date +%F)" || true
git push
tar -czf "/backup/knowledge-$(date +%F).tar.gz" .
```

### 13.2 bash vs PowerShell

| Фактор | bash (Linux/macOS) | PowerShell (Windows) |
|--------|---------------------|----------------------|
| Синтаксис | компактный, `$var` | явный, `$var` + `Write-Host` |
| Фильтрация | `grep`, `awk`, `sed` | `Select-String`, `Where-Object` |
| Файлы | `ls`, `cp`, `rm` | `Get-ChildItem`, `Copy-Item` |
| Запуск скриптов | `chmod +x` + `./` | `.\script.ps1` (после Bypass) |

Windows: разрешить выполнение скриптов один раз:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 13.3 cron / планировщик задач ⏰

**Linux/macOS — cron:**
```cron
# минута час день месяц день_недели  команда
0 20 * * * ~/.local/bin/daily-sync.sh      # каждый день в 20:00
0 8 * * 1  ~/.local/bin/weekly-report.sh   # каждый понедельник в 8:00
*/30 * * * * ~/.local/bin/pull-git.sh      # каждые 30 минут
```

**Windows — Планировщик задач (Task Scheduler):**
1. Создать задачу → запускать по расписанию
2. Действие: `powershell.exe -File C:\scripts\daily-sync.ps1`
3. Триггер: ежедневно в 20:00

> 💡 macOS: активация cron иногда требует разрешения в «Конфиденциальность»; альтернатива — `launchd` (см. глоссарий).

### 13.4 Дефолтные скрипты для рутины 📦

| Скрипт | Что делает | Когда нужен |
|--------|------------|-------------|
| `daily-sync.sh` | git add/commit/push базы | каждый день |
| `backup.sh` | база → архив на диск | еженедельно |
| `new-note.sh` | новая заметка по шаблону | по необходимости |
| `update-system.sh` | обновление всех пакетов | еженедельно |
| `clean-tmp.sh` | почистить temp/кэш | раз в месяц |
| `check-env.sh` | прогон чек-листов раздела 14 | после установки / при ошибке |

Пример `update-system.sh` (Ubuntu):

```bash
#!/usr/bin/env bash
set -e
sudo apt update && sudo apt upgrade -y
rustup update
python -m pip install --upgrade pip
nvm install --lts  # или nvm use --lts
npm i -g npm
```

---

## 14. Проверка среды ✅

Когда «что-то не работает» или после переустановки — гони проверку.

### 14.1 Чек-лист «всё установлено»

```
# пакетные менеджеры
winget --version        # Windows
brew --version          # macOS
apt --version           # Debian/Ubuntu

# базовые утилиты
git --version
curl --version
jq --version
rg --version
fzf --version
gh --version
```

### 14.2 Версии ключевых инструментов

```bash
# языки
go version
python --version
rustc --version
node --version
npm --version

# менеджеры поверх
nvm --version           # если используешь nvm
cargo --version
uv --version            # если используешь uv
pnpm --version

# мета
git --version
gh --version
```

Что считается «ок»:
- Go: `go version` показывает версию без предупреждений
- Python ≥ 3.11 (3.12 — текущий LTS-уровень)
- Node ≥ 20 (LTS)
- Git ≥ 2.40

### 14.3 Тесты окружения 🧪

Каждый инструмент прогнать минимальным вызовом:

```bash
# Git + SSH
ssh -T git@github.com && echo "git-ok"

# Go
cd /tmp && mkdir -p hello && cd hello
go mod init hello
echo 'package main

import "fmt"

func main() {
	fmt.Println("ok")
}
' > main.go
go run .

# Python
python -c "import sys; print(sys.version)"

# Node
node -e "console.log('ok')"
```

Также проверить работу **Obsidian** (открывается вайлт), **менеджер паролей** (разблокирован), **браузер** (открывается интернет).

> 🛠️ Если что-то упало — переходи в раздел 15, самые частые проблемы там.

---

## 15. Частые проблемы и решения 🧯

### 15.1 Горячие клавиши не работают / конфликты

Проблема: `Ctrl+P` в Obsidian открывает не палитру, а встроенный поиск (или наоборот).

Решение:
- Палитра команд: Настройки → Горячие клавиши → найти команды
- Конфликт обычно с VSCode-плагином или системой; поменять хоткей на свой
- Проверить, не перехватывает ли системный «универсальный» хоткей (например, в Windows некоторые глобальные комбинации зарезервированы)

### 15.2 PATH — команда не найдена ⚠️

Симптом: `python`, `code` или `winget` не находится.

Диагностика:
```bash
# что прописано в PATH (Windows)
echo $env:PATH
# macOS/Linux
echo $PATH
# где лежит исполняемый файл
where python      # Windows
which python      # macOS/Linux
```

Решение:
- Windows: «Переменные среды» → добавить путь; **после правки перезапустить терминал**
- macOS: добавить `export PATH="$HOME/...:$PATH"` в `~/.zshrc`
- Python на Windows: галка «Add Python to PATH» при установке; если пропустил — использовать полный путь `C:\Users\<user>\AppData\Local\Programs\Python\Python312\python.exe`

> 💡 Правило: изменения PATH применяются в новых сессиях терминала, не в текущей.

### 15.3 Proxy — интернет не качает

Симптом: всё работает в браузере, но `curl`/`git`/`npm` не тянут.

Диагностика:
```bash
curl -v https://example.com
git config --global --get http.proxy
env | grep -i proxy   # macOS/Linux
$env:HTTP_PROXY       # Windows
```

Решение:
- Если корпоративный/локальный прокси: прописать в конфиге пакетного менеджера (`.npmrc` — `proxy=`, `HOME/.gitconfig` — `[http] proxy=`)
- Если прокси не должен быть: очистить переменные `HTTP_PROXY`/`HTTPS_PROXY`, отключить системный прокси в настройках
- Git: `git config --global --unset http.proxy` (и ловить ошибку `SSL certificate problem` — см. ниже, но лучше не «выключать проверку», а починить сертификаты)

### 15.4 Устаревшие пакеты 📦

Проблема: `npm install` падает, или `pip install` ставит старые версии.

Решение:
```bash
# Node — обнулить и поставить заново
rm -rf node_modules package-lock.json
pnpm install

# Python — обновить саму установку
python -m pip install --upgrade pip setuptools wheel

# Go — починка module cache
go clean -modcache
go mod tidy

# Rust — обновить toolchain
rustup update stable
```

Если конкретный пакет не ставится: проверь совместимость версий (например, Python версии vs пакет), читай логи ошибок — 90% причин: PATH, прокси (см. 15.3) или устаревший инструментарий (см. 14.2).

---

## 16. Глоссарий по настройке 📖

| Термин | Что это |
|--------|---------|
| **SRS** | Spaced Repetition System — интервальное повторение (Anki) |
| **FSRS** | алгоритм планирования интервалов по твоей статистике |
| **MOC** | Map of Content — карта заметок, точка входа |
| **Frontmatter** | YAML-блок в начале заметки (метаданные) |
| **CI** | Continuous Integration — авто-проверки при каждом коммите |
| **Git Hook** | скрипт, запускаемый Git автоматически (pre-commit и др.) |
| **SSH-ключ** | пара ключей (приватный/публичный) для безопасного подключения |
| **Vault** | термин Obsidian для хранилища (папки с заметками) |
| **Backlink** | обратная ссылка — список заметок, ссылающихся на текущую |
| **TOTP** | Time-based One-Time Password — код 2FA, меняется каждые 30 сек |
| **2FA** | двухфакторная аутентификация |
| **VPN** | виртуальная частная сеть — защитённый туннель |
| **LUKS / BitLocker / FileVault** | дисковое шифрование Linux/Windows/macOS |
| **3-2-1** | правило резервирования: 3 копии, 2 носителя, 1 вне дома |
| **PATH** | список папок, где ОС ищет исполняемые файлы |
| **cron / launchd / Task Scheduler** | планировщики задач Linux / macOS / Windows |
| **winget / brew / apt** | пакетные менеджеры Windows / macOS / Debian |
| **nvm / rustup / uv** | версионные менеджеры Node / Rust / Python |
| **Pre-commit** | хуки, запускаемые перед коммитом (проверки) |
| **Immersion** | подход к языку: много контента, понятного «на грани» |
| **LingQ** | платформа иммерсийного чтения/аудио |
| **AnkiConnect** | add-on Anki для внешнего доступа к колоде |
| **Recovery key** | ключ восстановления (BitLocker и др.) |

---

## 17. FAQ ❓

**1. Почему Obsidian, а не просто Git + маркдаун?**
Obsidian добавляет граф, backlinks, шаблоны и скорость перехода — всё это локально на маркдаун-файлах. Git остаётся бэкапом и синхронизацией.

**2. Насколько безопасно хранить базу в Git на GitHub?**
Репозиторий приватный, ключи SSH приватные. Секретов в базу не клади. GitHub шифрует репозитории.

**3. Что делать, если Obsidian перестал видеть плагины?**
«Настройки → Сообщества плагины → включить». Проверить, что папка `.obsidian/plugins/` не попала в `.gitignore` (часто 🙂).

**4. Сколько новых слов в день ставить в Anki?**
Начинай с 10–20. Если реviews копятся — уменьши новые, а не решай ревьюёв.

**5. Какой VPN советуешь для иммерсии?**
Любой big «no-log» с WireGuard. Для geospecific контента лучше тот, что без обязательного логирования и слабых блокировок.

**6. Что такое «rebase» и когда его использовать?**
Перебазирование = пересобрать историю ветки на новую базу. Полезно для чистой истории перед merge. В персональном репо (один автор) — почти не нужно.

**7. Как перенести всю базу знаний на новый компьютер?**
См. раздел 8: закоммитить → скопировать приватный ключ SSH → клонировать репозиторий → Obsidian указать на папку. Это займёт ~15 минут.

**8. NPM не устанавливает пакеты. Что проверить?**
Proxy (15.3), версию Node (14.2), права файлов `package.json`, и не слушает ли `registry`. `npm config get registry` — должно быть `https://registry.npmjs.org/`.

**9. Не вижу своих заметок в Dataview.**
Проверь: путь FROM совпадает с папкой, frontmatter заполнен, в поле точно то значение, что в запросе (регистр!), и плагин включен.

**10. Стоит ли класть базу в Docker?**
Нет — для персональной заметки это излишне. Облако/диск + Git достаточно. Docker — для сервисов (раздел 9.7).

**11. Почему «Add Python to PATH» так важен?**
Без этого команды `python`/`pip` не находятся в терминале (15.2). Установщик предлагает галку — отметь её сразу.

**12. Как настроить автоматическое сохранение в базу?**
Obsidian Git: auto-commit каждые 30 минут + auto-pull при старте. Плюс exit-сохранение — файлы сохраняются по умолчанию.

**13. Git конфликт при push — что делать?**
`git pull --rebase`, разрешить конфликты (маркеры `<<<<<<<`), `git add` + `git rebase --continue`, `git push`.

**14. Чем bond / `recommend` — куда копится ревью?**
Ищи по серверной тренировке Anki: если ревью растут — снижай новые слова, поддерживай серию дней. Тепловая карта (add-on Review Heatmap) помогает держать streak.

**15. Мой телефон не пушит базу — что настроить?**
На телефоне: SSH-ключ сложно, поэтому проще HTTPS-клонирование или Obsidian Sync (платный). Другой вариант: протестировать клонирование на компьютере, а мобильник оставить на чтение.

**16. Нужно ли держать кмд-инструменты глобально?**
Почти нет. Всё лучше ставить в окружения: Python — venv, Node — папка проекта, Go/Rust — модуль. Глобально держи разве что сами среды (python, node, cargo), а не пакеты внутри них.

**17. Как понять, что мой `.gitignore` достаточно полон?**
`git status` не показывает мусор: `node_modules/`, `.venv/`, `.env`, `__pycache__/` и т.д. (раздел 9.3).

**18. Что такое «recovery key» и где его хранить?**
Ключ для восстановления шифрованного диска (BitLocker и др.). Храни его в менеджере паролей И на бумаге — не в репозитории.

**19. Obsidian на Linux не открывает Graph view.**
Требуется облачная рендер (WebView). Установить зависимости: `sudo apt install webkit2gtk-4.1` (Debian/Ubuntu 22.04+) или проверь версию дистрибутива.

**20. Могу ли я использовать эту базу с другим инструментом, кроме Obsidian?**
Да — это маркдаун-файлы. VSCode с Markdown All in One откроет всё, но потеряешь граф/backlinks. Для быстрого просмотра достаточно любого маркдаун-вьюера.

---

## 18. Что дальше 👣

- [ ] Пройти чек-лист новой машины (раздел 8.7)
- [ ] Разобрать первую автоматизацию (раздел 13.4)
- [ ] Настроить Anki с FSRS (раздел 10.1–10.3)
- [ ] Докинуть приватный репозиторий в GitHub Pages (9.7)
- [ ] Обновлять этот файл при смене инструментов

---

*Полная настройка базы знаний. Обновляется по мере улучшения инструментов.*