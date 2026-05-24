import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PLANS, getDemoPlan } from "@/lib/demo-data";
import { lessonPlanSchema, type LessonPlanInput } from "@/lib/types";

const baseInput: LessonPlanInput = {
  childAge: 8,
  learningStyle: "visual",
  subjects: ["math", "reading"],
  hoursPerWeek: 10,
};

describe("DEMO_PLANS — schema conformance", () => {
  it.each(Object.entries(DEMO_PLANS) as Array<[keyof typeof DEMO_PLANS, (typeof DEMO_PLANS)[keyof typeof DEMO_PLANS]]>)(
    "%s parses cleanly against lessonPlanSchema",
    (_name, plan) => {
      const r = lessonPlanSchema.safeParse(plan);
      if (!r.success) {
        // Print the first issue path so failures are debuggable
        throw new Error(
          `${_name} failed: ${r.error.issues
            .slice(0, 3)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(" | ")}`,
        );
      }
      expect(r.success).toBe(true);
    },
  );

  it("each demo plan has exactly 5 weekdays in order Mon..Fri", () => {
    const expected = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    for (const plan of Object.values(DEMO_PLANS)) {
      expect(plan.days.map((d) => d.day)).toEqual(expected);
    }
  });

  it("each session uses only declared SUBJECTS and minutes within 10..180", () => {
    for (const plan of Object.values(DEMO_PLANS)) {
      for (const day of plan.days) {
        for (const s of day.sessions) {
          expect(s.minutes).toBeGreaterThanOrEqual(10);
          expect(s.minutes).toBeLessThanOrEqual(180);
          expect(plan.input.subjects).toContain(s.subject);
        }
      }
    }
  });
});

describe("getDemoPlan — age band dispatch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("age ≤ 8 → EARLY", () => {
    for (const age of [3, 5, 7, 8]) {
      const plan = getDemoPlan({ ...baseInput, childAge: age });
      expect(plan.summary).toBe(DEMO_PLANS.EARLY.summary);
      expect(plan.days).toEqual(DEMO_PLANS.EARLY.days);
    }
  });

  it("age 9..12 → UPPER", () => {
    for (const age of [9, 10, 11, 12]) {
      const plan = getDemoPlan({ ...baseInput, childAge: age });
      expect(plan.summary).toBe(DEMO_PLANS.UPPER.summary);
      expect(plan.days).toEqual(DEMO_PLANS.UPPER.days);
    }
  });

  it("age ≥ 13 → TEEN", () => {
    for (const age of [13, 16, 18]) {
      const plan = getDemoPlan({ ...baseInput, childAge: age });
      expect(plan.summary).toBe(DEMO_PLANS.TEEN.summary);
      expect(plan.days).toEqual(DEMO_PLANS.TEEN.days);
    }
  });

  it("echoes the caller's input regardless of band", () => {
    const input: LessonPlanInput = {
      childName: "Ada",
      childAge: 10,
      learningStyle: "auditory",
      subjects: ["music", "math"],
      hoursPerWeek: 7,
      state: "OR",
      notes: "loves percussion",
    };
    const plan = getDemoPlan(input);
    expect(plan.input).toEqual(input);
  });

  it("generates a unique id and current ISO createdAt per call", () => {
    const a = getDemoPlan({ ...baseInput, childAge: 6 });
    expect(a.id).toMatch(/^demo-6-\d+$/);
    expect(a.createdAt).toBe("2026-01-15T12:00:00.000Z");

    // Advance time so Date.now() differs
    vi.setSystemTime(new Date("2026-01-15T12:00:05.000Z"));
    const b = getDemoPlan({ ...baseInput, childAge: 6 });
    expect(b.id).not.toBe(a.id);
    expect(b.createdAt).toBe("2026-01-15T12:00:05.000Z");
  });

  it("output of getDemoPlan parses against lessonPlanSchema", () => {
    for (const age of [4, 9, 14]) {
      const plan = getDemoPlan({ ...baseInput, childAge: age });
      const r = lessonPlanSchema.safeParse(plan);
      expect(r.success).toBe(true);
    }
  });
});
