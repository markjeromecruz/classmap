# Backlog

Statuses: `TODO` → `IN_PROGRESS` → `NEEDS_TEST` → `DONE_PENDING_A` → `DONE` · or `BLOCKED`

## Foundation (A)

| ID    | Owner | Status        | Title                                              | Notes |
|-------|-------|---------------|----------------------------------------------------|-------|
| A-01  | A     | DONE          | Scaffold Next.js + TS + Tailwind + shadcn          | Next 16, React 19, Tailwind 4 |
| A-02  | A     | DONE          | Claude headless wrapper + Zod schema               | `lib/claude.ts` spawns `claude -p` CLI. Parses JSON, Zod-validates against `lessonPlanSchema`. |
| A-03  | A     | DONE          | ClassMap demo-mode switch + 3 canned plans         | `lib/env.ts`, `lib/demo-data.ts` (early/upper/teen) |
| A-04  | A     | DONE          | Portfolio landing                                  | `app/page.tsx` + `components/portfolio/AppCard.tsx` |
| A-05  | A     | DONE          | GitHub Pages workflow                              | `.github/workflows/deploy-pages.yml`; strips api/ pre-build, sets `NEXT_PUBLIC_BASE_PATH=/classmap` |
| A-06  | A     | DONE          | Coordination files + agent prompts                 | this folder |
| A-07  | A     | DONE          | Push to GitHub + enable Pages                      | Live: https://markjeromecruz.github.io/classmap/ |
| A-08  | A     | DONE          | Fix ISS-02: tsconfig alias in tests                | tsconfig.test.json + vite-tsconfig-paths plugin |
| A-09  | A     | DONE          | Editorial redesign (Fraunces + Instrument Sans)    | Warm-cream + ink-blue + terracotta palette, masthead, kicker/dek/lead/drop-cap utilities. Resolves AppCard half of ISS-03. |
| A-10  | A     | DONE          | KindleMinds + Patriarch types & demo data          | `lib/kindleminds-types.ts`, `lib/kindleminds-demo-data.ts` (5 rooms, 10 threads), `lib/patriarch-types.ts`, `lib/patriarch-demo-data.ts` (3 devotionals, 3 family altars, 2 journal entries). |
| A-11  | A     | TODO          | Patriarch Claude wrapper (lib/patriarch-claude.ts) | Headless `claude -p` with a devotional system prompt; returns Zod-validated `Devotional`. Mirror the ClassMap wrapper. Schedule once KM ships. |
| A-12  | A     | TODO          | Update portfolio landing as apps come live         | Flip KindleMinds and Patriarch from `coming-soon` → `live` when their `/<app>` route exists. Update `app/page.tsx`. |
| A-13  | A     | TODO          | Sub-app routing under static export (basePath)     | Verify `/kindleminds` and `/patriarch` static-export correctly under `/classmap` basePath. May require trailingSlash audit. |

## ClassMap MVP (B)

| ID     | Owner | Status         | Title                                                | Depends on | Notes |
|--------|-------|----------------|------------------------------------------------------|------------|-------|
| CM-01  | B     | DONE           | `ClassMapForm` component                             | A-01       | Verified by C; 41/41 after ISS-01 fix. |
| CM-02  | B     | DONE           | `PlanCard` + `PlanBoard` components                  | A-01       | Verified by C; 17 tests. |
| CM-03  | B     | DONE           | `/classmap/result` page wiring form → API → board    | CM-01, CM-02, A-02, A-03 | Verified by C; 10-test flow incl. demo/live, regen, save. |
| CM-04  | B     | DONE           | `/classmap/saved` + `lib/storage.ts`                 | CM-02      | Verified by C; storage 13 tests + SavedPlansList 6 tests. |
| CM-05  | B     | DONE           | Loading + error states across `/classmap/*`          | CM-03      | Verified by C; PlanBoardSkeleton 6 tests + flow loading/error 2 tests. |
| CM-06  | B     | DONE           | Print stylesheet                                     | CM-02      | Verified by C; 12 source-level + 1 chromium e2e. |

## KindleMinds MVP (B)

Build the static social-hub demo. No backend, no auth, no real posting — data comes from `lib/kindleminds-demo-data.ts`. Polish the editorial look; this should feel like an actual periodical issue, not a forum.

| ID     | Owner | Status | Title                                                              | Depends on | Notes |
|--------|-------|--------|--------------------------------------------------------------------|------------|-------|
| KM-01  | B     | DONE_PENDING_A | `/kindleminds` landing page with rooms grid                | A-10       | Verified by C — tests/unit/kindleminds-landing.test.tsx (16 tests). Masthead, rooms-grid[data-count=5], one room-card per CURRICULUM_STYLES slug, links to /kindleminds/rooms/<slug>, h2 names, summed member count footer, RoomCard isolation. |
| KM-02  | B     | DONE_PENDING_A | `/kindleminds/rooms/[slug]` page with thread list          | KM-01      | Verified by C — tests/unit/kindleminds-room.test.tsx (13 tests). All 5 slugs render as async server component, threads-list[data-count] matches getThreadsForRoom, threads in source order, per-card data-thread-id + data-room-slug. generateStaticParams = CURRICULUM_STYLES; dynamicParams=false; notFound() on unknown; generateMetadata branches. Cross-rooms: total cards = THREADS.length. |
| KM-03  | B     | TODO   | `/kindleminds/rooms/[slug]/[threadId]` thread + replies            | KM-02      | Full thread body + every reply. Replies use a thin left-rule and indented body; author + timestamp in `.kicker` style. |
| KM-04  | B     | DONE_PENDING_A | `components/kindleminds/RoomCard.tsx` + `ThreadCard.tsx`    | KM-01      | RoomCard verified with KM-01. ThreadCard verified — tests/unit/kindleminds-ThreadCard.test.tsx (15 tests): data slots, default href, custom basePath, h3 title, author + Intl date, reply pluralization (0/1/2), view count, preview truncation at word boundary + ellipsis, no-space hard-cut, full-fixture render sanity. |
| KM-05  | B     | TODO   | Update portfolio landing: KindleMinds → live                       | KM-01, KM-02 | Edit `app/page.tsx` to change KindleMinds card from `coming-soon` → `live` with `href="/kindleminds"`. |

