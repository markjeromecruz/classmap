import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OnboardingWizard } from "@/components/classmap/onboarding/OnboardingWizard";
import { loadState } from "@/lib/classmap/db";
import { ageBandFor, avatarColorFor } from "@/lib/classmap/types";

// Mock next/navigation at the router boundary only. lib/classmap/db is real and
// writes to jsdom's window.localStorage.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
}));

beforeEach(() => {
  window.localStorage.clear();
  pushMock.mockReset();
});

// ----- small selector helpers ---------------------------------------------

const wizard = () =>
  document.querySelector('[data-slot="wizard"]') as HTMLElement;
const stepBody = () =>
  document.querySelector('[data-slot="wizard-step-body"]') as HTMLElement;
const wizardNav = () =>
  document.querySelector('[data-slot="wizard-nav"]') as HTMLElement | null;
const wizardError = () =>
  document.querySelector('[data-slot="wizard-error"]') as HTMLElement | null;
const backBtn = () => screen.getByTestId("wizard-back") as HTMLButtonElement;
const nextBtn = () => screen.getByTestId("wizard-next") as HTMLButtonElement;

/**
 * Drive a single step's inputs to a valid state. Reads inputs from the live
 * wizard-step-body so we don't deep-test step internals beyond what's needed
 * for the orchestrator to advance.
 */
async function fillStep1(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = within(stepBody()).getByLabelText(/child.+first name/i);
  await user.clear(input);
  await user.type(input, name);
}

async function fillStep2(
  user: ReturnType<typeof userEvent.setup>,
  age: number,
  grade: string,
) {
  const body = stepBody();
  const ageInput = within(body).getByLabelText(/^age$/i) as HTMLInputElement;
  await user.clear(ageInput);
  await user.type(ageInput, String(age));
  // Grade is a shadcn Select. The trigger has id=wizard-child-grade and
  // role=combobox; opening it surfaces the items by name.
  const trigger = within(body).getByRole("combobox");
  await user.click(trigger);
  // SelectContent renders into a portal; query at document level.
  const option = await screen.findByRole("option", { name: new RegExp(`^${grade}$`, "i") });
  await user.click(option);
}

async function fillStep3(
  user: ReturnType<typeof userEvent.setup>,
  fullStateName: string,
) {
  const input = within(stepBody()).getByLabelText(/us state/i) as HTMLInputElement;
  await user.clear(input);
  // Step3 maps an exact state name → 2-letter code. Partial keystrokes
  // (each parent re-render starts fresh) all match nothing and emit "".
  // Use paste() to deliver the full string in one input event so the
  // exact-name match succeeds.
  await user.click(input);
  await user.paste(fullStateName);
}

async function fillStep4(
  user: ReturnType<typeof userEvent.setup>,
  learningStyleLabel: RegExp,
  approachLabel: RegExp,
) {
  const body = stepBody();
  // Each option is a <label> wrapping a radio with the visible label text.
  await user.click(within(body).getByText(learningStyleLabel));
  await user.click(within(body).getByText(approachLabel));
}

async function fillStep5(
  user: ReturnType<typeof userEvent.setup>,
  subjectLabels: RegExp[],
) {
  const body = stepBody();
  for (const label of subjectLabels) {
    await user.click(within(body).getByText(label));
  }
}

// --------------------------------------------------------------------------

describe("OnboardingWizard — initial render", () => {
  it("renders wizard slot at data-step=1 with Back disabled and Next labeled 'Next'", () => {
    render(<OnboardingWizard />);

    const root = wizard();
    expect(root).not.toBeNull();
    expect(root.getAttribute("data-step")).toBe("1");

    // Back is rendered (per contract: disabled OR hidden on step 1). This
    // orchestrator implements the disabled variant.
    const back = backBtn();
    expect(back).toBeDisabled();

    // Next button is labeled "Next" (not "Finish") on step 1.
    const next = nextBtn();
    expect(next.textContent ?? "").toMatch(/next/i);
    expect(next.textContent ?? "").not.toMatch(/finish/i);

    // Nav slot is present.
    expect(wizardNav()).not.toBeNull();

    // No error on first render.
    expect(wizardError()).toBeNull();
  });
});

