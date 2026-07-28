# Database Snippets

SQL-запросы, паттерны ORM, миграции, настройка PostgreSQL/SQLite. Код на Python, Go, JavaScript.

---

## 1. SQL — Частые запросы

### 1.1 Основные SELECT

```sql
-- Пагинация
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 40;

-- Поиск по шаблону
SELECT * FROM products WHERE name ILIKE '%ноутбук%';

-- GROUP BY с подсчётом
SELECT category, COUNT(*) as cnt, AVG(price) as avg_price
FROM products
GROUP BY category
HAVING COUNT(*) > 5
ORDER BY cnt DESC;

-- DISTINCT с подсчётом уникальных
SELECT COUNT(DISTINCT user_id) as unique_users FROM orders;

-- CASE WHEN
SELECT
    name,
    email,
    CASE
        WHEN role = 'admin' THEN 'Администратор'
        WHEN role = 'moderator' THEN 'Модератор'
        ELSE 'Пользователь'
    END as role_name
FROM users;

-- COALESCE и NULLIF
SELECT
    name,
    COALESCE(nickname, username) as display_name,
    COALESCE(phone, 'Не указан') as phone
FROM users;

-- Топ-N в группах (Window functions)
SELECT * FROM (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rn
    FROM employees
) sub
WHERE rn <= 3;
```

### 1.2 JOIN

```sql
-- INNER JOIN
SELECT o.id, o.created_at, u.name, u.email
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'completed';

-- LEFT JOIN с GROUP BY
SELECT
    u.name,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Множественные JOIN
SELECT
    o.id as order_id,
    u.name as user_name,
    p.name as product_name,
    oi.quantity,
    oi.price
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;

-- Self JOIN
SELECT e.name as employee, m.name as manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Subquery в JOIN
SELECT u.name, latest.created_at as last_order
FROM users u
JOIN (
    SELECT user_id, MAX(created_at) as created_at
    FROM orders
    GROUP BY user_id
) latest ON u.id = latest.user_id;
```

### 1.3 INSERT / UPDATE / DELETE

```sql
-- UPSERT (PostgreSQL)
INSERT INTO products (name, price, stock)
VALUES ('Ноутбук', 999.99, 10)
ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    stock = stock + EXCLUDED.stock;

-- Массовая вставка
INSERT INTO users (name, email, role) VALUES
    ('Alice', 'alice@example.com', 'admin'),
    ('Bob', 'bob@example.com', 'user'),
    ('Charlie', 'charlie@example.com', 'user');

-- UPDATE с подзапросом
UPDATE products
SET price = price * 1.1
WHERE category_id IN (
    SELECT id FROM categories WHERE name = 'electronics'
);

-- DELETE с LIMIT
DELETE FROM logs
WHERE created_at < NOW() - INTERVAL '30 days'
LIMIT 1000;

-- Soft delete
UPDATE users SET deleted_at = NOW() WHERE id = 123;

-- CTE (Common Table Expression)
WITH active_users AS (
    SELECT user_id, COUNT(*) as orders_count
    FROM orders
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY user_id
    HAVING COUNT(*) >= 3
)
SELECT u.name, u.email, au.orders_count
FROM active_users au
JOIN users u ON au.user_id = u.id;
```

### 1.4 Индексы

```sql
-- B-tree индекс (по умолчанию)
CREATE INDEX idx_users_email ON users (email);

-- Уникальный индекс
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);

-- Составной индекс
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- Индекс с частичным условием
CREATE INDEX idx_orders_active ON orders (created_at)
WHERE status = 'pending';

-- GIN индекс для полнотекстового поиска (PostgreSQL)
CREATE INDEX idx_products_search ON products
USING GIN (to_tsvector('russian', name || ' ' || description));

-- Полнотекстовый поиск
SELECT * FROM products
WHERE to_tsvector('russian', name || ' ' || description)
   @@ to_tsquery('russian', 'ноутбук & игровой');

-- Индекс для JSONB (PostgreSQL)
CREATE INDEX idx_events_data ON events USING GIN (data jsonb_path_ops);

SELECT * FROM events WHERE data @> '{"type": "purchase"}';
```

---

## 2. PostgreSQL — Типы и особенности

### 2.1 Типы данных

