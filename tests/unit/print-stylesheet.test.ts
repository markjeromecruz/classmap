import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// jsdom doesn't actually evaluate @media print, so we pin the contract at the
// CSS source level. This catches "someone deleted the print block" and
// regressions in the documented selectors. The companion Playwright spec
// (tests/e2e/print.spec.ts) verifies actual browser behavior under
// page.emulateMedia({ media: 'print' }).

const css = readFileSync(
  resolve(process.cwd(), "app/globals.css"),
  "utf8",
);

function extractMediaPrintBlock(source: string): string {
  const idx = source.indexOf("@media print");
  if (idx === -1) throw new Error("@media print block not found");
  // Find matching closing brace by counting depth from the first `{` after idx.
  const openIdx = source.indexOf("{", idx);
  let depth = 0;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(openIdx + 1, i);
    }
  }
  throw new Error("@media print block is unterminated");
}

const block = extractMediaPrintBlock(css);

describe("@media print — chrome we hide", () => {
  it.each([
    '[data-slot="classmap-flow-form"]',
    '[data-slot="classmap-flow-error"]',
    '[data-testid="classmap-flow-save"]',
    '[data-testid="saved-plan-delete"]',
    '[data-testid="classmap-form-submit"]',
  ])("hides %s", (selector) => {
    expect(block).toContain(selector);
  });

  it("uses display: none for the hidden chrome rule", () => {
    // Find the rule that lists the hidden-chrome selectors and check its body
    const hideRule = /classmap-flow-form[^{}]*\{[^}]*display:\s*none/i;
    expect(block).toMatch(hideRule);
  });
});

describe("@media print — plan layout", () => {
  it("stacks the day grid vertically (display: block)", () => {
    expect(block).toMatch(/plan-board-grid[^{}]*\{[^}]*display:\s*block/i);
  });

  it("adds page-break / break-inside avoid on plan-day and plan-card", () => {
    expect(block).toMatch(/plan-day[^{}]*\{[^}]*page-break-inside:\s*avoid/i);
    expect(block).toMatch(/plan-day[^{}]*\{[^}]*break-inside:\s*avoid/i);
    expect(block).toMatch(/plan-card[^{}]*\{[^}]*page-break-inside:\s*avoid/i);
    expect(block).toMatch(/plan-card[^{}]*\{[^}]*break-inside:\s*avoid/i);
  });

  it("drops fills and shadows on plan-card", () => {
    expect(block).toMatch(/plan-card[^{}]*\{[^}]*background:\s*transparent/i);
    expect(block).toMatch(/plan-card[^{}]*\{[^}]*box-shadow:\s*none/i);
  });

  it("outlines (not fills) badges inside plan cards and materials", () => {
    expect(block).toMatch(/plan-card.*badge[^{}]*\{[^}]*background:\s*transparent/is);
    expect(block).toMatch(/plan-card.*badge[^{}]*\{[^}]*border:\s*1px\s+solid/is);
  });

  it("avoids orphaned headings via page-break-after on h1..h4", () => {
    expect(block).toMatch(/h1[^{}]*,\s*h2[^{}]*,\s*h3[^{}]*,\s*h4[^{}]*\{[^}]*page-break-after:\s*avoid/i);
  });
});

describe("@media print — color reset", () => {
  it("resets body to black on white for ink-friendly output", () => {
    expect(block).toMatch(/body[^{}]*\{[^}]*background:\s*white/i);
    expect(block).toMatch(/body[^{}]*\{[^}]*color:\s*black/i);
  });
});
