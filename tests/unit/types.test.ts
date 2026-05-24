import { describe, expect, it } from "vitest";
import {
  DAYS,
  LEARNING_STYLES,
  SUBJECTS,
  daySchema,
  lessonPlanInputSchema,
  lessonPlanSchema,
  sessionSchema,
} from "@/lib/types";

const validInput = {
  childName: "Ada",
  childAge: 9,
  learningStyle: "visual" as const,
  subjects: ["math", "reading"] as const,
  hoursPerWeek: 10,
  state: "CA",
  notes: "loves fractions",
};

const validSession = {
  subject: "math" as const,
  title: "Intro to fractions",
  description: "Use pizza slices to introduce numerator/denominator.",
  materials: ["paper", "marker"],
  minutes: 45,
};

const validDay = {
  day: "Mon" as const,
  sessions: [validSession],
};

const validPlan = {
  id: "plan_abc123",
  createdAt: "2026-05-23T18:00:00.000Z",
  input: validInput,
  summary: "A balanced first-grade week with daily math and reading.",
  days: DAYS.map((day) => ({ day, sessions: [validSession] })),
};

describe("lessonPlanInputSchema", () => {
  it("accepts a well-formed input", () => {
    const parsed = lessonPlanInputSchema.parse(validInput);
    expect(parsed.childAge).toBe(9);
  });

  it("rejects childAge below 3", () => {
    const r = lessonPlanInputSchema.safeParse({ ...validInput, childAge: 2 });
    expect(r.success).toBe(false);
  });

  it("rejects childAge above 18", () => {
    const r = lessonPlanInputSchema.safeParse({ ...validInput, childAge: 19 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer childAge", () => {
    const r = lessonPlanInputSchema.safeParse({ ...validInput, childAge: 9.5 });
    expect(r.success).toBe(false);
  });

  it("rejects empty subjects array", () => {
    const r = lessonPlanInputSchema.safeParse({ ...validInput, subjects: [] });
    expect(r.success).toBe(false);
  });

  it("rejects unknown subject", () => {
    const r = lessonPlanInputSchema.safeParse({
      ...validInput,
      subjects: ["math", "underwater-basket-weaving"],
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown learningStyle", () => {
    const r = lessonPlanInputSchema.safeParse({
      ...validInput,
      learningStyle: "telepathic",
    });
    expect(r.success).toBe(false);
  });

  it("rejects hoursPerWeek below 2", () => {
    const r = lessonPlanInputSchema.safeParse({ ...validInput, hoursPerWeek: 1 });
    expect(r.success).toBe(false);
  });

  it("rejects hoursPerWeek above 40", () => {
    const r = lessonPlanInputSchema.safeParse({ ...validInput, hoursPerWeek: 41 });
    expect(r.success).toBe(false);
  });

  it("trims and accepts optional childName", () => {
    const r = lessonPlanInputSchema.parse({ ...validInput, childName: "  Ada  " });
    expect(r.childName).toBe("Ada");
  });

  it("rejects empty trimmed childName", () => {
    const r = lessonPlanInputSchema.safeParse({ ...validInput, childName: "   " });
    expect(r.success).toBe(false);
  });

  it("rejects notes longer than 500 chars", () => {
    const r = lessonPlanInputSchema.safeParse({
      ...validInput,
      notes: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("allows omitting all optional fields", () => {
    const minimal = {
      childAge: 7,
      learningStyle: "kinesthetic" as const,
      subjects: ["art"] as const,
      hoursPerWeek: 5,
    };
    expect(() => lessonPlanInputSchema.parse(minimal)).not.toThrow();
  });
});

describe("sessionSchema", () => {
  it("accepts a well-formed session", () => {
    expect(() => sessionSchema.parse(validSession)).not.toThrow();
  });

  it("rejects minutes below 10", () => {
    const r = sessionSchema.safeParse({ ...validSession, minutes: 9 });
    expect(r.success).toBe(false);
  });

  it("rejects minutes above 180", () => {
    const r = sessionSchema.safeParse({ ...validSession, minutes: 181 });
    expect(r.success).toBe(false);
  });

  it("rejects more than 8 materials", () => {
    const r = sessionSchema.safeParse({
      ...validSession,
      materials: Array(9).fill("x"),
    });
    expect(r.success).toBe(false);
  });
});

describe("daySchema", () => {
  it("rejects empty sessions", () => {
    const r = daySchema.safeParse({ day: "Mon", sessions: [] });
    expect(r.success).toBe(false);
  });

  it("rejects more than 6 sessions", () => {
    const r = daySchema.safeParse({
      day: "Mon",
      sessions: Array(7).fill(validSession),
    });
    expect(r.success).toBe(false);
  });
});

describe("lessonPlanSchema", () => {
  it("requires exactly 5 days", () => {
    const tooFew = { ...validPlan, days: validPlan.days.slice(0, 4) };
    const tooMany = {
      ...validPlan,
      days: [...validPlan.days, { day: "Mon" as const, sessions: [validSession] }],
    };
    expect(lessonPlanSchema.safeParse(tooFew).success).toBe(false);
    expect(lessonPlanSchema.safeParse(tooMany).success).toBe(false);
  });

  it("accepts the canonical 5-day plan", () => {
    expect(() => lessonPlanSchema.parse(validPlan)).not.toThrow();
  });

  it("rejects non-ISO createdAt", () => {
    const r = lessonPlanSchema.safeParse({ ...validPlan, createdAt: "yesterday" });
    expect(r.success).toBe(false);
  });
});

describe("enum constants", () => {
  it("LEARNING_STYLES has the four canonical values", () => {
    expect([...LEARNING_STYLES].sort()).toEqual(
      ["auditory", "kinesthetic", "reading-writing", "visual"].sort(),
    );
  });

  it("DAYS is Mon..Fri in order", () => {
    expect([...DAYS]).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  });

  it("SUBJECTS includes the core academic subjects", () => {
    for (const s of ["math", "reading", "writing", "science"]) {
      expect(SUBJECTS).toContain(s);
    }
  });
});