```sql
-- UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

-- JSONB
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Массивы PostgreSQL
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

SELECT * FROM articles WHERE 'python' = ANY(tags);
SELECT * FROM articles WHERE tags @> ARRAY['python', 'django'];

-- ENUM
CREATE TYPE mood AS ENUM ('happy', 'sad', 'neutral');
CREATE TABLE diary (
    id SERIAL PRIMARY KEY,
    entry TEXT,
    mood mood NOT NULL
);

-- Range types
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INT,
    during TSTZRANGE NOT NULL,
    EXCLUDE USING gist (room_id WITH =, during WITH &&)
);
```

### 2.2 Транзакции

```sql
-- Начало транзакции
BEGIN;

-- Сериализуемый уровень изоляции
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Блокировка строк (FOR UPDATE)
SELECT * FROM accounts WHERE user_id = 1 FOR UPDATE;

-- Transfer money
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;

-- Проверка условия
DO $$
BEGIN
    IF (SELECT balance FROM accounts WHERE user_id = 1) < 0 THEN
        RAISE EXCEPTION 'Недостаточно средств';
    END IF;
END $$;

COMMIT;
-- или ROLLBACK при ошибке;
```

### 2.3 Хранимые процедуры и функции

```sql
-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Функция для пагинации
CREATE OR REPLACE FUNCTION paginate(
    p_table TEXT,
    p_page INT DEFAULT 1,
    p_per_page INT DEFAULT 20,
    p_order TEXT DEFAULT 'id'
)
RETURNS TABLE(id INT, data JSONB) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT id, to_jsonb(t) FROM %I t ORDER BY %I LIMIT %s OFFSET %s',
        p_table, p_order, p_per_page, (p_page - 1) * p_per_page
    );
END;
$$ LANGUAGE plpgsql;
```

---

## 3. SQLite — Быстрый старт

### 3.1 Создание и настройка

```python
import sqlite3
from contextlib import contextmanager

DATABASE = "app.db"

def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")     # Write-Ahead Logging
    conn.execute("PRAGMA synchronous=NORMAL")   # Быстрая запись
    conn.execute("PRAGMA foreign_keys=ON")      # FK constraints
    conn.execute("PRAGMA cache_size=-64000")    # 64MB кеш
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# Создание таблиц
with get_db() as db:
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            published BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
    """)
```

### 3.2 CRUD операции

```python
# CREATE
with get_db() as db:
    cursor = db.execute(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        ("Alice", "alice@example.com")
    )
    user_id = cursor.lastrowid

# READ
with get_db() as db:
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    print(dict(user))

    # Пагинация
    posts = db.execute(
        "SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (user_id, 10, 0)
    ).fetchall()

# UPDATE
with get_db() as db:
    db.execute(
        "UPDATE users SET name = ? WHERE id = ?",
        ("Алиса", user_id)
    )

# DELETE
with get_db() as db:
    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
```

---

## 4. ORM Patterns

### 4.1 SQLAlchemy (Python)

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime

DATABASE_URL = "postgresql://user:pass@localhost/dbname"
engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=10)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    posts = relationship("Post", back_populates="author", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.name}>"

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="posts")

