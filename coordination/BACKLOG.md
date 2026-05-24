# Backlog

Statuses: `TODO` → `IN_PROGRESS` → `NEEDS_TEST` → `DONE_PENDING_A` → `DONE` · or `BLOCKED`

## Foundation (A)

| ID    | Owner | Status        | Title                                              | Notes |
|-------|-------|---------------|----------------------------------------------------|-------|
| A-01  | A     | DONE          | Scaffold Next.js + TS + Tailwind + shadcn          | Next 16, React 19, Tailwind 4 |
| A-02  | A     | IN_PROGRESS   | Claude headless wrapper + Zod schema               | `lib/claude.ts`; schemas in `lib/types.ts` (done) |
| A-03  | A     | TODO          | Demo-mode switch + 3 canned plans (age bands)      | `lib/env.ts`, `lib/demo-data.ts` |
| A-04  | A     | TODO          | Portfolio landing                                  | `app/page.tsx` + `components/portfolio/AppCard.tsx` |
| A-05  | A     | TODO          | GitHub Pages workflow                              | `.github/workflows/deploy-pages.yml`; CI deletes `app/classmap/api/` before static build |
| A-06  | A     | IN_PROGRESS   | Coordination files + agent prompts                 | this folder |
| A-07  | A     | TODO          | Push to GitHub `markjeromecruz/classmap` public    | After A-04 lands so Pages has something to show |

## ClassMap MVP (B)

| ID     | Owner | Status | Title                                                       | Depends on | Notes |
|--------|-------|--------|-------------------------------------------------------------|------------|-------|
| CM-01  | B     | DONE_PENDING_A | `ClassMapForm` component                           | A-01       | Verified by C — 14 unit tests in tests/unit/ClassMapForm.test.tsx, all happy + invalid + coerce-empty cases. One P2 a11y nit filed as ISS-01. |
| CM-02  | B     | IN_PROGRESS | `PlanCard` + `PlanBoard` components                    | A-01       | Render `LessonPlan` from `lib/types.ts`. 5-column day layout, subject-colored cards. Use shadcn card/badge. |
| CM-03  | B     | TODO   | `/classmap/result` page wiring form → API → board           | CM-01, CM-02, A-02, A-03 | Reads `NEXT_PUBLIC_DEMO_MODE`. If true, calls `getDemoPlan(input)`. Else POSTs to `/api/generate`. |
| CM-04  | B     | TODO   | `/classmap/saved` + `lib/storage.ts` (localStorage)         | CM-02      | Save button on result page; saved list page; delete button. |
| CM-05  | B     | TODO   | Loading + error states across `/classmap/*`                 | CM-03      | shadcn skeleton + alert. |
| CM-06  | B     | TODO   | Print stylesheet (Export PDF stretch)                       | CM-02      | `@media print` in `app/globals.css`. |

## QA (C)

| ID    | Owner | Status | Title                                                  | Covers          | Notes |
|-------|-------|--------|--------------------------------------------------------|-----------------|-------|
| T-00  | C     | DONE_PENDING_A | Vitest + Playwright + CI                       | infra           | `npm test` 27/27, `npx playwright test` 1/1; CI at `.github/workflows/test.yml` |
| T-01  | C     | DONE_PENDING_A | Unit tests for `ClassMapForm` validation       | CM-01           | tests/unit/ClassMapForm.test.tsx — 14/14 passing |
| T-02  | C     | TODO   | Component tests for `PlanCard` / `PlanBoard`           | CM-02           | snapshot + a11y; verify all 5 days render |
| T-03  | C     | TODO   | E2E happy path: fill form → see plan                   | CM-03           | mock `/api/generate` with a fixture; assert plan renders |
| T-04  | C     | TODO   | E2E save + reload                                      | CM-04           | localStorage round-trip |
| T-05  | C     | TODO   | Demo-mode static build smoke                           | A-03, A-05      | `DEMO_MODE=true npm run build` succeeds; `out/` contains expected files |

## Conventions

- File new tasks at the bottom of the relevant section with the next sequential id (`CM-07`, `T-06`, etc.)
- When blocked, set status `BLOCKED` and add a `Notes` line starting with `BLOCKED:` explaining why
- Reference `lib/types.ts` for all data shapes — do not redeclare types locally
