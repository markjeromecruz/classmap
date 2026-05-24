import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";

import { PlanBoardSkeleton } from "@/components/classmap/PlanBoardSkeleton";
import { DAYS } from "@/lib/types";

describe("PlanBoardSkeleton", () => {
  it("exposes the documented data-slot and a11y attributes", () => {
    render(<PlanBoardSkeleton />);
    const root = document.querySelector(
      '[data-slot="plan-board-skeleton"]',
    ) as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-busy")).toBe("true");
    expect(root.getAttribute("aria-live")).toBe("polite");
    expect(root.getAttribute("aria-label")).toMatch(/generating lesson plan/i);
  });

  it("renders 5 day-skeleton columns in Mon..Fri order", () => {
    render(<PlanBoardSkeleton />);
    const cols = document.querySelectorAll('[data-slot="plan-day-skeleton"]');
    expect(cols).toHaveLength(5);
    const headings = Array.from(cols).map(
      (col) => (col.querySelector("h3") as HTMLElement).textContent,
    );
    expect(headings).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]);
  });

  it("defaults to 3 placeholder session cards per day (15 total)", () => {
    render(<PlanBoardSkeleton />);
    // Each per-day `<li>` is one card placeholder
    const items = document.querySelectorAll(
      '[data-slot="plan-day-skeleton"] li',
    );
    expect(items).toHaveLength(DAYS.length * 3);
  });

  it("respects custom sessionsPerDay", () => {
    render(<PlanBoardSkeleton sessionsPerDay={1} />);
    const items = document.querySelectorAll(
      '[data-slot="plan-day-skeleton"] li',
    );
    expect(items).toHaveLength(DAYS.length * 1);
  });

  it("renders pulsing skeleton bars (animate-pulse class via shadcn Skeleton)", () => {
    render(<PlanBoardSkeleton />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
    skeletons.forEach((s) => {
      expect(s.className).toMatch(/animate-pulse/);
    });
  });

  it("each day column has its own header skeleton inside it", () => {
    render(<PlanBoardSkeleton />);
    const cols = document.querySelectorAll('[data-slot="plan-day-skeleton"]');
    for (const col of Array.from(cols)) {
      const header = col.querySelector("header") as HTMLElement;
      expect(within(header).getByRole("heading", { level: 3 })).toBeInTheDocument();
    }
  });
});
