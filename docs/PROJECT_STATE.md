# Project State

Snapshot of every task across all apps. Live source of truth is `coordination/BACKLOG.md` — this file is a human-readable narrative copy plus history.

Last updated: shipped through commit `74946f3` (signed off CM-10 + CM-11, Phase 1 of ClassMap v2 complete).

---

## Apps shipped

### ClassMap v1 MVP — ✅ DONE
- `/classmap` → form, `/classmap/result` → AI plan, `/classmap/saved` → localStorage list
- Print stylesheet (browser "Save as PDF")
- All 6 `CM-01..CM-06` tasks DONE, all 6 `T-00..T-05` tests DONE
- _(Will be removed in ClassMap v2 Phase 2 — the v2 planner replaces the v1 form flow)_

### KindleMinds — ✅ DONE
- `/kindleminds` rooms grid (5 curriculum styles)
- `/kindleminds/rooms/[slug]` thread list (10 sample threads across rooms)
- `/kindleminds/rooms/[slug]/[threadId]` full thread + replies
- Editorial periodical aesthetic — kicker labels, drop caps, hairline rules
- All `KM-01..KM-05` and `TK-01..TK-04` DONE

### Patriarch — ✅ DONE
- `/patriarch` landing with day-of-week + today's theme
- `/patriarch/today` daily devotional (live `claude` locally, canned in demo)
- `/patriarch/altar` family altar grid + `/patriarch/altar/[id]` per plan
- All `PT-01..PT-04` and `TP-01..TP-03` DONE
- Voice rules baked into `lib/patriarch-claude.ts` system prompt (avoid generic Christianese; reference concrete household moments)

---

## ClassMap v2 — in progress

### Phase 1 — auth + onboarding + family + shell — ✅ DONE

| Task | What it shipped |
|------|-----------------|
| CM-07 | `/classmap/login` + `/classmap/signup` mock auth screens (49 tests) |
| CM-08 | `/classmap/onboarding` 5-step wizard built via 5-way subagent fan-out (117 tests) |
| CM-09 | `/classmap/family` page with profile cards + state-requirement panel (37 tests) |
| CM-10 | `/classmap` shell route — IA redirect logic (6 tests) |
| CM-11 | Mobile bottom nav + side nav + child switcher; ≥44px touch targets (18 tests) |
| TC-01 | `lib/classmap/db.ts` round-trip + v1 → v2 migration (29 tests) |
| TC-02 | Mock auth flow tests (49 tests) |
| TC-03 | Onboarding wizard tests (117 tests across 6 files) |
| TC-04 | Family page tests (37 tests) |

**Demo-mode fix (commit `39897a9`):** the mock-auth flow was redirecting users to `/classmap/today` (Phase 2, not built yet) and 404-ing the Pages demo. Fixed by short-circuiting in `isDemoMode`: `/classmap` redirects to `/classmap/result` (the working v1 flow), `/classmap/login` and `/classmap/signup` render a "Sign-in is off in the demo" notice.

### Phases 2–6 — A foundation ✅ DONE, B/C work 🔜

**All A-foundation for the remaining phases is already shipped** (commit `5a2915d`). Every lib + API route the rest of the roadmap needs is in place. What remains is the B+C UI/test work.

#### Foundation in place (A-19 .. A-26)

| File | Phase | Purpose |
|------|-------|---------|
| `lib/classmap/plan-claude.ts` | 2 | `generatePlanForChild({child, weekStart})` → `{plan, tasks[]}`; age-band + curriculum-aware |
| `app/classmap/api/generate-plan/route.ts` | 2 | POST handler |
| `lib/classmap/tutor-claude.ts` | 4 | Socratic per-task tutor; never gives the answer |
| `app/classmap/api/tutor/route.ts` | 4 | POST handler |
| `lib/classmap/coach-claude.ts` | 4 | Parent advisor with family + stats + state-requirement context |
| `app/classmap/api/coach/route.ts` | 4 | POST handler |
| `lib/classmap/portfolio-claude.ts` | 5 | Markdown compliance-report generator |
| `lib/classmap/canned-portfolio-report.ts` | 5 | Demo-mode sample report |
| `app/classmap/api/portfolio-report/route.ts` | 5 | POST handler |
| `lib/classmap/connect-data.ts` | 6 | 5 co-op + 4 charter directories + `makeMapsSearchUrl()` helper |
| `lib/classmap/state-requirements.ts` | (already in A-16) | All 50 states; 10 priority populated, 40 stubbed |

