# 📜 AI Agent Rules & Operational Guidelines

This document establishes the inviolable technical invariants, behavioral rules, and handoff standards for any AI agent operating in the `materials` repository.

---

## 0. Rule Zero: Universal Live Plan & Append-Only Protocol (Mandatory Across All IDEs & Providers)

> **CRITICAL MANDATE:** Every agent (regardless of whether you run in Antigravity, Cursor, Windsurf, Roo Code, Claude Code, VS Code, or CLI, and regardless of whether powered by Gemini, Claude, GPT, or DeepSeek) MUST strictly adhere to this protocol.

### 0.1 Live Parallel Plan Tracking (`.agents/ACTIVE_PLAN.md`)
- While working, maintain the live status checklist in [.agents/ACTIVE_PLAN.md](file:///c:/Users/~/Desktop/materials/.agents/ACTIVE_PLAN.md).
- Use 3 distinct states:
  - `[x]` **Completed**: Done and verified.
  - `[/]` **In Progress**: The step you are executing RIGHT NOW.
  - `[ ]` **Pending**: Remaining steps to be done.
- Whenever you transition to a new step, mark the previous as `[x]` and the new one as `[/]`.
- Record any modified files in the "Modified Files" section of `ACTIVE_PLAN.md`.

### 0.2 Absolute Rule: NEVER Overwrite Past History (Strictly Append-Only)
- **Do NOT overwrite, truncate, or delete previous sessions** in [.agents/history/agent-session-log.md](file:///c:/Users/~/Desktop/materials/.agents/history/agent-session-log.md).
- All session logs are **strictly append-only**. Every new agent session adds its own incremented session header (`## Session 001`, `## Session 002`, `## Session 003`, `## Session 004`, etc.).
- Document your actions thoroughly so another agent or developer has a complete, untruncated audit trail.

### 0.3 Instant Seamless Resumption for Incoming Agents
- If an agent session is interrupted (by token exhaustion, tool timeout, or user switching tools):
  1. The incoming agent opens [.agents/ACTIVE_PLAN.md](file:///c:/Users/~/Desktop/materials/.agents/ACTIVE_PLAN.md).
  2. Finds the item marked `[/]` or the first `[ ]`.
  3. Verifies filesystem state against the "Modified Files" list.
  4. Resumes immediately from that exact point without repeating completed work.
  5. Upon finishing all items, marks the plan as `COMPLETED` and appends the final session summary to `agent-session-log.md`.

---

## 1. Absolute Architectural Invariants (The "Never Do" List)

1. **NO Node.js / NPM / Astro / Tailwind Build Tools:**
   - The stack is **Pure Python Flask + Jinja2 + Vanilla CSS**.
   - Do NOT create or restore `package.json`, `node_modules/`, `astro.config.mjs`, `src/`, or `tailwind.config.js`.
   - All styling must be written directly into `static/css/style.css`.
2. **100% Offline Self-Containment:**
   - Do NOT introduce external CDN dependencies (e.g. unpkg, cdnjs, external Tailwind CDN, Google Fonts scripts).
   - The application must run completely offline without an internet connection.
3. **Windows CP1251 Console Trap (CJK Characters):**
   - The Windows console environment defaults to `cp1251` or `cp437`.
   - Direct `print()` of Chinese, Japanese, or Korean characters in CLI scripts will raise `UnicodeEncodeError`.
   - **Rule:** Always write script verification output to files (using `encoding="utf-8"`) or verify via HTTP status codes and length assertions.

---

## 2. Knowledge Base & Link Integrity Rules

1. **UTF-8 Encoding:**
   - All 642 files in `knowledge/` are UTF-8 encoded with Russian content and CJK vocabulary. Always use `encoding="utf-8"` when reading or writing files.
2. **Obsidian Link Compatibility:**
   - Internal links inside Markdown notes must use relative `.md` paths (e.g. `../grammar/core.md`).
   - `app.py` automatically rewrites these into `/doc/...` routes at render time.
   - **Verification Check:** Rendered HTML must have **zero** leftover `href="*.md"` strings.
3. **Table of Contents & Code Block Boundary Tracking:**
   - Headings must never match comments (`# comment`) inside code blocks.
   - The code block fence tracking (`in_code_block`) in `app.py` must be preserved at all times.
4. **Heading Slugification & Deduplication:**
   - GitHub-style lowercase hyphenated slugs (`slugify`).
   - Headings with identical names within the same document must have deduplicated IDs (e.g. `#summary`, `#summary-1`).

---

## 3. Code Style & Design System Guidelines

1. **Wabi-Sabi Design Philosophy:**
   - Clean, serene, minimal aesthetics (Paper, Washi, Charcoal, Gold, Stone, and Vermilion accents).
   - Smooth micro-interactions: card hover lifts (`translateY(-2px)`), soft borders, quiet toasts.
2. **Modular Vanilla CSS:**
   - Follow the structure in `static/css/style.css`:
     1. CSS Tokens (`:root` and `.dark`)
     2. Reset & Base Elements
     3. Layout Shell (Sidebar, Main Wrapper, Mobile Header, Overlay)
     4. Modals, Cards, Stamps, Toasts, Navigation
     5. General Utility Classes (matching Tailwind naming conventions natively)
3. **Cross-Platform Path Resolution:**
   - Never hardcode backslashes (`\`) in URLs or shared configurations. Always use forward slashes (`/`) or `os.path` / `pathlib`.

---

## 4. Multi-Agent Persistence & Handoff Protocol

Every agent working on this repository MUST follow the handoff protocol:

1. **Before Work:**
   - Inspect `.agents/STATE.json` for active focus, project version, and pending tasks.
   - Inspect the latest session in `.agents/history/agent-session-log.md`.
2. **During Work:**
   - Keep state in sync if executing multi-step tasks.
3. **After Work:**
   - Update `.agents/STATE.json`:
     - Set `current_focus` to describe the accomplished work.
     - Update `pending_tasks`.
     - Bump version if structural changes were made.
   - Append a structured session entry to `.agents/history/agent-session-log.md`:
     ```markdown
     ## Session XXX - YYYY-MM-DD
     - **Agent:** Model Name
     - **Task:** Task description
     - **Status:** Complete / In Progress
     - **Milestones Checklist:** ...
     - **Actions Taken:** 1. ... 2. ...
     - **Next Steps:** Recommended priorities for the next agent
     ```

---

## 5. Pre-Handoff Verification Checklist

Before reporting completion or committing changes, run the Flask test client verification script:
- [ ] `GET /` returns `200 OK`
- [ ] `GET /api/search.json` returns `200 OK` with exactly 642 items
- [ ] Sample `/doc/<slug>` routes return `200 OK`
- [ ] Zero leftover `href="*.md"` in rendered HTML
- [ ] Unknown slug returns `404 Not Found`
