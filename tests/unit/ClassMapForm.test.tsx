import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClassMapForm } from "@/components/classmap/ClassMapForm";
import type { LessonPlanInput } from "@/lib/types";

function renderForm(overrides?: Partial<React.ComponentProps<typeof ClassMapForm>>) {
  const onSubmit = vi.fn<(values: LessonPlanInput) => void>();
  const user = userEvent.setup();
  const utils = render(<ClassMapForm onSubmit={onSubmit} {...overrides} />);
  return { onSubmit, user, ...utils };
}

const ageInput = () => screen.getByLabelText(/^age$/i) as HTMLInputElement;
const hoursInput = () => screen.getByLabelText(/hours per week/i) as HTMLInputElement;
const childNameInput = () =>
  screen.getByLabelText(/child name/i) as HTMLInputElement;
const notesInput = () =>
  screen.getByLabelText(/^notes/i) as HTMLTextAreaElement;
const submitBtn = () => screen.getByTestId("classmap-form-submit");

async function setNumber(user: ReturnType<typeof userEvent.setup>, el: HTMLInputElement, value: string) {
  await user.clear(el);
  if (value !== "") await user.type(el, value);
}

describe("ClassMapForm — render", () => {
  it("renders all expected fields and a submit button", () => {
    renderForm();
    expect(childNameInput()).toBeInTheDocument();
    expect(ageInput()).toBeInTheDocument();
    expect(screen.getByLabelText(/learning style/i)).toBeInTheDocument();
    // Regression for ISS-01: exactly one accessible group named "Subjects"
    // (the fieldset+legend). The inner div must not re-expose role/aria-label.
    expect(screen.getAllByRole("group", { name: /subjects/i })).toHaveLength(1);
    expect(hoursInput()).toBeInTheDocument();
    expect(screen.getByLabelText(/state or region/i)).toBeInTheDocument();
    expect(notesInput()).toBeInTheDocument();
    expect(submitBtn()).toBeEnabled();
  });

  it("respects submitLabel and busy state", () => {
    renderForm({ submitLabel: "Make my plan", submitting: true });
    const btn = submitBtn();
    expect(btn).toHaveTextContent(/generating/i);
    expect(btn).toBeDisabled();
  });
});

describe("ClassMapForm — happy path", () => {
  it("submits parsed LessonPlanInput from default values", async () => {
    const { onSubmit, user } = renderForm();
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const arg = onSubmit.mock.calls[0][0];
    expect(arg).toMatchObject({
      childAge: 8,
      learningStyle: "visual",
      subjects: expect.arrayContaining(["math", "reading"]),
      hoursPerWeek: 12,
    });
  });

  it("coerces empty optional strings to undefined before submit", async () => {
    const { onSubmit, user } = renderForm();
    // defaults leave childName/state/notes as empty strings; submit and inspect parsed values
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const arg = onSubmit.mock.calls[0][0];
    expect(arg.childName).toBeUndefined();
    expect(arg.state).toBeUndefined();
    expect(arg.notes).toBeUndefined();
  });

  it("passes through non-empty optional strings, trimmed", async () => {
    const { onSubmit, user } = renderForm();
    await user.type(childNameInput(), "  Mira  ");
    await user.type(screen.getByLabelText(/state or region/i), " CA ");
    await user.type(notesInput(), "loves dinosaurs");
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const arg = onSubmit.mock.calls[0][0];
    expect(arg.childName).toBe("Mira");
    expect(arg.state).toBe("CA");
    expect(arg.notes).toBe("loves dinosaurs");
  });
});

describe("ClassMapForm — validation blocks submit", () => {
  it("childAge below 3 → blocks submit", async () => {
    const { onSubmit, user } = renderForm();
    await setNumber(user, ageInput(), "2");
    await user.click(submitBtn());
    // give react-hook-form a tick to set errors
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(ageInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("childAge above 18 → blocks submit", async () => {
    const { onSubmit, user } = renderForm();
    await setNumber(user, ageInput(), "19");
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(ageInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("non-integer childAge (9.5) → blocks submit", async () => {
    const { onSubmit, user } = renderForm();
    await setNumber(user, ageInput(), "9.5");
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(ageInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("hoursPerWeek below 2 → blocks submit", async () => {
    const { onSubmit, user } = renderForm();
    await setNumber(user, hoursInput(), "1");
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(hoursInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("hoursPerWeek above 40 → blocks submit", async () => {
    const { onSubmit, user } = renderForm();
    await setNumber(user, hoursInput(), "41");
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(hoursInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("childName > 40 chars → blocks submit", async () => {
    const { onSubmit, user } = renderForm();
    await user.type(childNameInput(), "x".repeat(41));
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(childNameInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("notes > 500 chars → blocks submit", async () => {
    const { onSubmit, user } = renderForm();
    // typing 501 chars char-by-char would be slow; paste instead
    await user.click(notesInput());
    await user.paste("y".repeat(501));
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(notesInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("all subjects unchecked → blocks submit", async () => {
    const { onSubmit, user } = renderForm({ defaultValues: { subjects: [] } });
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    // subjects has no input with aria-invalid because it's a group; verify error message
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("ClassMapForm — defaultValues override", () => {
  it("respects supplied defaultValues", async () => {
    const { onSubmit, user } = renderForm({
      defaultValues: {
        childName: "Theo",
        childAge: 11,
        learningStyle: "kinesthetic",
        subjects: ["science", "art"],
        hoursPerWeek: 20,
        state: "NY",
      },
    });
    await user.click(submitBtn());
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const arg = onSubmit.mock.calls[0][0];
    expect(arg).toMatchObject({
      childName: "Theo",
      childAge: 11,
      learningStyle: "kinesthetic",
      subjects: expect.arrayContaining(["science", "art"]),
      hoursPerWeek: 20,
      state: "NY",
    });
  });
});
