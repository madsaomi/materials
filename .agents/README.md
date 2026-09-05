# ⛩️ .agents — Multi-Agent Handoff & Repository System

> **START HERE:** If you are an AI agent (Claude, GPT, Gemini, Cursor, Roo, Antigravity, etc.) picking up this repository, this document gives you everything you need to become productive in under 60 seconds without breaking anything.

---

## ⚡ 60-Second Quick Briefing

| Property | Value |
| :--- | :--- |
| **Project Name** | `materials` (知 · Chishiki Knowledge Sanctuary) |
| **Current Version** | `2.2.0` (Updated: 2026-09-05) |
| **Stack** | Pure Python Flask + Jinja2 + Python-Markdown + Pygments + Vanilla CSS |
| **Dependencies** | Defined in `requirements.txt`. **Zero Node.js, Zero npm, Zero Astro, Zero Tailwind build steps.** |
| **Virtual Environment** | `.\venv\Scripts\python.exe` (Windows) |
| **Knowledge Base** | 642 Markdown notes in `knowledge/` (UTF-8 Russian content, CJK vocabulary) |
| **Design System** | Hand-written Vanilla CSS in `static/css/style.css` (Wabi-Sabi luxury theme, dark mode) |
| **Dev Server** | `.\venv\Scripts\python.exe app.py` (Port 5000) |
| **Production Server** | `gunicorn app:app` |

---

## 🧭 Directory Map & Component Roles

```
materials/
├── .agents/                        # 🧠 Multi-Agent Persistence & Handoff System
│   ├── README.md                   # 📍 This file — entrypoint & orientation for all agents
│   ├── ACTIVE_PLAN.md              # 🎯 Live in-progress plan & instant resumption tracker
│   ├── STATE.json                  # 🔄 Machine-readable state, active tasks, version, invariants
│   ├── RULES.md                    # 📜 Operational rules, code style, and critical invariants
│   ├── GLOSSARY.md                 # 📖 Project glossary, taxonomy, and terminology
│   ├── ARCHITECTURE.md             # 🏛️ Deep dive into app dataflow, link rewriting, and search
│   └── history/
│       └── agent-session-log.md    # 📝 Strictly append-only session logs (never overwritten)
├── app.py                          # 🚀 Flask core: markdown parsing, ToC, link rewriting, search API
├── knowledge/                      # 📚 642 Markdown notes (Russian explanations, CJK characters)
│   ├── languages/                  # Chinese, Japanese, Korean, English units
│   ├── mnemonics/                  # Memory systems, loci, associative peg systems
│   ├── programming/                # Python, JS, algorithms, system architecture
│   ├── philosophy/                 # Stoicism, mental models, epistemological frameworks
│   └── tools/                      # Terminal, git, workflow guides
├── static/
│   ├── css/
│   │   └── style.css               # 🎨 100% self-contained Vanilla CSS Wabi-Sabi system
│   └── favicon.svg, favicon.ico    # Favicon assets
├── templates/                      # 🖼️ Jinja2 templates
│   ├── layout.html                 # App shell, responsive drawer, Cmd+K modal, toast system
│   ├── index.html                  # Knowledge garden home, calligraphy watermark, domain directory
│   ├── doc.html                    # Note viewer, reading time, action bar, prev/next cards, ToC
│   └── 404.html                    # Themed 404 page with calligraphy watermark '無'
├── requirements.txt                # Flask, Markdown, python-frontmatter, Pygments, gunicorn
├── AGENTS.md                       # Root instructions for workspace agents
├── CLAUDE.md                       # Root instructions for Claude / Claude Code
└── .cursorrules                    # Root instructions for Cursor IDE
```

---

## 🔄 Standard 5-Step Agent Workflow

Whenever you start a task in this workspace, follow this protocol:

### Step 1: Read State & Live Plan (First Step)
1. Check [.agents/ACTIVE_PLAN.md](file:///c:/Users/~/Desktop/materials/.agents/ACTIVE_PLAN.md):
   - Is there an interrupted task in progress? Check for items marked `[/]`.
   - If yes, **resume from that exact step** without repeating work marked `[x]`.
2. Check [.agents/STATE.json](file:///c:/Users/~/Desktop/materials/.agents/STATE.json) for current focus, environment paths, and pending tasks.
3. Review the latest session in [.agents/history/agent-session-log.md](file:///c:/Users/~/Desktop/materials/.agents/history/agent-session-log.md).

### Step 2: Understand the Invariants
Review the Golden Invariants in [.agents/RULES.md](file:///c:/Users/~/Desktop/materials/.agents/RULES.md):
- **Pure Python:** Never introduce `package.json`, `npm`, Vite, Astro, or Tailwind build tooling.
- **Windows Console vs CJK:** Windows console uses cp1251. Never `print()` CJK directly; write output to files.
- **Link Rewriting:** Knowledge files use relative `.md` links (Obsidian compatible, e.g. `../grammar/core.md`). `app.py` translates them to `/doc/...` routes.

### Step 3: Work with Live Plan Tracking
- Open [.agents/ACTIVE_PLAN.md](file:///c:/Users/~/Desktop/materials/.agents/ACTIVE_PLAN.md).
- Mark your active action as `[/]` (in progress).
- Once finished, change it to `[x]` (completed) and mark the next item `[/]`.
- Record modified files in the plan.

### Step 4: Verify with Flask Test Client
Run a verification script using `.\venv\Scripts\python.exe`:
- `GET /` → Status `200 OK`
- `GET /api/search.json` → Status `200 OK` (must contain all 642 documents)
- Sample `/doc/<slug>` routes → Status `200 OK`
- Zero leftover `href="*.md"` links in rendered HTML
- `GET /nonexistent` → Status `404 Not Found`

### Step 5: Update State & Strictly Append to Session Log (Handoff)
Before ending your turn:
1. Update [.agents/ACTIVE_PLAN.md](file:///c:/Users/~/Desktop/materials/.agents/ACTIVE_PLAN.md) to mark the task as `COMPLETED`.
2. Update [.agents/STATE.json](file:///c:/Users/~/Desktop/materials/.agents/STATE.json) with current version and tasks.
3. **NEVER OVERWRITE HISTORICAL SESSIONS**. Strictly append your session summary (`## Session XXX - <Date>`) to the end of [.agents/history/agent-session-log.md](file:///c:/Users/~/Desktop/materials/.agents/history/agent-session-log.md).

---

## 🛠️ Common Commands

### Run Dev Server
```powershell
.\venv\Scripts\python.exe app.py
# Running on http://127.0.0.1:5000
```

### Install Dependencies
```powershell
.\venv\Scripts\pip.exe install -r requirements.txt
```

### Quick Verification One-Liner
```powershell
.\venv\Scripts\python.exe -c "from app import app, get_all_docs; c = app.test_client(); assert c.get('/').status_code == 200; assert len(get_all_docs()) == 642; print('OK: All 642 docs parsed')"
```

---

## 📌 Handoff Checklist for Incoming Agent
- [ ] Read `.agents/STATE.json`
- [ ] Read last session in `.agents/history/agent-session-log.md`
- [ ] Read `.agents/RULES.md`
- [ ] Ready to proceed!