## Patriarch MVP (B)

Build the daily devotional + family altar demo. AI on for local runs (via `lib/patriarch-claude.ts` once A ships A-11), canned in demo mode (from `lib/patriarch-demo-data.ts`).

| ID     | Owner | Status | Title                                                              | Depends on | Notes |
|--------|-------|--------|--------------------------------------------------------------------|------------|-------|
| PT-01  | B     | DONE_PENDING_A | `/patriarch` landing                                       | A-10       | Verified by C — tests/unit/patriarch-landing.test.tsx (8 tests). Masthead h1+dek+back link, patriarch-day shows day-of-week+long date (clock pinned), today-card with theme h2 + scriptureReference, both CTA links present with documented targets, altar plan count footer. |
| PT-02  | B     | DONE_PENDING_A | `/patriarch/today` daily devotional view                   | A-10       | Verified by C — DevotionalView (9 tests), LiveDevotional (7 tests), today-page dispatch (3 tests). All 6 devotional sub-slots present per devotional; live mode: loading skeleton has aria-busy+aria-live, fetch happy path swaps to DevotionalView, POST body is "{}", error paths (non-200, throw, schema-invalid) all surface destructive Alert; page data-mode reflects isDemoMode. |
| PT-03  | B     | IN_PROGRESS | `/patriarch/altar` family altar plans                         | A-10       | Grid of `FAMILY_ALTARS`. Each card: title, age range, minutes, scripture, opening question, activity, closing prayer. Add `/patriarch/altar/[id]` for a single plan. |
| PT-04  | B     | TODO   | Update portfolio landing: Patriarch → live                         | PT-01      | Edit `app/page.tsx`. |

## QA (C)

ClassMap test coverage is DONE. New work starts when KindleMinds tasks hit `NEEDS_TEST`.

| ID    | Owner | Status         | Title                                          | Covers          | Notes |
|-------|-------|----------------|------------------------------------------------|-----------------|-------|
| T-00  | C     | DONE           | Vitest + Playwright + CI                       | infra           | |
| T-01  | C     | DONE           | Unit tests for `ClassMapForm` validation       | CM-01           | 41/41 |
| T-02  | C     | DONE           | Component tests for `PlanCard` / `PlanBoard`   | CM-02           | 17/17 |
| T-03  | C     | DONE           | E2E happy path: fill form → see plan           | CM-03           | 10/10 |
| T-04  | C     | DONE           | E2E save + reload                              | CM-04           | storage 13 + SavedPlansList 6 |
| T-05  | C     | DONE           | Demo-mode static build smoke                   | A-03, A-05      | 14 contract tests |
| TK-01 | C     | DONE_PENDING_A | KindleMinds room grid render                   | KM-01           | tests/unit/kindleminds-landing.test.tsx — 16/16 passing. |
| TK-02 | C     | DONE_PENDING_A | KindleMinds room page                          | KM-02           | tests/unit/kindleminds-room.test.tsx + kindleminds-ThreadCard.test.tsx — 28/28 passing. |
| TK-03 | C     | TODO           | KindleMinds thread page                        | KM-03           | Full body + every reply rendered; replies in order. |
| TK-04 | C     | TODO           | KindleMinds e2e: landing → room → thread       | KM-01..KM-03    | Playwright nav test. |
| TP-01 | C     | DONE_PENDING_A | Patriarch landing render                       | PT-01           | tests/unit/patriarch-landing.test.tsx — 8/8 passing. |
| TP-02 | C     | DONE_PENDING_A | Patriarch devotional flow                      | PT-02           | tests/unit/patriarch-{DevotionalView,LiveDevotional,today-page}.test.tsx — 19/19 passing. |
| TP-03 | C     | TODO           | Patriarch family altar render                  | PT-03           | Grid renders all altars; single-altar page renders all 5 fields. |

## Conventions

- File new tasks at the bottom of the relevant section with the next sequential id.
- When blocked, set status `BLOCKED` and add a `Notes` line starting with `BLOCKED:` explaining why.
- Reference `lib/*-types.ts` for all data shapes — do not redeclare types locally.
- Use the editorial design vocabulary in `app/globals.css` (kicker, dek, lead, font-display, accent-clay, accent-ink). Don't invent parallel utilities.
- **Stage by explicit path** (`git add <file>`); never `git add -A` or `git add .` — see agent prompts for why.
