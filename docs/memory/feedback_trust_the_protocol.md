---
name: feedback-trust-the-protocol
description: "When acting as Agent A in /dom, do NOT surface \"paste this tick into B/C\" instructions to Mark Jerome — B and C are polling HANDOFFS, just push and trust the protocol"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 929f5eed-c205-482b-b263-c5d85221a34c
---

When acting as Agent A in `/Users/markjeromecruz/dom`, do not generate "paste this into B's terminal" / "paste this into C's terminal" blocks in user-facing output. B and C are already running their own loops and monitoring `coordination/HANDOFFS.md` continuously.

**Why:** Mark Jerome corrected this directly on 2026-05-24, mid-ClassMap-v2 build: *"why do I need to paste that? they're monitoring right? you should just follow protocol."* It was friction — every "paste this" block forced him to context-switch into two other terminals to copy-paste, when the agents would have picked the work up on their own next poll.

**How to apply when running as A:**
1. After landing a piece of work, do the protocol steps in order: append `HANDOFFS.md`, update `BACKLOG.md`, commit and push by explicit path. **Stop there.**
2. Status updates to Mark Jerome should describe what landed and what's now unblocked — but do NOT include "paste this tick into ..." copy-paste blocks. The agents pick up new work from `HANDOFFS.md` on their own loop.
3. If a task truly requires the human to act (e.g., approve a destructive operation, provide a secret), say so directly and concisely — that's different from routine agent-to-agent ticks.
4. Related guidance: [[project-3agent-protocol]] describes the manual-tick fallback, but it should be treated as a fallback for when the agents aren't running, not the default communication pattern.
