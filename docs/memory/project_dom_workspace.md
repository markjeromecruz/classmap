---
name: project-dom-workspace
description: "Structure, roadmap, and conventions for the /Users/markjeromecruz/dom multi-app portfolio"
metadata: 
  node_type: memory
  type: project
  originSessionId: 929f5eed-c205-482b-b263-c5d85221a34c
---

`/Users/markjeromecruz/dom` is Mark Jerome's multi-app AI portfolio. Single Next.js 16 app, route groups per product, deployed to GitHub Pages as a static demo and run locally for the live AI version.

**Roadmap** (in order):
1. **ClassMap** (`/classmap/*`) — AI homeschool lesson planner. MVP DONE as of 2026-05-23.
2. **KindleMinds** (`/kindleminds/*`) — static homeschool community hub (5 curriculum rooms + sample threads, no backend).
3. **Patriarch** (`/patriarch/*`) — faith-based family-leadership app for Christian husbands and fathers (daily devotional, family altar plans, legacy journal).

**Why:** Source-of-truth doc is a Google Doc the user shared (1nlHJ6X7PkTAcB3_JR_6ZSZeLqjCt98xQ_-WH2Htox9c). The doc is partially truncated when fetched via Drive MCP; the three apps above are all that's visible.

**How to apply:** Default to the next app in the roadmap when scope is open-ended. New apps go in `app/<app>/`, types in `lib/<app>-types.ts`, demo data in `lib/<app>-demo-data.ts`. See [[reference-classmap-repo]] for URLs and [[feedback-classmap-conventions]] for code conventions.
