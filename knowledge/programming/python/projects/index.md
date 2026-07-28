# Python — Проекты

10 проектов от начинающего до продвинутого. Каждый проект — рабочая структура с ключевым кодом.

---

## Проект 1: CLI Todo-приложение

**Уровень:** Начинающий  
**Стек:** argparse, json  
**Время:** 2-3 часа

### Описание

Консольное приложение для управления списком задач. Поддерживает добавление, удаление, пометку выполненных и сохранение в JSON-файл.

### Структура

```
todo-cli/
├── todo.py
├── tasks.json
└── README.md
```

### Ключевой код

```python
#!/usr/bin/env python3
"""CLI Todo-приложение с хранением в JSON."""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path

TASKS_FILE = Path(__file__).parent / "tasks.json"


def load_tasks() -> list[dict]:
    if TASKS_FILE.exists():
        return json.loads(TASKS_FILE.read_text(encoding="utf-8"))
    return []


def save_tasks(tasks: list[dict]) -> None:
    TASKS_FILE.write_text(
        json.dumps(tasks, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def add_task(title: str, priority: str = "medium") -> dict:
    tasks = load_tasks()
    task = {
        "id": max((t["id"] for t in tasks), default=0) + 1,
        "title": title,
        "priority": priority,
        "done": False,
        "created": datetime.now().isoformat(),
    }
    tasks.append(task)
    save_tasks(tasks)
    return task


def list_tasks(show_done: bool = True) -> list[dict]:
    tasks = load_tasks()
    if not show_done:
        tasks = [t for t in tasks if not t["done"]]
    return tasks


def complete_task(task_id: int) -> bool:
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["done"] = True
            save_tasks(tasks)
            return True
    return False


def delete_task(task_id: int) -> bool:
    tasks = load_tasks()
    new_tasks = [t for t in tasks if t["id"] != task_id]
    if len(new_tasks) < len(tasks):
        save_tasks(new_tasks)
        return True
    return False


def main():
    parser = argparse.ArgumentParser(description="Todo CLI")
    sub = parser.add_subparsers(dest="command")

    add_p = sub.add_parser("add", help="Добавить задачу")
    add_p.add_argument("title", help="Название задачи")
    add_p.add_argument("-p", "--priority", default="medium",
                       choices=["low", "medium", "high"])

    sub.add_parser("list", help="Показать задачи")
    sub.add_parser("list-active", help="Показать активные задачи")

    done_p = sub.add_parser("done", help="Завершить задачу")
    done_p.add_argument("id", type=int, help="ID задачи")

    del_p = sub.add_parser("delete", help="Удалить задачу")
    del_p.add_argument("id", type=int, help="ID задачи")

    args = parser.parse_args()

    if args.command == "add":
        task = add_task(args.title, args.priority)
        print(f"Добавлено: #{task['id']} {task['title']}")
    elif args.command == "list":
        for t in list_tasks():
            status = "✓" if t["done"] else "○"
            print(f"  {status} #{t['id']} [{t['priority']}] {t['title']}")
    elif args.command == "list-active":
        for t in list_tasks(show_done=False):
            print(f"  ○ #{t['id']} [{t['priority']}] {t['title']}")
    elif args.command == "done":
        if complete_task(args.id):
            print(f"Задача #{args.id} завершена")
        else:
            print(f"Задача #{args.id} не найдена")
    elif args.command == "delete":
        if delete_task(args.id):
            print(f"Задача #{args.id} удалена")
        else:
            print(f"Задача #{args.id} не найдена")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
```

### Использование

```bash
python todo.py add "Изучить Python" --priority high
python todo.py list
python todo.py done 1
python todo.py delete 1
```

### Следующие шаги

- Добавить цветной вывод (colorama)
- Экспорт в CSV
- Парсинг дедлайнов
- Интерактивный режим (prompt_toolkit)

---

## Проект 2: Веб-скрапер

**Уровень:** Начинающий-Средний  
**Стек:** requests, BeautifulSoup, csv  
**Время:** 3-4 часа

### Описание

Скрапер новостей или объявлений с веб-сайта. Собирает заголовки, ссылки, даты и сохраняет в CSV.

### Структура

```
web-scraper/
├── scraper.py
├── requirements.txt
└── output.csv
```

### Ключевой код

```python
#!/usr/bin/env python3
"""Веб-скрапер новостей с requests + BeautifulSoup."""

import csv
import time
from dataclasses import dataclass, asdict
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


@dataclass
class Article:
    title: str
    link: str
    summary: str
    date: str


class NewsScraper:
    def __init__(self, base_url: str, delay: float = 1.0):
        self.base_url = base_url
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        })

    def fetch(self, url: str) -> BeautifulSoup:
        """Получить и распарсить страницу."""
        resp = self.session.get(url, timeout=10)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")

    def scrape_page(self, url: str, selectors: dict) -> list[Article]:
        """Собрать статьи со страницы по CSS-селекторам."""
        soup = self.fetch(url)
        articles = []

        for item in soup.select(selectors["item"]):
            title_el = item.select_one(selectors["title"])
            link_el = item.select_one(selectors["link"])
            summary_el = item.select_one(selectors.get("summary", "p"))
            date_el = item.select_one(selectors.get("date", "time"))

            if not title_el:
                continue

            link = link_el["href"] if link_el and link_el.has_attr("href") else ""
            if link and not link.startswith("http"):
                link = urljoin(self.base_url, link)

            articles.append(Article(
                title=title_el.get_text(strip=True),
                link=link,
                summary=summary_el.get_text(strip=True) if summary_el else "",
                date=date_el.get_text(strip=True) if date_el else "",
            ))

        return articles

    def scrape_multiple_pages(self, url_pattern: str, pages: int,
                              selectors: dict) -> list[Article]:
        """Собрать статьи со страниц пагинации."""
        all_articles = []
        for i in range(1, pages + 1):
            url = url_pattern.format(page=i)
            print(f"Парсинг страницы {i}: {url}")
            articles = self.scrape_page(url, selectors)
            all_articles.extend(articles)
            print(f"  Найдено {len(articles)} статей")
            if i < pages:
                time.sleep(self.delay)
        return all_articles

    @staticmethod
    def save_to_csv(articles: list[Article], filename: str) -> None:
        """Сохранить статьи в CSV."""
        if not articles:
            print("Нет данных для сохранения")
            return

        with open(filename, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=asdict(articles[0]).keys())
            writer.writeheader()
            writer.writerows(asdict(a) for a in articles)
        print(f"Сохранено {len(articles)} статей в {filename}")


# Пример использования
if __name__ == "__main__":
    scraper = NewsScraper("https://example-news.com", delay=1.5)

    selectors = {
        "item": "article.post",
        "title": "h2.title a",
        "link": "h2.title a",
        "summary": "div.excerpt",
        "date": "span.date",
    }

    articles = scraper.scrape_page("https://example-news.com/news", selectors)
    scraper.save_to_csv(articles, "news.csv")
```

