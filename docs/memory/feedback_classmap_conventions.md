---
name: feedback-classmap-conventions
description: "Code conventions for the dom/ multi-app portfolio — editorial design, file layout, Tailwind 4, Next 16"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 929f5eed-c205-482b-b263-c5d85221a34c
---

Conventions established when building the dom/ portfolio:

**Design system — editorial / small-press field guide aesthetic:**
- Display font: **Fraunces** (variable serif with `opsz` + `SOFT` axes). Body: **Instrument Sans**. Both via `next/font/google` in `app/layout.tsx`. Do **not** introduce Inter, Geist, or any generic sans.
- Palette in `app/globals.css`: warm cream `--paper`, deep warm-black `--ink`, ink-blue `--accent-ink`, terracotta `--accent-clay`, sage `--accent-sage`. Subtle SVG fractal-noise paper grain on the body.
- Reusable utility classes (defined in `globals.css`): `.kicker`, `.kicker--accent`, `.dek`, `.lead`, `.drop-cap`, `.rule`, `.rule--accent`, `.rule--double`, `.font-display`, `.font-display-italic`, `.smallcaps`, `.tabular`.
- All three apps share these tokens; per-app variation comes through which accent dominates, not by introducing new tokens.

**Why:** Mark Jerome explicitly asked for the frontend to **not look AI-generated** (May 23, 2026). The default shadcn-neutral look was rejected; the editorial direction was committed to and approved on first visual review.

**File layout:**
- `app/<app>/page.tsx` — app landing
- `app/<app>/<route>/page.tsx` — nested routes
- `app/<app>/api/<endpoint>/route.ts` — `dynamic = "force-dynamic"` POST handlers (stripped from Pages build)
- `lib/<app>-types.ts` — Zod schemas (`lib/types.ts` is ClassMap-specific by accident of being first)
- `lib/<app>-demo-data.ts` — canned data for `NEXT_PUBLIC_DEMO_MODE=true`
- `lib/<app>-claude.ts` — headless `claude` wrapper (see [[feedback-headless-claude]])
- `components/<app>/<Component>.tsx` — domain components
- `components/ui/<name>.tsx` — shadcn primitives (`npx shadcn@latest add <name> -y`)

**Tech:** Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, shadcn/ui, Zod 4, Vitest, Playwright. Tests live in `tests/unit/` and `tests/e2e/`. `tsconfig.test.json` extends root for `@/*` alias inside tests; `vitest.config.mts` uses `vite-tsconfig-paths`.

**Next.js 16 has breaking changes from training data** — always read `node_modules/next/dist/docs/` for the relevant feature before writing framework code. Static export does **not** support POST route handlers — only GET with `dynamic = 'force-static'`.
