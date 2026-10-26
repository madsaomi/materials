# Project glossary — materials

## Persistence

- **State** — `STATE.json`: current version, active focus, components, metrics and pending work.
- **Live plan** — `ACTIVE_PLAN.md`: checklist using `[x]` done, `[/]` active and `[ ]` pending.
- **Session log** — `history/agent-session-log.md`: append-only record of work and verification.
- **Historical report** — evidence of a particular session; its commands and metrics may describe a former implementation.

## Documents and catalog

- **Note / document (`Note`)** — one UTF-8 Markdown file under `knowledge/`, with optional YAML frontmatter.
- **Slug (`doc.slug`)** — physical path relative to `knowledge/`, without extension, using forward slashes.
  Example: `languages/english/a1/unit-01/overview`.
- **Relative path (`doc.relativePath`)** — slug plus `.md`.
- **Logical path** — path used for catalog grouping after removing a leading `knowledge/` vault prefix.
  Physical files and their URLs remain separate.
- **Vault / collection (`doc.collection`)** — the primary library or retained nested `knowledge/knowledge/` collection.
- **Category (`doc.category`)** — subject grouping, such as `languages / english`.
- **Catalog level (`doc.catalogLevel`)** — a folder label such as `a1`, `foundation`, `practice` or `reference`.
  Labels organize existing content and do not guarantee complete level coverage.
- **Contents page** — `_contents.md` containing a section or level route.
  The `editorial: manual` frontmatter flag protects authored routes from generated refresh.
- **Legacy path** — an old slug mapped to its current physical slug in `legacy_paths.json`.
  The application returns 308 with query parameters preserved.
- **Breadcrumbs** — links back through the document's logical folder hierarchy.
- **Reading time** — rounded word-count estimate at 200 words per minute, minimum 1 minute.
- **Table of contents (`doc.toc`)** — rendered heading entries `level`, `id` and `text`, excluding code comments.
- **Heading alias** — explicit HTML ID kept when a heading changes, to preserve old fragment links.

The current library has 1348 Markdown files: 1217 originals and 131 contents pages.
Both vaults are retained; duplicate names do not imply duplicate content.

## Main subjects

| Folder | Subject |
| --- | --- |
| `languages/english`, `chinese`, `japanese`, `korean` | Four language courses and references |
| `programming/` | Python, JavaScript, Go, Rust and other programming materials |
| `psychology/` | Psychology and related references |
| `mnemonics/` | Memory techniques and practice |
| `philosophy/` | Philosophical topics and frameworks |
| `practices/` | Personal practices and productivity |
| `books/`, `tools/`, `study-plans/`, `comparison/`, `overview/` | Reading, tools, plans and navigation |

The Python course is teaching content. Optional Python examples or export helpers inside the
vaults are separate from the Node.js application and its normal maintenance.

## Interface and runtime

- **Catalog view** — list, cards or table, stored as `catalogView`.
- **Preview** — a requested plain-text excerpt beside an internal link; the link itself opens the note.
- **Related note** — suggestion based on outgoing links, backlinks or neighboring material.
- **Reading history** — up to 20 locally stored notes under `chishikiReadingHistory`.
- **Theme / font** — browser preferences stored under `theme` and `docFont`.
- **Standalone build** — Next.js server output packaged for the Node.js Docker runtime.
- **Current assets** — local files under `public/static/`.
- **Contents refresh** — `pnpm contents:refresh`, a dry run; add `--apply` to write.
