# Backlog

Statuses: `TODO` → `IN_PROGRESS` → `NEEDS_TEST` → `DONE_PENDING_A` → `DONE` · or `BLOCKED`

## Foundation (A)

| ID    | Owner | Status        | Title                                              | Notes |
|-------|-------|---------------|----------------------------------------------------|-------|
| A-01  | A     | DONE          | Scaffold Next.js + TS + Tailwind + shadcn          | Next 16, React 19, Tailwind 4 |
| A-02  | A     | DONE          | Claude headless wrapper (ClassMap v1)              | `lib/claude.ts` |
| A-03  | A     | DONE          | ClassMap v1 demo-mode + canned plans               | `lib/env.ts`, `lib/demo-data.ts` |
| A-04  | A     | DONE          | Portfolio landing                                  | `app/page.tsx` + `components/portfolio/AppCard.tsx` |
| A-05  | A     | DONE          | GitHub Pages workflow                              | `.github/workflows/deploy-pages.yml` |
| A-06  | A     | DONE          | Coordination files + agent prompts                 | this folder |
| A-07  | A     | DONE          | Push to GitHub + enable Pages                      | https://markjeromecruz.github.io/classmap/ |
| A-08  | A     | DONE          | Fix ISS-02 — tsconfig alias in tests               | tsconfig.test.json |
| A-09  | A     | DONE          | Editorial redesign                                 | Fraunces + Instrument Sans, warm cream |
| A-10  | A     | DONE          | KindleMinds + Patriarch types & demo data          | |
| A-11  | A     | DONE          | Patriarch Claude wrapper                           | `lib/patriarch-claude.ts` + POST route |
| A-12  | A     | DONE          | Portfolio landing flip (KM + PT → live)            | Folded into B's KM-05 + PT-04 commits. |
| A-13  | A     | TODO          | Sub-app routing under static export (basePath)     | Verify all sub-app routes static-export correctly under `/classmap` basePath. Can wait until ClassMap v2 stabilises. |

### ClassMap v2 foundation (A) — Phase 1

| ID    | Owner | Status        | Title                                                                  | Notes |
|-------|-------|---------------|------------------------------------------------------------------------|-------|
| A-14  | A     | IN_PROGRESS   | `lib/classmap/types.ts` + `lib/classmap/db.ts`                         | Types shipped; db.ts coming via subagent fan-out. v2 schema with Child, LessonPlan, LessonTask, PortfolioEntry, WorkSample, AppState. `STORAGE_KEY = "classmap:state:v2"`. db.ts must include v1 → v2 migration helper. |
| A-15  | A     | TODO          | `lib/classmap/auth.ts` — mock session                                  | signIn / signUp / signOut / `useSession()` hook. No real network. localStorage-backed. |
| A-16  | A     | TODO          | `lib/classmap/state-requirements.ts` — 10 priority states              | CA, TX, NY, FL, PA, IL, OH, GA, NC, WA: hoursPerYear, subjectsRequired, portfolioRequired, testingRequired, notificationOfIntent, notes. Stub other 40 with `{ code, name, ...nulls }`. |
| A-17  | A     | TODO          | `components/classmap/shell/ClassmapShell.tsx` skeleton                 | Mobile bottom nav + side nav (≥md), child switcher, current-path highlight, `useRedirectIfNoSession` + `useRedirectIfNoChild` guards. Mobile-first. |
| A-18  | A     | TODO          | Canned dialogue fixtures                                               | `lib/classmap/canned-tutor.ts` + `lib/classmap/canned-coach.ts` — 5–8 starter prompts each with matchers. |

### ClassMap v2 foundation (A) — Phases 2-6 (deferred — shipped per phase)

