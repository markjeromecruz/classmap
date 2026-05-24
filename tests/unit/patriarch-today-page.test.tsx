import { describe, expect, it, vi } from "vitest";

// We test the page's two branches by mocking `@/lib/env` and re-importing
// the module in each test (the page reads isDemoMode at module load).

describe("PatriarchTodayPage — demo mode dispatch", () => {
  it("renders <DevotionalView> with today's devotional when isDemoMode = true", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isDemoMode: true, SITE_BASE_PATH: "" }));
    const { default: Page } = await import("@/app/patriarch/today/page");
    const { render } = await import("@testing-library/react");

    render(<Page />);
    const main = document.querySelector(
      '[data-slot="patriarch-today"]',
    ) as HTMLElement;
    expect(main.getAttribute("data-mode")).toBe("demo");
    expect(document.querySelector('[data-slot="devotional"]')).not.toBeNull();
    expect(
      document.querySelector('[data-slot="devotional-loading"]'),
    ).toBeNull();
    vi.doUnmock("@/lib/env");
  });
});

describe("PatriarchTodayPage — live mode dispatch", () => {
  it("renders <LiveDevotional> (starts in loading) when isDemoMode = false", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isDemoMode: false, SITE_BASE_PATH: "" }));
    // Keep fetch pending so LiveDevotional stays in its loading branch.
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    const { default: Page } = await import("@/app/patriarch/today/page");
    const { render } = await import("@testing-library/react");

    render(<Page />);
    const main = document.querySelector(
      '[data-slot="patriarch-today"]',
    ) as HTMLElement;
    expect(main.getAttribute("data-mode")).toBe("live");
    expect(
      document.querySelector('[data-slot="devotional-loading"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-slot="devotional"]')).toBeNull();
    vi.doUnmock("@/lib/env");
    vi.unstubAllGlobals();
  });
});

describe("PatriarchTodayPage — shared chrome", () => {
  it("renders the back link and the date kicker regardless of mode", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({ isDemoMode: true, SITE_BASE_PATH: "" }));
    const { default: Page } = await import("@/app/patriarch/today/page");
    const { render, screen } = await import("@testing-library/react");

    render(<Page />);
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/patriarch",
    );
    expect(
      document.querySelector('[data-slot="patriarch-today-date"]'),
    ).not.toBeNull();
    vi.doUnmock("@/lib/env");
  });
});
