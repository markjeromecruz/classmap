# Continuation Guide

**Read this first when you sit down at this repo on a new machine.**

## Where we are

ClassMap (v1 MVP), KindleMinds, and Patriarch are all shipped and live at https://markjeromecruz.github.io/classmap/. ClassMap v2 (the full feature spec — onboarding wizard, today/week planner, AI tutor + coach, progress, portfolio, market, connect, family) is mid-rollout: **Phase 1 (auth + onboarding + family + shell) is complete**, and **A has shipped all foundation for Phases 2–6** (every `lib/classmap/*.ts` and `app/classmap/api/*/route.ts` the rest of the roadmap needs).

What's left is **pure B + C work**: build CM-12 through CM-34 (the UI for Phases 2–6) and TC-05 through TC-23 (the matching tests). Every dependency is already in place.

Detailed task-by-task state: [`PROJECT_STATE.md`](PROJECT_STATE.md). Phased roadmap: [`ROADMAP.md`](ROADMAP.md).

## Setting up on a new machine — checklist

1. **Clone the repo:**
   ```bash
   git clone https://github.com/markjeromecruz/classmap.git ~/dom
   cd ~/dom
   ```
   _(The path used to be `/Users/markjeromecruz/dom`. Memory files reference that path; the code itself doesn't care where it lives.)_

2. **Install Node 22+ and dependencies:**
   ```bash
   nvm install 22 && nvm use 22   # or your equivalent
   npm ci
   ```

3. **Install the `claude` CLI** if it's not already on PATH:
   ```bash
   which claude  # if empty, install Claude Code per https://docs.claude.com/claude-code
   claude login  # sign in with the same account you use here
   ```
   See [`memory/feedback_headless_claude.md`](memory/feedback_headless_claude.md) for why we use the CLI instead of the Anthropic SDK.

4. **Install the `gh` CLI** and authenticate (used for pushing, viewing CI, managing Pages):
   ```bash
   gh auth login   # repo + workflow scopes
   ```

5. **Verify the basics work:**
   ```bash
   npm run build   # should succeed
   npm test        # should pass (the suite was at 554/554 at last known check)
   npm run dev     # open http://localhost:3000 — portfolio landing should render
   ```

6. **Restore agent memory (optional but recommended).** This repo carries snapshots of the memory files in [`memory/`](memory/). Claude Code stores per-workspace memory at `~/.claude/projects/<workspace-hash>/memory/`. To restore them on the new machine:
   ```bash
   # The workspace hash is derived from your absolute path. Easiest: start
   # `claude` once in the new directory so the dir is created, then copy.
   mkdir -p ~/.claude/projects/-Users-$(whoami)-dom/memory
   cp docs/memory/*.md ~/.claude/projects/-Users-$(whoami)-dom/memory/
   ```
   _(Adjust the path if you cloned somewhere other than `~/dom`. The folder Claude Code creates on first run is `~/.claude/projects/<flattened-absolute-path>`.)_

7. **Optional: bring up Agents B and C.** Open two more terminals in this directory, run `claude` in each, paste:
   - `coordination/AGENT_B_PROMPT.md` into one — that session becomes B
   - `coordination/AGENT_C_PROMPT.md` into the other — that session becomes C

   They'll start polling `coordination/HANDOFFS.md` on their own.

## Next move

Pick one of these as the first thing to do on the new machine:

**Option 1 — Continue ClassMap v2 Phase 2 (recommended).** The biggest single user-visible chunk. B builds CM-12 (`/classmap/today`), CM-13 (`/classmap/week` with drag-and-drop), CM-14 (TaskModal), CM-15 (AI Generate button), CM-16 (subject colors), CM-17 (child switcher). C builds TC-05..TC-10. Every dep already installed (`@dnd-kit/*`, `recharts`, `sonner`, etc.).

**Option 2 — Audit and polish.** A-13 (verify sub-app routes static-export cleanly under `/classmap` basePath) is the only `pending` foundation task. Plus there's the cosmetic floating "N" avatar on `/classmap/login` + `/classmap/signup` that should be fixed.

**Option 3 — Verify the Pages demo end-to-end.** The mock-auth-on-Pages 404 fix (commit `39897a9`) shipped — visit https://markjeromecruz.github.io/classmap/ and confirm the demo flow works without dead ends.

## Conventions you must follow

These are codified in the memory files but the most important:

- **Stage git by explicit path** — never `git add -A` / `git add .` / `git commit -a`. The three agents share one git worktree and `-A` has absorbed in-flight work from other agents three times already. See [`memory/feedback_git_hygiene.md`](memory/feedback_git_hygiene.md).
- **Use `claude` CLI for AI**, not the Anthropic SDK. See [`memory/feedback_headless_claude.md`](memory/feedback_headless_claude.md).
- **Editorial design vocabulary only** — Fraunces + Instrument Sans, `.kicker` / `.dek` / `.lead` / `.font-display` / `.accent-clay` / `.accent-ink`. Do not introduce Inter, Geist, or parallel tokens. See [`memory/feedback_classmap_conventions.md`](memory/feedback_classmap_conventions.md).
- **Mobile-first** at 360 px viewport. Touch targets ≥ 44 px. Modals become drawers on `<md`.
- **When acting as A, don't surface "paste this into B/C" blocks** — B and C poll on their own. See [`memory/feedback_trust_the_protocol.md`](memory/feedback_trust_the_protocol.md).
- **Next.js 16 has breaking changes from training data.** Always read `node_modules/next/dist/docs/<feature>.md` before writing framework code. Static export does **not** support POST route handlers.

## Files to keep an eye on

| Path | What it is |
|------|------------|
| `coordination/BACKLOG.md` | Single source of truth for task state |
| `coordination/HANDOFFS.md` | Append-only event log — where the agents talk |
| `coordination/ISSUES.md` | Bugs C finds for B to fix |
| `coordination/AGENT_B_PROMPT.md` | What you paste into a session to make it Agent B |
| `coordination/AGENT_C_PROMPT.md` | What you paste into a session to make it Agent C |
| `lib/classmap/types.ts` | v2 domain schema (Child, LessonPlan, LessonTask, etc.) |
| `lib/classmap/db.ts` | localStorage CRUD + v1 → v2 migration |
| `lib/env.ts` | `isDemoMode` switch |
| `app/globals.css` | Editorial design tokens + utility classes |
| `.github/workflows/deploy-pages.yml` | Auto-deploy on push to main |

## In-flight branches

- `main` — production, what Pages deploys
- `wip/CM-08` — old branch from B's onboarding wizard work; CM-08 has since been merged and verified. Safe to delete on the new machine if you don't need it: `git branch -D wip/CM-08 && git push origin --delete wip/CM-08`.

## If something is off

- **Build broken on main?** Last known green commit: `74946f3` (A: sign off CM-10 + CM-11 → DONE). `git checkout 74946f3 -- <bad file>` to recover.
- **Tests broken?** `npm test` was at 554/554 passing. Recent failures most often come from C's new test files referencing a component that B hasn't pushed yet — check `coordination/HANDOFFS.md` for any `BLOCKED` lines.
- **Pages deploy failing?** Check `gh run list --repo markjeromecruz/classmap --workflow "Deploy demo to GitHub Pages" --limit 5` and inspect the failed log.

Welcome back.
