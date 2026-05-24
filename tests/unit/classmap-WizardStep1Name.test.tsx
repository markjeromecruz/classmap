import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WizardStep1Name } from "@/components/classmap/onboarding/WizardStep1Name";

// Per-test mobile viewport. WizardStep1Name uses responsive Tailwind classes
// (sm: prefixes); we assert it still mounts and exposes its input at 360px.
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

const nameInput = () =>
  screen.getByLabelText(/child.s first name/i) as HTMLInputElement;

describe("WizardStep1Name — render", () => {
  it("renders the prompt heading and the labeled name input", () => {
    render(<WizardStep1Name value="" onChange={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /who are we planning for\?/i }),
    ).toBeInTheDocument();
    expect(nameInput()).toBeInTheDocument();
  });

  it("renders at a 360px mobile viewport with the input present", () => {
    render(<WizardStep1Name value="" onChange={() => {}} />);
    expect(window.innerWidth).toBe(360);
    expect(nameInput()).toBeInTheDocument();
  });

  it("reflects the initial controlled `value` prop", () => {
    render(<WizardStep1Name value="Mira" onChange={() => {}} />);
    expect(nameInput().value).toBe("Mira");
  });
});

describe("WizardStep1Name — controlled onChange contract", () => {
  it("emits onChange(next: string) on each keystroke", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: string) => void>();
    render(<WizardStep1Name value="" onChange={onChange} />);

    await user.type(nameInput(), "Mi");

    // userEvent.type fires per-keystroke; the controlled input does NOT
    // re-render with the new value (parent owns state in this test), so each
    // call receives the single typed character against the original "" value.
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, "M");
    expect(onChange).toHaveBeenNthCalledWith(2, "i");
  });

  it("emits the full string when the parent threads state back in", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: string) => void>();

    function Harness() {
      const [v, setV] = (require("react") as typeof import("react")).useState("");
      return (
        <WizardStep1Name
          value={v}
          onChange={(next) => {
            onChange(next);
            setV(next);
          }}
        />
      );
    }

    render(<Harness />);
    await user.type(nameInput(), "Mira");

    expect(onChange).toHaveBeenLastCalledWith("Mira");
    expect(nameInput().value).toBe("Mira");
  });
});

describe("WizardStep1Name — validity is implicit in emitted value", () => {
  // The component has no onValidityChange callback; the source contract is
  // simply (value, onChange). Downstream validity is derived from the string.
  // We assert the emitted-string semantics the wizard relies on.

  it("empty value yields an empty string (treated as invalid upstream)", () => {
    render(<WizardStep1Name value="" onChange={() => {}} />);
    expect(nameInput().value).toBe("");
    expect(nameInput().value.trim().length).toBe(0);
  });

  it("whitespace-only value reads as untrimmed empty (invalid upstream)", () => {
    render(<WizardStep1Name value="   " onChange={() => {}} />);
    expect(nameInput().value).toBe("   ");
    expect(nameInput().value.trim().length).toBe(0);
  });

  it("non-empty value reads as valid (trimmed length >= 1)", () => {
    render(<WizardStep1Name value="Mira" onChange={() => {}} />);
    expect(nameInput().value.trim().length).toBeGreaterThanOrEqual(1);
  });
});

describe("WizardStep1Name — maxLength enforcement", () => {
  it("sets maxLength=40 on the input element", () => {
    render(<WizardStep1Name value="" onChange={() => {}} />);
    expect(nameInput()).toHaveAttribute("maxlength", "40");
  });

  it("accepts a 40-char value without truncation in props", () => {
    const forty = "x".repeat(40);
    render(<WizardStep1Name value={forty} onChange={() => {}} />);
    expect(nameInput().value).toHaveLength(40);
  });
});
