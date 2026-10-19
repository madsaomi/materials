# JavaScript — Проекты

10 проектов на JavaScript/Node.js: от простого приложения до реалтайм-чата и браузерных расширений.

---

## Проект 1: Погодное приложение

**Уровень:** Начинающий  
**Стек:** Vanilla JS, Fetch API, OpenWeatherMap  
**Время:** 3-4 часа

### Описание

Приложение для получения текущей погоды по городу. Кеширование результатов, обработка ошибок, responsive дизайн.

### Структура

```
weather-app/
├── index.html
├── style.css
├── app.js
└── config.js
```

### Ключевой код

```javascript
// config.js
const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
export { API_KEY, BASE_URL };
```

```javascript
// app.js
import { API_KEY, BASE_URL } from "./config.js";

const $ = (sel) => document.querySelector(sel);

class WeatherApp {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 10 * 60 * 1000; // 10 минут
    this.init();
  }

  init() {
    this.form = $("#search-form");
    this.input = $("#city-input");
    this.card = $("#weather-card");
    this.error = $("#error-message");
    this.loader = $("#loader");

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = this.input.value.trim();
      if (city) this.fetchWeather(city);
    });

    this.loadLastCity();
  }

  async fetchWeather(city) {
    this.showLoader(true);
    this.showError("");

    const cacheKey = city.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.time < this.cacheDuration) {
      this.renderWeather(cached.data);
      this.showLoader(false);
      return;
    }

    try {
      const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Город не найден");
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      this.cache.set(cacheKey, { data, time: Date.now() });
      this.renderWeather(data);
      this.saveLastCity(city);
    } catch (err) {
      this.showError(err.message);
    } finally {
      this.showLoader(false);
    }
  }

  renderWeather(data) {
    const { name, main, weather, wind, sys } = data;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    this.card.innerHTML = `
      <div class="weather-header">
        <h2>${name}, ${sys.country}</h2>
        <img src="${iconUrl}" alt="${weather[0].description}" class="weather-icon">
      </div>
      <div class="weather-main">
        <span class="temp">${Math.round(main.temp)}°C</span>
        <span class="description">${weather[0].description}</span>
      </div>
      <div class="weather-details">
        <div class="detail">
          <span class="label">Ощущается</span>
          <span class="value">${Math.round(main.feels_like)}°C</span>
        </div>
        <div class="detail">
          <span class="label">Влажность</span>
          <span class="value">${main.humidity}%</span>
        </div>
        <div class="detail">
          <span class="label">Давление</span>
          <span class="value">${Math.round(main.pressure * 0.75)} мм рт.ст.</span>
        </div>
        <div class="detail">
          <span class="label">Ветер</span>
          <span class="value">${wind.speed} м/с</span>
        </div>
      </div>
    `;
    this.card.classList.remove("hidden");
  }

  showLoader(show) {
    this.loader.classList.toggle("hidden", !show);
  }

  showError(msg) {
    this.error.textContent = msg;
    this.error.classList.toggle("hidden", !msg);
    if (msg) this.card.classList.add("hidden");
  }

  saveLastCity(city) {
    localStorage.setItem("lastCity", city);
  }

  loadLastCity() {
    const city = localStorage.getItem("lastCity");
    if (city) {
      this.input.value = city;
      this.fetchWeather(city);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new WeatherApp());
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Погода</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Погода</h1>
        <form id="search-form">
            <input type="text" id="city-input" placeholder="Введите город..." required>
            <button type="submit">Найти</button>
        </form>
        <div id="loader" class="hidden">Загрузка...</div>
        <div id="error-message" class="error hidden"></div>
        <div id="weather-card" class="weather-card hidden"></div>
    </div>
    <script type="module" src="app.js"></script>
</body>
</html>
```

### Следующие шаги

- Прогноз на 5 дней
- Геолокация (navigator.geolocation)
- Тёмная тема
- PWA с service worker

---

## Проект 2: Todo-лист с фильтрами

**Уровень:** Начинающий  
**Стек:** Vanilla JS, localStorage  
**Время:** 3-4 часа

### Описание

Полноценный Todo с добавлением, редактированием, удалением, фильтрами (все/активные/завершённые), перетаскиванием.

### Структура

```
todo-app/
├── index.html
├── style.css
└── app.js
```

### Ключевой код

```javascript
// app.js
class TodoApp {
  constructor() {
    this.todos = this.load();
    this.filter = "all";
    this.init();
  }

  init() {
    this.form = document.getElementById("todo-form");
    this.input = document.getElementById("todo-input");
    this.list = document.getElementById("todo-list");
    this.count = document.getElementById("todo-count");
    this.filters = document.querySelectorAll(".filter-btn");
    this.clearBtn = document.getElementById("clear-completed");

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.addTodo(this.input.value);
      this.input.value = "";
    });

    this.filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.filter = btn.dataset.filter;
        this.filters.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.render();
      });
    });

    this.clearBtn.addEventListener("click", () => this.clearCompleted());
    this.render();
  }

  addTodo(text) {
    if (!text.trim()) return;
    this.todos.push({
      id: Date.now(),
      text: text.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    });
    this.save();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.done = !todo.done;
      this.save();
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
    this.save();
    this.render();
  }

  editTodo(id, newText) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo && newText.trim()) {
      todo.text = newText.trim();
      this.save();
      this.render();
    }
  }

  clearCompleted() {
    this.todos = this.todos.filter((t) => !t.done);
    this.save();
    this.render();
  }

  getFiltered() {
    switch (this.filter) {
      case "active":
        return this.todos.filter((t) => !t.done);
      case "completed":
        return this.todos.filter((t) => t.done);
      default:
        return this.todos;
    }
  }

  render() {
    const filtered = this.getFiltered();
    const activeCount = this.todos.filter((t) => !t.done).length;

    this.list.innerHTML = filtered
      .map(
        (todo) => `
      <li class="todo-item ${todo.done ? "completed" : ""}" data-id="${todo.id}">
        <input type="checkbox" ${todo.done ? "checked" : ""} class="todo-toggle">
        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
        <button class="todo-edit">✎</button>
        <button class="todo-delete">✕</button>
      </li>
    `
      )
      .join("");

    this.count.textContent = `${activeCount} осталось`;

    this.list.querySelectorAll(".todo-item").forEach((item) => {
      const id = Number(item.dataset.id);
      item.querySelector(".todo-toggle").addEventListener("change", () => this.toggleTodo(id));
      item.querySelector(".todo-delete").addEventListener("click", () => this.deleteTodo(id));
      item.querySelector(".todo-edit").addEventListener("click", () => {
        const span = item.querySelector(".todo-text");
        const currentText = span.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.className = "edit-input";
        span.replaceWith(input);
        input.focus();

        const save = () => this.editTodo(id, input.value);
        input.addEventListener("blur", save);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") this.render();
        });
      });
    });
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  save() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem("todos")) || [];
    } catch {
      return [];
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new TodoApp());
```

