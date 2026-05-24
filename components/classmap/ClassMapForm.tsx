"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  LEARNING_STYLES,
  SUBJECTS,
  lessonPlanInputSchema,
  type LessonPlanInput,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const LEARNING_STYLE_LABELS: Record<(typeof LEARNING_STYLES)[number], string> = {
  visual: "Visual",
  auditory: "Auditory",
  kinesthetic: "Kinesthetic",
  "reading-writing": "Reading / Writing",
};

const SUBJECT_LABELS: Record<(typeof SUBJECTS)[number], string> = {
  math: "Math",
  reading: "Reading",
  writing: "Writing",
  science: "Science",
  history: "History",
  geography: "Geography",
  art: "Art",
  music: "Music",
  "physical-education": "Physical Education",
  "foreign-language": "Foreign Language",
};

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export type ClassMapFormProps = {
  defaultValues?: Partial<LessonPlanInput>;
  onSubmit: (values: LessonPlanInput) => void | Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
};

export function ClassMapForm({
  defaultValues,
  onSubmit,
  submitting = false,
  submitLabel = "Generate plan",
}: ClassMapFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LessonPlanInput>({
    resolver: zodResolver(lessonPlanInputSchema),
    mode: "onBlur",
    defaultValues: {
      childName: "",
      childAge: 8,
      learningStyle: "visual",
      subjects: ["math", "reading"],
      hoursPerWeek: 12,
      state: "",
      notes: "",
      ...defaultValues,
    },
  });

  const busy = submitting || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
      data-testid="classmap-form"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="childName">Child name (optional)</Label>
        <Input
          id="childName"
          placeholder="e.g. Mira"
          aria-invalid={errors.childName ? true : undefined}
          {...register("childName", { setValueAs: emptyToUndefined })}
        />
        <FieldError message={errors.childName?.message} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="childAge">Age</Label>
        <Input
          id="childAge"
          type="number"
          inputMode="numeric"
          min={3}
          max={18}
          aria-invalid={errors.childAge ? true : undefined}
          {...register("childAge", { valueAsNumber: true })}
        />
        <FieldError message={errors.childAge?.message} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="learningStyle">Learning style</Label>
        <Controller
          control={control}
          name="learningStyle"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="learningStyle"
                className="w-full"
                aria-invalid={errors.learningStyle ? true : undefined}
              >
                <SelectValue placeholder="Choose a style" />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_STYLES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {LEARNING_STYLE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.learningStyle?.message} />
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium leading-none">Subjects</legend>
        <Controller
          control={control}
          name="subjects"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUBJECTS.map((s) => {
                const checked = field.value?.includes(s) ?? false;
                return (
                  <Label key={s} className="cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) => {
                        const current = field.value ?? [];
                        const updated = next
                          ? Array.from(new Set([...current, s]))
                          : current.filter((v) => v !== s);
                        field.onChange(updated);
                      }}
                    />
                    <span>{SUBJECT_LABELS[s]}</span>
                  </Label>
                );
              })}
            </div>
          )}
        />
        <FieldError message={errors.subjects?.message as string | undefined} />
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor="hoursPerWeek">Hours per week</Label>
        <Input
          id="hoursPerWeek"
          type="number"
          inputMode="numeric"
          min={2}
          max={40}
          aria-invalid={errors.hoursPerWeek ? true : undefined}
          {...register("hoursPerWeek", { valueAsNumber: true })}
        />
        <FieldError message={errors.hoursPerWeek?.message} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="state">State or region (optional)</Label>
        <Input
          id="state"
          placeholder="e.g. California"
          aria-invalid={errors.state ? true : undefined}
          {...register("state", { setValueAs: emptyToUndefined })}
        />
        <FieldError message={errors.state?.message} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          rows={4}
          placeholder="Anything else the planner should know"
          aria-invalid={errors.notes ? true : undefined}
          {...register("notes", { setValueAs: emptyToUndefined })}
        />
        <FieldError message={errors.notes?.message} />
      </div>

      <Button type="submit" disabled={busy} data-testid="classmap-form-submit">
        {busy ? "Generating…" : submitLabel}
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}