| ID    | Owner | Status | Title |
|-------|-------|--------|-------|
| A-19  | A     | TODO   | Extend `lib/claude.ts` → `generatePlanForChild(child)` emits LessonTask[] |
| A-20  | A     | TODO   | Swap `app/classmap/api/generate-plan/route.ts` to new shape |
| A-21  | A     | TODO   | `lib/classmap/tutor-claude.ts` |
| A-22  | A     | TODO   | `lib/classmap/coach-claude.ts` |
| A-23  | A     | TODO   | `app/classmap/api/tutor/route.ts` + `app/classmap/api/coach/route.ts` |
| A-24  | A     | TODO   | `lib/classmap/portfolio-claude.ts` + `app/classmap/api/portfolio-report/route.ts` |
| A-25  | A     | TODO   | Canned portfolio report (demo mode) |
| A-26  | A     | TODO   | `lib/classmap/connect-data.ts` (5 co-op + 4 charter directories) |
| A-27  | A     | TODO   | State requirements expanded to all 50 states |

## ClassMap MVP (B) — v1, complete

| ID     | Owner | Status | Title | Notes |
|--------|-------|--------|-------|-------|
| CM-01  | B     | DONE   | `ClassMapForm` component                             | |
| CM-02  | B     | DONE   | `PlanCard` + `PlanBoard` components                  | |
| CM-03  | B     | DONE   | `/classmap/result` page wiring form → API → board    | **Removed during Phase 2 migration** |
| CM-04  | B     | DONE   | `/classmap/saved` + `lib/storage.ts`                 | **Removed during Phase 2 migration** |
| CM-05  | B     | DONE   | Loading + error states across `/classmap/*`          | |
| CM-06  | B     | DONE   | Print stylesheet                                     | |

## ClassMap v2 (B) — Phase 1 (auth + onboarding + shell + family)

All Phase 1 B tasks have the same hard requirements:
- **Wrap every classmap page in `<ClassmapShell>` once A-17 lands.**
- **Use `lib/classmap/types.ts` and `lib/classmap/db.ts` for all reads/writes.** Do not touch `lib/storage.ts` or `lib/types.ts` directly.
- **Mobile-first** — verify at 360 px viewport before NEEDS_TEST.
- **Fan out subagents** for any task with ≥3 new files (see AGENT_B_PROMPT.md for the rule).

| ID     | Owner | Status | Title                                                              | Depends on | Notes |
|--------|-------|--------|--------------------------------------------------------------------|------------|-------|
| CM-07  | B     | DONE           | `/classmap/login` + `/classmap/signup` (mock auth screens) | A-14, A-15 | Verified by C via 3-way subagent fan-out — tests/unit/classmap-auth.test.ts (24), classmap-AuthForm.test.tsx (15), classmap-auth-pages.test.tsx (10). 49 tests total. Real localStorage; next/navigation router mocked at the boundary only. Page tests assert ClassmapShell bare contract (no SideNav, no MobileBottomNav) + 360px viewport. |
| CM-08  | B     | DONE           | `/classmap/onboarding` — 5-step wizard                     | A-14       | Verified by C via 6-way subagent fan-out — tests/unit/classmap-{OnboardingWizard,WizardStep1Name,WizardStep2AgeGrade,WizardStep3State,WizardStep4Style,WizardStep5Subjects}.test.tsx. 117 tests across 6 files. Orchestrator: data-step transitions, back/next gating, Finish calls db.createChild + router.push("/classmap/today"). Steps individually: prop contract + validity-by-emission + mobile 360px. |
| CM-09  | B     | NEEDS_TEST | `/classmap/family` — list profiles + state req panel           | A-14, A-16 | Built via 2-parallel-subagent fan-out. `FamilyList` (client) reads via `useAppState`, renders `ChildCard` grid; `ChildCard` (server) per-child with avatar circle + XP/streak/badges row + style/approach line + collapsible `<details>` state-requirement panel via `getStateRequirement(child.state)`. Add-child + Portfolio-export Links, Logout Button calls signOut + router.push("/classmap/login"). Selectors: `data-slot="family"`, `family-list[data-count]`, `family-empty`, `family-add-child`, `family-actions`, `family-portfolio-link`, `family-logout`, `child-card[data-child-id]`, sub-slots `child-xp`/`child-streak`/`child-badges`/`child-state-req`. |
| CM-10  | B     | NEEDS_TEST | `/classmap` shell route — IA redirect logic                    | A-14, A-15 | `app/classmap/page.tsx` replaced with a client component that on mount calls `router.replace` based on (a) `getCurrentSession()` → /classmap/login if null, (b) `getChildren()` → /classmap/onboarding if empty, (c) else /classmap/today. Renders a static "Loading…" placeholder with `data-slot="classmap-shell-route"` aria-busy aria-live=polite. Replaces the v1 form-flow page. |
| CM-11  | B     | NEEDS_TEST | Mobile bottom nav + side nav + child switcher                  | A-17       | Shell components already had active-path highlight + ChildSwitcher in header. Single touch-target compliance fix: `SideNav` nav-item link height `h-10` → `h-11` (40→44px). MobileBottomNav already `min-h-[56px]`; ChildSwitcher rows already `min-h-[44px]`; SideNav sign-out already `h-11`. Bottom nav matches the 5-item spec (Today/Week/Tutor/Progress/More); SideNav has the same 5 plus extras (Coach/Portfolio/Market/Connect/Family) — non-violation. |