### Следующие шаги

- Drag-and-drop сортировка (SortableJS)
- Категории/теги
- Дедлайн с таймером
- Экспорт/импорт
- Синхронизация через API

---

## Проект 3: Чат-приложение (WebSocket)

**Уровень:** Средний  
**Стек:** ws (Node.js), Vanilla JS, WebSocket  
**Время:** 5-7 часов

### Описание

Реалтайм-чат с комнатами, статусами онлайн, историей сообщений, отправкой файлов.

### Структура

```
chat-app/
├── server.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── package.json
└── .env
```

### Ключевой код

```javascript
// server.js
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();
const clients = new Map();

class ChatRoom {
  constructor(name) {
    this.name = name;
    this.clients = new Map();
    this.history = [];
    this.maxHistory = 100;
  }

  addClient(ws, username) {
    this.clients.set(ws, { username, joinedAt: new Date() });
    this.broadcast({
      type: "user_joined",
      username,
      users: this.getUserList(),
      timestamp: Date.now(),
    });
    // Отправить историю новому клиент
    ws.send(JSON.stringify({
      type: "history",
      messages: this.history.slice(-50),
    }));
  }

  removeClient(ws) {
    const client = this.clients.get(ws);
    if (client) {
      this.clients.delete(ws);
      this.broadcast({
        type: "user_left",
        username: client.username,
        users: this.getUserList(),
        timestamp: Date.now(),
      });
    }
  }

  broadcast(message, exclude = null) {
    const data = JSON.stringify(message);
    for (const [client] of this.clients) {
      if (client !== exclude && client.readyState === 1) {
        client.send(data);
      }
    }
  }

  addMessage(msg) {
    this.history.push(msg);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getUserList() {
    return Array.from(this.clients.values()).map((c) => c.username);
  }
}

wss.on("connection", (ws) => {
  let currentRoom = null;
  let username = null;

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);

      switch (msg.type) {
        case "join":
          username = msg.username;
          const roomName = msg.room || "general";

          if (!rooms.has(roomName)) {
            rooms.set(roomName, new ChatRoom(roomName));
          }
          currentRoom = rooms.get(roomName);
          currentRoom.addClient(ws, username);
          break;

        case "message":
          if (currentRoom) {
            const chatMsg = {
              type: "message",
              username,
              text: msg.text,
              timestamp: Date.now(),
            };
            currentRoom.addMessage(chatMsg);
            currentRoom.broadcast(chatMsg);
          }
          break;

        case "typing":
          if (currentRoom) {
            currentRoom.broadcast(
              { type: "typing", username },
              ws
            );
          }
          break;
      }
    } catch (err) {
      console.error("Message parse error:", err);
    }
  });

  ws.on("close", () => {
    if (currentRoom) {
      currentRoom.removeClient(ws);
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
```

