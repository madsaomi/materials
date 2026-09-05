# AGENTS.md — materials (Flask knowledge base)

## Stack

Pure Python. No Node.js, no Astro, no Tailwind build step.

- `app.py` — Flask app: scans `knowledge/`, parses frontmatter + Markdown,
  builds ToC, reading time, breadcrumbs, search index
- `templates/` — Jinja2 (`layout.html`, `index.html`, `doc.html`, `404.html`)
- `static/css/style.css` — hand-written CSS (Wabi-Sabi theme, dark mode, Pygments Monokai)
- `knowledge/` — 642 Markdown notes (UTF-8, Russian content, CJK vocabulary)
- `requirements.txt` — Flask, Markdown, python-frontmatter, Pygments, gunicorn

## Development

Install deps once:

```
pip install -r requirements.txt
```

Run the dev server (foreground, port 5000):

```
python app.py
```

Production:

```
gunicorn app:app
```

## Conventions

- Knowledge files are UTF-8. Console on Windows is cp1251 — never `print()` CJK
  directly; write verification output to files under the Temp dir instead.
- Internal links use relative `.md` paths (Obsidian-compatible), e.g.
  `../grammar/core.md`. `app.py` rewrites them to `/doc/...` routes at render time.
- Heading anchors are GitHub-style (`slugify` in `app.py`: lowercase, drop
  punctuation, spaces → hyphens, e.g. `### 2.2 Частицы` → `#22-частицы`).
  Repeat `#` headings after the first also get ids and ToC entries.
- Breadcrumb segments without a matching doc render as plain text (never 404 links).
- `get_all_docs()` is mtime-cached. C Old Node/Astro files must never come back:
  no `package.json`, `src/`, `astro.config.mjs`, `node_modules/`, `dist/`, `.astro/`.

## Verification

Before committing site changes, verify with the Flask test client:

- `/` → 200, `/api/search.json` → 200 with 642 entries
- sample `/doc/<slug>` pages → 200, unknown slug → 404
- zero `href="*.md"` leftovers in rendered HTML
- zero broken internal `.md` links across `knowledge/` (audit script pattern:
  resolve relative links against slug set, excluding fenced code blocks)
- all 642 doc titles unique

## Multi-Agent Protocol & Live Planning

All agents working on this project (across any IDE, tool, or LLM provider) must adhere to the multi-agent persistence system in `.agents/`:

1. **Before starting work:**
   - Inspect `.agents/STATE.json` for repository version, active focus, and pending tasks.
   - Inspect `.agents/ACTIVE_PLAN.md` to see if there is an in-progress task from a previous agent.
   - Review operational rules in `.agents/RULES.md`.
2. **During work (Live Planning):**
   - Maintain the live checklist in `.agents/ACTIVE_PLAN.md` using 3 states: `[x]` (done), `[/]` (in progress right now), `[ ]` (remaining).
   - Any agent can immediately resume from a `[/]` or `[ ]` step without repeating completed work.
3. **Session Logging (Strictly Append-Only):**
   - **NEVER overwrite, edit, or truncate past history** in `.agents/history/agent-session-log.md`.
   - Always append your session (`## Session XXX - <Date>`) with actions taken, tests verified, and handoff notes for the next agent.

## Docs

- Flask: https://flask.palletsprojects.com/
- Jinja2: https://jinja.palletsprojects.com/
- Python-Markdown: https://python-markdown.github.io/
