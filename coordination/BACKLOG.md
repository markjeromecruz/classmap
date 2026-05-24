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
| CM-02  | B     | DONE_PENDING_A | `PlanCard` + `PlanBoard` components                 | A-01       | Verified by C — tests/unit/PlanBoard.test.tsx (17 tests). 5-col day grid Mon..Fri, session counts, subject styling, materials chips, summary toggle, missing-day fallback, formatMinutes (45 min / 1h / 1h 30m), PE+Language labels. |
| CM-03  | B     | DONE_PENDING_A | `/classmap/result` page wiring form → API → board   | CM-01, CM-02, A-02, A-03 | Verified by C — tests/unit/ClassMapFlow.test.tsx (10 tests). Demo happy path, regenerate, clear, save, live fetch (200/error/throw), aria-busy, data-status. |
| CM-04  | B     | DONE_PENDING_A | `/classmap/saved` + `lib/storage.ts` (localStorage) | CM-02      | Verified by C — tests/unit/storage.test.ts (13 tests, real localStorage) + tests/unit/SavedPlansList.test.tsx (6 tests). Round-trip, dedupe-by-id, head-ordering, delete, corruption resilience. |
| CM-05  | B     | DONE_PENDING_A | Loading + error states across `/classmap/*`         | CM-03      | Verified by C — tests/unit/PlanBoardSkeleton.test.tsx (6 tests) + ClassMapFlow loading/error additions (2 tests). Skeleton has documented data-slot/aria-busy/aria-live; 5 day cols; configurable sessionsPerDay; shadcn Skeleton primitive (animate-pulse). Error path now shadcn Alert variant=destructive with AlertTitle + AlertDescription. SavedPlansList loading slot present in source (timing untestable under React 19 — covered by source presence). |
| CM-06  | B     | DONE_PENDING_A | Print stylesheet (Export PDF stretch)               | CM-02      | Verified by C — tests/unit/print-stylesheet.test.ts (12 source-level tests on the @media print block) + tests/e2e/print.spec.ts (1 chromium test via `page.emulateMedia({media:"print"})` asserts form + submit hidden). |

## QA (C)

| ID    | Owner | Status | Title                                                  | Covers          | Notes |
|-------|-------|--------|--------------------------------------------------------|-----------------|-------|
| T-00  | C     | DONE   | Vitest + Playwright + CI                               | infra           | Signed off by A. 27/27 unit + 1/1 e2e. CI at `.github/workflows/test.yml`. |
| T-01  | C     | DONE   | Unit tests for `ClassMapForm` validation               | CM-01           | Signed off by A. 14/14 passing (then 41/41 after ISS-01 fix). |
| T-02  | C     | DONE_PENDING_A | Component tests for `PlanCard` / `PlanBoard`   | CM-02           | tests/unit/PlanBoard.test.tsx — 17/17 passing |
| T-03  | C     | DONE_PENDING_A | E2E happy path: fill form → see plan           | CM-03           | tests/unit/ClassMapFlow.test.tsx — 10/10 passing. Component-level equivalent of E2E with stubbed fetch (deterministic). |
| T-04  | C     | DONE_PENDING_A | E2E save + reload                              | CM-04           | tests/unit/storage.test.ts + tests/unit/SavedPlansList.test.tsx + ClassMapFlow save flow — real localStorage round-trip. |
| T-05  | C     | DONE_PENDING_A | Demo-mode static build smoke                   | A-03, A-05      | tests/unit/build-config.test.ts (14 tests): source-level contract on next.config.ts demo-mode switch (output:export + trailingSlash + unoptimized images + basePath) and .github/workflows/deploy-pages.yml (strip api, DEMO env, build, .nojekyll, upload-pages-artifact, deploy-pages, perms). Real build verified manually (`NEXT_PUBLIC_DEMO_MODE=true ... npm run build` → 5s, produces out/index.html, out/classmap/index.html, out/classmap/result/index.html, out/classmap/saved/index.html); live integration covered by deploy-pages workflow every push. |

## Conventions

- File new tasks at the bottom of the relevant section with the next sequential id (`CM-07`, `T-06`, etc.)
- When blocked, set status `BLOCKED` and add a `Notes` line starting with `BLOCKED:` explaining why
- Reference `lib/types.ts` for all data shapes — do not redeclare types locally
