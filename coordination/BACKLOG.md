# Backlog

Statuses: `TODO` → `IN_PROGRESS` → `NEEDS_TEST` → `DONE_PENDING_A` → `DONE` · or `BLOCKED`

## Foundation (A)

| ID    | Owner | Status        | Title                                              | Notes |
|-------|-------|---------------|----------------------------------------------------|-------|
| A-01  | A     | DONE          | Scaffold Next.js + TS + Tailwind + shadcn          | Next 16, React 19, Tailwind 4 |
| A-02  | A     | DONE          | Claude headless wrapper + Zod schema               | `lib/claude.ts` spawns `claude -p` CLI (not the npm SDK — that ships only a binary). Parses JSON, Zod-validates against `lessonPlanSchema`. |
| A-03  | A     | DONE          | Demo-mode switch + 3 canned plans (age bands)      | `lib/env.ts`, `lib/demo-data.ts` (early/upper/teen) |
| A-04  | A     | DONE          | Portfolio landing                                  | `app/page.tsx` + `components/portfolio/AppCard.tsx` (Card-based, ClassMap live, others coming soon) |
| A-05  | A     | DONE          | GitHub Pages workflow                              | `.github/workflows/deploy-pages.yml`; CI deletes `app/classmap/api/` before static build, sets `NEXT_PUBLIC_BASE_PATH=/classmap` |
| A-06  | A     | DONE          | Coordination files + agent prompts                 | this folder |
| A-07  | A     | DONE          | Push to GitHub `markjeromecruz/classmap` public    | Repo live. Pages enabled via `gh api -X POST /repos/.../pages -f build_type=workflow`. URL: https://markjeromecruz.github.io/classmap/ (live once next deploy run succeeds) |
| A-08  | A     | IN_PROGRESS   | Fix ISS-02: tsconfig alias in tests                | Add `tsconfig.test.json` extending root + setting `@/*` paths so we can re-narrow root tsconfig exclude AND keep `@/` aliases working in tests without hard-coding in `vitest.config.mts`. |

## ClassMap MVP (B)

| ID     | Owner | Status | Title                                                       | Depends on | Notes |
|--------|-------|--------|-------------------------------------------------------------|------------|-------|
| CM-01  | B     | DONE           | `ClassMapForm` component                           | A-01       | Verified by C — 41/41 tests after ISS-01 fix. Signed off by A. |
| CM-02  | B     | IN_PROGRESS | `PlanCard` + `PlanBoard` components                    | A-01       | Render `LessonPlan` from `lib/types.ts`. 5-column day layout, subject-colored cards. Use shadcn card/badge. |
| CM-03  | B     | TODO   | `/classmap/result` page wiring form → API → board           | CM-01, CM-02, A-02, A-03 | Reads `NEXT_PUBLIC_DEMO_MODE`. If true, calls `getDemoPlan(input)`. Else POSTs to `/api/generate`. |
| CM-04  | B     | TODO   | `/classmap/saved` + `lib/storage.ts` (localStorage)         | CM-02      | Save button on result page; saved list page; delete button. |
| CM-05  | B     | TODO   | Loading + error states across `/classmap/*`                 | CM-03      | shadcn skeleton + alert. |
| CM-06  | B     | TODO   | Print stylesheet (Export PDF stretch)                       | CM-02      | `@media print` in `app/globals.css`. |

## QA (C)

| ID    | Owner | Status | Title                                                  | Covers          | Notes |
|-------|-------|--------|--------------------------------------------------------|-----------------|-------|
| T-00  | C     | DONE   | Vitest + Playwright + CI                               | infra           | Signed off by A. 27/27 unit + 1/1 e2e. CI at `.github/workflows/test.yml`. |
| T-01  | C     | DONE   | Unit tests for `ClassMapForm` validation               | CM-01           | Signed off by A. 14/14 passing (then 41/41 after ISS-01 fix). |
| T-02  | C     | TODO   | Component tests for `PlanCard` / `PlanBoard`           | CM-02           | snapshot + a11y; verify all 5 days render |
| T-03  | C     | TODO   | E2E happy path: fill form → see plan                   | CM-03           | mock `/api/generate` with a fixture; assert plan renders |
| T-04  | C     | TODO   | E2E save + reload                                      | CM-04           | localStorage round-trip |
| T-05  | C     | TODO   | Demo-mode static build smoke                           | A-03, A-05      | `DEMO_MODE=true npm run build` succeeds; `out/` contains expected files |

## Conventions

- File new tasks at the bottom of the relevant section with the next sequential id (`CM-07`, `T-06`, etc.)
- When blocked, set status `BLOCKED` and add a `Notes` line starting with `BLOCKED:` explaining why
- Reference `lib/types.ts` for all data shapes — do not redeclare types locally
