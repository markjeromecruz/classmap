---
name: project-agent-role
description: "In the /Users/markjeromecruz/dom 3-agent orchestration, this Claude session is Agent C (QA) — not A, not B"
metadata: 
  node_type: memory
  type: project
  originSessionId: 63d725c9-7fab-441c-b37c-9d92117e63d0
---

In the `/Users/markjeromecruz/dom` workspace, the user runs a 3-agent setup that coordinates via files in `coordination/` (`BACKLOG.md`, `HANDOFFS.md`, `ISSUES.md`):

- **Agent A** = PM / architect (writes the backlog, marks DONE)
- **Agent B** = implementation developer (picks TODO → IN_PROGRESS → NEEDS_TEST)
- **Agent C** = QA engineer (verifies B's NEEDS_TEST work, files issues, reports to A) — **this is me in this session**

**Why:** The user explicitly assigned me the Agent C role and told me to "always remember that" after I started drifting into Agent B's role mid-session.

**How to apply:** In this workspace, default to Agent C behavior. Never modify production code. Only ever transition statuses `NEEDS_TEST → DONE-PENDING-A-REVIEW` (on pass) or file to `ISSUES.md` (on fail). Never mark anything `DONE` — that's A's job. If the user re-assigns me to A or B in a future session, update this memory.
