"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { isDemoMode, SITE_BASE_PATH } from "@/lib/env";
import { getDemoPlan } from "@/lib/demo-data";
import { isPlanSaved, savePlan } from "@/lib/storage";
import type { LessonPlan, LessonPlanInput } from "@/lib/types";

import { ClassMapForm } from "./ClassMapForm";
import { PlanBoard } from "./PlanBoard";
import { PlanBoardSkeleton } from "./PlanBoardSkeleton";

type Status = "idle" | "loading" | "success" | "error";

async function postToApi(input: LessonPlanInput): Promise<LessonPlan> {
  const res = await fetch(`${SITE_BASE_PATH}/classmap/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as LessonPlan;
}

export type ClassMapFlowProps = {
  /** Force-disable the API path; useful for tests/Storybook regardless of env. */
  forceDemo?: boolean;
};

export function ClassMapFlow({ forceDemo }: ClassMapFlowProps = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const useDemo = forceDemo ?? isDemoMode;

  useEffect(() => {
    // SSR-safe: isPlanSaved touches localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(plan ? isPlanSaved(plan.id) : false);
  }, [plan]);

  async function handleSubmit(input: LessonPlanInput) {
    setStatus("loading");
    setError(null);
    try {
      const result = useDemo ? getDemoPlan(input) : await postToApi(input);
      setPlan(result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  function handleReset() {
    setPlan(null);
    setError(null);
    setStatus("idle");
    setSaved(false);
  }

  function handleSave() {
    if (!plan) return;
    savePlan(plan);
    setSaved(true);
  }

  return (
    <div data-slot="classmap-flow" data-status={status} className="space-y-8">
      <section
        data-slot="classmap-flow-form"
        className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8"
        aria-busy={status === "loading" || undefined}
      >
        <header className="mb-6 space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Plan your week
          </h2>
          <p className="text-sm text-muted-foreground">
            {useDemo
              ? "Demo mode — submitting returns a canned plan instantly."
              : "Submit your child's profile to generate a 5-day plan."}
          </p>
        </header>
        <ClassMapForm
          onSubmit={handleSubmit}
          submitting={status === "loading"}
          submitLabel={plan ? "Regenerate plan" : "Generate plan"}
        />
      </section>

      {status === "loading" ? <PlanBoardSkeleton /> : null}

      {status === "error" && error ? (
        <Alert
          variant="destructive"
          data-slot="classmap-flow-error"
          className="bg-destructive/10"
        >
          <AlertTitle>Couldn&rsquo;t generate a plan.</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === "success" && plan ? (
        <section
          data-slot="classmap-flow-result"
          className="space-y-4"
          aria-label="Generated lesson plan"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Your plan</h2>
            <div className="flex items-center gap-1">
              <Button
                variant={saved ? "secondary" : "default"}
                size="sm"
                onClick={handleSave}
                disabled={saved}
                data-testid="classmap-flow-save"
              >
                {saved ? "Saved" : "Save plan"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Clear
              </Button>
            </div>
          </div>
          <PlanBoard plan={plan} />
        </section>
      ) : null}
    </div>
  );
}