describe("OnboardingWizard — validation gate", () => {
  it("Next on step 1 with empty name does NOT advance and the button is disabled", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard />);

    // Empty name → step is invalid → Next is disabled by the orchestrator.
    expect(nextBtn()).toBeDisabled();
    // userEvent.click on a disabled button is a no-op (jsdom).
    await user.click(nextBtn());
    expect(wizard().getAttribute("data-step")).toBe("1");

    // Now type a valid name → Next becomes enabled and advances.
    await fillStep1(user, "Ada");
    await waitFor(() => expect(nextBtn()).toBeEnabled());
    await user.click(nextBtn());

    await waitFor(() =>
      expect(wizard().getAttribute("data-step")).toBe("2"),
    );
    // Any prior error slot is cleared.
    expect(wizardError()).toBeNull();
  });
});

describe("OnboardingWizard — back navigation", () => {
  it("advances to step 2, Back returns to step 1, and step-1 input is preserved", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard />);

    await fillStep1(user, "Ada");
    await waitFor(() => expect(nextBtn()).toBeEnabled());
    await user.click(nextBtn());
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("2"));

    // Back to step 1.
    expect(backBtn()).toBeEnabled();
    await user.click(backBtn());
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("1"));

    // Step-1 value preserved.
    const nameInput = within(stepBody()).getByLabelText(
      /child.+first name/i,
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("Ada");
  });
});

describe("OnboardingWizard — full happy path", () => {
  it("steps 1→5, Finish creates a Child with derived fields and routes to /classmap/today", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard />);

    // Step 1
    expect(wizard().getAttribute("data-step")).toBe("1");
    expect(wizardNav()).not.toBeNull();
    await fillStep1(user, "Ada");
    await waitFor(() => expect(nextBtn()).toBeEnabled());
    await user.click(nextBtn());

    // Step 2
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("2"));
    expect(wizardNav()).not.toBeNull();
    await fillStep2(user, 9, "4th");
    await waitFor(() => expect(nextBtn()).toBeEnabled());
    await user.click(nextBtn());

    // Step 3
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("3"));
    expect(wizardNav()).not.toBeNull();
    await fillStep3(user, "California");
    await waitFor(() => expect(nextBtn()).toBeEnabled());
    await user.click(nextBtn());

    // Step 4
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("4"));
    expect(wizardNav()).not.toBeNull();
    await fillStep4(user, /^Visual$/, /^Eclectic$/);
    await waitFor(() => expect(nextBtn()).toBeEnabled());
    await user.click(nextBtn());

    // Step 5 — Next becomes "Finish"
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("5"));
    expect(wizardNav()).not.toBeNull();
    await fillStep5(user, [/^Math$/, /^Reading$/]);
    await waitFor(() => expect(nextBtn()).toBeEnabled());
    expect(nextBtn().textContent ?? "").toMatch(/finish/i);

    // Finish
    await user.click(nextBtn());

    // Router push to /classmap/today
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/classmap/today"),
    );

    // db.createChild persisted exactly one child via real localStorage.
    const state = loadState();
    expect(state.children).toHaveLength(1);

    const child = state.children[0];
    expect(child.name).toBe("Ada");
    expect(child.age).toBe(9);
    expect(child.grade).toBe("4th");
    expect(child.state).toBe("CA");
    expect(child.learningStyle).toBe("visual");
    expect(child.curriculumApproach).toBe("eclectic");
    expect(child.prioritySubjects).toEqual(
      expect.arrayContaining(["math", "reading"]),
    );

    // Derived fields.
    expect(child.ageBand).toBe("upper"); // age 9 → upper (9-12)
    expect(child.ageBand).toBe(ageBandFor(9));
    expect(child.avatarColor).toBe(avatarColorFor(child.id));
  });
});

describe("OnboardingWizard — wizard-nav slot", () => {
  it("wizard-nav is present at every step (1..5)", async () => {
    const user = userEvent.setup();
    render(<OnboardingWizard />);

    expect(wizardNav()).not.toBeNull();
    expect(wizard().getAttribute("data-step")).toBe("1");

    await fillStep1(user, "Ada");
    await user.click(nextBtn());
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("2"));
    expect(wizardNav()).not.toBeNull();

    await fillStep2(user, 9, "4th");
    await user.click(nextBtn());
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("3"));
    expect(wizardNav()).not.toBeNull();

    await fillStep3(user, "California");
    await user.click(nextBtn());
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("4"));
    expect(wizardNav()).not.toBeNull();

    await fillStep4(user, /^Visual$/, /^Eclectic$/);
    await user.click(nextBtn());
    await waitFor(() => expect(wizard().getAttribute("data-step")).toBe("5"));
    expect(wizardNav()).not.toBeNull();
  });
});
