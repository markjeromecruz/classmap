import { cn } from "@/lib/utils";
import { DAYS, type LessonPlan } from "@/lib/types";

import { PlanCard } from "./PlanCard";
import { DAY_LABELS } from "./subject-meta";

export type PlanBoardProps = {
  plan: LessonPlan;
  className?: string;
};

export function PlanBoard({ plan, className }: PlanBoardProps) {
  const sessionsByDay = new Map(plan.days.map((d) => [d.day, d.sessions]));

  return (
    <section
      data-slot="plan-board"
      data-plan-id={plan.id}
      className={cn("space-y-6", className)}
      aria-label="Weekly lesson plan"
    >
      {plan.summary ? (
        <p
          data-slot="plan-summary"
          className="text-sm leading-relaxed text-muted-foreground"
        >
          {plan.summary}
        </p>
      ) : null}

      <div
        data-slot="plan-board-grid"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {DAYS.map((day) => {
          const sessions = sessionsByDay.get(day) ?? [];
          return (
            <div
              key={day}
              data-slot="plan-day"
              data-day={day}
              className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3"
            >
              <header className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold tracking-wide">
                  {DAY_LABELS[day]}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {sessions.length}{" "}
                  {sessions.length === 1 ? "session" : "sessions"}
                </span>
              </header>
              <ol className="flex flex-col gap-2">
                {sessions.map((session, idx) => (
                  <li key={`${day}-${idx}`}>
                    <PlanCard session={session} />
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