### Требования

```
requests>=2.31
beautifulsoup4>=4.12
lxml>=5.0
```

### Следующие шаги

- Selenium/Playwright для JavaScript-рендеринга страниц
- Ротация прокси
- Сохранение в SQLite
- Ограничение частоты запросов (rate limiter)

---

## Проект 3: REST API на FastAPI

**Уровень:** Средний  
**Стек:** FastAPI, Pydantic, SQLite, uvicorn  
**Время:** 5-7 часов

### Описание

Полноценный REST API для управления книгами. CRUD-операции, валидация, пагинация, документация OpenAPI.

### Структура

```
books-api/
├── main.py
├── models.py
├── database.py
├── requirements.txt
└── tests/
    └── test_api.py
```

### Ключевой код

```python
# models.py
"""Pydantic модели и SQLAlchemy."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./books.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Genre(str, Enum):
    fiction = "fiction"
    non_fiction = "non_fiction"
    science = "science"
    technology = "technology"
    history = "history"


class BookDB(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    genre = Column(String(20), default="fiction")
    price = Column(Float, nullable=False)
    pages = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["Война и мир"])
    author: str = Field(..., min_length=1, max_length=100, examples=["Лев Толстой"])
    genre: Genre = Genre.fiction
    price: float = Field(..., gt=0, examples=[599.99])
    pages: int = Field(default=0, ge=0)


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    genre: Genre | None = None
    price: float | None = None
    pages: int | None = None


class BookResponse(BookCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list[BookResponse]
    total: int
    page: int
    per_page: int
    pages: int
```

```python
# database.py
"""Инициализация БД."""

from .models import engine, Base


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

```python
# main.py
"""FastAPI приложение — Books API."""

import math
from fastapi import FastAPI, HTTPException, Query, Depends
from sqlalchemy.orm import Session

from .database import init_db, get_db
from .models import (
    BookDB, BookCreate, BookUpdate, BookResponse,
    PaginatedResponse, Genre,
)

app = FastAPI(
    title="Books API",
    description="REST API для управления коллекцией книг",
    version="1.0.0",
)

app.on_event("startup")
def startup():
    init_db()


