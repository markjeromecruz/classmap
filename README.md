# Kindle Minds — multi-app portfolio

A working portfolio of AI-native apps. Built and maintained by a **3-agent coordination protocol** (A = PM + foundation, B = implementation dev, C = QA).

- **Live demo:** https://markjeromecruz.github.io/classmap/
- **Source:** https://github.com/markjeromecruz/classmap
- **Continuation guide (start here on a new machine):** [`docs/CONTINUATION.md`](docs/CONTINUATION.md)

## Status

| App                    | Status      | Notes |
|------------------------|-------------|-------|
| ClassMap v1 MVP        | ✅ Shipped  | Form → AI lesson plan → save (the original MVP) |
| KindleMinds            | ✅ Shipped  | Homeschool community hub — 5 rooms + threads |
| Patriarch              | ✅ Shipped  | Faith-based family-leadership app — daily devotional + family altars |
| ClassMap v2 Phase 1    | ✅ Shipped  | Mock auth + onboarding wizard + family page + shell |
| ClassMap v2 Phase 2    | 🔜 Next     | Today / Week views, task CRUD, AI Generate |
| ClassMap v2 Phases 3–6 | 🔓 Unblocked| Gamification → AI tutor/coach → portfolio/market → connect |

Full status table: [`docs/PROJECT_STATE.md`](docs/PROJECT_STATE.md). Roadmap: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Quick start (local, full features)

```bash
git clone https://github.com/markjeromecruz/classmap.git
cd classmap
npm install
npm run dev
```

Open http://localhost:3000. ClassMap calls the **`claude` CLI in headless mode** (`claude -p`) — no `ANTHROPIC_API_KEY` needed, no API charges, requires you to have `claude` on PATH and signed in. See [`docs/SETUP.md`](docs/SETUP.md) for the full machine setup.

## Pages demo build (static, canned AI)

```bash
rm -rf app/classmap/api app/patriarch/api app/kindleminds/api  # static export can't include POST handlers
NEXT_PUBLIC_DEMO_MODE=true NEXT_PUBLIC_BASE_PATH= npm run build
npx serve out
```

CI does this on every push to `main` via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

## How the 3-agent protocol works

Three concurrent Claude Code sessions in the same git worktree:
- **Agent A** (PM + foundation) — this is the main session
- **Agent B** (developer) — separate terminal, started by pasting `coordination/AGENT_B_PROMPT.md`
- **Agent C** (QA) — separate terminal, started by pasting `coordination/AGENT_C_PROMPT.md`

They coordinate by editing `coordination/BACKLOG.md`, `coordination/HANDOFFS.md`, and `coordination/ISSUES.md`. Git is the transport.

Full protocol: [`docs/3_AGENT_PROTOCOL.md`](docs/3_AGENT_PROTOCOL.md).

## Stack

- **Next.js 16** (App Router + Turbopack) + **React 19** + **TypeScript** strict
- **Tailwind 4** + **shadcn/ui** primitives
- **Editorial design system** — Fraunces (display serif) + Instrument Sans (body), warm-cream palette. See [`docs/memory/feedback_classmap_conventions.md`](docs/memory/feedback_classmap_conventions.md).
- **Zod 4** for schema validation everywhere
- **Vitest** + **Playwright** for tests (`tests/unit/` and `tests/e2e/`)
- **`claude` CLI** (headless) for all AI generation — never the Anthropic SDK. See [`docs/memory/feedback_headless_claude.md`](docs/memory/feedback_headless_claude.md).
