# 🏛️ Architecture & Technical Specifications

This document describes the architectural flow, algorithms, caching mechanisms, and design systems of `materials` (`Chishiki Knowledge Sanctuary`).

---

## 1. High-Level Data Flow

```
[knowledge/*.md] (642 Markdown Notes)
        │
        ▼
   [app.py: get_all_docs()]
        │
        ├── 1. Frontmatter extraction (`python-frontmatter`)
        ├── 2. Slug calculation (`rel_path[:-3].replace('\\', '/')`)
        ├── 3. Title resolution (Frontmatter > First H1 > Filename)
        ├── 4. Category grouping (`slug.split('/')[0]`)
        ├── 5. Markdown Parsing & Pygments Syntax Highlighting
        ├── 6. Obsidian Link Rewriting (`.md` -> `/doc/...`)
        ├── 7. Table of Contents & Heading Slugification (Code-block safe)
        └── 8. Reading Time Estimation (Words / 200 wpm)
        │
        ▼
[_docs_cache in Memory] (Invalidated on knowledge/ mtime change)
        │
        ├── Route `/`                  ──► index.html (Stats, Hero, Category Directory)
        ├── Route `/doc/<path:slug>`    ──► doc.html (Article, Breadcrumbs, Prev/Next, ToC)
        ├── Route `/api/search.json`   ──► JSON (Client-side multi-word search index)
        └── Route `404`                ──► 404.html (Sanctuary error page)
```

---

## 2. Core Modules & Mechanisms

### 2.1 Caching Mechanism (`_docs_cache`)
- `_knowledge_mtime()` walks `knowledge/` and checks the latest `.md` file modification time.
- `get_all_docs()` checks if `current_mtime <= _cache_mtime`.
- If cache is valid, it returns the in-memory `_docs_cache` instantly (0ms latency).
- Cold start parses all 642 files in ~10-15 seconds; all subsequent requests are instantaneous.

### 2.2 Markdown Parsing & Code Fence Tracking
In `app.py:parse_markdown(content, slug)`:
- Markdown is parsed using `python-markdown` with extensions: `fenced_code`, `codehilite`, `tables`, `toc`.
- **Critical Invariant:** To prevent Markdown headings regex from matching `# comment` lines inside Python/bash code blocks, the parser tracks code fence boundaries:
  ```python
  in_code_block = False
  for line in content.splitlines():
      if line.strip().startswith('```'):
          in_code_block = not in_code_block
          continue
      if in_code_block:
          continue  # Skip comments inside code blocks
      ...
  ```
  *(This invariant rescues over 1,200 code comments from polluting the Table of Contents).*

### 2.3 Heading Anchors & Deduplication
- Headings are slugified via GitHub-style slugification:
  `slugify(title): lowercase, remove punctuation, replace whitespace with '-'`.
- Per-document slug collision handling: If multiple headings in a note produce the same slug (e.g. multiple `### Summary`), `app.py` tracks `seen_slugs` and appends `-1`, `-2`, etc.

### 2.4 Obsidian Link Rewriter
- Internal links in `knowledge/` are written using relative Obsidian `.md` links:
  - Example: `[Grammar Overview](../grammar/overview.md)`
- In `parse_markdown`, a regex rewriter matches `href="...*.md"`:
  1. Resolves relative path against current document directory `os.path.dirname(slug)`.
  2. Normalizes path with `os.path.normpath`.
  3. Translates to clean `/doc/<normalized_slug>` URL.
- **Verification Rule:** Rendered HTML must have zero leftover `href="*.md"`.

### 2.5 Sequential Reading Navigation (`prev_doc` / `next_doc`)
In `doc_detail(slug)`:
- Categories are indexed: `categories = build_categories(docs)`.
- Notes within the same category are sequenced.
- The route calculates `prev_doc` and `next_doc` and passes them to `doc.html`.
- `doc.html` renders elegant adjacent note cards at the bottom of the article.

---

## 3. Client-Side Search Architecture

- **Search Index Endpoint:** `/api/search.json` returns lightweight metadata:
  ```json
  [
    {
      "title": "...",
      "slug": "languages/chinese/grammar/core",
      "category": "languages / chinese"
    }
  ]
  ```
- **Modal Logic (`templates/layout.html`):**
  - Trigger: `Cmd+K`, `Ctrl+K`, `/`, or clicking the search box in the sidebar/hero.
  - Multi-word search: splits queries by whitespace and verifies every word matches against title, slug, or category.
  - Highlight: matches are highlighted with `<mark class="search-highlight">`.
  - Domain filter chips: instant filter by `Languages (語)`, `Mnemonics (記)`, `Code & Tech (術)`, `Philosophy (考)`, `Other (書)`.
  - Keyboard navigation: `↑`, `↓` to navigate results, `Enter` to open, `ESC` to close.

---

## 4. Design System & CSS Architecture

- Hand-written in `static/css/style.css` (approx. 1,000 lines of pure Vanilla CSS).
- Zero external CSS libraries or build tools (Tailwind CDN was completely removed in Session 002 for 100% offline capability).
- **Design Tokens:**
  - Light mode: `--bg-paper: #f7f5f0`, `--bg-card: #ffffff`, `--text-charcoal: #2b2b2b`, `--accent-gold: #8c7853`, `--accent-vermilion: #b93838`.
  - Dark mode: `--bg-paper: #1a1a1a`, `--bg-card: #252525`, `--text-charcoal: #e8e4de`, `--border-color: #333333`.
- **Wabi-Sabi Components:**
  - `.stamp-seal`: Traditional vermilion Inkan seal (`知`).
  - `.stamp-kanji`: Subtle category kanji badge.
  - `.hero-watermark`: Large, low-opacity calligraphy character.
  - `.washi-card`: Glassmorphism card with micro-elevation on hover.
  - `.toast-notification`: Animated bottom-right feedback toast.
  - `zen-mode`: Single-click distraction-free reading mode hiding sidebar and ToC.
