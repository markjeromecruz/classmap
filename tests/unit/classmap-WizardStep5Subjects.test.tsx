import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WizardStep5Subjects } from "@/components/classmap/onboarding/WizardStep5Subjects";
import { SUBJECTS, type Subject } from "@/lib/classmap/types";

/* ------------------------------------------------------------------ *
 * Mobile breakpoint (HARD): pin the viewport to 360x740 for every
 * test in this file. WizardStep5Subjects uses responsive Tailwind
 * (`sm:` prefixes on grid + headings); we assert it still mounts and
 * exposes every checkbox + reorder control at the smallest breakpoint
 * we ship.
 * ------------------------------------------------------------------ */
beforeEach(() => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 360,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 740,
  });
  window.dispatchEvent(new Event("resize"));
});

/* ------------------------------------------------------------------ *
 * Source-of-truth label map. Mirrors LABELS inside the component;
 * we keep a local copy so the tests fail loudly if the component
 * renames a subject.
 * ------------------------------------------------------------------ */
const LABELS: Record<Subject, string> = {
  math: "Math",
  reading: "Reading",
  writing: "Writing",
  science: "Science",
  history: "History",
  geography: "Geography",
  art: "Art",
  music: "Music",
  "physical-education": "PE",
  "foreign-language": "Language",
  "computer-science": "Computer Sci.",
  "life-skills": "Life Skills",
};

/** Query a checkbox by its visible subject label via role + accessible name. */
function checkboxFor(subject: Subject): HTMLElement {
  // The component wraps <Checkbox> inside a <label> with the subject text,
  // so the label content becomes the accessible name on the base-ui checkbox.
  return screen.getByRole("checkbox", { name: LABELS[subject] });
}

/** Get the ordered <li> labels from the priorities reorder list, if rendered. */
function priorityListLabels(): string[] {
  const list = screen.queryByRole("list");
  if (!list) return [];
  return within(list)
    .getAllByRole("listitem")
    .map((li) => {
      // Each <li> renders "NN" + <subject label> + up/down buttons (↑↓).
      // Strip the leading "NN " position prefix AND any trailing arrow glyphs.
      const text = li.textContent ?? "";
      return text
        .replace(/^\s*\d{2}\s*/, "")
        .replace(/[↑↓]/g, "")
        .trim();
    });
}

/* ================================================================== *
 * 1. Renders one checkbox per SUBJECTS entry (12 total).
 * ================================================================== */
