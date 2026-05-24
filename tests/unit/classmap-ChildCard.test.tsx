import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";

import { ChildCard } from "@/components/classmap/family/ChildCard";
import { getStateRequirement } from "@/lib/classmap/state-requirements";
import {
  ageBandFor,
  avatarColorFor,
  type Child,
} from "@/lib/classmap/types";

// ---------------------------------------------------------------------------
// Fixture helper — composes a valid Child via the canonical helpers from
// lib/classmap/types so we don't drift from the zod schema. Tests override
// the fields they care about and leave the rest at sensible defaults.
// ---------------------------------------------------------------------------
function makeChild(overrides: Partial<Child> = {}): Child {
  const id = overrides.id ?? "child-1";
  return {
    id,
    name: "Ada",
    age: 9,
    grade: "4",
    state: "CA",
    learningStyle: "visual",
    curriculumApproach: "eclectic",
    prioritySubjects: ["math"],
    avatarColor: avatarColorFor(id),
    ageBand: ageBandFor(9),
    xpTotal: 0,
    streakDays: 0,
    lastActiveDate: null,
    badges: [],
    createdAt: "2026-05-23T18:00:00.000Z",
    ...overrides,
  };
}

describe("ChildCard — root + identity", () => {
  it("renders root <article> with data-slot=child-card and data-child-id matching child.id", () => {
    const child = makeChild({ id: "kid-42" });
    const { container } = render(<ChildCard child={child} />);
    const root = container.querySelector('[data-slot="child-card"]');
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe("ARTICLE");
    expect(root?.getAttribute("data-child-id")).toBe("kid-42");
  });
});

