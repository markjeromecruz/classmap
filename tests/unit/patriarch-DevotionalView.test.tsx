import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DevotionalView } from "@/components/patriarch/DevotionalView";
import { DEVOTIONALS } from "@/lib/patriarch-demo-data";

describe("DevotionalView — every demo devotional renders all 6 slots", () => {
  it.each(DEVOTIONALS)("$id exposes all documented sub-slots", (d) => {
    render(<DevotionalView devotional={d} />);
    const root = document.querySelector(
      '[data-slot="devotional"]',
    ) as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("data-devotional-id")).toBe(d.id);

    for (const slot of [
      "devotional-theme",
      "devotional-reference",
      "devotional-scripture",
      "devotional-reflection",
      "devotional-prompt",
      "devotional-prayer",
    ]) {
      const el = root.querySelector(`[data-slot="${slot}"]`);
      expect(el, `missing slot ${slot} for ${d.id}`).not.toBeNull();
    }
  });
});

describe("DevotionalView — content placement", () => {
  const d = DEVOTIONALS[0];

  it("theme is in devotional-theme", () => {
    render(<DevotionalView devotional={d} />);
    expect(
      document.querySelector('[data-slot="devotional-theme"]')?.textContent,
    ).toBe(d.theme);
  });

  it("scriptureReference is the h1", () => {
    render(<DevotionalView devotional={d} />);
    expect(
      screen.getByRole("heading", { level: 1, name: d.scriptureReference }),
    ).toBeInTheDocument();
  });

  it("scriptureText is inside a blockquote at devotional-scripture", () => {
    render(<DevotionalView devotional={d} />);
    const bq = document.querySelector(
      '[data-slot="devotional-scripture"]',
    ) as HTMLElement;
    expect(bq.tagName.toLowerCase()).toBe("blockquote");
    expect(bq.textContent).toContain(d.scriptureText);
  });

  it("reflection slot contains the reflection text", () => {
    render(<DevotionalView devotional={d} />);
    expect(
      document.querySelector('[data-slot="devotional-reflection"]')?.textContent,
    ).toContain(d.reflection);
  });

  it("prompt slot contains the prompt text", () => {
    render(<DevotionalView devotional={d} />);
    expect(
      document.querySelector('[data-slot="devotional-prompt"]')?.textContent,
    ).toContain(d.prompt);
  });

  it("prayer slot contains the prayer text", () => {
    render(<DevotionalView devotional={d} />);
    expect(
      document.querySelector('[data-slot="devotional-prayer"]')?.textContent,
    ).toContain(d.prayer);
  });
});
