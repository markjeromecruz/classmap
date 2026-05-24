import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  SAVED_PLANS_KEY,
  deletePlan,
  isPlanSaved,
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

function makePlan(id: string, childAge = 9): LessonPlan {
  return {
    id,
    createdAt: new Date().toISOString(),
    input: {
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

describe("lib/storage — empty state", () => {
  it("listSavedPlans returns [] when localStorage is empty", () => {
    expect(listSavedPlans()).toEqual([]);
  });

  it("isPlanSaved returns false for any id when empty", () => {
    expect(isPlanSaved("anything")).toBe(false);
  });
});

describe("lib/storage — round-trip", () => {
  it("savePlan persists and listSavedPlans reads back", () => {
    const a = makePlan("a");
    savePlan(a);
    const list = listSavedPlans();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("a");
    expect(isPlanSaved("a")).toBe(true);
  });

  it("savePlan puts new entries at the head (newest first)", () => {
    const a = makePlan("a");
    const b = makePlan("b");
    const c = makePlan("c");
    savePlan(a);
    savePlan(b);
    savePlan(c);
    expect(listSavedPlans().map((p) => p.id)).toEqual(["c", "b", "a"]);
  });

  it("savePlan replaces an entry with the same id (in-place by id, moved to head)", () => {
    const original = makePlan("a", 7);
    const updated = makePlan("a", 11);
    savePlan(original);
    savePlan(makePlan("b"));
    savePlan(updated);
    const list = listSavedPlans();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("a");
    expect(list[0].input.childAge).toBe(11);
    expect(list[1].id).toBe("b");
  });

  it("deletePlan removes the matching id and leaves the rest", () => {
    savePlan(makePlan("a"));
    savePlan(makePlan("b"));
    savePlan(makePlan("c"));
    deletePlan("b");
    expect(listSavedPlans().map((p) => p.id)).toEqual(["c", "a"]);
    expect(isPlanSaved("b")).toBe(false);
  });

  it("deletePlan on a missing id is a no-op", () => {
    savePlan(makePlan("a"));
    deletePlan("nope");
    expect(listSavedPlans().map((p) => p.id)).toEqual(["a"]);
  });

  it("uses the documented storage key", () => {
    savePlan(makePlan("a"));
    const raw = window.localStorage.getItem(SAVED_PLANS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe("a");
  });
});

describe("lib/storage — corruption resilience", () => {
  it("listSavedPlans returns [] when value is not valid JSON", () => {
    window.localStorage.setItem(SAVED_PLANS_KEY, "{not json");
    expect(listSavedPlans()).toEqual([]);
  });

  it("listSavedPlans returns [] when value is JSON but not an array", () => {
    window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify({ foo: "bar" }));
    expect(listSavedPlans()).toEqual([]);
  });

  it("listSavedPlans silently drops entries that don't match the schema", () => {
    const good = makePlan("good");
    const bad = { id: "bad", days: [] };
    window.localStorage.setItem(
      SAVED_PLANS_KEY,
      JSON.stringify([bad, good, "not even an object"]),
    );
    const list = listSavedPlans();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("good");
  });
});
