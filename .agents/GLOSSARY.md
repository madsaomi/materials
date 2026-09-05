# 📖 Project Glossary & Taxonomy

This glossary defines standard terminology, data model structures, and UI nomenclature used across the `materials` repository.

---

## 1. Core Architecture & Persistence

- **Multi-Agent System (`.agents/`):** The persistent multi-agent framework ensuring context, invariants, and logs are preserved across agent sessions and different LLM providers.
- **Handoff Protocol:** The standardized procedure of reading `STATE.json` and session logs before starting work, and updating them upon completion.
- **`STATE.json`:** The machine-readable single source of truth for project version, current focus, active components, git status, and pending tasks.
- **`agent-session-log.md`:** The chronological, append-only log of all agent sessions documenting actions taken, bugs fixed, and test results.
- **Wabi-Sabi Design System:** The visual design philosophy inspired by Japanese aesthetics: simplicity, natural paper tones, subtle imperfections, tranquility, and dark-mode harmony.

---

## 2. Knowledge Base Data Structures

- **Document (`doc`):** A single Markdown file located within `knowledge/` containing optional YAML frontmatter and Markdown content.
- **Slug (`doc.slug`):** The clean, URL-friendly unique identifier of a document derived from its relative path without extension (e.g. `languages/chinese/units/unit-01/dialogue`). Always uses forward slashes `/`.
- **Category (`doc.category`):** The top-level knowledge domain derived from the slug prefix (e.g. `languages / chinese`, `mnemonics`, `programming`).
- **Relative Path (`doc.relativePath`):** The filesystem-relative path under `knowledge/` (e.g. `languages/chinese/units/unit-01/dialogue.md`).
- **Breadcrumbs:** The hierarchical navigation chain generated from path segments, resolving parent documents or indexes when available.
- **Reading Time:** Estimated document duration calculated as `round(words / 200)` with a minimum of 1 minute.
- **Table of Contents (`doc.toc`):** Extracted list of headings (`level`, `id`, `text`) filtered to exclude comments inside fenced code blocks.

---

## 3. Knowledge Taxonomy & Domains

The repository currently organizes 642 notes across these primary domains:

| Domain Key | Kanji Badge | Description | Example Note |
| :--- | :---: | :--- | :--- |
| `languages/chinese` | **語** | HSK vocabulary, grammar rules, dialogues, character analysis | `/doc/languages/chinese/units/unit-12/dialogue` |
| `languages/english` | **語** | Advanced idioms, collocations, unit dialogues, grammar | `/doc/languages/english/units/unit-14/dialogue` |
| `languages/japanese` | **語** | Kanji mnemonics, JLPT grammar structures, particles | `/doc/languages/japanese/grammar/core` |
| `languages/korean` | **語** | Hangul, unit dialogues, TOPIK grammar patterns | `/doc/languages/korean/units/unit-12/reading` |
| `mnemonics` | **記** | Method of loci, Major System, peg lists, memory palaces | `/doc/mnemonics/systems/loci` |
| `programming` | **術** | Algorithms, Python, JavaScript, CSS architectures, Git | `/doc/programming/python/concurrency` |
| `philosophy` | **考** | Stoicism, epistemology, mental models, cognitive frameworks | `/doc/philosophy/epistemology/models` |
| `tools` | **術** | Terminal productivity, shell scripting, editor workflows | `/doc/tools/guides/terminal` |

---

## 4. UI Components & Nomenclature

- **Inkan Seal (`.stamp-seal`):** A vermilion Japanese stamp (`知`) in the header representing knowledge sanctuary branding.
- **Domain Stamp (`.stamp-kanji`):** Category-specific calligraphy stamps (`語`, `記`, `術`, `考`, `書`) used in cards and search results.
- **Calligraphy Watermark (`.hero-watermark`):** Atmospheric, low-opacity kanji characters positioned behind section headers (`庭` for Garden, `無` for 404).
- **Washi Card (`.washi-card`):** Elevated container with soft shadows, subtle borders, and smooth hover micro-elevation.
- **Adjacent Navigation (`.doc-nav-card`):** Previous and Next note cards at the bottom of articles facilitating sequential reading within categories.
- **Heading Anchor (`.heading-anchor`):** Subtle `#` symbol appearing on heading hover that copies the permalink section to clipboard.
- **Zen Mode (`zen-mode`):** Distraction-free reading view toggled via `禪`, hiding the sidebar and table of contents to maximize focus.
- **Toast Notification (`.toast-notification`):** Temporary bottom-right feedback alert confirming link copy actions.