#### Phase 2 — planner core (CM-12 .. CM-17 / TC-05 .. TC-10)

| Task | Owner | Status |
|------|-------|--------|
| CM-12 `/classmap/today` Today View | B | TODO |
| CM-13 `/classmap/week` Week View + drag-and-drop | B | TODO |
| CM-14 TaskModal (add/edit/delete) | B | TODO |
| CM-15 AI Generate button + modal | B | TODO |
| CM-16 Extended subject color tokens | B | TODO |
| CM-17 Child switcher persistence | B | TODO |
| TC-05 .. TC-10 | C | TODO |

Deps already installed: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, shadcn `dialog` + `drawer` + `sheet`.

#### Phase 3 — gamification + progress (CM-18 .. CM-22 / TC-11 .. TC-13)

| Task | Owner | Status |
|------|-------|--------|
| CM-18 `lib/classmap/xp.ts` (pure functions) | B | TODO |
| CM-19 XP toast + card animation | B | TODO |
| CM-20 All-done celebration screen | B | TODO |
| CM-21 `/classmap/progress` dashboard + charts | B | TODO |
| CM-22 Per-child progress filtering | B | TODO |
| TC-11 .. TC-13 | C | TODO |

Deps already installed: `recharts`, `sonner`, shadcn `progress`.

#### Phase 4 — AI tutor + coach (CM-23 .. CM-26 / TC-14 .. TC-16)

| Task | Owner | Status |
|------|-------|--------|
| CM-23 `/classmap/tutor/[taskId]` full-screen chat | B | TODO |
| CM-24 `/classmap/coach` chat (family-context-aware) | B | TODO |
| CM-25 Socratic prompt (already in A-21 system prompt) | B | TODO |
| CM-26 Shared `components/classmap/chat/*` primitives | B | TODO |
| TC-14 .. TC-16 | C | TODO |

Canned-dialogue fixtures for demo mode already exist in `lib/classmap/canned-tutor.ts` and `lib/classmap/canned-coach.ts`.

#### Phase 5 — portfolio + market (CM-27 .. CM-31 / TC-17 .. TC-20)

| Task | Owner | Status |
|------|-------|--------|
| CM-27 `/classmap/portfolio` upload UI + list | B | TODO |
| CM-28 Generate-report button + markdown render | B | TODO |
| CM-29 `/classmap/market` (merchant + work upload tabs) | B | TODO |
| CM-30 File size + type validation | B | TODO |
| CM-31 Date-range filter | B | TODO |
| TC-17 .. TC-20 | C | TODO |

Deps already installed: `react-dropzone`, shadcn `tabs`.

#### Phase 6 — connect + family polish (CM-32 .. CM-34 / TC-21 .. TC-23)

| Task | Owner | Status |
|------|-------|--------|
| CM-32 `/classmap/connect` (co-ops + charter tabs) | B | TODO |
| CM-33 Family page polish + state-req + quick links | B | TODO |
| CM-34 Mobile pass (touch targets + bottom-nav active states) | B | TODO |
| TC-21 .. TC-23 | C | TODO |

---

## A foundation tasks

| ID | Status | What |
|----|--------|------|
| A-01 .. A-12 | DONE | Original ClassMap MVP + KindleMinds + Patriarch foundation |
| A-13 | TODO | Sub-app routing under static export (basePath audit). Deferable. |
| A-14 .. A-18 | DONE | ClassMap v2 Phase 1 foundation (types, db, auth, state-requirements, shell, canned dialogues) |
| A-19 .. A-27 | DONE | ClassMap v2 Phases 2–6 foundation (wrappers + API routes + connect data) |

---

## Open issues

(Tracked in `coordination/ISSUES.md` — only "OPEN" or "RE_TEST" rows are live.)

- **None blocking.** The "floating N avatar on `/classmap/login` + `/classmap/signup`" cosmetic bug was noted in HANDOFFS as low-priority; investigate when polishing Phase 1.

---

## Live URLs

- **GitHub Pages demo:** https://markjeromecruz.github.io/classmap/
- **GitHub repo:** https://github.com/markjeromecruz/classmap
- **CI dashboard:** https://github.com/markjeromecruz/classmap/actions

---

## Test totals at last known checkpoint

- Local: **554 / 554** passing (commit `74946f3`)
- CI: green on both `test` and `Deploy demo to GitHub Pages` workflows
