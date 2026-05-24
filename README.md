# Kindle Minds — multi-app portfolio

A working portfolio of AI-native apps, starting with **ClassMap** (AI homeschool lesson planner). Built and maintained by a **3-agent coordination protocol** (A = PM + foundation, B = implementation dev, C = QA).

- Live demo: https://markjeromecruz.github.io/classmap/ _(after first Pages deploy)_
- Source: https://github.com/markjeromecruz/classmap

## Status

| App         | Status      | Notes |
|-------------|-------------|-------|
| ClassMap    | MVP in progress | First app — form + lesson plan generator |
| KindleMinds | Coming soon | Homeschool social hub |
| Patriarch   | Coming soon | Faith-based family-leadership app |

## How it runs

### Local (full-stack, real Claude generation)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The ClassMap form POSTs to `/api/generate`, which uses the **Claude Code headless SDK** (`@anthropic-ai/claude-code`) — no Anthropic API key required, since it routes through your existing Claude Code session.

### Demo build (static, canned data) — same as what GitHub Pages serves

```bash
rm -rf app/classmap/api          # static export can't include POST handlers
NEXT_PUBLIC_DEMO_MODE=true NEXT_PUBLIC_BASE_PATH= npm run build
npx serve out
```

The form returns a pre-canned plan matched by age band. No network calls leave the page.

## 3-agent workflow

This repo is intended to be developed by three Claude Code sessions running in parallel:

- **Agent A** (the session you started in) — PM, foundation, reviews
- **Agent B** — implementation, picks up `TODO` items
- **Agent C** — QA, writes tests, files bugs

Setup:

1. Open two more terminals; run `claude` in each, both starting in this directory.
2. Paste the contents of `coordination/AGENT_B_PROMPT.md` into one. That session becomes B.
3. Paste the contents of `coordination/AGENT_C_PROMPT.md` into the other. That session becomes C.
4. All three communicate by editing `coordination/BACKLOG.md`, `coordination/HANDOFFS.md`, and `coordination/ISSUES.md`. Git is the transport.
5. When you want B or C to pick up new work, just type `tick` into their terminal — their loop will scan the files and act.

See `coordination/README.md` for the full protocol.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- `@anthropic-ai/claude-code` for AI generation (headless)
- Zod for input/output validation
- Vitest + Playwright for tests (set up by Agent C)
