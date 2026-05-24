"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { createChild } from "@/lib/classmap/db";
import {
  CURRICULUM_APPROACHES,
  LEARNING_STYLES,
  SUBJECTS,
  type CurriculumApproach,
  type LearningStyle,
  type Subject,
} from "@/lib/classmap/types";

import { WizardStep1Name } from "./WizardStep1Name";
import {
  WizardStep2AgeGrade,
  type Step2Value,
} from "./WizardStep2AgeGrade";
import { WizardStep3State } from "./WizardStep3State";
import {
  WizardStep4Style,
  type Step4Value,
} from "./WizardStep4Style";
import { WizardStep5Subjects } from "./WizardStep5Subjects";

type Draft = {
  name: string;
  ageGrade: Step2Value;
  state: string;
  style: Step4Value;
  subjects: Subject[];
};

const TOTAL_STEPS = 5;

function emptyDraft(): Draft {
  return {
    name: "",
    ageGrade: { age: NaN, grade: "" },
    state: "",
    style: { learningStyle: "", curriculumApproach: "" },
    subjects: [],
  };
}

function isStepValid(step: number, d: Draft): boolean {
  switch (step) {
    case 1:
      return d.name.trim().length >= 1 && d.name.trim().length <= 40;
    case 2:
      return (
        Number.isFinite(d.ageGrade.age) &&
        d.ageGrade.age >= 3 &&
        d.ageGrade.age <= 18 &&
        d.ageGrade.grade.trim().length > 0
      );
    case 3:
      return /^[A-Z]{2}$/.test(d.state);
    case 4:
      return (
        (LEARNING_STYLES as readonly string[]).includes(d.style.learningStyle) &&
        (CURRICULUM_APPROACHES as readonly string[]).includes(
          d.style.curriculumApproach,
        )
      );
    case 5:
      return d.subjects.length >= 1 && d.subjects.length <= SUBJECTS.length;
    default:
      return false;
  }
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const valid = isStepValid(step, draft);

  function handleNext() {
    setError(null);
    if (!valid) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    // Final step → createChild + redirect.
    setSubmitting(true);
    try {
      createChild({
        name: draft.name.trim(),
        age: draft.ageGrade.age,
        grade: draft.ageGrade.grade,
        state: draft.state,
        learningStyle: draft.style.learningStyle as LearningStyle,
        curriculumApproach: draft.style.curriculumApproach as CurriculumApproach,
        prioritySubjects: draft.subjects,
      });
      router.push("/classmap/today");
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Couldn’t save the child.");
    }
  }

  function handleBack() {
    setError(null);
    if (step > 1) setStep(step - 1);
  }

  return (
    <section
      data-slot="wizard"
      data-step={step}
      className="mx-auto w-full max-w-xl space-y-8"
    >
      {/* Progress dots */}
      <ol
        aria-label="Onboarding progress"
        className="flex items-center justify-center gap-2"
      >
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const isCurrent = n === step;
          const isDone = n < step;
          return (
            <li key={n}>
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={`block h-1.5 w-8 rounded-full transition-colors ${
                  isDone
                    ? "bg-[color:var(--accent-clay)]"
                    : isCurrent
                    ? "bg-[color:var(--ink)]"
                    : "bg-[color:var(--rule)]"
                }`}
              />
            </li>
          );
        })}
      </ol>

      {step === 1 ? (
        <WizardStep1Name
          value={draft.name}
          onChange={(name) => setDraft((d) => ({ ...d, name }))}
        />
      ) : null}
      {step === 2 ? (
        <WizardStep2AgeGrade
          value={draft.ageGrade}
          onChange={(ageGrade) => setDraft((d) => ({ ...d, ageGrade }))}
        />
      ) : null}
      {step === 3 ? (
        <WizardStep3State
          value={draft.state}
          onChange={(state) => setDraft((d) => ({ ...d, state }))}
        />
      ) : null}
      {step === 4 ? (
        <WizardStep4Style
          value={draft.style}
          onChange={(style) => setDraft((d) => ({ ...d, style }))}
        />
      ) : null}
      {step === 5 ? (
        <WizardStep5Subjects
          value={draft.subjects}
          onChange={(subjects) => setDraft((d) => ({ ...d, subjects }))}
        />
      ) : null}

      {error ? (
        <Alert variant="destructive" data-slot="wizard-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div
        data-slot="wizard-nav"
        className="flex items-center justify-between gap-3 pt-4 border-t border-[color:var(--rule)]"
      >
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-4"
          onClick={handleBack}
          disabled={step === 1 || submitting}
          data-testid="wizard-back"
        >
          ← Back
        </Button>
        <p className="kicker tabular text-[color:var(--ink-faded)]">
          Step {step} of {TOTAL_STEPS}
        </p>
        <Button
          type="button"
          className="h-11 px-5 bg-[color:var(--accent-clay)] text-white hover:bg-[color:var(--accent-clay)]/90"
          onClick={handleNext}
          disabled={!valid || submitting}
          data-testid="wizard-next"
        >
          {submitting
            ? "Saving…"
            : step === TOTAL_STEPS
            ? "Finish"
            : "Next →"}
        </Button>
      </div>
    </section>
  );
}
