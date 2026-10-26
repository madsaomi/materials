# Agent operating rules — materials

## Persistence and coordination

Before work read `STATE.json`, `ACTIVE_PLAN.md` and the latest relevant session.
Resume active work after checking the filesystem; do not repeat completed edits or one-time migrations.
Maintain the live checklist: `[x]` completed, `[/]` active, `[ ]` pending.
Record modified paths and update state after verified work.

`history/agent-session-log.md` is strictly append-only.
Never overwrite, edit, truncate or delete historical sessions.
Append a new numbered session with actions, checks, limitations and handoff notes.

Concurrent agents share the workspace. Agree on disjoint ownership, inspect existing changes,
and preserve changes belonging to the user or another agent.

## Application architecture

- Use TypeScript + Next.js App Router + React on Node.js 22+, pnpm 11.25.0.
- Runtime, normal contents maintenance and site verification require no Python.
  The educational Python course and optional helpers inside the vaults remain separate from the application.
- Current browser CSS/JS belongs in `public/static/`.
- Keep assets and fonts local; reading must not require an external CDN.
- Use hand-written CSS. Do not introduce Astro or Tailwind.
- The removed Flask implementation is available in Git history.
  Superseded Python-only or no-Node rules in old reports do not apply.

## Knowledge and link integrity

- Preserve all 1348 UTF-8 Markdown documents, both vaults and editorial warnings.
- Keep note links relative and ending in `.md` for Obsidian compatibility.
  `lib/knowledge.ts` rewrites them to `/doc/...` only when rendering.
- Preserve old heading anchors and all 1217 mappings in `legacy_paths.json`.
  Legacy redirects must retain query parameters.
- Heading IDs lowercase text, remove punctuation, replace spaces with hyphens and
  suffix duplicates `-1`, `-2`. Code comments inside fences must not become headings.
- Preserve optional script links in notes, including the Anki export helper.
- Use explicit UTF-8 I/O and keep verification output safe for Windows consoles with CJK.
- Keep manual contents pages with `editorial: manual` intact.
  `pnpm contents:refresh` previews changes; `pnpm contents:refresh --apply` writes.
- Never repeat the one-time folder reorganization on the current library.

## Interface compatibility

Preserve browser localStorage keys `theme`, `catalogView`, `docFont`
and `chishikiReadingHistory`, including old-slug reading history compatibility.
Retain responsive reading, accessible controls, code scrolling/copying,
hidden answer disclosures and separate links to retained vault versions.
Use platform-independent paths and forward slashes in URLs.

## Verification and handoff

Run checks appropriate to the change; before publishing application changes:

```sh
pnpm typecheck
pnpm contents:verify
pnpm verify
pnpm build
```

Verify `/` (200), `/api/search.json` (200, 1348 entries), representative `/doc/...`
pages, unknown paths (404), legacy redirects (308, query preserved), `/api/search`
and `/api/preview/...`. Rendered HTML must have no leftover relative `.md` hrefs,
broken internal targets/fragments or duplicate heading IDs.
Preserve both vaults; duplicate titles alone do not justify deleting notes.

Report the actual checks and material limits. A local build does not prove Docker execution
or external hosting. Historical session reports are immutable evidence of their original scope;
current instructions live in AGENTS.md and these agent documents.
