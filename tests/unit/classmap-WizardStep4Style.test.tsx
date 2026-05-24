import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  WizardStep4Style,
  type Step4Value,
} from "@/components/classmap/onboarding/WizardStep4Style";
import {
  CURRICULUM_APPROACHES,
  LEARNING_STYLES,
  type CurriculumApproach,
  type LearningStyle,
} from "@/lib/classmap/types";

// ---------------------------------------------------------------------------
// Mobile viewport (HARD): WizardStep4Style uses responsive `sm:` Tailwind
// classes. Pin to 360x740 so every test asserts the small-screen layout still
// mounts both fieldsets and exposes every radio.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Source contract: the component uses native <input type="radio"> inside
// <label> rows (not custom <button data-slot> cards). Therefore:
//   - card count → role="radio"
//   - card identity → the input's `value` attribute (= the enum string)
//   - scoping → each fieldset is a `role="group"` named by its <legend>
// ---------------------------------------------------------------------------
const EMPTY: Step4Value = { learningStyle: "", curriculumApproach: "" };

const learningFieldset = () =>
  screen.getByRole("group", { name: /learning style/i });
const approachFieldset = () =>
  screen.getByRole("group", { name: /curriculum approach/i });

const learningRadio = (style: LearningStyle) =>
  within(learningFieldset()).getByRole("radio", {
    // role+value isn't queryable directly; use the underlying input's `value`.
    // RTL doesn't filter radios by value, so fall back to a CSS query inside
    // the fieldset and assert it's actually a radio.
  }) && (within(learningFieldset()).container.querySelector(
    `input[type="radio"][value="${style}"]`,
  ) as HTMLInputElement | null);

const approachRadio = (approach: CurriculumApproach) =>
  within(approachFieldset()).getByRole("radio", {}) &&
  (within(approachFieldset()).container.querySelector(
    `input[type="radio"][value="${approach}"]`,
  ) as HTMLInputElement | null);

// Simpler, direct DOM lookups for individual radios — the helpers above are
// defensive but verbose; tests below use these straightforward queries.
const learningInput = (style: LearningStyle): HTMLInputElement => {
  const el = learningFieldset().querySelector(
    `input[type="radio"][value="${style}"]`,
  ) as HTMLInputElement | null;
  if (!el) throw new Error(`learning-style radio not found for "${style}"`);
  return el;
};
const approachInput = (approach: CurriculumApproach): HTMLInputElement => {
  const el = approachFieldset().querySelector(
    `input[type="radio"][value="${approach}"]`,
  ) as HTMLInputElement | null;
  if (!el)
    throw new Error(`curriculum-approach radio not found for "${approach}"`);
  return el;
};

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
describe("WizardStep4Style — render", () => {
  it("renders the prompt heading and both fieldset legends", () => {
    render(<WizardStep4Style value={EMPTY} onChange={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /how do they learn best\?/i }),
    ).toBeInTheDocument();
    expect(learningFieldset()).toBeInTheDocument();
    expect(approachFieldset()).toBeInTheDocument();
  });

  it("renders at a 360px mobile viewport with both fieldsets mounted", () => {
    render(<WizardStep4Style value={EMPTY} onChange={() => {}} />);
    expect(window.innerWidth).toBe(360);
    expect(learningFieldset()).toBeInTheDocument();
    expect(approachFieldset()).toBeInTheDocument();
  });

  it("renders exactly one radio per LEARNING_STYLES value (4 cards)", () => {
    render(<WizardStep4Style value={EMPTY} onChange={() => {}} />);
    const radios = within(learningFieldset()).getAllByRole("radio");
    expect(radios).toHaveLength(LEARNING_STYLES.length);
    expect(LEARNING_STYLES).toHaveLength(4);
    for (const style of LEARNING_STYLES) {
      expect(learningInput(style)).toBeInTheDocument();
      expect(learningInput(style).name).toBe("learning-style");
    }
  });

  it("renders exactly one radio per CURRICULUM_APPROACHES value (6 cards)", () => {
    render(<WizardStep4Style value={EMPTY} onChange={() => {}} />);
    const radios = within(approachFieldset()).getAllByRole("radio");
    expect(radios).toHaveLength(CURRICULUM_APPROACHES.length);
    expect(CURRICULUM_APPROACHES).toHaveLength(6);
    for (const approach of CURRICULUM_APPROACHES) {
      expect(approachInput(approach)).toBeInTheDocument();
      expect(approachInput(approach).name).toBe("curriculum-approach");
    }
  });
});

