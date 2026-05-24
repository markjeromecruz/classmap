"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type WizardStep1NameProps = {
  value: string;
  onChange: (next: string) => void;
};

export function WizardStep1Name({ value, onChange }: WizardStep1NameProps) {
  return (
    <div data-slot="wizard-step-body">
      <header className="space-y-3 mb-8">
        <p className="kicker kicker--accent">Step 1 of 5</p>
        <h2 className="font-display text-[1.875rem] sm:text-[2.25rem] leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)]">
          Who are we planning for?
        </h2>
        <p className="dek text-base sm:text-lg">
          A first name is enough. You can add more children after onboarding.
        </p>
      </header>

      <div className="grid gap-1.5">
        <Label htmlFor="wizard-child-name">Child&rsquo;s first name</Label>
        <Input
          id="wizard-child-name"
          autoFocus
          autoComplete="given-name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={40}
          className="h-11"
          placeholder="e.g. Mira"
        />
        <p className="kicker text-[color:var(--ink-faded)]">
          1 to 40 characters.
        </p>
      </div>
    </div>
  );
}
