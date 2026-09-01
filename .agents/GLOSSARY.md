# Project Glossary & Source of Truth

## Core Terminology
- **Knowledge Base (`knowledge/`):** The structured repository of study materials, reference guides, programming snippets, language units, psychological frameworks, and philosophical texts.
- **Multi-Agent System (`.agents/`):** The persistence and handoff framework enabling seamless collaboration across multiple AI agent sessions.
- **Handoff Protocol:** The standardized procedure of updating `STATE.json` and appending session logs to `history/agent-session-log.md` to pass context between agents.
- **State Persistence:** Maintaining accurate, real-time tracking of repository state, active components, and git status in `STATE.json`.
- **Atomic Updates:** Ensuring documentation, configuration, code, and state files are committed together in clean, cohesive units of work.