# CRUD
def create_user(db, name: str, email: str) -> User:
    user = User(name=name, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user(db, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def get_users(db, skip=0, limit=10):
    return db.query(User).offset(skip).limit(limit).all()

def get_user_posts(db, user_id: int):
    return db.query(Post).filter(Post.user_id == user_id).order_by(Post.created_at.desc()).all()

# Агрегации
def get_user_stats(db):
    return db.query(
        User.name,
        func.count(Post.id).label("post_count"),
        func.max(Post.created_at).label("last_post")
    ).outerjoin(Post).group_by(User.id).all()

# Поиск
def search_users(db, query: str):
    return db.query(User).filter(
        User.name.ilike(f"%{query}%") | User.email.ilike(f"%{query}%")
    ).all()
```

### 4.2 GORM (Go)

```go
package models

import (
    "time"
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
)

type User struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    Name      string         `gorm:"size:100;not null" json:"name"`
    Email     string         `gorm:"size:200;uniqueIndex;not null" json:"email"`
    Posts     []Post         `gorm:"foreignKey:UserID" json:"posts,omitempty"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Post struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    UserID    uint           `gorm:"index;not null" json:"user_id"`
    Title     string         `gorm:"size:200;not null" json:"title"`
    Content   string         `json:"content"`
    Published bool           `gorm:"default:false" json:"published"`
    CreatedAt time.Time      `json:"created_at"`
    User      User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func InitDB() (*gorm.DB, error) {
    dsn := "host=localhost user=postgres password=secret dbname=myapp port=5432 sslmode=disable"
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, err
    }

    db.AutoMigrate(&User{}, &Post{})
    return db, nil
}

// CRUD
func CreateUser(db *gorm.DB, user *User) error {
    return db.Create(user).Error
}

func GetUser(db *gorm.DB, id uint) (*User, error) {
    var user User
    err := db.Preload("Posts").First(&user, id).Error
    return &user, err
}

func ListUsers(db *gorm.DB, page, perPage int) ([]User, int64, error) {
    var users []User
    var total int64

    db.Model(&User{}).Count(&total)
    err := db.Offset((page - 1) * perPage).Limit(perPage).Find(&users).Error
    return users, total, err
}

func SearchUsers(db *gorm.DB, query string) ([]User, error) {
    var users []User
    err := db.Where("name ILIKE ? OR email ILIKE ?", "%"+query+"%", "%"+query+"%").Find(&users).Error
    return users, err
}

func CreateUserWithPosts(db *gorm.DB, user *User, posts []Post) error {
    return db.Transaction(func(tx *gorm.DB) error {
        if err := tx.Create(user).Error; err != nil {
            return err
        }
        for i := range posts {
            posts[i].UserID = user.ID
        }
        return tx.Create(&posts).Error
    })
}
```

### 4.3 Prisma (JavaScript/TypeScript)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  email     String   @unique @db.VarChar(200)
  posts     Post[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int      @map("author_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("posts")
}
```

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE
const user = await prisma.user.create({
  data: { name: "Alice", email: "alice@example.com" },
});

// READ с relation
const userWithPosts = await prisma.user.findUnique({
  where: { id: user.id },
  include: { posts: true },
});

// Фильтрация и пагинация
const users = await prisma.user.findMany({
  where: {
    name: { contains: "Ali", mode: "insensitive" },
  },
  orderBy: { createdAt: "desc" },
  skip: 0,
  take: 20,
});

// Агрегации
const stats = await prisma.post.groupBy({
  by: ["authorId"],
  _count: { id: true },
  _avg: { id: true },
});

// Транзакция
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name: "Bob", email: "bob@example.com" },
  });
  const post = await tx.post.create({
    data: { title: "First Post", authorId: user.id },
  });
  return { user, post };
});
```

---

## 5. Миграции

### 5.1 Alembic (Python/SQLAlchemy)

```bash
# Инициализация
alembic init alembic

# Создание миграции
alembic revision --autogenerate -m "create users table"

# Применение
alembic upgrade head

# Откат
alembic downgrade -1
```

```python
# alembic/versions/xxx_create_users.py
"""Create users table

Revision ID: abc123
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(200), unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_index('idx_users_email')
    op.drop_table('users')
```

### 5.2 Goose (Go)

```sql
-- migrations/001_create_users.sql
-- +goose Up
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- +goose Down
DROP INDEX idx_users_email;
DROP TABLE users;
```

```bash
# Применение
goose -dir migrations postgres "user=postgres dbname=myapp sslmode=disable" up

# Статус
goose status

# Откат последней миграции
goose down
```

### 5.3 Node.js миграции (knex)

```javascript
// migrations/20240101_create_users.js
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 200).unique().notNullable();
        table.timestamps(true, true);
    }).createTable('posts', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
        table.string('title', 200).notNullable();
        table.text('content');
        table.boolean('published').defaultTo(false);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('posts').dropTableIfExists('users');
};
```

```bash
# Создание миграции
npx knex migrate:make create_users

# Применение
npx knex migrate:latest

# Откат
npx knex migrate:rollback
```

---

## 6. Паттерны доступа к данным

### 6.1 Unit of Work (Python)

```python
from typing import Optional
from sqlalchemy.orm import Session

class UnitOfWork:
    def __init__(self, session_factory):
        self.session_factory = session_factory
        self.session: Optional[Session] = None

    def __enter__(self):
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()
        self.session.close()

    def commit(self):
        self.session.commit()

    def rollback(self):
        self.session.rollback()

    def add(self, obj):
        self.session.add(obj)

    def query(self, model):
        return self.session.query(model)

# Использование
with UnitOfWork(SessionLocal) as uow:
    user = User(name="Alice", email="alice@example.com")
    uow.add(user)
    # Автоматический commit при выходе из контекста
```

### 6.2 Repository Pattern (Go)

```go
package repository

import (
    "gorm.io/gorm"
    "myapp/models"
)

type UserRepository interface {
    Create(user *models.User) error
    GetByID(id uint) (*models.User, error)
    List(page, perPage int) ([]models.User, int64, error)
    Update(user *models.User) error
    Delete(id uint) error
}

type userRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
    return &userRepository{db: db}
}

func (r *userRepository) Create(user *models.User) error {
    return r.db.Create(user).Error
}

func (r *userRepository) GetByID(id uint) (*models.User, error) {
    var user models.User
    err := r.db.Preload("Posts").First(&user, id).Error
    return &user, err
}

func (r *userRepository) List(page, perPage int) ([]models.User, int64, error) {
    var users []models.User
    var total int64
    r.db.Model(&models.User{}).Count(&total)
    err := r.db.Offset((page - 1) * perPage).Limit(perPage).Find(&users).Error
    return users, total, err
}

func (r *userRepository) Update(user *models.User) error {
    return r.db.Save(user).Error
}

func (r *userRepository) Delete(id uint) error {
    return r.db.Delete(&models.User{}, id).Error
}
```

### 6.3 Query Builder (Python)

```python
class QueryBuilder:
    def __init__(self, model):
        self.model = model
        self._filters = []
        self._order = []
        self._limit = None
        self._offset = None
        self._includes = []

    def where(self, **kwargs):
        for key, value in kwargs.items():
            self._filters.append((key, value))
        return self

    def order_by(self, *fields):
        self._order = list(fields)
        return self

    def limit(self, n):
        self._limit = n
        return self

    def offset(self, n):
        self._offset = n
        return self

    def include(self, *relations):
        self._includes = list(relations)
        return self

    def build(self):
        query = self.model.query
        for key, value in self._filters:
            if isinstance(value, tuple):
                op, val = value
                if op == "gt":
                    query = query.filter(getattr(self.model, key) > val)
                elif op == "lt":
                    query = query.filter(getattr(self.model, key) < val)
                elif op == "like":
                    query = query.filter(getattr(self.model, key).ilike(f"%{val}%"))
            else:
                query = query.filter(getattr(self.model, key) == value)

        for field in self._order:
            if field.startswith("-"):
                query = query.order_by(getattr(self.model, field[1:]).desc())
            else:
                query = query.order_by(getattr(self.model, field))

        if self._offset:
            query = query.offset(self._offset)
        if self._limit:
            query = query.limit(self._limit)
        for rel in self._includes:
            query = query.options(joinedload(getattr(self.model, rel)))

        return query

# Использование
users = (
    QueryBuilder(User)
    .where(role="admin", status=("like", "active"))
    .order_by("-created_at")
    .limit(10)
    .include("posts")
    .build()
    .all()
)
```

---

## 7. Performance Tips

### 7.1 N+1 Problem

```python
# ПЛОХО — N+1 запрос
users = db.query(User).all()
for user in users:
    print(user.posts)  # Отдельный запрос на каждое user!

# ХОРОШО — eager loading
users = db.query(User).options(joinedload(User.posts)).all()
for user in users:
    print(user.posts)  # Уже загружены
```

### 7.2 Connection Pool

```python
# SQLAlchemy
engine = create_engine(
    "postgresql://user:pass@localhost/db",
    pool_size=20,        # Размер пула
    max_overflow=10,     # Доп. соединения
    pool_timeout=30,     # Таймаут получения соединения
    pool_recycle=1800,   # Пересоздание через 30 мин
    pool_pre_ping=True,  # Проверка соединения перед использованием
)
```

```go
// GORM
db, _ := gorm.Open(postgres.Open(dsn), &gorm.Config{})
sqlDB, _ := db.DB()
sqlDB.SetMaxOpenConns(25)
sqlDB.SetMaxIdleConns(10)
sqlDB.SetConnMaxLifetime(5 * time.Minute)
```

### 7.3 Batch Operations

```python
# ПЛОХО — по одному
for user_data in users_list:
    db.add(User(**user_data))
db.commit()

# ХОРОШО — batch
db.bulk_save_objects([User(**data) for data in users_list])
db.commit()

# Или через COPY (PostgreSQL, fastest)
from sqlalchemy import text
db.execute(text("""
    COPY users(name, email)
    FROM STDIN WITH (FORMAT CSV, HEADER false)
"""), csv_data)
```
