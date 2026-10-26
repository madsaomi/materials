# CLAUDE.md — materials

Follow [AGENTS.md](AGENTS.md) and the current state in `.agents/STATE.json`.
Read `.agents/ACTIVE_PLAN.md` and `.agents/RULES.md` before making changes.
Resume active checklist steps after checking the filesystem; preserve completed work.

The application is **TypeScript + Next.js App Router + React**, running on Node.js 22+.
Use pnpm 11.25.0. Runtime, normal content maintenance and site verification require no Python.
The Python teaching materials in `knowledge/` remain part of the library;
the removed Flask implementation is available in Git history.
Optional educational/export helpers inside the vaults may use Python independently; preserve their note links.

- Current CSS/JS: `public/static/`. Browser assets stay local; no CDN, Astro or Tailwind.
- Current Markdown/rendering/search: `lib/knowledge.ts`; catalog/navigation: `lib/catalog.ts`.
- Preserve all 1348 Markdown notes, both vaults, 1217 old path mappings and query parameters.
- Keep relative `.md` links, old heading anchors and localStorage keys compatible.
- Use UTF-8 and keep CJK output safe for Windows consoles.
- `pnpm contents:refresh` is a dry run; `pnpm contents:refresh --apply` writes.
  Preserve `editorial: manual` pages. Do not repeat the one-time folder migration.
- Verify with `pnpm typecheck`, `pnpm contents:verify`, `pnpm verify`, `pnpm build`
  and appropriate HTTP/browser checks. See [MIGRATION_NEXT.md](MIGRATION_NEXT.md).
- Maintain `[x]`, `[/]`, `[ ]` in the live plan and update state after verified work.
  Append session logs; never edit or truncate earlier history.

Old reports retain their original context. Superseded Python-only or no-Node rules do not apply.
