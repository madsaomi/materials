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

*Полная настройка базы знаний. Обновляется по мере улучшения инструментов.*