```javascript
// public/app.js
class ChatApp {
  constructor() {
    this.ws = null;
    this.username = "";
    this.room = "";
    this.typingTimeout = null;
    this.init();
  }

  init() {
    this.loginScreen = document.getElementById("login-screen");
    this.chatScreen = document.getElementById("chat-screen");
    this.loginForm = document.getElementById("login-form");
    this.messageForm = document.getElementById("message-form");
    this.messagesEl = document.getElementById("messages");
    this.usersEl = document.getElementById("users");
    this.typingEl = document.getElementById("typing-indicator");

    this.loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.username = document.getElementById("username").value.trim();
      this.room = document.getElementById("room").value.trim() || "general";
      if (this.username) this.connect();
    });

    this.messageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    document.getElementById("message-input").addEventListener("input", () => {
      this.sendTyping();
    });
  }

  connect() {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    this.ws = new WebSocket(`${protocol}//${location.host}`);

    this.ws.onopen = () => {
      this.loginScreen.classList.add("hidden");
      this.chatScreen.classList.remove("hidden");

      this.ws.send(JSON.stringify({
        type: "join",
        username: this.username,
        room: this.room,
      }));
    };

    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      this.handleMessage(msg);
    };

    this.ws.onclose = () => {
      this.addSystemMessage("Соединение разорвано. Переподключение...");
      setTimeout(() => this.connect(), 3000);
    };
  }

  handleMessage(msg) {
    switch (msg.type) {
      case "message":
        this.addMessage(msg.username, msg.text, msg.timestamp);
        break;
      case "user_joined":
        this.addSystemMessage(`${msg.username} присоединился`);
        this.updateUsers(msg.users);
        break;
      case "user_left":
        this.addSystemMessage(`${msg.username} покинул чат`);
        this.updateUsers(msg.users);
        break;
      case "typing":
        this.showTyping(msg.username);
        break;
      case "history":
        msg.messages.forEach((m) => this.addMessage(m.username, m.text, m.timestamp, false));
        break;
    }
  }

  sendMessage() {
    const input = document.getElementById("message-input");
    const text = input.value.trim();
    if (!text || !this.ws) return;

    this.ws.send(JSON.stringify({ type: "message", text }));
    this.addMessage(this.username, text, Date.now());
    input.value = "";
  }

  sendTyping() {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify({ type: "typing" }));
    }
    this.typingTimeout = setTimeout(() => {}, 2000);
  }

  addMessage(username, text, timestamp, scroll = true) {
    const time = new Date(timestamp).toLocaleTimeString("ru", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const isMe = username === this.username;
    const div = document.createElement("div");
    div.className = `message ${isMe ? "own" : ""}`;
    div.innerHTML = `
      <span class="msg-user">${this.escapeHtml(username)}</span>
      <span class="msg-text">${this.escapeHtml(text)}</span>
      <span class="msg-time">${time}</span>
    `;
    this.messagesEl.appendChild(div);
    if (scroll) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }

  addSystemMessage(text) {
    const div = document.createElement("div");
    div.className = "message system";
    div.textContent = text;
    this.messagesEl.appendChild(div);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  updateUsers(users) {
    this.usersEl.innerHTML = users
      .map((u) => `<li class="${u === this.username ? "me" : ""}">${this.escapeHtml(u)}</li>`)
      .join("");
  }

  showTyping(username) {
    this.typingEl.textContent = `${username} печатает...`;
    this.typingEl.classList.remove("hidden");
    setTimeout(() => this.typingEl.classList.add("hidden"), 3000);
  }

  escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", () => new ChatApp());
```

### Следующие шаги

- Отправка файлов/изображений
- Приватные сообщения
- Эмодзи-пикер
- Уведомления (Web Notifications API)
- История в Redis

---

## Проект 4: Браузерное расширение

**Уровень:** Средний  
**Стек:** Chrome Extensions API, Vanilla JS  
**Время:** 4-6 часов

### Описание

Расширение для блокировки отвлекающих сайтов. Popup с интерфейсом, background script для перехвата запросов, storage API.

### Структура

```
focus-extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background.js
├── content.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Ключевой код

```json
// manifest.json
{
  "manifest_version": 3,
  "name": "Focus Blocker",
  "version": "1.0.0",
  "description": "Блокировка отвлекающих сайтов",
  "permissions": ["storage", "alarms", "activeTab"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": "icons/icon48.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ]
}
```

```javascript
// background.js
class FocusBlocker {
  constructor() {
    this.blockedSites = [];
    this.isEnabled = false;
    this.scheduleStart = null;
    this.scheduleEnd = null;

    this.loadSettings();
    this.setupAlarms();
    this.setupListeners();
  }

  async loadSettings() {
    const data = await chrome.storage.local.get([
      "blockedSites", "isEnabled", "scheduleStart", "scheduleEnd",
    ]);
    this.blockedSites = data.blockedSites || [];
    this.isEnabled = data.isEnabled || false;
    this.scheduleStart = data.scheduleStart || null;
    this.scheduleEnd = data.scheduleEnd || null;
  }

  async saveSettings() {
    await chrome.storage.local.set({
      blockedSites: this.blockedSites,
      isEnabled: this.isEnabled,
      scheduleStart: this.scheduleStart,
      scheduleEnd: this.scheduleEnd,
    });
  }

  setupAlarms() {
    chrome.alarms.create("checkSchedule", { periodInMinutes: 1 });
  }

  setupListeners() {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "checkSchedule") {
        this.checkSchedule();
      }
    });

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      switch (msg.action) {
        case "getSettings":
          sendResponse({
            blockedSites: this.blockedSites,
            isEnabled: this.isEnabled,
          });
          break;
        case "toggleBlock":
          this.isEnabled = msg.isEnabled;
          this.saveSettings();
          sendResponse({ success: true });
          break;
        case "addSite":
          if (!this.blockedSites.includes(msg.site)) {
            this.blockedSites.push(msg.site);
            this.saveSettings();
          }
          sendResponse({ success: true });
          break;
        case "removeSite":
          this.blockedSites = this.blockedSites.filter((s) => s !== msg.site);
          this.saveSettings();
          sendResponse({ success: true });
          break;
        case "isBlocked":
          sendResponse({ blocked: this.isBlocked(msg.url) });
          break;
      }
    });
  }

  isBlocked(url) {
    if (!this.isEnabled) return false;
    try {
      const hostname = new URL(url).hostname;
      return this.blockedSites.some((site) =>
        hostname.includes(site)
      );
    } catch {
      return false;
    }
  }

  checkSchedule() {
    if (!this.scheduleStart || !this.scheduleEnd) return;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const current = hours * 60 + minutes;

    const [startH, startM] = this.scheduleStart.split(":").map(Number);
    const [endH, endM] = this.scheduleEnd.split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (current >= start && current <= end) {
      this.isEnabled = true;
    } else if (this.scheduleStart) {
      this.isEnabled = false;
    }
    this.saveSettings();
  }
}

new FocusBlocker();
```

```javascript
// content.js
chrome.runtime.sendMessage(
  { action: "isBlocked", url: window.location.href },
  (response) => {
    if (response && response.blocked) {
      document.documentElement.innerHTML = `
        <body style="display:flex;align-items:center;justify-content:center;
                     height:100vh;font-family:sans-serif;background:#1a1a2e;color:#e94560;">
          <div style="text-align:center">
            <h1>Блокировка активна</h1>
            <p>Этот сайт заблокирован в режиме фокусировки.</p>
            <p style="color:#888">Возвращайтесь к работе!</p>
          </div>
        </body>
      `;
      document.title = "Заблокировано — Focus Blocker";
    }
  }
);
```

```javascript
// popup/popup.js
document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.getElementById("toggle");
  const siteInput = document.getElementById("site-input");
  const addBtn = document.getElementById("add-btn");
  const siteList = document.getElementById("site-list");

  // Загрузить настройки
  chrome.runtime.sendMessage({ action: "getSettings" }, (settings) => {
    toggle.checked = settings.isEnabled;
    renderSites(settings.blockedSites);
  });

  toggle.addEventListener("change", () => {
    chrome.runtime.sendMessage({
      action: "toggleBlock",
      isEnabled: toggle.checked,
    });
  });

  addBtn.addEventListener("click", () => {
    const site = siteInput.value.trim();
    if (site) {
      chrome.runtime.sendMessage({ action: "addSite", site }, () => {
        siteInput.value = "";
        reloadSites();
      });
    }
  });

  function renderSites(sites) {
    siteList.innerHTML = sites
      .map(
        (s) => `
      <li>
        <span>${s}</span>
        <button class="remove-btn" data-site="${s}">✕</button>
      </li>
    `
      )
      .join("");

    siteList.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        chrome.runtime.sendMessage(
          { action: "removeSite", site: btn.dataset.site },
          () => reloadSites()
        );
      });
    });
  }

  function reloadSites() {
    chrome.runtime.sendMessage({ action: "getSettings" }, (s) => {
      renderSites(s.blockedSites);
    });
  }
});
```

### Следующие шаги

- Таймер Pomodoro
- Статистика по времени на сайтах
- Белый список для определённых часов
- Экспорт/импорт настроек
- Синхронизация через sync storage

---

## Проект 5: React-компоненты (без сборщика)

**Уровень:** Средний  
**Стек:** React 18, Babel standalone, CDN  
**Время:** 4-5 часов

### Описание

Набор переиспользуемых React-компонентов: таблица с сортировкой, модальное окно, тост-уведомления, автокомплит.

### Структура

```
react-components/
├── index.html
├── components/
│   ├── DataTable.js
│   ├── Modal.js
│   ├── Toast.js
│   └── Autocomplete.js
└── app.js
```

### Ключевой код

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>React Components</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="app.js"></script>
</body>
</html>
```

```javascript
// components/DataTable.js
const { useState, useMemo } = React;

function DataTable({ data, columns, pageSize = 10 }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pagedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="data-table">
      <input
        type="text"
        placeholder="Поиск..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        className="table-search"
      />
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: "pointer" }}>
                {col.label}
                {sortConfig.key === col.key && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
        <span>{currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</button>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
      </div>
    </div>
  );
}
```

```javascript
// components/Toast.js
const { useState, useEffect, useCallback, createContext, useContext } = React;

const ToastContext = createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  return useContext(ToastContext);
}
```

```javascript
// components/Modal.js
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
```

```javascript
// components/Autocomplete.js
function Autocomplete({ items, onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, items]);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0) {
          onSelect(filtered[highlightIndex]);
          setQuery(filtered[highlightIndex]);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="autocomplete">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setHighlightIndex(-1); }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {isOpen && filtered.length > 0 && (
        <ul className="autocomplete-list">
          {filtered.map((item, i) => (
            <li
              key={item}
              className={`autocomplete-item ${i === highlightIndex ? "highlighted" : ""}`}
              onMouseDown={() => { onSelect(item); setQuery(item); setIsOpen(false); }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

```javascript
// app.js
function App() {
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const users = [
    { id: 1, name: "Алексей", email: "alex@mail.ru", role: "admin" },
    { id: 2, name: "Мария", email: "maria@mail.ru", role: "user" },
    { id: 3, name: "Иван", email: "ivan@mail.ru", role: "moderator" },
  ];

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Имя" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Роль",
      render: (val) => <span className={`badge badge-${val}`}>{val}</span>,
    },
  ];

  return (
    <div className="app">
      <h1>React Components Demo</h1>

      <section>
        <h2>Таблица</h2>
        <DataTable data={users} columns={columns} pageSize={5} />
      </section>

      <section>
        <h2>Модальное окно</h2>
        <button onClick={() => setModalOpen(true)}>Открыть</button>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Заголовок">
          <p>Содержимое модального окна</p>
          <button onClick={() => { addToast("Сохранено!", "success"); setModalOpen(false); }}>
            Сохранить
          </button>
        </Modal>
      </section>

      <section>
        <h2>Автокомплит</h2>
        <Autocomplete
          items={["JavaScript", "TypeScript", "Python", "Go", "Rust", "Java"]}
          onSelect={(item) => addToast(`Выбрано: ${item}`, "info")}
          placeholder="Язык программирования..."
        />
      </section>
    </div>
  );
}

function Root() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
```

### Следующие шаги

- Добавить drag-and-drop в таблицу
- Tree-компонент (файловое дерево)
- Charts (Chart.js интеграция)
- Form builder с валидацией

---

## Проект 6: Видео-плеер

**Уровень:** Средний  
**Стек:** Vanilla JS, Media API  
**Время:** 4-5 часов

### Описание

Кастомный видеоплеер с управлением клавиатурой, прогресс-баром, скоростью, Picture-in-Picture, плейлистом.

### Ключевой код

```javascript
// player.js
class VideoPlayer {
  constructor(container) {
    this.container = container;
    this.isPlaying = false;
    this.volume = 1;
    this.playbackRate = 1;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="video-wrapper">
        <video class="video-element"></video>
        <div class="video-overlay">
          <div class="big-play">▶</div>
        </div>
        <div class="video-controls">
          <div class="progress-bar">
            <div class="progress-filled"></div>
            <div class="progress-handle"></div>
          </div>
          <div class="controls-row">
            <button class="play-btn">▶</button>
            <div class="volume-control">
              <button class="volume-btn">🔊</button>
              <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="1">
            </div>
            <span class="time-display">0:00 / 0:00</span>
            <div class="controls-right">
              <select class="speed-select">
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1" selected>1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
              <button class="pip-btn">⧉</button>
              <button class="fullscreen-btn">⛶</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.video = this.container.querySelector(".video-element");
    this.playBtn = this.container.querySelector(".play-btn");
    this.progressBar = this.container.querySelector(".progress-bar");
    this.progressFilled = this.container.querySelector(".progress-filled");
    this.timeDisplay = this.container.querySelector(".time-display");
    this.volumeSlider = this.container.querySelector(".volume-slider");
    this.speedSelect = this.container.querySelector(".speed-select");
    this.overlay = this.container.querySelector(".video-overlay");

    this.bindEvents();
  }

  bindEvents() {
    this.playBtn.addEventListener("click", () => this.togglePlay());
    this.overlay.addEventListener("click", () => this.togglePlay());

    this.video.addEventListener("timeupdate", () => this.updateProgress());
    this.video.addEventListener("loadedmetadata", () => this.updateTime());
    this.video.addEventListener("ended", () => this.onEnded());

    this.progressBar.addEventListener("click", (e) => {
      const rect = this.progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.video.currentTime = percent * this.video.duration;
    });

    this.volumeSlider.addEventListener("input", (e) => {
      this.video.volume = e.target.value;
    });

    this.speedSelect.addEventListener("change", (e) => {
      this.video.playbackRate = parseFloat(e.target.value);
    });

    this.container.querySelector(".pip-btn").addEventListener("click", () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else if (this.video.requestPictureInPicture) {
        this.video.requestPictureInPicture();
      }
    });

    this.container.querySelector(".fullscreen-btn").addEventListener("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        this.container.requestFullscreen();
      }
    });

    this.container.querySelector(".volume-btn").addEventListener("click", () => {
      this.video.muted = !this.video.muted;
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          this.togglePlay();
          break;
        case "ArrowLeft":
          this.video.currentTime -= 10;
          break;
        case "ArrowRight":
          this.video.currentTime += 10;
          break;
        case "ArrowUp":
          e.preventDefault();
          this.video.volume = Math.min(1, this.video.volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          this.video.volume = Math.max(0, this.video.volume - 0.1);
          break;
        case "f":
          this.container.requestFullscreen();
          break;
        case "m":
          this.video.muted = !this.video.muted;
          break;
      }
    });
  }

  loadSource(src) {
    this.video.src = src;
    this.video.load();
  }

  togglePlay() {
    if (this.video.paused) {
      this.video.play();
      this.playBtn.textContent = "⏸";
      this.overlay.classList.add("hidden");
    } else {
      this.video.pause();
      this.playBtn.textContent = "▶";
      this.overlay.classList.remove("hidden");
    }
  }

  updateProgress() {
    const percent = (this.video.currentTime / this.video.duration) * 100;
    this.progressFilled.style.width = `${percent}%`;
    this.updateTime();
  }

  updateTime() {
    const fmt = (t) => {
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${s.toString().padStart(2, "0")}`;
    };
    this.timeDisplay.textContent =
      `${fmt(this.video.currentTime)} / ${fmt(this.video.duration || 0)}`;
  }

  onEnded() {
    this.playBtn.textContent = "▶";
    this.overlay.classList.remove("hidden");
  }
}

// Использование
const player = new VideoPlayer(document.getElementById("player"));
player.loadSource("https://example.com/video.mp4");
```

### Следующие шаги

- Плейлист с переключением
- Субтитры (WebVTT)
- Скачивание видео
- Адаптивное качество (HLS.js)

---

## Проект 7: Галерея изображений

**Уровень:** Начинающий-Средний  
**Стек:** Vanilla JS, IntersectionObserver, lazy loading  
**Время:** 3-4 часа

### Описание

Масонри-галерея с lazy loading, лайтбоксом, фильтрацией по тегам, бесконечной подгрузкой.

### Ключевой код

```javascript
// gallery.js
class MasonryGallery {
  constructor(container, options = {}) {
    this.container = container;
    this.columns = options.columns || 4;
    this.gap = options.gap || 16;
    this.images = [];
    this.observer = null;
    this.lightbox = null;
    this.init();
  }

  init() {
    this.container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${this.columns}, 1fr);
      gap: ${this.gap}px;
    `;

    this.setupLazyLoading();
    this.createLightbox();
  }

  setupLazyLoading() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add("loaded");
            this.observer.unobserve(img);
          }
        });
      },
      { rootMargin: "200px" }
    );
  }

  addImages(imageData) {
    imageData.forEach((data) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.dataset.tags = data.tags.join(",");

      item.innerHTML = `
        <img data-src="${data.src}" alt="${data.alt}" class="gallery-img">
        <div class="gallery-overlay">
          <span class="gallery-title">${data.title || ""}</span>
          <span class="gallery-tags">${data.tags.join(", ")}</span>
        </div>
      `;

      const img = item.querySelector("img");
      this.observer.observe(img);

      item.addEventListener("click", () => this.openLightbox(data));
      this.container.appendChild(item);
      this.images.push({ element: item, data });
    });
  }

  filterByTag(tag) {
    this.images.forEach(({ element, data }) => {
      if (tag === "all" || data.tags.includes(tag)) {
        element.style.display = "";
      } else {
        element.style.display = "none";
      }
    });
  }

  createLightbox() {
    this.lightbox = document.createElement("div");
    this.lightbox.className = "lightbox hidden";
    this.lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <button class="lightbox-close">✕</button>
        <button class="lightbox-prev">‹</button>
        <button class="lightbox-next">›</button>
        <img class="lightbox-img" src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(this.lightbox);

    this.lightbox.querySelector(".lightbox-backdrop").addEventListener("click", () => this.closeLightbox());
    this.lightbox.querySelector(".lightbox-close").addEventListener("click", () => this.closeLightbox());
    this.lightbox.querySelector(".lightbox-prev").addEventListener("click", () => this.navigateLightbox(-1));
    this.lightbox.querySelector(".lightbox-next").addEventListener("click", () => this.navigateLightbox(1));

    document.addEventListener("keydown", (e) => {
      if (this.lightbox.classList.contains("hidden")) return;
      if (e.key === "Escape") this.closeLightbox();
      if (e.key === "ArrowLeft") this.navigateLightbox(-1);
      if (e.key === "ArrowRight") this.navigateLightbox(1);
    });
  }

  openLightbox(data) {
    this.currentLightboxData = data;
    const img = this.lightbox.querySelector(".lightbox-img");
    img.src = data.src;
    this.lightbox.querySelector(".lightbox-caption").textContent = data.title || "";
    this.lightbox.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  closeLightbox() {
    this.lightbox.classList.add("hidden");
    document.body.style.overflow = "";
  }

  navigateLightbox(direction) {
    const visibleImages = this.images.filter(
      (img) => img.element.style.display !== "none"
    );
    const currentIndex = visibleImages.findIndex(
      (img) => img.data === this.currentLightboxData
    );
    const nextIndex = (currentIndex + direction + visibleImages.length) % visibleImages.length;
    this.openLightbox(visibleImages[nextIndex].data);
  }
}

// Использование
const gallery = new MasonryGallery(document.getElementById("gallery"), { columns: 4 });
gallery.addImages([
  { src: "img1.jpg", title: "Фото 1", tags: ["nature", "landscape"], alt: "" },
  { src: "img2.jpg", title: "Фото 2", tags: ["city", "architecture"], alt: "" },
]);
```

### Следующие шаги

- Загрузка с Unsplash API
- PIN-код (Pinterest-style)
- Редактирование (обрезка, фильтры)
- Виртуальный скроллинг для больших коллекций

---

## Проект 8: Форм-библиотека с валидацией

**Уровень:** Средний  
**Стек:** Vanilla JS  
**Время:** 5-6 часов

### Описание

Библиотека для декларативного создания форм: правила валидации, кастомные сообщения,_CONDITIONAL_ отображение полей.

### Ключевой код

```javascript
// form-builder.js
class FormBuilder {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { validateOnChange: true, ...options };
    this.fields = {};
    this.validators = {
      required: (v) => (v ? null : "Обязательное поле"),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Некорректный email"),
      min: (min) => (v) => (v.length >= min ? null : `Минимум ${min} символов`),
      max: (max) => (v) => (v.length <= max ? null : `Максимум ${max} символов`),
      pattern: (re) => (v) => (re.test(v) ? null : "Некорректный формат"),
      match: (field) => (v) =>
        v === this.fields[field]?.value ? null : "Поля не совпадают",
      custom: (fn) => fn,
    };
    this.onSubmit = options.onSubmit || (() => {});
    this.onChange = options.onChange || (() => {});
  }

  addField(name, config) {
    this.fields[name] = {
      value: config.defaultValue || "",
      rules: config.rules || [],
      label: config.label || name,
      type: config.type || "text",
      placeholder: config.placeholder || "",
      hidden: config.hidden || false,
      element: null,
      errorEl: null,
    };
    return this;
  }

  render() {
    this.container.innerHTML = "";
    this.container.classList.add("form-builder");

    for (const [name, field] of Object.entries(this.fields)) {
      if (field.hidden) continue;

      const group = document.createElement("div");
      group.className = "form-group";

      const label = document.createElement("label");
      label.className = "form-label";
      label.textContent = field.label;
      label.setAttribute("for", name);

      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
      } else if (field.type === "select") {
        input = document.createElement("select");
        (field.options || []).forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.label;
          input.appendChild(option);
        });
      } else {
        input = document.createElement("input");
        input.type = field.type;
      }

      input.id = name;
      input.name = name;
      input.className = "form-input";
      input.placeholder = field.placeholder;
      input.value = field.value;

      const error = document.createElement("div");
      error.className = "form-error";

      input.addEventListener("input", () => {
        field.value = input.value;
        if (this.options.validateOnChange) {
          this.validateField(name);
        }
        this.onChange(name, field.value, this.getValues());
      });

      input.addEventListener("blur", () => this.validateField(name));

      group.append(label, input, error);
      this.container.appendChild(group);

      field.element = input;
      field.errorEl = error;
    }

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "form-submit";
    submitBtn.textContent = this.options.submitText || "Отправить";
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.submit();
    });
    this.container.appendChild(submitBtn);

    return this;
  }

  validateField(name) {
    const field = this.fields[name];
    if (!field) return true;

    for (const rule of field.rules) {
      const [validatorName, ...args] = Array.isArray(rule) ? rule : [rule];
      const validator = this.validators[validatorName];
      if (!validator) continue;

      const fn = args.length > 0 ? validator(...args) : validator;
      const error = fn(field.value);

      if (error) {
        field.errorEl.textContent = error;
        field.element.classList.add("error");
        field.element.classList.remove("valid");
        return false;
      }
    }

    field.errorEl.textContent = "";
    field.element.classList.remove("error");
    field.element.classList.add("valid");
    return true;
  }

  validate() {
    let valid = true;
    for (const name of Object.keys(this.fields)) {
      if (!this.validateField(name)) {
        valid = false;
      }
    }
    return valid;
  }

  getValues() {
    const values = {};
    for (const [name, field] of Object.entries(this.fields)) {
      values[name] = field.value;
    }
    return values;
  }

  setValues(values) {
    for (const [name, value] of Object.entries(values)) {
      if (this.fields[name]) {
        this.fields[name].value = value;
        this.fields[name].element.value = value;
      }
    }
    return this;
  }

  submit() {
    if (this.validate()) {
      this.onSubmit(this.getValues());
    }
  }

  reset() {
    for (const field of Object.values(this.fields)) {
      field.value = "";
      field.element.value = "";
      field.errorEl.textContent = "";
      field.element.classList.remove("error", "valid");
    }
  }
}

// Использование
const form = new FormBuilder(document.getElementById("form"), {
  submitText: "Зарегистрироваться",
  onSubmit: (values) => {
    console.log("Данные:", values);
    alert("Форма отправлена!");
  },
});

form
  .addField("name", { label: "Имя", rules: ["required", ["min", 2]] })
  .addField("email", { label: "Email", rules: ["required", "email"] })
  .addField("password", {
    label: "Пароль",
    type: "password",
    rules: ["required", ["min", 8]],
  })
  .addField("confirm", {
    label: "Подтвердите пароль",
    type: "password",
    rules: ["required", ["match", "password"]],
  })
  .render();
```

### Следующие шаги

- Conditionals (показывать поле если другое == значение)
- Динамические поля (add/remove)
- Async-валидация (проверка уникальности email)
- Экспорт в JSON Schema
- Интеграция с серверной валидацией

---

## Проект 9: Таск-менеджер с Kanban-доской

**Уровень:** Средний-Продвинутый  
**Стек:** Vanilla JS, Drag-and-Drop API  
**Время:** 6-8 часов

### Описание

Kanban-доска как в Trello: колонки (To Do, In Progress, Done), карточки с перетаскиванием, метки, дедлайны.

### Ключевой код

```javascript
// kanban.js
class KanbanBoard {
  constructor(container, options = {}) {
    this.container = container;
    this.columns = options.columns || ["To Do", "In Progress", "Review", "Done"];
    this.cards = this.loadCards();
    this.draggedCard = null;
    this.init();
  }

  init() {
    this.render();
    this.container.classList.add("kanban-board");
  }

  render() {
    this.container.innerHTML = "";
    this.columns.forEach((col) => {
      const columnEl = document.createElement("div");
      columnEl.className = "kanban-column";
      columnEl.dataset.column = col;

      const cards = this.cards.filter((c) => c.column === col);

      columnEl.innerHTML = `
        <div class="column-header">
          <h3>${col} <span class="count">${cards.length}</span></h3>
          <button class="add-card-btn" data-column="${col}">+</button>
        </div>
        <div class="column-cards" data-column="${col}">
          ${cards.map((card) => this.renderCard(card)).join("")}
        </div>
      `;

      this.container.appendChild(columnEl);
    });

    this.bindDragEvents();
    this.bindCardEvents();
    this.bindAddButtons();
  }

  renderCard(card) {
    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
    return `
      <div class="kanban-card ${card.priority || ""}" draggable="true" data-id="${card.id}">
        <div class="card-header">
          <span class="card-title">${this.escapeHtml(card.title)}</span>
          <button class="card-delete" data-id="${card.id}">✕</button>
        </div>
        ${card.description ? `<p class="card-desc">${this.escapeHtml(card.description)}</p>` : ""}
        <div class="card-footer">
          ${card.tags.map((t) => `<span class="card-tag">${t}</span>`).join("")}
          ${card.dueDate ? `<span class="card-due ${isOverdue ? "overdue" : ""}">${card.dueDate}</span>` : ""}
        </div>
      </div>
    `;
  }

  bindDragEvents() {
    this.container.addEventListener("dragstart", (e) => {
      if (!e.target.classList.contains("kanban-card")) return;
      this.draggedCard = e.target;
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    this.container.addEventListener("dragend", (e) => {
      if (this.draggedCard) {
        this.draggedCard.classList.remove("dragging");
        this.draggedCard = null;
      }
    });

    this.container.querySelectorAll(".column-cards").forEach((col) => {
      col.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        col.classList.add("drag-over");
      });

      col.addEventListener("dragleave", () => col.classList.remove("drag-over"));

      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("drag-over");
        if (!this.draggedCard) return;

        const cardId = Number(this.draggedCard.dataset.id);
        const newColumn = col.dataset.column;
        const card = this.cards.find((c) => c.id === cardId);

        if (card) {
          card.column = newColumn;
          this.saveCards();
          this.render();
        }
      });
    });
  }

  bindCardEvents() {
    this.container.querySelectorAll(".card-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        this.deleteCard(id);
      });
    });
  }

  bindAddButtons() {
    this.container.querySelectorAll(".add-card-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const column = btn.dataset.column;
        const title = prompt("Название карточки:");
        if (title) {
          const description = prompt("Описание (необязательно):") || "";
          this.addCard({ title, description, column, tags: [], priority: "" });
        }
      });
    });
  }

  addCard(cardData) {
    const card = {
      id: Date.now(),
      title: cardData.title,
      description: cardData.description || "",
      column: cardData.column || this.columns[0],
      tags: cardData.tags || [],
      priority: cardData.priority || "",
      dueDate: cardData.dueDate || null,
      createdAt: new Date().toISOString(),
    };
    this.cards.push(card);
    this.saveCards();
    this.render();
    return card;
  }

  deleteCard(id) {
    this.cards = this.cards.filter((c) => c.id !== id);
    this.saveCards();
    this.render();
  }

  moveCard(id, toColumn) {
    const card = this.cards.find((c) => c.id === id);
    if (card) {
      card.column = toColumn;
      this.saveCards();
      this.render();
    }
  }

  saveCards() {
    localStorage.setItem("kanban-cards", JSON.stringify(this.cards));
  }

  loadCards() {
    try {
      return JSON.parse(localStorage.getItem("kanban-cards")) || [];
    } catch {
      return [];
    }
  }

  escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }
}

// Использование
const board = new KanbanBoard(document.getElementById("kanban"));
board.addCard({ title: "Настроить CI/CD", column: "To Do", tags: ["devops"] });
board.addCard({ title: "Написать тесты", column: "In Progress", tags: ["testing"], priority: "high" });
```

### Следующие шаги

- API-бэкенд для хранения
- Поиск/фильтрация карточек
- Метки с цветами
- Подзадачи (checklist)
- Уведомления о дедлайнах
- Экспорт в Markdown

---

## Проект 10: Мини-игра (Snake)

**Уровень:** Средний  
**Стек:** Canvas API, Vanilla JS  
**Время:** 4-5 часов

### Описание

Классическая змейка на Canvas: управление клавишами, рост, очки, уровни сложности, таблица рекордов.

### Ключевой код

```javascript
// snake.js
class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    this.snake = [{ x: 10, y: 10 }];
    this.food = { x: 15, y: 15 };
    this.direction = { x: 0, y: -1 };
    this.nextDirection = { x: 0, y: -1 };
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;
    this.speed = 120;
    this.isRunning = false;
    this.isPaused = false;
    this.gameLoop = null;

    this.init();
  }

  init() {
    this.canvas.width = 400;
    this.canvas.height = 400;

    document.addEventListener("keydown", (e) => this.handleKey(e));
    this.drawStartScreen();
  }

  handleKey(e) {
    const keyMap = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    };

    if (e.key === " " || e.key === "Escape") {
      if (!this.isRunning) {
        this.start();
      } else {
        this.togglePause();
      }
      return;
    }

    const newDir = keyMap[e.key];
    if (newDir) {
      e.preventDefault();
      // Запрет разворота на 180°
      if (newDir.x !== -this.direction.x || newDir.y !== -this.direction.y) {
        this.nextDirection = newDir;
      }
    }
  }

  start() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: -1 };
    this.nextDirection = { x: 0, y: -1 };
    this.score = 0;
    this.speed = 120;
    this.isRunning = true;
    this.isPaused = false;
    this.spawnFood();
    this.gameLoop = setInterval(() => this.update(), this.speed);
  }

  update() {
    if (this.isPaused) return;

    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;

    // Столкновение со стеной
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    // Столкновение с собой
    if (this.snake.some((s) => s.x === head.x && s.y === head.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    // Еда
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      if (this.score % 50 === 0) {
        this.speed = Math.max(50, this.speed - 10);
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.speed);
      }
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    // Фон
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Сетка
    this.ctx.strokeStyle = "#16213e";
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }

    // Змейка
    this.snake.forEach((segment, i) => {
      const brightness = 1 - i / this.snake.length * 0.5;
      this.ctx.fillStyle = `rgba(0, 255, 136, ${brightness})`;
      this.ctx.shadowColor = "#00ff88";
      this.ctx.shadowBlur = i === 0 ? 10 : 0;
      this.ctx.fillRect(
        segment.x * this.gridSize + 1,
        segment.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });
    this.ctx.shadowBlur = 0;

    // Еда
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.shadowColor = "#ff6b6b";
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Счёт
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "16px monospace";
    this.ctx.fillText(`Счёт: ${this.score}`, 10, 25);
    this.ctx.fillText(`Рекорд: ${this.highScore}`, 10, 45);

    if (this.isPaused) {
      this.ctx.fillStyle = "rgba(0,0,0,0.7)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "24px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("ПАУЗА", this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.textAlign = "start";
    }
  }

  drawStartScreen() {
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#00ff88";
    this.ctx.font = "32px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("SNAKE", this.canvas.width / 2, this.canvas.height / 2 - 40);
    this.ctx.fillStyle = "#888";
    this.ctx.font = "16px sans-serif";
    this.ctx.fillText("Нажмите ПРОБЕЛ для старта", this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.fillText("WASD / Стрелки — управление", this.canvas.width / 2, this.canvas.height / 2 + 40);
    this.ctx.textAlign = "start";
  }

  spawnFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
      };
    } while (this.snake.some((s) => s.x === this.food.x && s.y === this.food.y));
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  gameOver() {
    clearInterval(this.gameLoop);
    this.isRunning = false;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("snakeHighScore", this.highScore);
    }

    this.ctx.fillStyle = "rgba(0,0,0,0.8)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.font = "28px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - 20);
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "18px sans-serif";
    this.ctx.fillText(`Счёт: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillStyle = "#888";
    this.ctx.font = "14px sans-serif";
    this.ctx.fillText("ПРОБЕЛ — заново", this.canvas.width / 2, this.canvas.height / 2 + 60);
    this.ctx.textAlign = "start";
  }
}

// Запуск
document.addEventListener("DOMContentLoaded", () => new SnakeGame("game-canvas"));
```

### Следующие шаги

- Бонусы (ускорение, заморозка, двойные очки)
- Генератор уровней
- Онлайн-таблица рекордов
- Мультиплеер (WebSocket)
- Мобильное управление (свайпы)

---

## Рекомендации

| Уровень | Проекты | Ключевые навыки |
|---------|---------|-----------------|
| Начинающий | Погода, Todo, Галерея | DOM, Fetch, localStorage |
| Средний | Чат (WS), Расширение, Формы, Видео | WebSocket, Chrome API, Canvas |
| Средний+ | React-компоненты, Kanban, Змейка | React, Drag-and-Drop, Game loop |

**Советы:**

1. Используйте `const` по умолчанию, `let` когда нужно переназначение
2. Всегда обрабатывайте ошибки в `async/await` (try/catch)
3. Избегайте утечек памяти: отписывайтесь от событий
4. Используйте `IntersectionObserver` вместо scroll-событий
5. Декомпозируйте: один компонент — одна ответственность