describe("ChildCard — avatar", () => {
  it("renders a circular span with the first uppercase initial of child.name", () => {
    const child = makeChild({ name: "ada" });
    const { container } = render(<ChildCard child={child} />);
    const root = container.querySelector('[data-slot="child-card"]') as HTMLElement;
    const avatar = root.querySelector("header > span") as HTMLSpanElement;
    expect(avatar).not.toBeNull();
    expect(avatar.textContent).toBe("A");
  });

  it("applies child.avatarColor as inline backgroundColor", () => {
    // Use a plain color string (not OKLCH) so jsdom's CSSOM doesn't normalize
    // or reject it — the component sets the value verbatim via style prop.
    const child = makeChild({ avatarColor: "rgb(10, 20, 30)" });
    const { container } = render(<ChildCard child={child} />);
    const avatar = container.querySelector(
      '[data-slot="child-card"] header > span',
    ) as HTMLSpanElement;
    expect(avatar.style.backgroundColor).toBe("rgb(10, 20, 30)");
  });

  it("marks the avatar aria-hidden", () => {
    const child = makeChild();
    const { container } = render(<ChildCard child={child} />);
    const avatar = container.querySelector(
      '[data-slot="child-card"] header > span',
    ) as HTMLSpanElement;
    // React normalizes the aria-hidden boolean prop to the string "true".
    expect(avatar.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("ChildCard — header text", () => {
  it("renders child.name as an h2", () => {
    const child = makeChild({ name: "Ada Lovelace" });
    const { container } = render(<ChildCard child={child} />);
    const heading = container.querySelector(
      '[data-slot="child-card"] h2',
    ) as HTMLHeadingElement;
    expect(heading).not.toBeNull();
    expect(heading.textContent).toBe("Ada Lovelace");
  });

  it("renders the kicker as 'Age {age} · {grade} · {state}'", () => {
    const child = makeChild({ age: 11, grade: "5", state: "NY" });
    const { container } = render(<ChildCard child={child} />);
    const root = container.querySelector('[data-slot="child-card"]') as HTMLElement;
    // The kicker is the only <p> inside the header.
    const kicker = root.querySelector("header p") as HTMLParagraphElement;
    expect(kicker.textContent).toBe("Age 11 · 5 · NY");
  });
});

describe("ChildCard — stats row", () => {
  it("formats xpTotal with toLocaleString (e.g. 1234 -> '1,234')", () => {
    const child = makeChild({ xpTotal: 1234 });
    const { container } = render(<ChildCard child={child} />);
    const xp = container.querySelector('[data-slot="child-xp"]');
    expect(xp?.textContent).toBe((1234).toLocaleString());
  });

  it("renders streakDays with a 'd' suffix", () => {
    const child = makeChild({ streakDays: 7 });
    const { container } = render(<ChildCard child={child} />);
    const streak = container.querySelector('[data-slot="child-streak"]');
    expect(streak?.textContent).toBe("7d");
  });

  it("renders badges count from badges.length", () => {
    const child = makeChild({
      badges: [
        { id: "b1", name: "First Steps", earnedAt: "2026-05-20T00:00:00.000Z" },
        { id: "b2", name: "Streak 7", earnedAt: "2026-05-21T00:00:00.000Z" },
        { id: "b3", name: "Math Whiz", earnedAt: "2026-05-22T00:00:00.000Z" },
      ],
    });
    const { container } = render(<ChildCard child={child} />);
    const badges = container.querySelector('[data-slot="child-badges"]');
    expect(badges?.textContent).toBe("3");
  });

  it("renders zero values: xpTotal=0 -> '0', streakDays=0 -> '0d', badges=[] -> '0'", () => {
    const child = makeChild({ xpTotal: 0, streakDays: 0, badges: [] });
    const { container } = render(<ChildCard child={child} />);
    expect(
      container.querySelector('[data-slot="child-xp"]')?.textContent,
    ).toBe("0");
    expect(
      container.querySelector('[data-slot="child-streak"]')?.textContent,
    ).toBe("0d");
    expect(
      container.querySelector('[data-slot="child-badges"]')?.textContent,
    ).toBe("0");
  });
});

describe("ChildCard — style + approach labels", () => {
  // The labels sit as bare text nodes between <span>s inside one <p>, so
  // textContent matching is more robust than getByText.
  it.each([
    ["visual", "Visual"],
    ["auditory", "Auditory"],
    ["kinesthetic", "Kinesthetic"],
    ["reading-writing", "Reading / writing"],
  ] as const)("maps learningStyle=%s to %s", (style, label) => {
    const child = makeChild({ learningStyle: style });
    const { container } = render(<ChildCard child={child} />);
    const root = container.querySelector('[data-slot="child-card"]') as HTMLElement;
    expect(root.textContent).toContain(label);
  });

  it.each([
    ["classical", "Classical"],
    ["charlotte-mason", "Charlotte Mason"],
    ["unschooling", "Unschooling"],
    ["eclectic", "Eclectic"],
    ["montessori", "Montessori"],
    ["traditional", "Traditional"],
  ] as const)("maps curriculumApproach=%s to %s", (approach, label) => {
    const child = makeChild({ curriculumApproach: approach });
    const { container } = render(<ChildCard child={child} />);
    const root = container.querySelector('[data-slot="child-card"]') as HTMLElement;
    expect(root.textContent).toContain(label);
  });
});

describe("ChildCard — state requirement panel (known state)", () => {
  it("summary reads '<State name> homeschool requirements' for CA", () => {
    const child = makeChild({ state: "CA" });
    const { container } = render(<ChildCard child={child} />);
    const details = container.querySelector(
      '[data-slot="child-state-req"]',
    ) as HTMLDetailsElement;
    expect(details).not.toBeNull();
    const summary = details.querySelector("summary") as HTMLElement;
    expect(summary.textContent).toContain("California homeschool requirements");
  });

  it("when opened, renders Hours/yr, Portfolio, Testing, Intent filing rows + notes using getStateRequirement('CA')", () => {
    const child = makeChild({ state: "CA" });
    const { container } = render(<ChildCard child={child} />);
    const details = container.querySelector(
      '[data-slot="child-state-req"]',
    ) as HTMLDetailsElement;

    // <details open> — content is in the DOM regardless of `open`, but we set
    // it for fidelity with how the component is actually used.
    details.open = true;

    const req = getStateRequirement("CA");
    expect(req).toBeDefined();
    if (!req) throw new Error("CA requirement missing — fixture invariant broken");

    const text = details.textContent ?? "";

    // Labels
    expect(text).toContain("Hours / yr");
    expect(text).toContain("Portfolio");
    expect(text).toContain("Testing");
    expect(text).toContain("Intent filing");

    // Values driven by the real requirement record.
    // CA: hoursPerYear === null -> "Not specified"
    expect(text).toContain(req.hoursPerYear ?? "Not specified");
    expect(text).toContain(req.portfolioRequired ? "Required" : "Not required");
    expect(text).toContain(req.testingRequired ? "Required" : "Not required");
    expect(text).toContain(
      req.notificationOfIntent ? "Required" : "Not required",
    );

    // Notes copy is present verbatim.
    expect(text).toContain(req.notes);
  });
});

describe("ChildCard — state requirement panel (unknown state)", () => {
  it("falls back to '<code> requirements' in the summary and shows the italic fallback body", () => {
    // 'ZZ' is not a real US state code and is absent from STATE_REQUIREMENTS,
    // so getStateRequirement returns undefined.
    expect(getStateRequirement("ZZ")).toBeUndefined();

    // Schema validates state as length-2, so 'ZZ' is shape-valid even though
    // it's not a known code — this is the exact unknown-state branch.
    const child = makeChild({ state: "ZZ" });
    const { container } = render(<ChildCard child={child} />);
    const details = container.querySelector(
      '[data-slot="child-state-req"]',
    ) as HTMLDetailsElement;
    const summary = details.querySelector("summary") as HTMLElement;
    expect(summary.textContent).toContain("ZZ requirements");

    details.open = true;
    expect(details.textContent).toContain(
      "No requirements summary on file for ZZ.",
    );

    // None of the structured rows should appear in the unknown branch.
    expect(details.textContent).not.toContain("Hours / yr");
    expect(details.textContent).not.toContain("Portfolio");
    expect(details.textContent).not.toContain("Intent filing");
  });
});

describe("ChildCard — edge cases", () => {
  it("empty/whitespace name -> avatar initial falls back to '?'", () => {
    const child = makeChild({ name: "   " });
    const { container } = render(<ChildCard child={child} />);
    const avatar = container.querySelector(
      '[data-slot="child-card"] header > span',
    ) as HTMLSpanElement;
    expect(avatar.textContent).toBe("?");
  });

  it("summary uses min-h-11 for the 44px touch-target rule", () => {
    const child = makeChild();
    const { container } = render(<ChildCard child={child} />);
    const summary = container.querySelector(
      '[data-slot="child-state-req"] summary',
    ) as HTMLElement;
    expect(summary).not.toBeNull();
    expect(summary.className).toContain("min-h-11");
  });
});
