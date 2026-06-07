---
name: feedback-git-hygiene
description: "In the multi-agent dom/ workspace, always stage git by explicit path — never `git add -A` or `git add .`"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 929f5eed-c205-482b-b263-c5d85221a34c
---

When running as Agent A, B, or C in `/Users/markjeromecruz/dom`, **always stage by explicit path**: `git add path/to/file1 path/to/file2`. Never `git add -A`, `git add .`, `git add -u`, or `git commit -a`.

**Why:** All three agents share a single git worktree. `git add -A` sweeps in whatever the other agents have written or modified but not yet staged, silently absorbing their in-flight work into your commit. This happened twice in May 2026 — B's commits absorbed both A's and C's uncommitted files; commit messages no longer matched their actual diffs, and authorship/blame became misleading.

**How to apply:**
- Run `git status --short` before every `git add` to see what would be swept up.
- Stage each file or directory you actually authored. A folder shortcut (`git add components/portfolio/`) is fine when `git status` confirms only your files are dirty in it.
- Run `git pull --rebase` before committing so your local main matches origin.
- Pre-push, run `npm run build && npm test`. If either fails, push to a `wip/<task-id>` branch instead of `main` and append a `<YOU>→A: BLOCKED` line to `coordination/HANDOFFS.md`.

This rule is now codified in both `coordination/AGENT_B_PROMPT.md` and `coordination/AGENT_C_PROMPT.md`. Related: [[project-3agent-protocol]].
