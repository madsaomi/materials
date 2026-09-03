# 知 · Chishiki Knowledge Repository

A minimalist, Japanese-inspired Wabi-Sabi digital garden and knowledge repository, powered by **Python Flask**, Jinja2, and Python-Markdown.

## 🌿 Features

- **Tranquil Wabi-Sabi Aesthetic**: Clean typography (*Noto Serif JP* & *Inter*), warm paper tones (`#f7f5f0`), and seamless dark mode support.
- **Python Flask Backend**: Fast, lightweight SSR server scanning 600+ structured markdown notes on the fly.
- **Dynamic Table of Contents (ToC)**: Auto-extracted from document headings for effortless navigation.
- **Quick Search (`Cmd+K` / `Ctrl+K`)**: Instant keyboard-navigable modal search across all documents.
- **Zen Mode (Focus)**: Distraction-free reading mode hiding sidebars and auxiliary navigation.
- **Font & Theme Controls**: Toggle between Serif/Sans typography and Light/Dark modes with `localStorage` persistence.
- **Syntax Highlighting**: Monokai-styled syntax highlighting for code blocks across languages and snippets.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Flask Server
```bash
python app.py
```

### 3. Open in Browser
Navigate to **`http://localhost:5000`**

---

## 📂 Project Structure

```text
materials/
├── app.py               # Flask application & Markdown parser
├── requirements.txt     # Python dependencies
├── knowledge/           # Isolated structured notes (.md)
├── static/              # Stylesheets & static assets
└── templates/           # Jinja2 templates (layout, index, doc, 404)
```

## 📜 License
MIT
