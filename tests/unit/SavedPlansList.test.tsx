import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SavedPlansList } from "@/components/classmap/SavedPlansList";
import {
  SAVED_PLANS_KEY,
  listSavedPlans,
  savePlan,
} from "@/lib/storage";
import type { LessonPlan, Session } from "@/lib/types";

function session(subject: Session["subject"], title: string): Session {
  return {
    subject,
    title,
    description: `${title} (desc)`,
    materials: ["paper"],
    minutes: 30,
  };
}

function makePlan(id: string, childName?: string, childAge = 9): LessonPlan {
  return {
    id,
    createdAt: "2026-05-23T18:00:00.000Z",
    input: {
      ...(childName ? { childName } : {}),
      childAge,
      learningStyle: "visual",
      subjects: ["math", "reading"],
      hoursPerWeek: 10,
    },
    summary: "A simple visual week.",
    days: [
      { day: "Mon", sessions: [session("math", "Counting")] },
      { day: "Tue", sessions: [session("reading", "Story")] },
      { day: "Wed", sessions: [session("math", "Shapes")] },
      { day: "Thu", sessions: [session("reading", "Re-read")] },
      { day: "Fri", sessions: [session("math", "Review")] },
    ],
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("SavedPlansList — empty state", () => {
  it("renders the empty placeholder after hydration when storage is empty", async () => {
    render(<SavedPlansList />);
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="saved-plans-empty"]'),
      ).not.toBeNull();
    });
    expect(document.querySelector('[data-slot="saved-plans-list"]')).toBeNull();
  });
});

describe("SavedPlansList — populated", () => {
  it("renders one saved-plan article per stored plan and exposes data-count", async () => {
    savePlan(makePlan("a", "Ada"));
    savePlan(makePlan("b", "Theo"));
    render(<SavedPlansList />);
    await waitFor(() => {
      expect(document.querySelector('[data-slot="saved-plans-list"]')).not.toBeNull();
    });
    const list = document.querySelector('[data-slot="saved-plans-list"]') as HTMLElement;
    expect(list.getAttribute("data-count")).toBe("2");
    const items = list.querySelectorAll('[data-slot="saved-plan"]');
    expect(items).toHaveLength(2);
    expect(
      Array.from(items).map((el) => el.getAttribute("data-plan-id")),
    ).toEqual(["b", "a"]); // newest first
  });

  it("renders the child name + age in the header when childName is set", async () => {
    savePlan(makePlan("a", "Ada", 7));
    render(<SavedPlansList />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ada's week/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/age 7/i)).toBeInTheDocument();
  });

  it("falls back to 'Saved plan' header when childName is missing", async () => {
    savePlan(makePlan("a", undefined, 12));
    render(<SavedPlansList />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /saved plan/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/age 12/i)).toBeInTheDocument();
  });

  it("delete removes a plan from the DOM AND from localStorage", async () => {
    savePlan(makePlan("a", "Ada"));
    savePlan(makePlan("b", "Theo"));
    const user = userEvent.setup();
    render(<SavedPlansList />);
    await waitFor(() => {
      expect(
        document.querySelectorAll('[data-slot="saved-plan"]'),
      ).toHaveLength(2);
    });

    const adaCard = document.querySelector('[data-plan-id="a"]') as HTMLElement;
    const deleteBtn = adaCard.querySelector(
      '[data-testid="saved-plan-delete"]',
    ) as HTMLElement;
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(document.querySelectorAll('[data-slot="saved-plan"]')).toHaveLength(1);
    });
    expect(document.querySelector('[data-plan-id="a"]')).toBeNull();
    expect(listSavedPlans().map((p) => p.id)).toEqual(["b"]);
  });
});

describe("SavedPlansList — corruption resilience", () => {
  it("silently drops corrupt entries (renders only the valid ones)", async () => {
    const good = makePlan("good", "Ada");
    window.localStorage.setItem(
      SAVED_PLANS_KEY,
      JSON.stringify([{ id: "bad", days: [] }, good]),
    );
    render(<SavedPlansList />);
    await waitFor(() => {
      expect(document.querySelector('[data-slot="saved-plans-list"]')).not.toBeNull();
    });
    const items = document.querySelectorAll('[data-slot="saved-plan"]');
    expect(items).toHaveLength(1);
    expect(items[0].getAttribute("data-plan-id")).toBe("good");
  });
});
