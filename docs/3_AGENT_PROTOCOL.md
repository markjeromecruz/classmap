# The 3-Agent Coordination Protocol

Three concurrent Claude Code sessions develop this repo together:

| Agent | Role | Identified by |
|-------|------|---------------|
| **A** | PM + foundation engineer | Default — no prompt pasted; the main session you started in |
| **B** | Implementation developer | Started by pasting `coordination/AGENT_B_PROMPT.md` |
| **C** | QA engineer | Started by pasting `coordination/AGENT_C_PROMPT.md` |

All three share **one git worktree**. They coordinate by editing three markdown files in `coordination/`. Git is the transport — every agent `git pull --rebase`s at the top of its loop.

---

## Coordination state files

### `coordination/BACKLOG.md`

The single source of truth for task state. Each row has:
- **ID** (e.g. `CM-13`, `TC-08`, `A-22`)
- **Owner** (`A`, `B`, or `C`)
- **Status** (see below)
- **Title** + **Notes**

Status progression:
```
TODO → IN_PROGRESS → NEEDS_TEST → DONE_PENDING_A → DONE
                                                ↘ BLOCKED
```

Only **A** is allowed to set `DONE`. B and C transition through the in-between states.

### `coordination/HANDOFFS.md`

Append-only event log. Format:
```
[<UTC ISO timestamp>] FROM→TO: <task-id> <one-line message>
```

Examples:
```
[2026-05-24T01:48:32Z] B→A: started CM-01
[2026-05-24T01:52:37Z] B→C: CM-01 ready — files: components/classmap/ClassMapForm.tsx ...
[2026-05-24T01:57:03Z] C→A: CM-01 verified — tests/unit/ClassMapForm.test.tsx (14/14)
[2026-05-24T02:00:30Z] A→B: nice work on CM-01 + ISS-01. CM-02 unblocked and is yours.
```

### `coordination/ISSUES.md`

C writes here when a `NEEDS_TEST` task fails verification. Status progression:
```
OPEN → FIXING (B claims) → RE_TEST (B done, C re-verifies) → CLOSED
```

Severity is `P0` (blocks MVP), `P1` (must fix before DONE), `P2` (polish).

---

## The loop each agent runs

### A's loop (PM + foundation)

1. `git pull --rebase`
2. Read `BACKLOG.md` and `HANDOFFS.md`. Scan for new `B→A` and `C→A` lines.
3. Sign off any `DONE_PENDING_A` rows that look good → set status `DONE`.
4. Triage any new `OPEN` issues.
5. Build foundation pieces (lib, types, design system, CI) that unblock B or C.
6. Append `A→ALL` or `A→B` / `A→C` lines to `HANDOFFS.md` announcing what's ready.
7. Commit by explicit path, push, idle.

### B's loop (developer)

1. `git pull --rebase`
2. Read `BACKLOG.md` and `ISSUES.md`. Pick highest-priority work:
   - Open issue on a task B owns → fix it first
   - Else top `TODO` row where Owner = `B` with all dependencies `DONE`
3. Set status to `IN_PROGRESS`. Append `B→A: started <task-id>` to `HANDOFFS.md`.
4. Implement. Use editorial design vocabulary. Mobile-first at 360 px.
5. Pre-push: run `npm run build && npm test`. If either fails, push to `wip/<task-id>` branch and append a `B→A: BLOCKED` line.
6. If green, set status to `NEEDS_TEST`, commit by explicit path, push. Append `B→C: <task-id> ready — files: ... — exercise: ...` to `HANDOFFS.md`.

### C's loop (QA)

1. `git pull --rebase`
2. Scan `HANDOFFS.md` for new `B→C` lines.
3. Pick a `NEEDS_TEST` row. Set to `IN_PROGRESS`. Append `C→A: started verifying <task-id>`.
4. Write tests under `tests/unit/` (Vitest) or `tests/e2e/` (Playwright). Real boundaries where they matter (real localStorage, real Zod parse); mock only at API/network boundaries.
5. Run `npm test` and / or `npx playwright test`.
6. **PASS:** set status `DONE_PENDING_A`, commit by explicit path, push. Append `C→A: <task-id> verified — tests: ... — coverage notes: ...`.
7. **FAIL:** keep status `NEEDS_TEST`. Add a row to `ISSUES.md` (`ISS-NN`). Append `C→B: <task-id> failed — see ISS-NN`.

C **never modifies production code.** If C spots a fix, it goes in `ISSUES.md`, not in a commit.

---

## Subagent fan-out (HARD rule for all three)

When a task decomposes into **≥ 3 independent files** or **independent searches**, agents MUST fan out subagents in parallel — single message, multiple `Agent` tool calls — not one at a time.

Example: B picks up CM-08 (a 5-step wizard). B dispatches **5 parallel `general-purpose` subagents**, one per `WizardStepN.tsx`, in a single message. After they return, B reads each result, fixes anything broken, runs `npm run build && npm test`, commits with explicit `git add path1 path2 ...`.

**Subagents do NOT commit.** The dispatching agent integrates, verifies, and stages.

This pattern was used to ship CM-08 (6-way fan-out, 117 tests) and CM-09 (3-way fan-out, 37 tests) in ~minutes wall-clock each.

---

## Git hygiene (HARD rule — bit us four times)

**Always `git add <explicit path>`.** Never `git add -A`, never `git add .`, never `git commit -a`, never `git add -u`.

Why: three agents share one worktree. `git add -A` sweeps up whatever the other agents have in flight, silently absorbing their files into your commit. This happened four times in May 2026 — B's commits absorbed both A's and C's uncommitted files; authorship became misleading.

Acceptable shortcut: `git add path/to/dir/` is OK if `git status --short` confirms only your files are dirty in it.

Full rule: [`memory/feedback_git_hygiene.md`](memory/feedback_git_hygiene.md).

---

## Cadence

**Manual ticks (current).** Mark Jerome types "tick" (or any message) into each agent's terminal when there's new work. They pull, read, act.

**Continuous polling (alternative).** If you want it hands-off, both B and C can be put on `/loop 5m tick` so they pull `HANDOFFS.md` every five minutes. The risk is runaway spend; manual ticks are the default.

**A's note when surfacing status to Mark Jerome:** A should describe what landed and what's now unblocked, but should NOT generate "paste this tick into B / C" copy-paste blocks. B and C are polling on their own. See [`memory/feedback_trust_the_protocol.md`](memory/feedback_trust_the_protocol.md).

---

## When something goes wrong

- **B's CI failed lint or type-check** → fix locally, push as a follow-up commit (don't `--amend` — the agents' history is shared and amending rewrites blame).
- **C's tests reference a component B hasn't pushed** → C should push to `wip/CM-NN` and not `main` until B's component lands; otherwise CI is red for everyone.
- **Two agents conflict on a file** → whoever pushed second resolves the merge. Append `A→ALL` line to HANDOFFS explaining what happened.
- **A is offline / not running** → B and C stack `DONE_PENDING_A` rows; when A comes back, A signs them all off in batch.
