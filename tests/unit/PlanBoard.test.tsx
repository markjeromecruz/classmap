import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { PlanBoard } from "@/components/classmap/PlanBoard";
import { PlanCard } from "@/components/classmap/PlanCard";
import { DAYS, type LessonPlan, type Session } from "@/lib/types";

const session = (
  subject: Session["subject"],
  title: string,
  minutes = 30,
  materials: string[] = ["paper"],
): Session => ({
  subject,
  title,
  description: `${title} (description)`,
  materials,
  minutes,
});

const fullPlan: LessonPlan = {
  id: "test-plan",
  createdAt: "2026-05-23T18:00:00.000Z",
  input: {
    childAge: 9,
    learningStyle: "visual",
    subjects: ["math", "reading", "writing", "science", "art"],
    hoursPerWeek: 10,
  },
  summary: "A focused week of math + reading practice.",
  days: [
    { day: "Mon", sessions: [session("math", "Counting", 20)] },
    { day: "Tue", sessions: [session("reading", "Story time", 25), session("writing", "Letters", 15)] },
    { day: "Wed", sessions: [session("science", "Plants", 30)] },
    { day: "Thu", sessions: [session("math", "Shapes", 45), session("art", "Collage", 30, [])] },
    { day: "Fri", sessions: [session("reading", "Re-read")] },
  ],
};

describe("PlanBoard", () => {
  it("renders 5 day columns in Mon..Fri order", () => {
    render(<PlanBoard plan={fullPlan} />);
    const days = document.querySelectorAll('[data-slot="plan-day"]');
    expect(days).toHaveLength(5);
    expect(Array.from(days).map((el) => el.getAttribute("data-day"))).toEqual([
      ...DAYS,
    ]);
  });

  it("renders the plan summary above the grid", () => {
    render(<PlanBoard plan={fullPlan} />);
    const summary = document.querySelector('[data-slot="plan-summary"]');
    expect(summary).not.toBeNull();
    expect(summary).toHaveTextContent(/focused week/i);
  });

  it("omits the summary node when plan.summary is empty", () => {
    // schema requires summary.min(1), so use a single space to simulate `undefined`-ish content.
    // The component renders summary if truthy; we test the falsy branch via direct override.
    const plan = { ...fullPlan, summary: "" } as unknown as LessonPlan;
    render(<PlanBoard plan={plan} />);
    expect(document.querySelector('[data-slot="plan-summary"]')).toBeNull();
  });

  it("each day shows its session count and pluralizes", () => {
    render(<PlanBoard plan={fullPlan} />);
    const mon = document.querySelector('[data-day="Mon"]') as HTMLElement;
    const tue = document.querySelector('[data-day="Tue"]') as HTMLElement;
    expect(within(mon).getByText("1 session")).toBeInTheDocument();
    expect(within(tue).getByText("2 sessions")).toBeInTheDocument();
  });

  it("renders day labels (Monday..Friday)", () => {
    render(<PlanBoard plan={fullPlan} />);
    for (const label of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]) {
      expect(screen.getByRole("heading", { level: 3, name: label })).toBeInTheDocument();
    }
  });

  it("renders the right number of PlanCards per day with matching subjects", () => {
    render(<PlanBoard plan={fullPlan} />);
    for (const day of fullPlan.days) {
      const col = document.querySelector(`[data-day="${day.day}"]`) as HTMLElement;
      const cards = col.querySelectorAll('[data-slot="plan-card"]');
      expect(cards).toHaveLength(day.sessions.length);
      expect(Array.from(cards).map((c) => c.getAttribute("data-subject"))).toEqual(
        day.sessions.map((s) => s.subject),
      );
    }
  });

  it("falls back to an empty session list if a day is missing from plan.days", () => {
    const partial: LessonPlan = {
      ...fullPlan,
      days: [{ day: "Mon", sessions: [session("math", "Only Monday")] }],
    } as unknown as LessonPlan;
    render(<PlanBoard plan={partial} />);
    // All 5 columns still render even though the plan only provides Mon
    const days = document.querySelectorAll('[data-slot="plan-day"]');
    expect(days).toHaveLength(5);
    const fri = document.querySelector('[data-day="Fri"]') as HTMLElement;
    expect(within(fri).getByText("0 sessions")).toBeInTheDocument();
    expect(fri.querySelectorAll('[data-slot="plan-card"]')).toHaveLength(0);
  });

  it("exposes the plan id on the root data-plan-id", () => {
    render(<PlanBoard plan={fullPlan} />);
    const root = document.querySelector('[data-slot="plan-board"]');
    expect(root?.getAttribute("data-plan-id")).toBe("test-plan");
  });

  it("root has an aria-label for the weekly plan", () => {
    render(<PlanBoard plan={fullPlan} />);
    expect(screen.getByRole("region", { name: /weekly lesson plan/i })).toBeInTheDocument();
  });
});

describe("PlanCard", () => {
  it("renders subject badge, title, description and minutes", () => {
    render(<PlanCard session={session("math", "Fractions", 45)} />);
    const card = document.querySelector('[data-slot="plan-card"]') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.getAttribute("data-subject")).toBe("math");
    expect(within(card).getByText("Math")).toBeInTheDocument();
    expect(within(card).getByText("Fractions")).toBeInTheDocument();
    expect(within(card).getByText(/description/i)).toBeInTheDocument();
    expect(within(card).getByText("45 min")).toBeInTheDocument();
  });

  it("formats minutes >= 60 as hours+minutes", () => {
    render(<PlanCard session={session("reading", "Long read", 60)} />);
    expect(screen.getByText("1h")).toBeInTheDocument();
  });

  it("formats minutes with hour+min remainder", () => {
    render(<PlanCard session={session("history", "Lecture", 90)} />);
    expect(screen.getByText("1h 30m")).toBeInTheDocument();
  });

  it("renders materials as badge chips inside a labelled list", () => {
    render(
      <PlanCard
        session={session("science", "Lab", 30, ["beaker", "water", "salt"])}
      />,
    );
    const list = screen.getByRole("list", { name: /materials/i });
    const items = within(list).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["beaker", "water", "salt"]);
  });

  it("omits the materials list when materials is empty", () => {
    render(<PlanCard session={session("art", "Free draw", 20, [])} />);
    expect(screen.queryByRole("list", { name: /materials/i })).toBeNull();
  });

  it("applies the subject accent class on the card root", () => {
    render(<PlanCard session={session("science", "Lab", 30)} />);
    const card = document.querySelector('[data-slot="plan-card"]') as HTMLElement;
    expect(card.className).toMatch(/border-l-emerald-500/);
  });

  it("uses PE label for physical-education subject", () => {
    render(<PlanCard session={session("physical-education", "Run", 20)} />);
    expect(screen.getByText("PE")).toBeInTheDocument();
  });

  it("uses Language label for foreign-language subject", () => {
    render(<PlanCard session={session("foreign-language", "Vocab", 20)} />);
    expect(screen.getByText("Language")).toBeInTheDocument();
  });
});
