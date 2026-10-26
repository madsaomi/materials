# Agent handoff — materials

Start with [STATE.json](STATE.json), [ACTIVE_PLAN.md](ACTIVE_PLAN.md) and [RULES.md](RULES.md).
Use the latest completed session and actual filesystem to distinguish current work from historical notes.

## Current project

- Stack: TypeScript, Next.js App Router, React, Node.js 22+, pnpm 11.25.0.
- Runtime and normal maintenance require no Python. The Python course and optional vault helpers remain.
- Source: 1348 UTF-8 Markdown documents in `knowledge/`, including both retained vaults.
- Navigation: section → level → lesson → materials; 1217 old paths in `legacy_paths.json`.
- Assets: hand-written CSS and browser JavaScript in `public/static/`; no runtime CDN dependencies.
- Commands and deployment: [../README.md](../README.md), [../MIGRATION_NEXT.md](../MIGRATION_NEXT.md).
- Current project version and editorial backlog: [STATE.json](STATE.json).

## Directory map

```text
materials/
  app/                  Next.js pages, layout, API handlers
  components/           Shared interface
  lib/knowledge.ts      Markdown, links, headings, cache, search
  lib/catalog.ts        Folder hierarchy, lesson order, vault versions
  public/static/        Current CSS/JavaScript and local assets
  knowledge/            Markdown library; includes knowledge/knowledge/
  legacy_paths.json     Old path → current path mappings
  scripts/              Node/TypeScript start, maintenance and verification
  reports/              Session evidence and editorial reports
  .agents/
    STATE.json          Current machine-readable state
    ACTIVE_PLAN.md      Live checklist and handoff
    RULES.md            Operating rules
    ARCHITECTURE.md     Current data flow
    GLOSSARY.md         Terms and data structures
    history/
      agent-session-log.md  Strictly append-only history
```

The removed Flask application and previous maintenance tools remain in Git history.
Historical reports retain their original commands; they do not describe the current runtime.

## Workflow

1. Read state, active plan, rules and the latest relevant session.
2. Resume the active `[/]` or first pending `[ ]` step after verifying current files.
3. Maintain `[x]` done, `[/]` in progress and `[ ]` pending; record modified files.
4. Run checks appropriate to the change:
   `pnpm typecheck`, `pnpm contents:verify`, `pnpm verify`, `pnpm build`.
   Check HTTP/browser behavior for affected application paths.
5. Update state and plan after verification; append a new session to the log.
   Never overwrite, edit or truncate earlier history.

## Common commands

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm contents:refresh
pnpm contents:refresh --apply
pnpm contents:verify
pnpm typecheck
pnpm verify
pnpm build
pnpm start
```

`contents:refresh` is a dry run until `--apply` is supplied.
Manual contents pages (`editorial: manual`) are protected.
Do not repeat the one-time folder reorganization.

The default port is 5000; production honors `PORT`. Docker runs the standalone Node server.
