"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { deletePlan, listSavedPlans } from "@/lib/storage";
import type { LessonPlan } from "@/lib/types";

import { PlanBoard } from "./PlanBoard";

export function SavedPlansList() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // SSR-safe localStorage hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlans(listSavedPlans());
    setHydrated(true);
  }, []);

  function handleDelete(id: string) {
    setPlans(deletePlan(id));
  }

  if (!hydrated) {
    return (
      <p
        data-slot="saved-plans-loading"
        className="text-sm text-muted-foreground"
      >
        Loading saved plans…
      </p>
    );
  }

  if (plans.length === 0) {
    return (
      <div
        data-slot="saved-plans-empty"
        className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          No saved plans yet. Generate one from{" "}
          <a className="underline" href="/classmap">
            ClassMap
          </a>{" "}
          and hit “Save plan”.
        </p>
      </div>
    );
  }

  return (
    <div
      data-slot="saved-plans-list"
      data-count={plans.length}
      className="space-y-10"
    >
      {plans.map((plan) => (
        <article
          key={plan.id}
          data-slot="saved-plan"
          data-plan-id={plan.id}
          className="space-y-3"
        >
          <header className="flex items-baseline justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-lg font-semibold tracking-tight">
                {plan.input.childName
                  ? `${plan.input.childName}'s week`
                  : "Saved plan"}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  age {plan.input.childAge}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Saved{" "}
                <time dateTime={plan.createdAt}>
                  {new Date(plan.createdAt).toLocaleString()}
                </time>
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(plan.id)}
              data-testid="saved-plan-delete"
            >
              Delete
            </Button>
          </header>
          <PlanBoard plan={plan} />
        </article>
      ))}
    </div>
  );
}
