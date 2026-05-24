import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { WizardStep3State } from "@/components/classmap/onboarding/WizardStep3State";
import { STATE_REQUIREMENTS } from "@/lib/classmap/state-requirements";

// Per-test mobile viewport. WizardStep3State uses responsive Tailwind classes
// (sm: prefixes); we assert it still mounts and exposes its input + datalist
// at 360px.
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

const stateInput = () =>
  screen.getByLabelText(/us state/i) as HTMLInputElement;

// Controlled harness so the input reflects emitted onChange values mid-typing,
// matching the wizard's parent-owns-state contract. Tracks emitted codes for
// assertions.
function ControlledHarness({
  initial = "",
  onEmit,
}: {
  initial?: string;
  onEmit?: (next: string) => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <WizardStep3State
      value={v}
      onChange={(next) => {
        onEmit?.(next);
        setV(next);
      }}
    />
  );
}

describe("WizardStep3State — render", () => {
  it("renders the step heading and the labeled US state input", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    expect(
      screen.getByRole("heading", { name: /which state\?/i }),
    ).toBeInTheDocument();
    expect(stateInput()).toBeInTheDocument();
  });

  it("renders at a 360px mobile viewport with the input and datalist present", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    expect(window.innerWidth).toBe(360);
    expect(stateInput()).toBeInTheDocument();
    const datalist = document.querySelector("datalist");
    expect(datalist).not.toBeNull();
  });

  it("wires the input to the datalist via the `list` attribute", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    const input = stateInput();
    const listId = input.getAttribute("list");
    expect(listId).toBe("wizard-state-options");
    const datalist = document.getElementById(listId!);
    expect(datalist).not.toBeNull();
    expect(datalist!.tagName.toLowerCase()).toBe("datalist");
  });

  it("hints autocomplete=address-level1 for the browser", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    expect(stateInput()).toHaveAttribute("autoComplete", "address-level1");
  });
});

describe("WizardStep3State — datalist contents", () => {
  it("emits one <option> per US state in the source (50 entries)", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    const datalist = document.querySelector("datalist")!;
    const options = datalist.querySelectorAll("option");
    // Source emits exactly 50 entries. Assert that count and reaffirm the
    // "at least 50" floor required by the spec.
    expect(options.length).toBe(STATE_REQUIREMENTS.length);
    expect(options.length).toBeGreaterThanOrEqual(50);
  });

  it("uses the state NAME as option value and the state CODE as label", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    const datalist = document.querySelector("datalist")!;
    const options = Array.from(datalist.querySelectorAll("option"));
    const ca = options.find((o) => o.textContent === "CA");
    expect(ca).toBeDefined();
    expect(ca!.getAttribute("value")).toBe("California");
    const ny = options.find((o) => o.textContent === "NY");
    expect(ny).toBeDefined();
    expect(ny!.getAttribute("value")).toBe("New York");
  });

  it("sorts options alphabetically by state name", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    const datalist = document.querySelector("datalist")!;
    const values = Array.from(datalist.querySelectorAll("option")).map(
      (o) => o.getAttribute("value") ?? "",
    );
    // Alabama (AL) should come before Alaska (AK) when sorted by name even
    // though it would come after when sorted by code.
    const idxAlabama = values.indexOf("Alabama");
    const idxAlaska = values.indexOf("Alaska");
    expect(idxAlabama).toBeGreaterThanOrEqual(0);
    expect(idxAlaska).toBeGreaterThanOrEqual(0);
    expect(idxAlabama).toBeLessThan(idxAlaska);
    // Spot-check overall sortedness.
    const sorted = [...values].sort((a, b) => a.localeCompare(b));
    expect(values).toEqual(sorted);
  });
});

