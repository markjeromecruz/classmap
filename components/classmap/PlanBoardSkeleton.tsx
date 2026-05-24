import { Skeleton } from "@/components/ui/skeleton";
import { DAYS } from "@/lib/types";
import { cn } from "@/lib/utils";

import { DAY_LABELS } from "./subject-meta";

export type PlanBoardSkeletonProps = {
  className?: string;
  /** How many session cards to render per day. Defaults to 3. */
  sessionsPerDay?: number;
};

export function PlanBoardSkeleton({
  className,
  sessionsPerDay = 3,
}: PlanBoardSkeletonProps) {
  return (
    <section
      data-slot="plan-board-skeleton"
      aria-busy
      aria-live="polite"
      aria-label="Generating lesson plan"
      className={cn("space-y-6", className)}
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {DAYS.map((day) => (
          <div
            key={day}
            data-slot="plan-day-skeleton"
            className="flex flex-col gap-3 rounded-xl bg-muted/40 p-3"
          >
            <header className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold tracking-wide">
                {DAY_LABELS[day]}
              </h3>
              <Skeleton className="h-3 w-12" />
            </header>
            <ol className="flex flex-col gap-2">
              {Array.from({ length: sessionsPerDay }).map((_, i) => (
                <li
                  key={i}
                  className="space-y-2 rounded-xl border-l-4 border-l-muted bg-card/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