## ClassMap v2 (B) — Phases 2-6 (rows seeded; details added at phase kickoff)

| ID     | Owner | Status | Title | Phase |
|--------|-------|--------|-------|-------|
| CM-12  | B     | TODO   | `/classmap/today` — Today View | 2 |
| CM-13  | B     | TODO   | `/classmap/week` — Week View + drag-and-drop | 2 |
| CM-14  | B     | TODO   | TaskModal — add/edit/delete | 2 |
| CM-15  | B     | TODO   | "AI Generate" button + modal | 2 |
| CM-16  | B     | TODO   | Extended subject color tokens | 2 |
| CM-17  | B     | TODO   | Child switcher persistence | 2 |
| CM-18  | B     | TODO   | `lib/classmap/xp.ts` — XP/streak/badge pure functions | 3 |
| CM-19  | B     | TODO   | +XP toast + card pop animation | 3 |
| CM-20  | B     | TODO   | All-done celebration screen | 3 |
| CM-21  | B     | TODO   | `/classmap/progress` — dashboard + recharts | 3 |
| CM-22  | B     | TODO   | Per-child progress filtering | 3 |
| CM-23  | B     | TODO   | `/classmap/tutor/[taskId]` — full-screen chat | 4 |
| CM-24  | B     | TODO   | `/classmap/coach` — chat with family context | 4 |
| CM-25  | B     | TODO   | Socratic-style tutor prompt | 4 |
| CM-26  | B     | TODO   | `components/classmap/chat/*` shared primitives | 4 |
| CM-27  | B     | TODO   | `/classmap/portfolio` — upload UI + list | 5 |
| CM-28  | B     | TODO   | Generate-report button + markdown render + download | 5 |
| CM-29  | B     | TODO   | `/classmap/market` — merchant + work upload tabs | 5 |
| CM-30  | B     | TODO   | File size + type validation + friendly errors | 5 |
| CM-31  | B     | TODO   | Date range filter on portfolio | 5 |
| CM-32  | B     | TODO   | `/classmap/connect` — co-ops + charter tabs | 6 |
| CM-33  | B     | TODO   | Family page polish + state req + quick-links | 6 |
| CM-34  | B     | TODO   | Mobile polish pass — touch targets + bottom nav active states | 6 |

## KindleMinds MVP (B) — complete

| ID     | Owner | Status | Title |
|--------|-------|--------|-------|
| KM-01  | B     | DONE   | `/kindleminds` landing + rooms grid |
| KM-02  | B     | DONE   | `/kindleminds/rooms/[slug]` |
| KM-03  | B     | DONE   | `/kindleminds/rooms/[slug]/[threadId]` |
| KM-04  | B     | DONE   | `RoomCard` + `ThreadCard` |
| KM-05  | B     | DONE   | Portfolio landing: KindleMinds → live |

## Patriarch MVP (B) — complete

| ID     | Owner | Status | Title |
|--------|-------|--------|-------|
| PT-01  | B     | DONE   | `/patriarch` landing |
| PT-02  | B     | DONE   | `/patriarch/today` daily devotional view |
| PT-03  | B     | DONE   | `/patriarch/altar` family altar plans |
| PT-04  | B     | DONE   | Portfolio landing: Patriarch → live |

## QA (C) — complete history

