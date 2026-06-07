# Roadmap

The big picture for the multi-app portfolio. For the live, task-by-task status see [`PROJECT_STATE.md`](PROJECT_STATE.md); for live coordination see [`../coordination/BACKLOG.md`](../coordination/BACKLOG.md).

## Apps in priority order

| # | App | Audience | Status |
|---|-----|----------|--------|
| 1 | **ClassMap** v1 MVP | Homeschool parents | ✅ Shipped |
| 1 | **ClassMap** v2 full spec | Homeschool parents | 🟡 Phase 1 done; Phases 2–6 next |
| 2 | **KindleMinds** | Homeschool families (community) | ✅ Shipped |
| 3 | **Patriarch** | Christian husbands / fathers | ✅ Shipped |

The source-of-truth doc (Google Doc id `1nlHJ6X7PkTAcB3_JR_6ZSZeLqjCt98xQ_-WH2Htox9c`) describes these three. When fetched via Google Drive MCP the doc is truncated; treat these as the full scope until further notice.

---

## ClassMap v2 — six phases

Each phase is sized for one A/B/C cycle. Phases 2–6 have **zero remaining A-blockers** — every dependency was pre-shipped during the May 24 foundation push.

### Phase 1 — foundation: auth + onboarding + family + shell — ✅ DONE
- Mock auth flow (localStorage session, cosmetic OTP + Google)
- 5-step onboarding wizard (creates a `Child` with derived `ageBand` + `avatarColor`)
- Family page (profile cards + collapsible state-requirement panel)
- `/classmap` shell route — IA redirects (no session → login, session + 0 kids → onboarding, else → today)
- `ClassmapShell` chrome — mobile bottom nav, side nav (≥md), child switcher header
- 5 + 5 starter canned dialogues for AI Tutor + AI Coach (Phase 4 demo mode)

### Phase 2 — planner core 🔜 (B+C only)
- `/classmap/today` — today's tasks with progress bar + active card + completed list + upcoming days preview
- `/classmap/week` — 5-column day layout, drag-and-drop reorder (via `@dnd-kit/sortable`)
- TaskModal — manual add/edit/delete in a shadcn Dialog (Drawer on mobile)
- "AI Generate" — wires `lib/classmap/plan-claude.ts` locally, `lib/classmap/demo-data.ts` (existing) in demo
- Subject color tokens extended
- Child switcher persistence in `prefs.activeChildId`

### Phase 3 — gamification + progress 🔓
- `lib/classmap/xp.ts` — XP award per task, streak rollover, badge auto-grant (pure functions)
- +XP toast on task completion (via `sonner`)
- All-done celebration screen
- `/classmap/progress` — XP total, streak, completion rate, subject bar chart, time pie chart (via `recharts`)
- Per-child progress filtering

### Phase 4 — AI experiences 🔓
- `/classmap/tutor/[taskId]` — full-screen chat per task; Socratic in live, canned in demo
- `/classmap/coach` — parent-facing chat with family + stats + state-requirement context
- Shared chat primitives in `components/classmap/chat/{ChatThread,ChatComposer,ChatBubble}`
- API routes already exist at `/classmap/api/tutor` and `/classmap/api/coach`

### Phase 5 — portfolio + market 🔓
- `/classmap/portfolio` — drag-and-drop uploads (data URLs ≤1 MB) + list with date filter
- "Generate report" — markdown compliance report from `lib/classmap/portfolio-claude.ts` (canned in demo from `canned-portfolio-report.ts`)
- `/classmap/market` — two tabs (Merchant Supplies / Work Upload)

### Phase 6 — connect + family polish 🔓
- `/classmap/connect` — co-ops tab + charter tab, each with 5/4 curated directories (data in `lib/classmap/connect-data.ts`) + a "Search Google Maps" link via `makeMapsSearchUrl(query)`
- Family page polish — quick links to Portfolio + Logout
- Mobile pass — touch targets, bottom-nav active states, swipe between Today/Week (stretch)

---

## Out of scope (deferred)

- **Real auth** (Supabase / Clerk + database). Phase 1 ships mock; real auth is a future addendum.
- **Real cloud file storage.** Phase 5 uses localStorage data URLs.
- **Live Google Maps with API key.** Phase 6 uses external links.
- **Real OTP delivery / Google OAuth.** Buttons are cosmetic.
- **Multi-device sync** / cross-device session.
- **Push notifications** / streak reminders.
- **Iron Circle / accountability groups** (this lives in Patriarch, not ClassMap).
- **ClassMap settings page** (theme toggle / data export).

---

## After ClassMap v2

Once ClassMap v2 is shipped end-to-end, the natural next moves are:
- Re-fetch the source doc to see if more apps are described (last fetch was truncated)
- Polish Pages so each app's deep link works reliably under the `/classmap` basePath (A-13)
- Add a real backend for ClassMap (auth + DB) if usage warrants it
