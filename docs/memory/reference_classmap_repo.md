---
name: reference-classmap-repo
description: "External URLs for the dom/ workspace — GitHub repo, Pages demo, source doc"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 929f5eed-c205-482b-b263-c5d85221a34c
---

- **GitHub repo:** https://github.com/markjeromecruz/classmap (public; named "classmap" historically, hosts all three apps).
- **Pages demo (static):** https://markjeromecruz.github.io/classmap/ — Auto-deploys via `.github/workflows/deploy-pages.yml` on every push to `main`. Builds with `NEXT_PUBLIC_DEMO_MODE=true` and `NEXT_PUBLIC_BASE_PATH=/classmap`. Strips all `app/<app>/api/` folders before build (POST handlers can't be static-exported).
- **Source of truth doc (Google Drive):** file ID `1nlHJ6X7PkTAcB3_JR_6ZSZeLqjCt98xQ_-WH2Htox9c` — fetch with `mcp__claude_ai_Google_Drive__read_file_content`. The doc is truncated when fetched; only three apps (ClassMap, KindleMinds, Patriarch) visible.
- **`gh` CLI:** authenticated as `markjeromecruz` with `repo`, `workflow`, `gist`, `read:org` scopes — can create repos, push, manage Pages, view workflow runs/logs.
- **`claude` CLI:** at `/Users/markjeromecruz/.local/bin/claude` — used by `lib/claude.ts` (ClassMap) and `lib/patriarch-claude.ts` for headless AI generation. Spawned with `-p`, `--append-system-prompt`, `--output-format text`. **No `ANTHROPIC_API_KEY` needed** — this is intentional, [[feedback-headless-claude]].