// ---------------------------------------------------------------------------
// Controlled value reflection
// ---------------------------------------------------------------------------
describe("WizardStep4Style — controlled initial values", () => {
  it("with both empty, no radio is checked in either fieldset", () => {
    render(<WizardStep4Style value={EMPTY} onChange={() => {}} />);
    for (const style of LEARNING_STYLES) {
      expect(learningInput(style).checked).toBe(false);
    }
    for (const approach of CURRICULUM_APPROACHES) {
      expect(approachInput(approach).checked).toBe(false);
    }
  });

  it("reflects an initial learningStyle by checking only that radio", () => {
    render(
      <WizardStep4Style
        value={{ learningStyle: "kinesthetic", curriculumApproach: "" }}
        onChange={() => {}}
      />,
    );
    for (const style of LEARNING_STYLES) {
      expect(learningInput(style).checked).toBe(style === "kinesthetic");
    }
  });

  it("reflects an initial curriculumApproach by checking only that radio", () => {
    render(
      <WizardStep4Style
        value={{ learningStyle: "", curriculumApproach: "montessori" }}
        onChange={() => {}}
      />,
    );
    for (const approach of CURRICULUM_APPROACHES) {
      expect(approachInput(approach).checked).toBe(approach === "montessori");
    }
  });

  it("reflects both initial values simultaneously", () => {
    render(
      <WizardStep4Style
        value={{
          learningStyle: "reading-writing",
          curriculumApproach: "charlotte-mason",
        }}
        onChange={() => {}}
      />,
    );
    expect(learningInput("reading-writing").checked).toBe(true);
    expect(approachInput("charlotte-mason").checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// onChange contract — selecting a card emits next Step4Value with the right
// enum value, preserving the other field.
// ---------------------------------------------------------------------------
describe("WizardStep4Style — learning-style selection", () => {
  it.each(LEARNING_STYLES)(
    "clicking %s emits onChange with learningStyle=%s",
    async (style) => {
      const user = userEvent.setup();
      const onChange = vi.fn<(next: Step4Value) => void>();
      render(<WizardStep4Style value={EMPTY} onChange={onChange} />);

      await user.click(learningInput(style));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        learningStyle: style,
        curriculumApproach: "",
      });
    },
  );

  it("preserves an existing curriculumApproach when changing learning style", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Step4Value) => void>();
    render(
      <WizardStep4Style
        value={{ learningStyle: "", curriculumApproach: "classical" }}
        onChange={onChange}
      />,
    );
    await user.click(learningInput("auditory"));
    expect(onChange).toHaveBeenCalledWith({
      learningStyle: "auditory",
      curriculumApproach: "classical",
    });
  });
});

describe("WizardStep4Style — curriculum-approach selection", () => {
  it.each(CURRICULUM_APPROACHES)(
    "clicking %s emits onChange with curriculumApproach=%s",
    async (approach) => {
      const user = userEvent.setup();
      const onChange = vi.fn<(next: Step4Value) => void>();
      render(<WizardStep4Style value={EMPTY} onChange={onChange} />);

      await user.click(approachInput(approach));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        learningStyle: "",
        curriculumApproach: approach,
      });
    },
  );

  it("preserves an existing learningStyle when changing approach", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Step4Value) => void>();
    render(
      <WizardStep4Style
        value={{ learningStyle: "visual", curriculumApproach: "" }}
        onChange={onChange}
      />,
    );
    await user.click(approachInput("unschooling"));
    expect(onChange).toHaveBeenCalledWith({
      learningStyle: "visual",
      curriculumApproach: "unschooling",
    });
  });
});

// ---------------------------------------------------------------------------
// Validity — the component does NOT expose an onValidityChange callback.
// Its contract is `(value, onChange)`; validity is derived upstream from the
// emitted Step4Value where BOTH learningStyle and curriculumApproach must be
// non-empty. We mirror WizardStep1Name's pattern: assert the value-shape
// semantics the wizard relies on.
// ---------------------------------------------------------------------------
describe("WizardStep4Style — validity is implicit in emitted Step4Value", () => {
  const isStep4Valid = (v: Step4Value) =>
    v.learningStyle !== "" && v.curriculumApproach !== "";

  it("empty/empty is invalid upstream", () => {
    expect(isStep4Valid(EMPTY)).toBe(false);
  });

  it("learningStyle only is invalid upstream (both required)", () => {
    expect(
      isStep4Valid({ learningStyle: "visual", curriculumApproach: "" }),
    ).toBe(false);
  });

  it("curriculumApproach only is invalid upstream (both required)", () => {
    expect(
      isStep4Valid({ learningStyle: "", curriculumApproach: "eclectic" }),
    ).toBe(false);
  });

  it("both selected is valid upstream", () => {
    expect(
      isStep4Valid({
        learningStyle: "kinesthetic",
        curriculumApproach: "traditional",
      }),
    ).toBe(true);
  });

  it("a parent threading state back through (value, onChange) reaches a valid Step4Value after two clicks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: Step4Value) => void>();

    function Harness() {
      const React = require("react") as typeof import("react");
      const [v, setV] = React.useState<Step4Value>(EMPTY);
      return (
        <WizardStep4Style
          value={v}
          onChange={(next) => {
            onChange(next);
            setV(next);
          }}
        />
      );
    }

    render(<Harness />);
    await user.click(learningInput("visual"));
    await user.click(approachInput("montessori"));

    const last = onChange.mock.calls.at(-1)?.[0] as Step4Value;
    expect(last).toEqual({
      learningStyle: "visual",
      curriculumApproach: "montessori",
    });
    expect(isStep4Valid(last)).toBe(true);

    // And the DOM reflects both selections after the parent re-renders.
    expect(learningInput("visual").checked).toBe(true);
    expect(approachInput("montessori").checked).toBe(true);
  });
});
