# Setup

Bringing this repo up on a fresh machine.

## Prerequisites

- **macOS or Linux.** Windows would work via WSL but hasn't been tested.
- **Node 22+.** Use `nvm`, `fnm`, `asdf`, or your package manager.
  ```bash
  nvm install 22 && nvm use 22
  ```
- **Git** with a configured `user.name` and `user.email`.
- **`gh` CLI** for pushing, viewing CI runs, managing Pages.
- **`claude` CLI** for headless AI generation. Sign in with the account that has the Claude Code subscription you want to use.

## Clone

```bash
git clone https://github.com/markjeromecruz/classmap.git ~/dom
cd ~/dom
```

The path doesn't have to be `~/dom`. The code is path-agnostic. The agent memory files reference `/Users/markjeromecruz/dom` but only for historical context — the protocol works in any path.

## Install

```bash
npm ci
```

This installs Next.js 16, React 19, Tailwind 4, shadcn primitives, Zod, Vitest, Playwright, and the multi-phase deps that A pre-installed (`@dnd-kit/*`, `recharts`, `sonner`, `react-dropzone`).

If you want to run the Playwright e2e suite locally:
```bash
npx playwright install --with-deps chromium
```

## Run locally

```bash
npm run dev
```

Open http://localhost:3000. The portfolio landing should render with three live cards (ClassMap, KindleMinds, Patriarch).

- **ClassMap v1 form flow:** http://localhost:3000/classmap → redirects through auth chain. For the original form flow, go directly to http://localhost:3000/classmap/result.
- **KindleMinds:** http://localhost:3000/kindleminds
- **Patriarch:** http://localhost:3000/patriarch
- **Mock login:** http://localhost:3000/classmap/login (any email; any 6-digit OTP)

## Build the static demo (what GitHub Pages serves)

```bash
rm -rf app/classmap/api app/patriarch/api app/kindleminds/api
NEXT_PUBLIC_DEMO_MODE=true NEXT_PUBLIC_BASE_PATH= npm run build
npx serve out
```

Open http://localhost:3000 (or whichever port `serve` reports). All AI calls return canned data.

To restore the API folders after building:
```bash
git checkout -- app/classmap/api app/patriarch/api app/kindleminds/api
```

## Run the test suite

```bash
npm test                 # vitest, ~5s, 554+ unit + component tests
npx playwright test      # chromium e2e (smoke + nav specs)
```

## Bring up the 3-agent setup

This repo is designed to be developed by **three concurrent Claude Code sessions**:

1. **Agent A** — this is whatever session you started in. Stays running as PM.
2. **Agent B** — open a second terminal in the same directory, run `claude`, paste the contents of `coordination/AGENT_B_PROMPT.md`. That session becomes B.
3. **Agent C** — third terminal, same dance with `coordination/AGENT_C_PROMPT.md`.

All three read and write `coordination/BACKLOG.md`, `coordination/HANDOFFS.md`, `coordination/ISSUES.md`. Git is the transport — every agent does `git pull --rebase` at the start of its loop.

The protocol details (statuses, handoff format, fan-out rules, git-hygiene rule) are in [`3_AGENT_PROTOCOL.md`](3_AGENT_PROTOCOL.md).

## Restore agent memory on a new machine

Claude Code stores per-workspace memory at `~/.claude/projects/<workspace-hash>/memory/`. The hash is a flattened version of the absolute path you're running in.

Snapshots of all memory files are checked into [`memory/`](memory/). To install them:

```bash
# Start `claude` once in the workspace so the project dir is created, then exit.
claude     # then /quit

# Copy the snapshots in. The dir name is the absolute path with `/` → `-`.
# For ~/dom on a user named `you`, that's `-Users-you-dom`.
mkdir -p ~/.claude/projects/-Users-$(whoami)-dom/memory
cp docs/memory/*.md ~/.claude/projects/-Users-$(whoami)-dom/memory/
```

Restart `claude` and the memories will load on next session.

## Configure GitHub Pages (only needed if the repo was deleted)

This repo's Pages is already configured (`build_type=workflow`). If you ever recreate the repo from scratch:

```bash
gh repo create markjeromecruz/classmap --public --source=. --remote=origin --push
gh api -X POST /repos/markjeromecruz/classmap/pages -f build_type=workflow
```

CI auto-deploys on every push to `main`.

## Common gotchas

- **`@/*` aliases failing in tests** → `tsconfig.test.json` and `vitest.config.mts` together resolve them. Don't add an `@/*` entry to the root tsconfig include — that breaks the `next build` due to a vite-vs-vitest version drift.
- **Next 16 docs differ from training data** → always read `node_modules/next/dist/docs/<feature>.md` before touching framework code. Static export does NOT support POST handlers.
- **`git add -A` silently absorbs other agents' work** → see [`memory/feedback_git_hygiene.md`](memory/feedback_git_hygiene.md). Stage by explicit path.
- **`@anthropic-ai/claude-code` npm package is CLI-only** → it ships only a binary, not an importable SDK. Shell out to `claude -p` via `child_process.spawn` instead.
