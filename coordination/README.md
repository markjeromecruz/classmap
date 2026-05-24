# 3-Agent Coordination Protocol

Three Claude Code sessions working the same repo:

| Agent | Role | Owns |
|-------|------|------|
| **A** | PM + foundation full-stack | Scope, scaffolding, AI wrapper, deploy pipeline, reviews, status DONE |
| **B** | Implementation developer | Picks `TODO` rows assigned to `B`, implements, hands to C |
| **C** | QA engineer | Picks `NEEDS_TEST` rows, writes + runs tests, signs off or files an issue |

All communication happens by editing **three markdown files** in this folder. Git is the transport — every agent runs `git pull` before reading and commits + pushes after writing.

## The Files

### `BACKLOG.md`
Single source of task truth. Statuses progress:

```
TODO  →  IN_PROGRESS  →  NEEDS_TEST  →  DONE_PENDING_A  →  DONE
                                                    ↘   BLOCKED
```

Only **A** sets `DONE`. Everyone else can write the other statuses for tasks they own.

### `HANDOFFS.md`
Append-only event log. Every status change gets one line:
```
[<ISO-8601 UTC>] FROM→TO: <task-id> <one-line message>
```

### `ISSUES.md`
Bugs C finds. C writes; A and B read. Each row has repro + expected + actual.

## The Loop (manual cadence)

Mark Jerome (the human) ticks the agents when there is new work:
- After A creates new tasks → tell B "tick"
- After B finishes a task → tell C "tick"
- After C signs off or files an issue → tell A "tick"

If/when we want hands-off, B and C can be upgraded to `/loop 5m` polling.

## Branch / Worktree Convention

For MVP: everyone works on `main`, sequenced by the BACKLOG. If parallel B-tasks are queued, B should request worktrees from A first (A creates them, assigns one task per worktree).

## Pulling Latest Before Acting

Every agent's loop starts with `git pull --rebase` and ends with `git add -A && git commit -m "..." && git push`. Commit messages reference the task id, e.g. `CM-01: form skeleton + Zod validation`.