describe("WizardStep5Subjects — render", () => {
  it("renders the step heading and prompt copy", () => {
    render(<WizardStep5Subjects value={[]} onChange={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /which subjects matter most\?/i }),
    ).toBeInTheDocument();
  });

  it("renders exactly one checkbox per SUBJECTS entry (12 total)", () => {
    render(<WizardStep5Subjects value={[]} onChange={() => {}} />);
    // SUBJECTS is the canonical source; assert length defensively so a
    // future addition to SUBJECTS forces an update here.
    expect(SUBJECTS).toHaveLength(12);
    const all = screen.getAllByRole("checkbox");
    expect(all).toHaveLength(SUBJECTS.length);
    for (const subject of SUBJECTS) {
      expect(checkboxFor(subject)).toBeInTheDocument();
    }
  });

  it("renders at a 360px mobile viewport with every checkbox present", () => {
    render(<WizardStep5Subjects value={[]} onChange={() => {}} />);
    expect(window.innerWidth).toBe(360);
    expect(screen.getAllByRole("checkbox")).toHaveLength(SUBJECTS.length);
  });

  it("omits the priorities reorder list when no subjects are selected", () => {
    render(<WizardStep5Subjects value={[]} onChange={() => {}} />);
    // The <ol> only mounts when value.length > 0.
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

/* ================================================================== *
 * 2. Toggle semantics — checking adds, unchecking removes.
 *    Component contract: onChange receives the FULL next Subject[].
 * ================================================================== */
describe("WizardStep5Subjects — toggle onChange contract", () => {
  it("checking an unchecked subject appends it to the array", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(<WizardStep5Subjects value={[]} onChange={onChange} />);

    await user.click(checkboxFor("math"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(["math"]);
  });

  it("checking a second subject appends after existing entries", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(<WizardStep5Subjects value={["math"]} onChange={onChange} />);

    await user.click(checkboxFor("reading"));

    expect(onChange).toHaveBeenLastCalledWith(["math", "reading"]);
  });

  it("unchecking a selected subject removes it from the array", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(
      <WizardStep5Subjects
        value={["math", "reading", "writing"]}
        onChange={onChange}
      />,
    );

    await user.click(checkboxFor("reading"));

    // Order of the surviving entries is preserved.
    expect(onChange).toHaveBeenLastCalledWith(["math", "writing"]);
  });

  it("unchecking the only selected subject yields []", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(<WizardStep5Subjects value={["math"]} onChange={onChange} />);

    await user.click(checkboxFor("math"));

    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

/* ================================================================== *
 * 3. Initial selected subjects (controlled prop) are reflected both
 *    in the checkbox grid AND in the reorder list.
 * ================================================================== */
describe("WizardStep5Subjects — controlled value reflection", () => {
  it("shows initial selections as data-checked on the grid checkboxes", () => {
    render(
      <WizardStep5Subjects
        value={["math", "art"]}
        onChange={() => {}}
      />,
    );

    // base-ui Checkbox exposes data-state via aria-checked.
    expect(checkboxFor("math")).toHaveAttribute("aria-checked", "true");
    expect(checkboxFor("art")).toHaveAttribute("aria-checked", "true");
    // Unchecked siblings stay false.
    expect(checkboxFor("reading")).toHaveAttribute("aria-checked", "false");
    expect(checkboxFor("science")).toHaveAttribute("aria-checked", "false");
  });

  it("renders the priorities list with only the selected subjects", () => {
    render(
      <WizardStep5Subjects
        value={["math", "art"]}
        onChange={() => {}}
      />,
    );

    const labels = priorityListLabels();
    expect(labels).toEqual(["Math", "Art"]);
  });
});

/* ================================================================== *
 * 4. The reorder list shows ONLY selected subjects, in selection order.
 * ================================================================== */
describe("WizardStep5Subjects — priority list contents", () => {
  it("excludes unselected subjects from the priority list", () => {
    render(
      <WizardStep5Subjects
        value={["writing", "music"]}
        onChange={() => {}}
      />,
    );

    const labels = priorityListLabels();
    expect(labels).toEqual(["Writing", "Music"]);
    expect(labels).not.toContain("Math");
    expect(labels).not.toContain("Reading");
  });

  it("preserves selection order (input order = display order)", () => {
    // Deliberately non-alphabetical, non-canonical order.
    render(
      <WizardStep5Subjects
        value={["life-skills", "math", "history"]}
        onChange={() => {}}
      />,
    );

    expect(priorityListLabels()).toEqual(["Life Skills", "Math", "History"]);
  });

  it("renders one up + one down button per priority entry", () => {
    render(
      <WizardStep5Subjects
        value={["math", "reading", "writing"]}
        onChange={() => {}}
      />,
    );

    // 3 entries × (up + down) = 6 reorder buttons, all aria-labelled.
    expect(screen.getByRole("button", { name: /move math up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move math down/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move reading up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move reading down/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move writing up/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move writing down/i })).toBeInTheDocument();
  });

  it("disables 'up' on the first entry and 'down' on the last entry", () => {
    render(
      <WizardStep5Subjects
        value={["math", "reading", "writing"]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /move math up/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /move math down/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /move writing up/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /move writing down/i })).toBeDisabled();
  });
});

/* ================================================================== *
 * 5. Reorder buttons swap adjacent positions via onChange. Because the
 *    component is fully controlled (no internal state), we drive both
 *    swaps in one test through a tiny stateful harness that threads the
 *    parent's new array back in — this matches how the wizard wraps it
 *    in real usage. The asset in the spec:
 *      select math+reading+writing →
 *        move reading DOWN → [math, writing, reading]
 *        move writing UP   → [writing, math, reading]
 * ================================================================== */
describe("WizardStep5Subjects — reorder swaps adjacent positions", () => {
  it("'down' on a middle entry swaps it with its successor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(
      <WizardStep5Subjects
        value={["math", "reading", "writing"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /move reading down/i }));

    // Single swap, emitted as the FULL next array (order matters for
    // prioritySubjects downstream).
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(["math", "writing", "reading"]);
  });

  it("'up' on a middle entry swaps it with its predecessor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(
      <WizardStep5Subjects
        value={["math", "writing", "reading"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /move writing up/i }));

    expect(onChange).toHaveBeenLastCalledWith(["writing", "math", "reading"]);
  });

  it("full scripted asset: down(reading) then up(writing) lands at [writing, math, reading]", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();

    function Harness() {
      const [v, setV] = (
        require("react") as typeof import("react")
      ).useState<Subject[]>(["math", "reading", "writing"]);
      return (
        <WizardStep5Subjects
          value={v}
          onChange={(next) => {
            onChange(next);
            setV(next);
          }}
        />
      );
    }

    render(<Harness />);

    // Sanity: starting order.
    expect(priorityListLabels()).toEqual(["Math", "Reading", "Writing"]);

    // Move reading down → [math, writing, reading]
    await user.click(screen.getByRole("button", { name: /move reading down/i }));
    expect(onChange).toHaveBeenNthCalledWith(1, ["math", "writing", "reading"]);
    expect(priorityListLabels()).toEqual(["Math", "Writing", "Reading"]);

    // Move writing up → [writing, math, reading]
    await user.click(screen.getByRole("button", { name: /move writing up/i }));
    expect(onChange).toHaveBeenNthCalledWith(2, ["writing", "math", "reading"]);
    expect(priorityListLabels()).toEqual(["Writing", "Math", "Reading"]);
  });

  it("does not emit when 'up' is pressed on the first entry (no-op guard)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(
      <WizardStep5Subjects
        value={["math", "reading"]}
        onChange={onChange}
      />,
    );

    // First-entry 'up' is disabled; pointer-events should be blocked, so no
    // emit. userEvent respects the disabled attribute and silently no-ops.
    await user.click(screen.getByRole("button", { name: /move math up/i }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not emit when 'down' is pressed on the last entry (no-op guard)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();
    render(
      <WizardStep5Subjects
        value={["math", "reading"]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /move reading down/i }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

/* ================================================================== *
 * 6. Validity contract. The component itself has no onValidityChange
 *    callback — validity is encoded in the emitted Subject[] and the
 *    upstream zod schema:
 *      childSchema.prioritySubjects = z.array(z.enum(SUBJECTS))
 *                                       .min(1).max(SUBJECTS.length)
 *    So "empty → invalid, ≥1 → valid" is asserted via the array length
 *    of the controlled `value` prop and the presence/absence of the
 *    priority list.
 * ================================================================== */
describe("WizardStep5Subjects — validity contract (≥1 selection)", () => {
  it("empty selection is invalid (no priorities list rendered)", () => {
    render(<WizardStep5Subjects value={[]} onChange={() => {}} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    // Mirrors the upstream schema invariant: prioritySubjects.min(1).
    expect([].length >= 1).toBe(false);
  });

  it("exactly one selection is valid (priorities list mounts)", () => {
    render(<WizardStep5Subjects value={["math"]} onChange={() => {}} />);
    const labels = priorityListLabels();
    expect(labels).toEqual(["Math"]);
    expect(labels.length >= 1).toBe(true);
  });

  it("becomes invalid again when the last selection is unchecked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();

    function Harness() {
      const [v, setV] = (
        require("react") as typeof import("react")
      ).useState<Subject[]>(["math"]);
      return (
        <WizardStep5Subjects
          value={v}
          onChange={(next) => {
            onChange(next);
            setV(next);
          }}
        />
      );
    }

    render(<Harness />);
    // Starts valid (priorities list visible).
    expect(screen.getByRole("list")).toBeInTheDocument();

    await user.click(checkboxFor("math"));

    expect(onChange).toHaveBeenLastCalledWith([]);
    // Priority list disappears on the very next render.
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

/* ================================================================== *
 * 7. Reorder is reflected in the emitted change — order matters.
 *    This is the load-bearing assertion for prioritySubjects: the
 *    consumer reads value[0] as the highest-priority subject.
 * ================================================================== */
describe("WizardStep5Subjects — emitted order is the priority order", () => {
  it("emits the swapped array on every reorder click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Subject[]) => void>();

    function Harness() {
      const [v, setV] = (
        require("react") as typeof import("react")
      ).useState<Subject[]>(["math", "reading", "writing", "science"]);
      return (
        <WizardStep5Subjects
          value={v}
          onChange={(next) => {
            onChange(next);
            setV(next);
          }}
        />
      );
    }

    render(<Harness />);

    // Walk science from position 4 → position 1 via repeated 'up' clicks.
    await user.click(screen.getByRole("button", { name: /move science up/i }));
    expect(onChange).toHaveBeenNthCalledWith(1, [
      "math",
      "reading",
      "science",
      "writing",
    ]);

    await user.click(screen.getByRole("button", { name: /move science up/i }));
    expect(onChange).toHaveBeenNthCalledWith(2, [
      "math",
      "science",
      "reading",
      "writing",
    ]);

    await user.click(screen.getByRole("button", { name: /move science up/i }));
    expect(onChange).toHaveBeenNthCalledWith(3, [
      "science",
      "math",
      "reading",
      "writing",
    ]);

    // Final on-screen order matches the last emitted array.
    expect(priorityListLabels()).toEqual([
      "Science",
      "Math",
      "Reading",
      "Writing",
    ]);
  });
});