describe("WizardStep3State — initial controlled value", () => {
  it("reflects a valid initial state code by displaying the full name", () => {
    render(<WizardStep3State value="CA" onChange={() => {}} />);
    // Source maps a known code back to its display name in the input.
    expect(stateInput().value).toBe("California");
  });

  it("reflects an unknown initial value verbatim (no mapping found)", () => {
    render(<WizardStep3State value="???" onChange={() => {}} />);
    expect(stateInput().value).toBe("???");
  });

  it("shows the 'Selected: …' hint when a code is set", () => {
    render(<WizardStep3State value="NY" onChange={() => {}} />);
    expect(screen.getByText(/selected:\s*ny/i)).toBeInTheDocument();
  });

  it("shows the 'Pick from the list to continue.' hint when empty", () => {
    render(<WizardStep3State value="" onChange={() => {}} />);
    expect(
      screen.getByText(/pick from the list to continue\./i),
    ).toBeInTheDocument();
  });
});

describe("WizardStep3State — onChange contract (validity via emitted code)", () => {
  // The source has no onValidityChange callback. Validity is encoded in the
  // emitted string: a valid 2-letter code means "valid pick"; an empty string
  // means "not yet a valid pick" (see handleChange in WizardStep3State.tsx).

  it("typing a valid 2-letter code (lowercase 'ca') emits 'CA' (uppercased)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: string) => void>();
    render(<WizardStep3State value="" onChange={onChange} />);

    // userEvent.type fires per keystroke; the controlled input is fed value=""
    // from the parent, so each call sees a single character against "".
    // The single-char calls 'c' and 'a' will each emit "" (no match). Use
    // user.paste to deliver the full string in one input event.
    await user.click(stateInput());
    await user.paste("ca");

    // Source uppercases trimmed 2-letter input and confirms it exists in the
    // states list before emitting.
    expect(onChange).toHaveBeenLastCalledWith("CA");
  });

  it("typing a valid 2-letter code with surrounding whitespace still emits the trimmed/uppercased code", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: string) => void>();
    render(<WizardStep3State value="" onChange={onChange} />);

    await user.click(stateInput());
    await user.paste("  ny  ");

    expect(onChange).toHaveBeenLastCalledWith("NY");
  });

  it("typing the full state name (case-insensitive) emits the code", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: string) => void>();
    render(<WizardStep3State value="" onChange={onChange} />);

    await user.click(stateInput());
    await user.paste("california");

    expect(onChange).toHaveBeenLastCalledWith("CA");
  });

  it("a non-state 2-letter string (e.g. 'ZZ') emits '' (treated as invalid)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: string) => void>();
    render(<WizardStep3State value="" onChange={onChange} />);

    await user.click(stateInput());
    await user.paste("ZZ");

    // 'ZZ' is shape-valid (/^[A-Z]{2}$/) but not in the list → fallback emits "".
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("a free-form non-state string (e.g. 'California Republic') emits '' (treated as invalid)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(next: string) => void>();
    render(<WizardStep3State value="" onChange={onChange} />);

    await user.click(stateInput());
    await user.paste("California Republic");

    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("clearing the input emits '' (empty → invalid)", async () => {
    const user = userEvent.setup();
    const onEmit = vi.fn<(next: string) => void>();
    render(<ControlledHarness initial="CA" onEmit={onEmit} />);

    // Initial display is the mapped name "California".
    expect(stateInput().value).toBe("California");

    await user.clear(stateInput());
    expect(onEmit).toHaveBeenLastCalledWith("");
    // After parent threads "" back, display reverts to empty.
    expect(stateInput().value).toBe("");
  });
});

describe("WizardStep3State — controlled round-trip (parent threads state back)", () => {
  it("pasting a full state name flips the displayed input to the canonical NAME and emits the CODE", async () => {
    const user = userEvent.setup();
    const onEmit = vi.fn<(next: string) => void>();
    render(<ControlledHarness onEmit={onEmit} />);

    await user.click(stateInput());
    await user.paste("new york");

    // Source emits the code "NY"; parent threads it back; component maps it
    // to the display name "New York".
    expect(onEmit).toHaveBeenLastCalledWith("NY");
    expect(stateInput().value).toBe("New York");
    expect(screen.getByText(/selected:\s*ny/i)).toBeInTheDocument();
  });

  it("pasting a 2-letter code flips display to the full state name", async () => {
    const user = userEvent.setup();
    render(<ControlledHarness />);

    await user.click(stateInput());
    await user.paste("tx");

    expect(stateInput().value).toBe("Texas");
  });
});
