"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SUBJECTS, type Subject } from "@/lib/classmap/types";

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

export type WizardStep5SubjectsProps = {
  value: Subject[];
  onChange: (next: Subject[]) => void;
};

export function WizardStep5Subjects({ value, onChange }: WizardStep5SubjectsProps) {
  function toggle(subject: Subject) {
    if (value.includes(subject)) {
      onChange(value.filter((s) => s !== subject));
    } else {
      onChange([...value, subject]);
    }
  }

  function move(subject: Subject, delta: -1 | 1) {
    const i = value.indexOf(subject);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div data-slot="wizard-step-body">
      <header className="space-y-3 mb-8">
        <p className="kicker kicker--accent">Step 5 of 5</p>
        <h2 className="font-display text-[1.875rem] sm:text-[2.25rem] leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)]">
          Which subjects matter most?
        </h2>
        <p className="dek text-base sm:text-lg">
          Pick the ones you want covered first, then drag-reorder them by
          priority.
        </p>
      </header>

      <fieldset className="mb-8">
        <legend className="kicker text-[color:var(--ink-soft)] mb-3">
          Subjects (pick at least one)
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUBJECTS.map((subject) => {
            const checked = value.includes(subject);
            return (
              <label
                key={subject}
                className={`group flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                  checked
                    ? "border-[color:var(--accent-ink)] bg-[color:var(--accent-ink)]/5"
                    : "border-[color:var(--rule)] hover:border-[color:var(--ink-faded)]"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(subject)}
                />
                <span className="font-medium text-[color:var(--ink)]">
                  {LABELS[subject]}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {value.length > 0 ? (
        <section>
          <p className="kicker text-[color:var(--ink-soft)] mb-3">
            Your priorities (top = first)
          </p>
          <ol className="space-y-2">
            {value.map((subject, i) => (
              <li
                key={subject}
                className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-[color:var(--rule)] bg-[color:var(--paper)] p-2 pl-4"
              >
                <span className="flex items-center gap-3">
                  <span className="kicker tabular text-[color:var(--ink-faded)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-[color:var(--ink)]">
                    {LABELS[subject]}
                  </span>
                </span>
                <span className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move ${LABELS[subject]} up`}
                    onClick={() => move(subject, -1)}
                    disabled={i === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move ${LABELS[subject]} down`}
                    onClick={() => move(subject, 1)}
                    disabled={i === value.length - 1}
                  >
                    ↓
                  </Button>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
