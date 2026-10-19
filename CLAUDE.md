# AGENTS.md — materials (Next.js knowledge base)

## Stack

User explicitly approved migration from Flask to TypeScript + Next.js on 2026-10-18. This supersedes earlier Python-only / no-Node rules. Next.js App Router, React, hand-written CSS, no Astro or Tailwind.

- app/: React server pages and API route handlers.
- lib/knowledge.ts: Markdown/frontmatter, links, headings, cache, search, related notes.
- lib/catalog.ts: folders, levels, lesson order, retained-vault versions.
- components/shell.tsx: shared interface.
- public/static/: current CSS/JS; all browser assets local.
- knowledge/: 1348 UTF-8 Markdown documents, both vaults retained.
- legacy_paths.json: 1217 old path mappings; redirect queries must survive.
- Python runtime, templates/ and static/ are retained for comparison only. Do not accidentally change the old copy instead of public/static/.

## Development and verification

Node.js 22+, pnpm 11.25.0. See MIGRATION_NEXT.md.

```
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm verify
pnpm build
pnpm start
```

Default port 5000; production honors PORT. Docker runs the standalone Node server.
Verify / and /api/search.json (1348 entries), representative /doc/ pages, unknown paths 404, legacy redirects with query parameters, search and preview API. The full verifier audits rendered Markdown links, fragments and heading IDs. Preserve localStorage keys and old heading anchors.

## Content conventions

UTF-8; never print CJK directly from Python to a Windows cp1251 console. Markdown links stay relative .md paths for Obsidian; rewrite only when rendering. Heading IDs are lowercase, punctuation removed, spaces replaced by hyphens, duplicates suffixed -1, -2. Code comments inside fences are not headings. Both vaults and editorial warnings remain intact. Never rerun the one-time folder migration.

## Persistence

Before work read .agents/STATE.json, ACTIVE_PLAN.md and RULES.md. Maintain [x] done, [/] active, [ ] pending. Append sessions to .agents/history/agent-session-log.md; NEVER overwrite or truncate history. Update state after verified work. Do not restore the superseded Python-only restriction.
