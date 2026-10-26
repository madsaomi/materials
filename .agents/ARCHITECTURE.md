# Application architecture — materials

The current application uses Next.js App Router, React and TypeScript on Node.js.
The old Flask implementation is available in Git history.

## Data flow

```text
knowledge/**/*.md (1348 notes, both vaults)
  → lib/knowledge.ts: getDocs()
      gray-matter frontmatter and title
      Markdown-it tokens and highlight.js code
      heading IDs and ToC
      relative .md link → /doc/... rewriting
      plain text, outgoing links and reading time
      cache per file: mtime + size
  → lib/catalog.ts: folders, levels, ordered lessons and vault versions
  → app/: server-rendered pages and JSON API
  → public/static/: local CSS and browser behavior
```

## Parsing and cache

`getDocs()` scans non-hidden Markdown files under `knowledge/` and derives the slug
from each relative path without `.md`, using forward slashes.
Titles prefer frontmatter, then the first Markdown H1, then the filename.
The cache checks file mtime and size and reparses changed files; deleted files leave the cache.
Scans are throttled to 1.5 seconds when documents are already loaded.
A cold request parses the library; no fixed latency is guaranteed.

`renderMarkdown()` uses Markdown-it tokens so comments inside code fences do not become headings.
The first H1 is removed from the article body because the page displays the document title.
Remaining headings receive IDs; levels 1–3 appear in the ToC.
`slugify()` lowercases, removes punctuation and hyphenates whitespace.
Repeated heading slugs receive `-1`, `-2`, etc.
Explicit old-ID spans in edited notes preserve incoming fragment links.

Relative `.md` targets are resolved against the current slug with POSIX path operations,
then rendered as encoded `/doc/...` URLs with query/fragment suffixes preserved.
Source Markdown remains suitable for Obsidian.

## Catalog and navigation

`lib/catalog.ts` supplies labels, level names, folder trees and material order.
The nested vault prefix is removed only for logical grouping; each physical note keeps its slug.
The catalog can show one logical row with links to both retained versions.
Course level labels describe organization and do not certify complete exam or CEFR coverage.

Document pages choose previous/next notes within the same category, vault and level.
Related notes rank outgoing links and backlinks before neighboring content and explain the relation.
Duplicate-title suppression in suggestions changes presentation, not files.

`scripts/refresh-contents.ts` maintains existing `_contents.md` pages.
The default invocation previews changes; `--apply` writes.
Pages marked `editorial: manual` are preserved.
The one-time reorganization is complete and must not be repeated.

## Routes

| Path | Role |
| --- | --- |
| `/` | Folder catalog, sorting, pagination and views |
| `/doc/[...slug]` | Document, ToC, breadcrumbs, adjacent and related notes |
| `/api/search.json` | Metadata for all 1348 documents |
| `/api/search?q=...&domain=...` | Ranked full-text search, up to 40 results |
| `/api/preview/[...slug]` | Plain-text excerpt and metadata, or 404 |
| `/healthz` | Lightweight JSON health response without parsing notes |

Missing document paths are checked against the 1217 mappings in `legacy_paths.json`.
Mapped paths redirect with HTTP 308 and preserve query parameters, including repeated values.
Unmapped unknown paths return 404.

## Browser state and local assets

`components/shell.tsx` provides shared controls.
`public/static/css/style.css` contains the current hand-written theme and responsive layout;
`public/static/js/site.js` implements search, disclosures, previews and reading controls.
Browser assets are served locally.

The keys `theme`, `catalogView`, `docFont` and `chishikiReadingHistory`
preserve existing preferences. Reading history holds up to 20 notes locally and understands old slugs.
Storage failures are caught; state remains usable during the current page session.
Normal links perform full navigation rather than depending on a separate client router.

## Runtime and verification

`pnpm dev` starts development on 5000. `pnpm build` creates the production application;
`pnpm start` uses `scripts/start.mjs`, honoring `PORT`.
Docker builds a standalone Node 22 image and starts `node server.js` as a non-root user.
The application needs server filesystem access to its Markdown; it is not a static export.

`pnpm verify` audits corpus count, rendered links, fragments, IDs, legacy targets,
catalog order and search. `pnpm contents:verify` checks content-maintenance behavior.
Use HTTP and browser checks for actual routing and interaction.
Docker execution and external deployment require separate evidence.
Python is unnecessary for the application and normal maintenance;
optional learning/export helpers inside the vaults may require it independently.
