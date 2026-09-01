# AI Agent Rules & Operational Guidelines

## 1. Code Style & Conventions
- Maintain consistency with the existing directory structure and documentation formatting (Markdown for notes/knowledge bases, standard syntax in programming snippets).
- Write clean, modular, and self-documenting code and documentation.
- Avoid unnecessary commentary; focus documentation on core principles, architecture, and usage.

## 2. Cross-Platform Compatibility & Paths
- Ensure all file paths and script instructions work across Windows (`win32`), macOS, and Linux.
- Use forward slashes (`/`) or OS-agnostic path resolution (e.g., `pathlib` in Python, `path` module in Node.js) when writing code or referencing paths.
- Avoid hardcoding absolute system paths in shared code or documentation.

## 3. Clean Handoffs & State Persistence
- Every agent session must conclude by updating `.agents/STATE.json` with current task status, active components, and git progress.
- Append a structured session summary to `.agents/history/agent-session-log.md` before terminating or handing off to another agent.
- Ensure pending tasks, blockers, and next steps are explicitly documented in `STATE.json`.

## 4. Atomic Updates & Integrity
- Update state files and logs cleanly and atomically alongside code or content modifications.
- Verify git status after significant changes and ensure commits have descriptive, concise messages.
