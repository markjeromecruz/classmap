"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GRADES = [
  "Pre-K",
  "K",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
] as const;

export type Step2Value = {
  age: number;
  grade: string;
};

export type WizardStep2AgeGradeProps = {
  value: Step2Value;
  onChange: (next: Step2Value) => void;
};

export function WizardStep2AgeGrade({ value, onChange }: WizardStep2AgeGradeProps) {
  return (
    <div data-slot="wizard-step-body">
      <header className="space-y-3 mb-8">
        <p className="kicker kicker--accent">Step 2 of 5</p>
        <h2 className="font-display text-[1.875rem] sm:text-[2.25rem] leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)]">
          How old, and what year?
        </h2>
        <p className="dek text-base sm:text-lg">
          Age and grade help us calibrate pace and reading level.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="wizard-child-age">Age</Label>
          <Input
            id="wizard-child-age"
            type="number"
            inputMode="numeric"
            min={3}
            max={18}
            value={Number.isFinite(value.age) ? value.age : ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...value, age: Number.isFinite(n) ? n : NaN });
            }}
            className="h-11"
            placeholder="8"
          />
          <p className="kicker text-[color:var(--ink-faded)]">3 to 18.</p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="wizard-child-grade">Grade</Label>
          <Select
            value={value.grade}
            onValueChange={(grade) =>
              onChange({ ...value, grade: grade ?? "" })
            }
          >
            <SelectTrigger id="wizard-child-grade" className="h-11 w-full">
              <SelectValue placeholder="Choose a grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