| ID    | Owner | Status | Title |
|-------|-------|--------|-------|
| T-00..T-05 | C | DONE | ClassMap v1 + infra |
| TK-01..TK-04 | C | DONE | KindleMinds |
| TP-01..TP-03 | C | DONE | Patriarch |

## ClassMap v2 QA (C) — Phase 1

All C tasks: **mobile breakpoint assertion at 360 px is required for any page-level test** (use Playwright `device: 'iPhone 13'` for e2e).

| ID     | Owner | Status | Title                                                  | Covers      | Notes |
|--------|-------|--------|--------------------------------------------------------|-------------|-------|
| TC-01  | C     | DONE           | `lib/classmap/db.ts` round-trip + v1→v2 migration | A-14    | Verified by C — tests/unit/classmap-db.test.ts (29 tests). Real localStorage; schemas asserted via lib/classmap/types.ts. Full CRUD round-trip; migration: fixture v1 saved-plans → v2 LessonPlan + 3 LessonTasks + auto Imported child (or existing), v1 key removed; corrupt/empty/non-array v1 → key cleared, state untouched; unknown day skipped, unknown subject → math, minutes clamped 5..240; runs once per module load. |
| TC-02  | C     | DONE           | Mock auth flow                                 | CM-07, A-15 | tests/unit/classmap-auth.test.ts + classmap-AuthForm.test.tsx + classmap-auth-pages.test.tsx — 49/49 passing. |
| TC-03  | C     | DONE           | Onboarding wizard                              | CM-08       | tests/unit/classmap-{OnboardingWizard,WizardStep1..5}.test.tsx — 117/117 passing. |
| TC-04  | C     | TODO   | Family page                                            | CM-09       | Renders all children, avatars present, state requirements panel toggles, add-child reopens wizard. |

## ClassMap v2 QA (C) — Phases 2-6 (rows seeded; details added at phase kickoff)

| ID    | Owner | Status | Title | Phase |
|-------|-------|--------|-------|-------|
| TC-05 | C | TODO | Today View progress + active card | 2 |
| TC-06 | C | TODO | Week View drag-and-drop persistence | 2 |
| TC-07 | C | TODO | TaskModal add/edit/delete | 2 |
| TC-08 | C | TODO | AI Generate demo + live paths | 2 |
| TC-09 | C | TODO | Child switcher persistence | 2 |
| TC-10 | C | TODO | E2E: onboard → generate → today → complete | 2 |
| TC-11 | C | TODO | xp.ts pure-function tests | 3 |
| TC-12 | C | TODO | Toast + celebration screen | 3 |
| TC-13 | C | TODO | Progress dashboard renders charts | 3 |
| TC-14 | C | TODO | Tutor demo canned matcher | 4 |
| TC-15 | C | TODO | Coach demo canned matcher | 4 |
| TC-16 | C | TODO | Chat persistence across navigation | 4 |
| TC-17 | C | TODO | Upload round-trip | 5 |
| TC-18 | C | TODO | Report generation demo + live | 5 |
| TC-19 | C | TODO | Market tabs + cards | 5 |
| TC-20 | C | TODO | Date filter narrows portfolio | 5 |
| TC-21 | C | TODO | Connect tabs render | 6 |
| TC-22 | C | TODO | Family page polish | 6 |
| TC-23 | C | TODO | Mobile breakpoint snapshots | 6 |

## Conventions

- File new tasks at the bottom of the relevant section with the next sequential id.
- When blocked, set status `BLOCKED` and add a `Notes` line starting with `BLOCKED:` explaining why.
- For ClassMap v2: types live in `lib/classmap/types.ts`; data CRUD in `lib/classmap/db.ts`. Do not redeclare or bypass.
- Use the editorial design vocabulary in `app/globals.css` (kicker, dek, lead, font-display, accent-clay, accent-ink). No parallel utilities.
- **Mobile-first for every ClassMap v2 task** — verify at 360 px viewport before NEEDS_TEST.
- **Stage by explicit path** (`git add <file>`); never `git add -A` or `git add .`.
- **Fan out subagents** for any task with ≥3 new files or independent searches — see AGENT_*_PROMPT.md.
