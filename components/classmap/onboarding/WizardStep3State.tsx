"use client";

import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATE_REQUIREMENTS } from "@/lib/classmap/state-requirements";

export type WizardStep3StateProps = {
  value: string;
  onChange: (next: string) => void;
};

export function WizardStep3State({ value, onChange }: WizardStep3StateProps) {
  const states = useMemo(
    () =>
      [...STATE_REQUIREMENTS].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const inputValue =
    states.find((s) => s.code === value)?.name ?? value;

  function handleChange(raw: string) {
    const exact = states.find(
      (s) => s.name.toLowerCase() === raw.toLowerCase(),
    );
    if (exact) {
      onChange(exact.code);
      return;
    }
    // Allow direct 2-letter typing as well
    const code = raw.trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(code) && states.some((s) => s.code === code)) {
      onChange(code);
      return;
    }
    onChange(""); // not yet a valid pick
  }

  return (
    <div data-slot="wizard-step-body">
      <header className="space-y-3 mb-8">
        <p className="kicker kicker--accent">Step 3 of 5</p>
        <h2 className="font-display text-[1.875rem] sm:text-[2.25rem] leading-[1.05] tracking-[-0.025em] text-[color:var(--ink)]">
          Which state?
        </h2>
        <p className="dek text-base sm:text-lg">
          We&rsquo;ll surface your state&rsquo;s homeschool reporting hints
          later.
        </p>
      </header>

      <div className="grid gap-1.5">
        <Label htmlFor="wizard-state">US state</Label>
        <Input
          id="wizard-state"
          list="wizard-state-options"
          autoComplete="address-level1"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          className="h-11"
          placeholder="Start typing your state"
        />
        <datalist id="wizard-state-options">
          {states.map((s) => (
            <option key={s.code} value={s.name}>
              {s.code}
            </option>
          ))}
        </datalist>
        <p className="kicker text-[color:var(--ink-faded)]">
          {value ? `Selected: ${value}` : "Pick from the list to continue."}
        </p>
      </div>
    </div>
  );
}
