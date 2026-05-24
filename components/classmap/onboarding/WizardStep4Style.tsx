"use client";

import {
  CURRICULUM_APPROACHES,
  LEARNING_STYLES,
  type CurriculumApproach,
  type LearningStyle,
} from "@/lib/classmap/types";

const LEARNING_STYLE_LABELS: Record<LearningStyle, { label: string; hint: string }> = {
  visual: { label: "Visual", hint: "Learns from images, diagrams, demonstrations." },
  auditory: { label: "Auditory", hint: "Learns from listening and discussion." },
  kinesthetic: { label: "Kinesthetic", hint: "Learns from doing — hands on, movement." },
  "reading-writing": { label: "Reading / writing", hint: "Learns from text and note-taking." },
};

const APPROACH_LABELS: Record<CurriculumApproach, { label: string; hint: string }> = {
  classical: { label: "Classical", hint: "Trivium / quadrivium, Great Books." },
  "charlotte-mason": { label: "Charlotte Mason", hint: "Living books, narration, nature." },
  unschooling: { label: "Unschooling", hint: "Child-led, interest-driven." },
  eclectic: { label: "Eclectic", hint: "Piece together what works." },
  montessori: { label: "Montessori", hint: "Prepared environment, multi-age." },
  traditional: { label: "Traditional", hint: "School-at-home, standard sequence." },
};

export type Step4Value = {
  learningStyle: LearningStyle | "";
  curriculumApproach: CurriculumApproach | "";
};

export type WizardStep4StyleProps = {
  value: Step4Value;
  onChange: (next: Step4Value) => void;
};

export function WizardStep4Style({ value, onChange }: WizardStep4StyleProps) {
  return (
    <div data-slot="wizard-step-body">
      <header className="space-y-3 mb-8">
        <p className="kicker kicker--accent">Step 4 of 5</p>
        <h2 className="font-display text-[1.875rem] sm:text-[2.25rem] leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)]">
          How do they learn best?
        </h2>
        <p className="dek text-base sm:text-lg">
          Pick the closest fit for now — you can always adjust later.
        </p>
      </header>

      <fieldset className="grid gap-3 mb-8">
        <legend className="kicker text-[color:var(--ink-soft)] mb-2">
          Learning style
        </legend>
        {LEARNING_STYLES.map((style) => {
          const checked = value.learningStyle === style;
          return (
            <label
              key={style}
              className={`group flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                checked
                  ? "border-[color:var(--accent-ink)] bg-[color:var(--accent-ink)]/5"
                  : "border-[color:var(--rule)] hover:border-[color:var(--ink-faded)]"
              }`}
            >
              <input
                type="radio"
                name="learning-style"
                value={style}
                checked={checked}
                onChange={() => onChange({ ...value, learningStyle: style })}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block font-medium text-[color:var(--ink)]">
                  {LEARNING_STYLE_LABELS[style].label}
                </span>
                <span className="block text-sm text-[color:var(--ink-soft)] mt-0.5">
                  {LEARNING_STYLE_LABELS[style].hint}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="kicker text-[color:var(--ink-soft)] mb-2">
          Curriculum approach
        </legend>
        {CURRICULUM_APPROACHES.map((approach) => {
          const checked = value.curriculumApproach === approach;
          return (
            <label
              key={approach}
              className={`group flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                checked
                  ? "border-[color:var(--accent-ink)] bg-[color:var(--accent-ink)]/5"
                  : "border-[color:var(--rule)] hover:border-[color:var(--ink-faded)]"
              }`}
            >
              <input
                type="radio"
                name="curriculum-approach"
                value={approach}
                checked={checked}
                onChange={() =>
                  onChange({ ...value, curriculumApproach: approach })
                }
                className="mt-1"
              />
              <span className="flex-1">
                <span className="block font-medium text-[color:var(--ink)]">
                  {APPROACH_LABELS[approach].label}
                </span>
                <span className="block text-sm text-[color:var(--ink-soft)] mt-0.5">
                  {APPROACH_LABELS[approach].hint}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
