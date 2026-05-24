import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import PatriarchLandingPage from "@/app/patriarch/page";
import {
  FAMILY_ALTARS,
  getTodayDevotional,
} from "@/lib/patriarch-demo-data";

// Pin the clock so date-derived text is deterministic.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-23T18:00:00.000Z")); // Saturday
});
afterEach(() => {
  vi.useRealTimers();
});

describe("Patriarch landing page", () => {
  it("exposes the documented data-slot on <main>", () => {
    render(<PatriarchLandingPage />);
    expect(
      document.querySelector('[data-slot="patriarch-landing"]'),
    ).not.toBeNull();
  });

  it("renders the masthead h1 + dek + back link", () => {
    render(<PatriarchLandingPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /patriarch/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/quiet daily reading/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to portfolio/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("patriarch-day slot shows the day-of-week + long date for the system clock", () => {
    render(<PatriarchLandingPage />);
    const day = document.querySelector(
      '[data-slot="patriarch-day"]',
    ) as HTMLElement;
    expect(day).not.toBeNull();
    // Pinned to Saturday May 23 2026 (UTC) — local rendering should still
    // surface "Saturday" and the date components in some order.
    expect(day.textContent).toMatch(/Saturday/);
    expect(day.textContent).toMatch(/May/);
    expect(day.textContent).toMatch(/2026/);
  });

  it("today card renders the devotional theme and scripture reference", () => {
    render(<PatriarchLandingPage />);
    const card = document.querySelector(
      '[data-slot="patriarch-today-card"]',
    ) as HTMLElement;
    expect(card).not.toBeNull();
    const today = getTodayDevotional();
    expect(card.textContent).toContain(today.theme);
    const ref = document.querySelector(
      '[data-slot="patriarch-today-reference"]',
    ) as HTMLElement;
    expect(ref?.textContent).toContain(today.scriptureReference);
  });

  it("today card renders the theme as an h2 heading", () => {
    render(<PatriarchLandingPage />);
    const today = getTodayDevotional();
    expect(
      screen.getByRole("heading", { level: 2, name: today.theme }),
    ).toBeInTheDocument();
  });

  it("renders both CTA links with documented slots and targets", () => {
    render(<PatriarchLandingPage />);
    const todayLink = document.querySelector(
      '[data-slot="patriarch-today-link"]',
    ) as HTMLAnchorElement;
    const altarLink = document.querySelector(
      '[data-slot="patriarch-altar-link"]',
    ) as HTMLAnchorElement;
    expect(todayLink?.getAttribute("href")).toBe("/patriarch/today");
    expect(altarLink?.getAttribute("href")).toBe("/patriarch/altar");
  });

  it("footer shows the altar plan count", () => {
    render(<PatriarchLandingPage />);
    const expected = new RegExp(`${FAMILY_ALTARS.length}\\s+altar plans`, "i");
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("renders the 'Today's reading' kicker", () => {
    render(<PatriarchLandingPage />);
    expect(screen.getByText(/today.?s reading/i)).toBeInTheDocument();
  });
});
