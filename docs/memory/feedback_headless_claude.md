---
name: feedback-headless-claude
description: "Use the `claude` CLI (headless) for AI calls in this project, never the Anthropic API SDK"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 929f5eed-c205-482b-b263-c5d85221a34c
---

For AI generation in the `dom/` project, **always shell out to the `claude` CLI** via Node's `child_process.spawn`, not the Anthropic Messages API SDK.

**Why:** Mark Jerome explicitly chose this to avoid accruing Anthropic API usage charges — calls route through his existing Claude Code subscription. He said so when setting up the project.

**How to apply:**
- When adding AI features, model after `lib/claude.ts` (ClassMap lesson plans) and `lib/patriarch-claude.ts` (devotionals). Pattern: spawn `claude` with `-p <prompt>`, `--append-system-prompt <system>`, `--output-format text`.
- Do **not** install `@anthropic-ai/sdk` or `@anthropic-ai/claude-code` for SDK use. The `claude-code` npm package only ships a CLI binary, not an importable JS SDK — verified 2026-05-23, version 2.1.150.
- Parse the CLI's stdout, extract JSON (handle bare JSON, ```json fenced, and outer `{...}` fallback), then Zod-validate against the expected output schema.
- API routes that use these wrappers must be `dynamic = "force-dynamic"`. They are stripped from the Pages static-export build via the deploy workflow.
