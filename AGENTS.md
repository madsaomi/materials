# AGENTS.md — materials (Next.js knowledge base)

## Stack

TypeScript + Next.js App Router + React, hand-written CSS, no Astro or Tailwind.
The user approved the migration on 2026-10-18 and removal of the old Python application stack.
Application runtime, normal content maintenance and site verification use Node.js; the Python teaching course remains.
Optional educational/export helpers inside the vaults may use Python independently; preserve their note links.
Historical Flask implementation and tools are available in Git history.

- `app/`: React server pages and API route handlers.
- `lib/knowledge.ts`: Markdown/frontmatter, links, headings, cache, search, related notes.
- `lib/catalog.ts`: folders, levels, lesson order, retained-vault versions.
- `components/shell.tsx`: shared interface.
- `public/static/`: current CSS/JS; all browser assets local.
- `knowledge/`: 1348 UTF-8 Markdown documents, both vaults retained.
- `legacy_paths.json`: 1217 old path mappings; redirect queries must survive.
- `scripts/refresh-contents.ts`: contents maintenance; dry run by default, explicit `--apply` writes.

## Development and verification

Node.js 22+, pnpm 11.25.0. See `MIGRATION_NEXT.md`.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm contents:refresh
pnpm contents:refresh --apply
pnpm contents:verify
pnpm verify
pnpm build
pnpm start
```

Default port 5000; production honors `PORT`. Docker runs the standalone Node server.
Verify `/` and `/api/search.json` (1348 entries), representative `/doc/` pages,
unknown paths 404, legacy redirects with query parameters, search and preview API.
The full verifier audits rendered Markdown links, fragments and heading IDs.
Preserve localStorage keys and old heading anchors. Current styles and scripts are in `public/static/`.

## Content conventions

Use UTF-8 for every note and report; keep CJK verification output safe for Windows consoles.
Markdown links stay relative `.md` paths for Obsidian; rewrite only when rendering.
Heading IDs are lowercase, punctuation removed, spaces replaced by hyphens,
duplicates suffixed `-1`, `-2`. Code comments inside fences are not headings.
Both vaults and editorial warnings remain intact. Never repeat the one-time folder migration.
Contents pages with frontmatter `editorial: manual` must survive automatic refresh.
Keep browser assets local and preserve offline reading; do not introduce CDN dependencies.

## Persistence

Before work read `.agents/STATE.json`, `ACTIVE_PLAN.md` and `RULES.md`.
Maintain `[x]` done, `[/]` active, `[ ]` pending. Append sessions to
`.agents/history/agent-session-log.md`; NEVER overwrite or truncate history.
Update state after verified work. Historical reports describe their original session;
do not treat old Flask commands or superseded Python-only restrictions as current instructions.
