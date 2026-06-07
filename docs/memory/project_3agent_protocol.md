---
name: project-3agent-protocol
description: The 3-agent (A/B/C) coordination protocol used in /dom — what each agent does and how they hand off
metadata: 
  node_type: memory
  type: project
  originSessionId: 929f5eed-c205-482b-b263-c5d85221a34c
---

The `/Users/markjeromecruz/dom` workspace uses three concurrent Claude Code sessions:

- **A** (PM + foundation) — scopes work, builds scaffolding (`lib/*`, layout, design system, CI), reviews handoffs, signs off `DONE_PENDING_A` → `DONE`.
- **B** (developer) — picks `TODO` rows assigned to B, ships them, hands to C.
- **C** (QA) — picks `NEEDS_TEST` rows, writes tests, signs off or files an issue.

Each agent identifies its role by **which prompt was pasted into its session**: `coordination/AGENT_B_PROMPT.md` makes you B, `coordination/AGENT_C_PROMPT.md` makes you C, neither = A (the main/PM session). [[project-agent-role]] was C's own note; not authoritative for A or B sessions.

**Coordination state:** three markdown files under `coordination/`:
- `BACKLOG.md` — task table with statuses `TODO → IN_PROGRESS → NEEDS_TEST → DONE_PENDING_A → DONE` (or `BLOCKED`)
- `HANDOFFS.md` — append-only event log, format `[<UTC ISO>] FROM→TO: <task-id> <message>`
- `ISSUES.md` — bug rows from C, `OPEN → FIXING → RE_TEST → CLOSED`

**Manual cadence:** Mark Jerome ticks each agent ("tick — start <task-id>" or just "tick") when there's new work. They each `git pull --rebase`, scan files, act.

**How to apply when running as A:** review `DONE_PENDING_A` rows and sign them off; create new tasks; resolve `BLOCKED` rows; never edit files B or C currently has staged. See [[feedback-git-hygiene]].