@app.get("/books", response_model=PaginatedResponse)
def list_books(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    genre: Genre | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(BookDB)

    if genre:
        query = query.filter(BookDB.genre == genre.value)
    if search:
        query = query.filter(
            BookDB.title.contains(search) | BookDB.author.contains(search)
        )

    total = query.count()
    pages = math.ceil(total / per_page) if total > 0 else 1
    items = (
        query
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return PaginatedResponse(
        items=[BookResponse.model_validate(b) for b in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@app.post("/books", response_model=BookResponse, status_code=201)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    db_book = BookDB(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return BookResponse.model_validate(db_book)


@app.get("/books/{book_id}", response_model=BookResponse)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    return BookResponse.model_validate(book)


@app.put("/books/{book_id}", response_model=BookResponse)
def update_book(book_id: int, updates: BookUpdate, db: Session = Depends(get_db)):
    book = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(book, key, value)

    db.commit()
    db.refresh(book)
    return BookResponse.model_validate(book)


@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(BookDB).filter(BookDB.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    db.delete(book)
    db.commit()


@app.get("/genres", response_model=list[str])
def list_genres():
    return [g.value for g in Genre]
```

### Запуск

```bash
pip install fastapi uvicorn sqlalchemy pydantic
uvicorn main:app --reload
# Документация: http://localhost:8000/docs
```

### Следующие шаги

- JWT аутентификация
- Alembic миграции
- Redis кеш
- Тесты на pytest + httpx

---

## Проект 4: Визуализация данных

**Уровень:** Средний  
**Стек:** matplotlib, pandas, requests  
**Время:** 3-4 часа

### Описание

Скрипт для загрузки данных с API и построения графиков: столбчатые диаграммы, линейные графики, тепловые карты.

### Структура

```
data-viz/
├── visualize.py
├── data/
└── charts/
```

### Ключевой код

```python
#!/usr/bin/env python3
"""Визуализация данных: загрузка, обработка, построение графиков."""

from pathlib import Path
from typing import Any

import matplotlib.pyplot as plt
import matplotlib
import pandas as pd
import numpy as np

matplotlib.use("Agg")
plt.style.use("seaborn-v0_8-whitegrid")

CHARTS_DIR = Path("charts")
CHARTS_DIR.mkdir(exist_ok=True)


class DataVisualizer:
    """Генератор графиков из данных."""

    def __init__(self, data: pd.DataFrame):
        self.data = data

    @classmethod
    def from_csv(cls, path: str) -> "DataVisualizer":
        return cls(pd.read_csv(path))

    @classmethod
    def from_dict(cls, records: list[dict]) -> "DataVisualizer":
        return cls(pd.DataFrame(records))

    def bar_chart(self, x_col: str, y_col: str, title: str,
                  filename: str, color: str = "#4C72B0") -> Path:
        """Столбчатая диаграмма."""
        fig, ax = plt.subplots(figsize=(10, 6))
        bars = ax.bar(self.data[x_col], self.data[y_col], color=color)
        ax.set_title(title, fontsize=14, fontweight="bold")
        ax.set_xlabel(x_col)
        ax.set_ylabel(y_col)

        for bar in bars:
            height = bar.get_height()
            ax.annotate(f"{height:.1f}",
                        xy=(bar.get_x() + bar.get_width() / 2, height),
                        xytext=(0, 3), textcoords="offset points",
                        ha="center", va="bottom", fontsize=9)

        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()
        path = CHARTS_DIR / filename
        fig.savefig(path, dpi=150)
        plt.close(fig)
        return path

    def line_chart(self, x_col: str, y_cols: list[str], title: str,
                   filename: str) -> Path:
        """Линейный график с несколькими сериями."""
        fig, ax = plt.subplots(figsize=(12, 6))

        for col in y_cols:
            ax.plot(self.data[x_col], self.data[col], marker="o",
                    markersize=4, label=col)

        ax.set_title(title, fontsize=14, fontweight="bold")
        ax.set_xlabel(x_col)
        ax.legend()
        ax.grid(True, alpha=0.3)

        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()
        path = CHARTS_DIR / filename
        fig.savefig(path, dpi=150)
        plt.close(fig)
        return path

    def heatmap(self, filename: str, title: str = "Correlation Matrix") -> Path:
        """Тепловая карта корреляций."""
        fig, ax = plt.subplots(figsize=(10, 8))
        numeric = self.data.select_dtypes(include=[np.number])
        corr = numeric.corr()

        im = ax.imshow(corr, cmap="coolwarm", aspect="auto", vmin=-1, vmax=1)
        ax.set_xticks(range(len(corr.columns)))
        ax.set_yticks(range(len(corr.columns)))
        ax.set_xticklabels(corr.columns, rotation=45, ha="right")
        ax.set_yticklabels(corr.columns)
        ax.set_title(title, fontsize=14, fontweight="bold")

        plt.colorbar(im, ax=ax, shrink=0.8)

        for i in range(len(corr)):
            for j in range(len(corr)):
                ax.text(j, i, f"{corr.iloc[i, j]:.2f}",
                        ha="center", va="center", fontsize=8)

        plt.tight_layout()
        path = CHARTS_DIR / filename
        fig.savefig(path, dpi=150)
        plt.close(fig)
        return path

    def pie_chart(self, label_col: str, value_col: str, title: str,
                  filename: str) -> Path:
        """Круговая диаграмма."""
        fig, ax = plt.subplots(figsize=(8, 8))
        colors = plt.cm.Set3(np.linspace(0, 1, len(self.data)))

        wedges, texts, autotexts = ax.pie(
            self.data[value_col],
            labels=self.data[label_col],
            autopct="%1.1f%%",
            colors=colors,
            startangle=90,
        )
        ax.set_title(title, fontsize=14, fontweight="bold")
        plt.tight_layout()
        path = CHARTS_DIR / filename
        fig.savefig(path, dpi=150)
        plt.close(fig)
        return path


# Пример: данные о продажах
if __name__ == "__main__":
    sales_data = [
        {"month": "Янв", "revenue": 12000, "costs": 8000, "profit": 4000},
        {"month": "Фев", "revenue": 15000, "costs": 9500, "profit": 5500},
        {"month": "Мар", "revenue": 13500, "costs": 8800, "profit": 4700},
        {"month": "Апр", "revenue": 18000, "costs": 11000, "profit": 7000},
        {"month": "Май", "revenue": 16500, "costs": 10200, "profit": 6300},
        {"month": "Июн", "revenue": 21000, "costs": 12500, "profit": 8500},
    ]

    viz = DataVisualizer.from_dict(sales_data)

    viz.bar_chart("month", "revenue", "Выручка по месяцам", "revenue.png")
    viz.line_chart("month", ["revenue", "costs", "profit"],
                   "Финансовые показатели", "finance.png")
    viz.pie_chart("month", "profit", "Доля прибыли", "profit_pie.png")
    print("Графики сохранены в charts/")
```

### Следующие шаги

- Dash/Streamlit для интерактивных дашбордов
- Загрузка с Kaggle API
- Автоматическая генерация отчётов (PDF)
- Геоданные (folium, geopandas)

---

## Проект 5: Telegram-бот

**Уровень:** Средний  
**Стек:** python-telegram-bot, asyncio  
**Время:** 4-6 часов

### Описание

Бот для управления заметками. Команды: /add, /list, /delete, /search. Хранение в SQLite.

### Структура

```
telegram-bot/
├── bot.py
├── database.py
├── config.py
├── requirements.txt
└── .env
```

### Ключевой код

```python
# config.py
import os
from dataclasses import dataclass

@dataclass
class Config:
    token: str
    admin_id: int

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            token=os.environ["BOT_TOKEN"],
            admin_id=int(os.environ.get("ADMIN_ID", 0)),
        )
```

```python
# database.py
"""SQLite-хранилище заметок."""

import sqlite3
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Note:
    id: int
    user_id: int
    title: str
    content: str
    created: str


class NoteDB:
    def __init__(self, db_path: str = "notes.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with self._conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

    @contextmanager
    def _conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def add(self, user_id: int, title: str, content: str) -> Note:
        with self._conn() as conn:
            cur = conn.execute(
                "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)",
                (user_id, title, content),
            )
            return Note(
                id=cur.lastrowid, user_id=user_id,
                title=title, content=content,
                created=datetime.now().isoformat(),
            )

    def list(self, user_id: int, limit: int = 10) -> list[Note]:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM notes WHERE user_id = ? ORDER BY created DESC LIMIT ?",
                (user_id, limit),
            ).fetchall()
            return [Note(**dict(r)) for r in rows]

    def delete(self, note_id: int, user_id: int) -> bool:
        with self._conn() as conn:
            cur = conn.execute(
                "DELETE FROM notes WHERE id = ? AND user_id = ?",
                (note_id, user_id),
            )
            return cur.rowcount > 0

    def search(self, user_id: int, query: str) -> list[Note]:
        with self._conn() as conn:
            rows = conn.execute(
                """SELECT * FROM notes
                   WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
                   ORDER BY created DESC""",
                (user_id, f"%{query}%", f"%{query}%"),
            ).fetchall()
            return [Note(**dict(r)) for r in rows]


# bot.py
"""Telegram-бот заметок."""

import asyncio
import logging

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters,
)

from config import Config
from database import NoteDB

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db = NoteDB()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Приветствие."""
    await update.message.reply_text(
        "Привет! Я бот для заметок.\n"
        "Команды:\n"
        "/add <заголовок> — добавить заметку\n"
        "/list — список заметок\n"
        "/search <запрос> — поиск\n"
        "/help — помощь"
    )


async def add_note(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Добавить заметку: /add Заголовок | Содержимое."""
    user_id = update.effective_user.id
    text = " ".join(context.args) if context.args else ""

    if "|" not in text:
        await update.message.reply_text(
            "Формат: /add Заголовок | Содержимое заметки"
        )
        return

    title, content = text.split("|", 1)
    note = db.add(user_id, title.strip(), content.strip())
    await update.message.reply_text(
        f"Заметка #{note.id} добавлена:\n"
        f" *{note.title}*\n{note.content}"
    )


async def list_notes(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать список заметок."""
    user_id = update.effective_user.id
    notes = db.list(user_id)

    if not notes:
        await update.message.reply_text("У вас нет заметок.")
        return

    lines = []
    for note in notes:
        lines.append(f"#{note.id} *{note.title}*\n_{note.created}_")

    keyboard = [
        [InlineKeyboardButton(f"#{n.id} — {n.title}", callback_data=f"view:{n.id}")]
        for n in notes
    ]
    await update.message.reply_text(
        "\n\n".join(lines),
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def view_note(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Просмотр заметки по callback."""
    query = update.callback_query
    await query.answer()

    note_id = int(query.data.split(":")[1])
    user_id = query.from_user.id

    notes = db.list(user_id, limit=100)
    note = next((n for n in notes if n.id == note_id), None)

    if note:
        keyboard = [[
            InlineKeyboardButton("Удалить", callback_data=f"del:{note.id}")
        ]]
        await query.edit_message_text(
            f"*{note.title}*\n\n{note.content}\n\n_{note.created}_",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )


async def delete_note(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Удалить заметку."""
    query = update.callback_query
    await query.answer()

    note_id = int(query.data.split(":")[1])
    user_id = query.from_user.id

    if db.delete(note_id, user_id):
        await query.edit_message_text(f"Заметка #{note_id} удалена.")
    else:
        await query.edit_message_text("Не удалось удалить.")


async def search_notes(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Поиск: /search запрос."""
    user_id = update.effective_user.id
    query = " ".join(context.args) if context.args else ""

    if not query:
        await update.message.reply_text("Формат: /search запрос")
        return

    notes = db.search(user_id, query)
    if not notes:
        await update.message.reply_text("Ничего не найдено.")
        return

    lines = [f"#{n.id} *{n.title}* — {n.content[:50]}..." for n in notes]
    await update.message.reply_text("\n".join(lines))


def main():
    config = Config.from_env()
    app = Application.builder().token(config.token).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("add", add_note))
    app.add_handler(CommandHandler("list", list_notes))
    app.add_handler(CommandHandler("search", search_notes))
    app.add_handler(CallbackQueryHandler(view_note, pattern=r"^view:\d+$"))
    app.add_handler(CallbackQueryHandler(delete_note, pattern=r"^del:\d+$"))

    app.run_polling()


if __name__ == "__main__":
    main()
```

### Следующие шаги

- Inline-режим
- Поддержка файлов и фото
- Кнопка «Напоминание» (APScheduler)
- Хостинг наRailway/Render

---

## Проект 6: Файовый менеджер

**Уровень:** Средний  
**Стек:** pathlib, shutil, watchdog  
**Время:** 4-5 часов

### Описание

CLI-утилита для управления файлами: поиск по расширению, группировка, дедупликация по хешу, отслеживание изменений.

### Структура

```
file-manager/
├── filemanager.py
├── requirements.txt
└── watch_log.txt
```

### Ключевой код

```python
#!/usr/bin/env python3
"""Файовый менеджер: поиск, группировка, дедупликация."""

import hashlib
import shutil
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path


@dataclass
class FileInfo:
    path: Path
    size: int
    extension: str
    md5: str


class FileManager:
    def __init__(self, root: str = "."):
        self.root = Path(root)

    def scan(self, recursive: bool = True) -> list[FileInfo]:
        """Сканировать директорию и вернуть информацию о файлах."""
        pattern = "**/*" if recursive else "*"
        files = []

        for p in self.root.glob(pattern):
            if p.is_file():
                try:
                    files.append(FileInfo(
                        path=p,
                        size=p.stat().st_size,
                        extension=p.suffix.lower(),
                        md5=self._md5(p),
                    ))
                except (PermissionError, OSError):
                    continue

        return files

    def find_duplicates(self, recursive: bool = True) -> dict[str, list[FileInfo]]:
        """Найти дубликаты файлов по MD5."""
        files = self.scan(recursive)
        by_hash = defaultdict(list)

        for f in files:
            by_hash[f.md5].append(f)

        return {h: flist for h, flist in by_hash.items() if len(flist) > 1}

    def group_by_extension(self, recursive: bool = True) -> dict[str, list[FileInfo]]:
        """Сгруппировать файлы по расширению."""
        files = self.scan(recursive)
        groups = defaultdict(list)
        for f in files:
            groups[f.extension or "(no ext)"].append(f)
        return dict(sorted(groups.items(), key=lambda x: -len(x[1])))

    def find_large_files(self, min_size_mb: float = 10,
                         recursive: bool = True) -> list[FileInfo]:
        """Найти файлы больше указанного размера."""
        min_bytes = int(min_size_mb * 1024 * 1024)
        return [
            f for f in self.scan(recursive)
            if f.size >= min_bytes
        ]

    def search(self, pattern: str, extensions: list[str] | None = None,
               min_size: int = 0, max_size: int = 0) -> list[FileInfo]:
        """Расширенный поиск файлов."""
        results = []
        for f in self.scan(recursive=True):
            if pattern.lower() not in f.path.name.lower():
                continue
            if extensions and f.extension not in extensions:
                continue
            if min_size and f.size < min_size:
                continue
            if max_size and f.size > max_size:
                continue
            results.append(f)
        return results

    def organize_by_type(self, target: str = "organized") -> dict[str, int]:
        """Распределить файлы по папкам по типу."""
        type_map = {
            "image": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"],
            "video": [".mp4", ".avi", ".mkv", ".mov", ".webm"],
            "document": [".pdf", ".doc", ".docx", ".txt", ".odt", ".rtf"],
            "archive": [".zip", ".tar", ".gz", ".rar", ".7z"],
            "code": [".py", ".js", ".go", ".rs", ".java", ".cpp", ".c"],
        }

        target_dir = self.root / target
        counts = defaultdict(int)

        for f in self.scan(recursive=False):
            category = "other"
            for cat, exts in type_map.items():
                if f.extension in exts:
                    category = cat
                    break

            dest_dir = target_dir / category
            dest_dir.mkdir(parents=True, exist_ok=True)
            dest = dest_dir / f.path.name

            if dest.exists():
                stem = f.path.stem
                i = 1
                while dest.exists():
                    dest = dest_dir / f"{stem}_{i}{f.extension}"
                    i += 1

            shutil.copy2(f.path, dest)
            counts[category] += 1

        return dict(counts)

    @staticmethod
    def _md5(path: Path, chunk_size: int = 8192) -> str:
        h = hashlib.md5()
        with open(path, "rb") as f:
            while chunk := f.read(chunk_size):
                h.update(chunk)
        return h.hexdigest()


def format_size(size: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


if __name__ == "__main__":
    import sys

    fm = FileManager(sys.argv[1] if len(sys.argv) > 1 else ".")

    print("=== Дубликаты ===")
    dupes = fm.find_duplicates()
    for h, files in dupes.items():
        print(f"\nХеш: {h}")
        for f in files:
            print(f"  {format_size(f.size):>10}  {f.path}")

    print("\n=== По расширению ===")
    groups = fm.group_by_extension()
    for ext, files in list(groups.items())[:10]:
        print(f"  {ext or '(нет)':>8}: {len(files)} файлов")
```

### Следующие шаги

- Интеграция с watchdog для отслеживания в реальном времени
- GUI на tkinter
- Восстановление удалённых файлов
- Шифрование файлов

---

## Проект 7: CLI-парсер логов

**Уровень:** Средний-Продвинутый  
**Стек:** re, collections, rich, click  
**Время:** 5-6 часов

### Описание

Утилита анализа логов: подсчёт ошибок, топ IP, временные паттерны, генерация отчётов. Поддержка Apache/Nginx/Common Log Format.

### Структура

```
log-analyzer/
├── analyzer.py
├── requirements.txt
└── sample.log
```

### Ключевой код

```python
#!/usr/bin/env python3
"""Анализатор веб-логов: статистика, паттерны, отчёты."""

import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table
from rich.panel import Panel


# Common Log Format / Apache Combined
LOG_PATTERN = re.compile(
    r'(?P<ip>[\d.:a-f]+)\s+-\s+(?P<user>\S+)\s+'
    r'\[(?P<timestamp>[^\]]+)\]\s+'
    r'"(?P<method>\w+)\s+(?P<path>\S+)\s+(?P<protocol>\S+)"\s+'
    r'(?P<status>\d{3})\s+(?P<size>\d+|-)\s+'
    r'"(?P<referrer>[^"]*)"\s+"(?P<ua>[^"]*)"'
)

STATUS_DESCRIPTIONS = {
    200: "OK", 301: "Redirect", 302: "Redirect",
    304: "Not Modified", 400: "Bad Request", 403: "Forbidden",
    404: "Not Found", 500: "Server Error", 502: "Bad Gateway",
    503: "Service Unavailable",
}


@dataclass
class LogEntry:
    ip: str
    user: str
    timestamp: datetime
    method: str
    path: str
    protocol: str
    status: int
    size: int
    referrer: str
    user_agent: str


class LogAnalyzer:
    def __init__(self):
        self.entries: list[LogEntry] = []

    def parse_line(self, line: str) -> LogEntry | None:
        m = LOG_PATTERN.match(line.strip())
        if not m:
            return None

        try:
            ts = datetime.strptime(m.group("timestamp"), "%d/%b/%Y:%H:%M:%S %z")
        except ValueError:
            ts = datetime.now()

        size = int(m.group("size")) if m.group("size") != "-" else 0

        return LogEntry(
            ip=m.group("ip"),
            user=m.group("user"),
            timestamp=ts,
            method=m.group("method"),
            path=m.group("path"),
            protocol=m.group("protocol"),
            status=int(m.group("status")),
            size=size,
            referrer=m.group("referrer"),
            user_agent=m.group("ua"),
        )

    def load_file(self, path: str) -> int:
        count = 0
        with open(path, encoding="utf-8", errors="replace") as f:
            for line in f:
                entry = self.parse_line(line)
                if entry:
                    self.entries.append(entry)
                    count += 1
        return count

    def status_distribution(self) -> dict[int, int]:
        return dict(Counter(e.status for e in self.entries))

    def top_ips(self, n: int = 10) -> list[tuple[str, int]]:
        return Counter(e.ip for e in self.entries).most_common(n)

    def top_paths(self, n: int = 10) -> list[tuple[str, int]]:
        return Counter(e.path for e in self.entries).most_common(n)

    def errors_by_hour(self) -> dict[int, int]:
        errors = [e for e in self.entries if e.status >= 400]
        return dict(Counter(e.timestamp.hour for e in errors))

    def method_distribution(self) -> dict[str, int]:
        return dict(Counter(e.method for e in self.entries))

    def total_bytes(self) -> int:
        return sum(e.size for e in self.entries)

    def avg_response_size(self) -> float:
        sizes = [e.size for e in self.entries if e.size > 0]
        return sum(sizes) / len(sizes) if sizes else 0

    def generate_report(self) -> dict:
        statuses = self.status_distribution()
        error_count = sum(v for k, v in statuses.items() if k >= 400)
        return {
            "total_requests": len(self.entries),
            "unique_ips": len(set(e.ip for e in self.entries)),
            "error_rate": f"{error_count / len(self.entries) * 100:.1f}%" if self.entries else "0%",
            "total_bytes": self.total_bytes(),
            "avg_response_size": self.avg_response_size(),
            "status_distribution": statuses,
            "top_ips": self.top_ips(),
            "top_paths": self.top_paths(),
            "errors_by_hour": self.errors_by_hour(),
            "methods": self.method_distribution(),
        }


console = Console()


@click.group()
def cli():
    """Анализатор веб-логов."""
    pass


@cli.command()
@click.argument("logfile")
def summary(logfile: str):
    """Краткая сводка по логу."""
    analyzer = LogAnalyzer()
    count = analyzer.load_file(logfile)
    report = analyzer.generate_report()

    console.print(Panel(f"[bold]Файл: {logfile}[/bold]\nЗапросов: {count}"))

    table = Table(title="Статус-коды")
    table.add_column("Код", style="cyan")
    table.add_column("Описание")
    table.add_column("Количество", justify="right")
    table.add_column("%", justify="right")

    for status, count in sorted(report["status_distribution"].items()):
        pct = f"{count / report['total_requests'] * 100:.1f}%"
        desc = STATUS_DESCRIPTIONS.get(status, "")
        table.add_row(str(status), desc, str(count), pct)

    console.print(table)


@cli.command()
@click.argument("logfile")
@click.option("-n", "--top", default=10, help="Количество записей")
def ips(logfile: str, top: int):
    """Топ IP-адресов."""
    analyzer = LogAnalyzer()
    analyzer.load_file(logfile)

    table = Table(title=f"Топ {top} IP-адресов")
    table.add_column("IP", style="cyan")
    table.add_column("Запросов", justify="right")

    for ip, count in analyzer.top_ips(top):
        table.add_row(ip, str(count))

    console.print(table)


@cli.command()
@click.argument("logfile")
def errors(logfile: str):
    """Анализ ошибок по часам."""
    analyzer = LogAnalyzer()
    analyzer.load_file(logfile)

    by_hour = analyzer.errors_by_hour()
    console.print("Ошибки по часам:")
    for hour in range(24):
        count = by_hour.get(hour, 0)
        bar = "█" * min(count, 50)
        console.print(f"  {hour:02d}:00  {bar} {count}")


if __name__ == "__main__":
    cli()
```

### Следующие шаги

- Поддержка JSON-логов
- Генерация HTML-отчётов
- Мониторинг в реальном времени (tail -f)
- Интеграция с Elasticsearch

---

## Проект 8: Телеграм-бот для опросов

**Уровень:** Средний  
**Стек:** python-telegram-bot, aiosqlite  
**Время:** 4-5 часов

### Описание

Бот для создания и проведения опросов. Поддержка вариантов ответов, анонимного голосования, статистики.

### Структура

```
poll-bot/
├── bot.py
├── storage.py
├── requirements.txt
└── .env
```

### Ключевой код

```python
# storage.py
"""Асинхронное хранилище опросов."""

import aiosqlite
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Poll:
    id: int
    creator_id: int
    question: str
    options: list[str]
    created: str
    is_active: bool = True


class PollStorage:
    def __init__(self, db: str = "polls.db"):
        self.db_path = db
        self._db = None

    async def connect(self):
        self._db = await aiosqlite.connect(self.db_path)
        await self._db.executescript("""
            CREATE TABLE IF NOT EXISTS polls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                creator_id INTEGER NOT NULL,
                question TEXT NOT NULL,
                options TEXT NOT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                poll_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                option_index INTEGER NOT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(poll_id, user_id)
            );
        """)
        await self._db.commit()

    async def close(self):
        if self._db:
            await self._db.close()

    async def create_poll(self, creator_id: int, question: str,
                          options: list[str]) -> Poll:
        options_json = "|".join(options)
        cursor = await self._db.execute(
            "INSERT INTO polls (creator_id, question, options) VALUES (?, ?, ?)",
            (creator_id, question, options_json),
        )
        await self._db.commit()
        return Poll(
            id=cursor.lastrowid, creator_id=creator_id,
            question=question, options=options,
            created=datetime.now().isoformat(),
        )

    async def vote(self, poll_id: int, user_id: int, option_index: int) -> bool:
        try:
            await self._db.execute(
                "INSERT INTO votes (poll_id, user_id, option_index) VALUES (?, ?, ?)",
                (poll_id, user_id, option_index),
            )
            await self._db.commit()
            return True
        except aiosqlite.IntegrityError:
            return False

    async def get_results(self, poll_id: int) -> dict:
        poll_row = await self._db.execute_fetchall(
            "SELECT question, options FROM polls WHERE id = ?", (poll_id,)
        )
        if not poll_row:
            return {}

        question = poll_row[0][0]
        options = poll_row[0][1].split("|")

        votes = await self._db.execute_fetchall(
            "SELECT option_index, COUNT(*) FROM votes WHERE poll_id = ? GROUP BY option_index",
            (poll_id,),
        )
        vote_counts = {row[0]: row[1] for row in votes}
        total = sum(vote_counts.values())

        results = []
        for i, opt in enumerate(options):
            count = vote_counts.get(i, 0)
            pct = f"{count / total * 100:.1f}%" if total > 0 else "0%"
            results.append({"option": opt, "votes": count, "percent": pct})

        return {
            "question": question,
            "options": results,
            "total_votes": total,
        }


# bot.py
"""Telegram-бот для опросов."""

from telegram import (
    Update, Poll, PollOption,
    InlineKeyboardButton, InlineKeyboardMarkup,
)
from telegram.ext import (
    Application, CommandHandler, PollAnswerHandler,
    CallbackQueryHandler, ContextTypes,
)

from storage import PollStorage

storage = PollStorage()


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Бот опросов\n\n"
        "/poll Вопрос | Вариант1 | Вариант2 — создать опрос\n"
        "/results ID — результаты опроса\n"
        "/my — мои опросы"
    )


async def create_poll(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = " ".join(context.args) if context.args else ""

    if "|" not in text:
        await update.message.reply_text(
            "Формат: /poll Вопрос | Вариант1 | Вариант2 | ..."
        )
        return

    parts = [p.strip() for p in text.split("|")]
    question = parts[0]
    options = [p for p in parts[1:] if p]

    if len(options) < 2:
        await update.message.reply_text("Нужно минимум 2 варианта ответа.")
        return

    poll = await storage.create_poll(
        update.effective_user.id, question, options
    )

    keyboard = [
        [InlineKeyboardButton(opt, callback_data=f"vote:{poll.id}:{i}")]
        for i, opt in enumerate(options)
    ]
    keyboard.append([
        InlineKeyboardButton(
            f"Результаты ({0} голосов)",
            callback_data=f"results:{poll.id}"
        )
    ])

    await update.message.reply_text(
        f"📊 *{question}*\n\n" +
        "\n".join(f"  {i+1}. {opt}" for i, opt in enumerate(options)),
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def handle_vote(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    parts = query.data.split(":")
    poll_id = int(parts[1])
    option_index = int(parts[2])

    success = await storage.vote(poll_id, query.from_user.id, option_index)

    if success:
        results = await storage.get_results(poll_id)
        await query.edit_message_text(
            f"✅ Вы проголосовали!\n\n"
            f"*{results['question']}*\n\n" +
            "\n".join(
                f"  {'→' if i == option_index else ' '} {r['option']}: "
                f"{r['votes']} ({r['percent']})"
                for i, r in enumerate(results["options"])
            ) +
            f"\n\nВсего голосов: {results['total_votes']}"
        )
    else:
        await query.answer("Вы уже голосовали!", show_alert=True)


async def results(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not context.args:
        await update.message.reply_text("Формат: /results ID")
        return

    poll_id = int(context.args[0])
    data = await storage.get_results(poll_id)

    if not data:
        await update.message.reply_text("Опрос не найден.")
        return

    text = f"*{data['question']}*\n\n"
    for r in data["options"]:
        bar_len = min(r["votes"] * 2, 20)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        text += f"  {r['option']}\n  {bar} {r['votes']} ({r['percent']})\n\n"
    text += f"Всего голосов: {data['total_votes']}"

    await update.message.reply_text(text)


def main():
    import os
    app = Application.builder().token(os.environ["BOT_TOKEN"]).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("poll", create_poll))
    app.add_handler(CommandHandler("results", results))
    app.add_handler(CallbackQueryHandler(handle_vote, pattern=r"^vote:"))

    app.run_polling()


if __name__ == "__main__":
    main()
```

### Следующие шаги

- Квиз-режим с таймером
- Экспорт результатов в CSV
- Групповые опросы
- Графическая статистика

---

## Проект 9: Клон curl

**Уровень:** Продвинутый  
**Стек:** requests, argparse, rich  
**Время:** 6-8 часов

### Описание

CLI-утилита для HTTP-запросов: GET, POST, PUT, DELETE. Поддержка заголовков, cookies, JSON, аутентификации, форматированный вывод.

### Структура

```
pycurl/
├── client.py
├── output.py
├── auth.py
├── requirements.txt
└── tests/
```

### Ключевой код

```python
#!/usr/bin/env python3
"""Клон curl на Python: HTTP-клиент для терминала."""

import json
import sys
import time
from dataclasses import dataclass, field
from typing import Any

import click
import httpx
from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax
from rich.table import Table


console = Console()


@dataclass
class RequestConfig:
    method: str
    url: str
    headers: dict[str, str] = field(default_factory=dict)
    data: Any = None
    json_data: Any = None
    auth: tuple[str, str] | None = None
    timeout: int = 30
    follow_redirects: bool = True
    verify_ssl: bool = True
    cookies: dict[str, str] = field(default_factory=dict)


class HTTPClient:
    def __init__(self, config: RequestConfig):
        self.config = config
        self.client = httpx.Client(
            timeout=config.timeout,
            follow_redirects=config.follow_redirects,
            verify=config.verify_ssl,
        )

    def execute(self) -> httpx.Response:
        start = time.perf_counter()

        kwargs = {
            "headers": self.config.headers,
            "cookies": self.config.cookies,
        }

        if self.config.auth:
            kwargs["auth"] = self.config.auth

        if self.config.json_data:
            kwargs["json"] = self.config.json_data
        elif self.config.data:
            kwargs["content"] = self.config.data

        response = self.client.request(
            self.config.method,
            self.config.url,
            **kwargs,
        )

        elapsed = time.perf_counter() - start
        response.elapsed_ms = elapsed * 1000
        return response


def format_response(response: httpx.Response, verbose: bool = False) -> Panel:
    """Форматировать ответ для вывода."""
    if verbose:
        parts = []
        parts.append(f"[cyan]{response.http_version}[/cyan] {response.status_code} {response.reason_phrase}")
        parts.append("")

        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Key", style="green")
        table.add_column("Value")
        for key, value in response.headers.items():
            table.add_row(key, value)
        parts.append(table)
        parts.append("")

        content_type = response.headers.get("content-type", "")
        if "json" in content_type:
            try:
                data = response.json()
                body = json.dumps(data, indent=2, ensure_ascii=False)
                parts.append(Syntax(body, "json", theme="monokai"))
            except Exception:
                parts.append(response.text)
        else:
            parts.append(response.text[:5000])

        return Panel(
            "\n".join(str(p) for p in parts),
            title=f"[bold]{response.status_code}[/bold]",
            subtitle=f"{response.elapsed_ms:.0f}ms | {len(response.content)} bytes",
        )
    else:
        return Panel(
            response.text[:5000],
            title=f"[bold]{response.status_code}[/bold]",
            subtitle=f"{response.elapsed_ms:.0f}ms",
        )


@click.command()
@click.argument("url")
@click.option("-X", "--method", default="GET", help="HTTP method")
@click.option("-d", "--data", default=None, help="Request body")
@click.option("-H", "--header", multiple=True, help="Header (key:value)")
@click.option("-u", "--auth", default=None, help="user:password")
@click.option("-k", "--insecure", is_flag=True, help="Skip SSL verify")
@click.option("-v", "--verbose", is_flag=True, help="Verbose output")
@click.option("-o", "--output", default=None, help="Save response to file")
@click.option("--json", "json_data", default=None, help="JSON body")
@click.option("--cookie", multiple=True, help="Cookie (name=value)")
@click.option("-L", "--follow", is_flag=True, help="Follow redirects")
@click.option("-t", "--timeout", default=30, help="Timeout in seconds")
def main(url, method, data, header, auth, insecure, verbose, output,
         json_data, cookie, follow, timeout):
    """HTTP-клиент для терминала."""

    if not url.startswith(("http://", "https://")):
        url = f"http://{url}"

    headers = {}
    for h in header:
        key, _, value = h.partition(":")
        headers[key.strip()] = value.strip()

    cookies = {}
    for c in cookie:
        name, _, value = c.partition("=")
        cookies[name.strip()] = value.strip()

    config = RequestConfig(
        method=method.upper(),
        url=url,
        headers=headers,
        data=data,
        json_data=json.loads(json_data) if json_data else None,
        auth=tuple(auth.split(":", 1)) if auth else None,
        timeout=timeout,
        follow_redirects=follow,
        verify_ssl=not insecure,
        cookies=cookies,
    )

    client = HTTPClient(config)

    try:
        response = client.execute()
    except httpx.ConnectError as e:
        console.print(f"[red]Ошибка подключения:[/red] {e}")
        sys.exit(1)
    except httpx.TimeoutException:
        console.print("[red]Таймаут[/red]")
        sys.exit(1)

    if output:
        with open(output, "wb") as f:
            f.write(response.content)
        console.print(f"Сохранено в {output} ({len(response.content)} bytes)")
    else:
        panel = format_response(response, verbose)
        console.print(panel)


if __name__ == "__main__":
    main()
```

### Следующие шаги

- Поддержка multipart/form-data
- WebSocket-клиент
- Прокси и SOCKS
- Сессии (сохранение cookies между запросами)
- Интеграция с Newman/Postman-коллекциями

---

## Проект 10: Генератор паролей и менеджер секретов

**Уровень:** Продвинутый  
**Стек:** cryptography, click, keyring  
**Время:** 6-8 часов

### Описание

Генератор безопасных паролей, шифрование секретов, хранение в зашифрованном хранилище. Интеграция с системным keyring.

### Структура

```
secret-manager/
├── manager.py
├── crypto.py
├── storage.py
├── cli.py
├── requirements.txt
└── .secrets.json
```

### Ключевой код

```python
# crypto.py
"""Шифрование и генерация паролей."""

import hashlib
import os
import secrets
import string
from base64 import b64decode, b64encode

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


def generate_password(
    length: int = 16,
    use_uppercase: bool = True,
    use_lowercase: bool = True,
    use_digits: bool = True,
    use_symbols: bool = True,
    exclude_chars: str = "",
) -> str:
    """Генерация криптографически стойкого пароля."""
    chars = ""
    required = []

    if use_lowercase:
        pool = string.ascii_lowercase
        chars += pool
        required.append(secrets.choice(pool))
    if use_uppercase:
        pool = string.ascii_uppercase
        chars += pool
        required.append(secrets.choice(pool))
    if use_digits:
        pool = string.digits
        chars += pool
        required.append(secrets.choice(pool))
    if use_symbols:
        pool = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        chars += pool
        required.append(secrets.choice(pool))

    if exclude_chars:
        chars = "".join(c for c in chars if c not in exclude_chars)

    if not chars:
        raise ValueError("Нет доступных символов для генерации")

    remaining = length - len(required)
    if remaining < 0:
        remaining = 0

    password_chars = required + [secrets.choice(chars) for _ in range(remaining)]

    password_list = list(password_chars)
    secrets.SystemRandom().shuffle(password_list)
    return "".join(password_list)


def derive_key(master_password: str, salt: bytes | None = None) -> tuple[bytes, bytes]:
    """Вывести ключ шифрования из мастер-пароля (PBKDF2)."""
    if salt is None:
        salt = os.urandom(16)

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
    )
    key = b64encode(kdf.derive(master_password.encode()))
    return key, salt


class SecretEncryptor:
    """Шифрование/дешифрование секретов через Fernet."""

    def __init__(self, master_password: str, salt: bytes | None = None):
        self.key, self.salt = derive_key(master_password, salt)
        self.fernet = Fernet(self.key)

    def encrypt(self, plaintext: str) -> str:
        """Зашифровать строку."""
        return self.fernet.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        """Расшифровать строку."""
        return self.fernet.decrypt(ciphertext.encode()).decode()


# storage.py
"""Хранилище зашифрованных секретов."""

import json
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

from crypto import SecretEncryptor


@dataclass
class Secret:
    name: str
    username: str
    password: str
    url: str = ""
    notes: str = ""
    created: str = ""
    updated: str = ""


class SecretStore:
    def __init__(self, path: str = ".secrets.json"):
        self.path = Path(path)
        self._data: dict = {"secrets": {}, "salt": ""}
        self._encryptor: SecretEncryptor | None = None

    def init(self, master_password: str) -> None:
        """Инициализировать хранилище с мастер-паролем."""
        self._encryptor = SecretEncryptor(master_password)
        self._data["salt"] = self._encryptor.salt.hex()
        self._save()

    def unlock(self, master_password: str) -> bool:
        """Открыть существующее хранилище."""
        if not self.path.exists():
            return False

        self._data = json.loads(self.path.read_text(encoding="utf-8"))
        salt = bytes.fromhex(self._data["salt"])
        self._encryptor = SecretEncryptor(master_password, salt)

        try:
            self.list_secrets()
            return True
        except Exception:
            return False

    def add_secret(self, secret: Secret) -> None:
        """Добавить зашифрованный секрет."""
        secret.created = datetime.now().isoformat()
        secret.updated = secret.created

        encrypted = {
            "username": self._encryptor.encrypt(secret.username),
            "password": self._encryptor.encrypt(secret.password),
            "url": self._encryptor.encrypt(secret.url) if secret.url else "",
            "notes": self._encryptor.encrypt(secret.notes) if secret.notes else "",
            "created": secret.created,
            "updated": secret.updated,
        }
        self._data["secrets"][secret.name] = encrypted
        self._save()

    def get_secret(self, name: str) -> Secret | None:
        """Расшифровать и вернуть секрет."""
        encrypted = self._data["secrets"].get(name)
        if not encrypted:
            return None

        return Secret(
            name=name,
            username=self._encryptor.decrypt(encrypted["username"]),
            password=self._encryptor.decrypt(encrypted["password"]),
            url=self._encryptor.decrypt(encrypted["url"]) if encrypted.get("url") else "",
            notes=self._encryptor.decrypt(encrypted["notes"]) if encrypted.get("notes") else "",
            created=encrypted.get("created", ""),
            updated=encrypted.get("updated", ""),
        )

    def list_secrets(self) -> list[str]:
        """Вернуть имена всех секретов."""
        return list(self._data["secrets"].keys())

    def delete_secret(self, name: str) -> bool:
        """Удалить секрет."""
        if name in self._data["secrets"]:
            del self._data["secrets"][name]
            self._save()
            return True
        return False

    def _save(self) -> None:
        self.path.write_text(
            json.dumps(self._data, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )


# cli.py
"""CLI для менеджера секретов."""

import click
import getpass
from rich.console import Console
from rich.table import Table

from crypto import generate_password
from storage import SecretStore, Secret

console = Console()
store = SecretStore()


@click.group()
@click.option("--file", "-f", default=".secrets.json", help="Путь к хранилищу")
def cli(file):
    """Менеджер секретов — шифрованное хранение паролей."""
    store.path = file


@cli.command()
def init():
    """Инициализировать новое хранилище."""
    master = getpass.getpass("Мастер-пароль: ")
    confirm = getpass.getpass("Подтвердите: ")

    if master != confirm:
        console.print("[red]Пароли не совпадают[/red]")
        return

    if len(master) < 8:
        console.print("[red]Пароль должен быть не менее 8 символов[/red]")
        return

    store.init(master)
    console.print("[green]Хранилище создано[/green]")


@cli.command()
@click.option("--name", "-n", required=True, help="Название")
@click.option("--length", "-l", default=20, help="Длина пароля")
def genpass(name, length):
    """Сгенерировать пароль и сохранить."""
    password = generate_password(length)
    console.print(f"Пароль: [cyan]{password}[/cyan]")

    master = getpass.getpass("Мастер-пароль: ")
    if not store.unlock(master):
        console.print("[red]Неверный мастер-пароль[/red]")
        return

    username = click.prompt("Имя пользователя", default="")
    url = click.prompt("URL", default="")

    store.add_secret(Secret(
        name=name,
        username=username,
        password=password,
        url=url,
    ))
    console.print(f"[green]Секрет '{name}' сохранён[/green]")


@cli.command()
@click.argument("name")
def get(name):
    """Получить секрет."""
    master = getpass.getpass("Мастер-пароль: ")
    if not store.unlock(master):
        console.print("[red]Неверный мастер-пароль[/red]")
        return

    secret = store.get_secret(name)
    if not secret:
        console.print(f"[red]Секрет '{name}' не найден[/red]")
        return

    table = Table(title=name)
    table.add_column("Поле", style="green")
    table.add_column("Значение")
    table.add_row("Username", secret.username)
    table.add_row("Password", secret.password)
    table.add_row("URL", secret.url)
    table.add_row("Notes", secret.notes)
    console.print(table)


@cli.command()
def list():
    """Показать все секреты."""
    master = getpass.getpass("Мастер-пароль: ")
    if not store.unlock(master):
        console.print("[red]Неверный мастер-пароль[/red]")
        return

    names = store.list_secrets()
    if not names:
        console.print("Хранилище пусто.")
        return

    console.print("Секреты:")
    for name in sorted(names):
        console.print(f"  • {name}")


@cli.command()
@click.option("--length", "-l", default=16, help="Длина пароля")
def randpass(length):
    """Случайный пароль (без сохранения)."""
    password = generate_password(length)
    console.print(f"[cyan]{password}[/cyan]")


if __name__ == "__main__":
    cli()
```

### Следующие шаги

- Интеграция с macOS Keychain / GNOME Keyring
- CLI- автозаполнение (bash/zsh completion)
- Экспорт/импорт в KeePass
- Автоматическая смена паролей
- Таймер автоочистки буфера

---

## Рекомендации по проектам

| Уровень | Проекты | Ключевые навыки |
|---------|---------|-----------------|
| Начинающий | Todo CLI, Веб-скрапер | Файлы, парсинг, HTTP |
| Средний | FastAPI, Визуализация, Telegram-бот, Файловый менеджер | API, БД, библиотеки |
| Средний+ | Парсер логов, Telegram-опросы | CLI, rich, asyncio |
| Продвинутый | Клон curl, Менеджер секретов | Шифрование, HTTP, архитектура |

**Советы:**
1. Начинай с README — опиши назначение и структуру
2. Используй type hints и dataclass/pydantic
3. Добавляй тесты (pytest) параллельно с разработкой
4. Используй `if __name__ == "__main__"` для запуска
5. Версионируй через git с тегами для каждого этапа
