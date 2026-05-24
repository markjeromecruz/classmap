import { getStateRequirement } from "@/lib/classmap/state-requirements";
import type { Child } from "@/lib/classmap/types";

export type ChildCardProps = {
  child: Child;
};

const APPROACH_LABELS: Record<Child["curriculumApproach"], string> = {
  classical: "Classical",
  "charlotte-mason": "Charlotte Mason",
  unschooling: "Unschooling",
  eclectic: "Eclectic",
  montessori: "Montessori",
  traditional: "Traditional",
};

const STYLE_LABELS: Record<Child["learningStyle"], string> = {
  visual: "Visual",
  auditory: "Auditory",
  kinesthetic: "Kinesthetic",
  "reading-writing": "Reading / writing",
};

function initial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export function ChildCard({ child }: ChildCardProps) {
  const req = getStateRequirement(child.state);

  return (
    <article
      data-slot="child-card"
      data-child-id={child.id}
      className="flex flex-col gap-4 rounded-xl border border-[color:var(--rule)] bg-[color:var(--paper)] p-5 sm:p-6"
    >
      <header className="flex items-start gap-4">
        <span
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-full font-display text-2xl text-[color:var(--paper)]"
          style={{ backgroundColor: child.avatarColor }}
        >
          {initial(child.name)}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-[1.5rem] leading-[1.1] tracking-[-0.02em] text-[color:var(--ink)] truncate">
            {child.name}
          </h2>
          <p className="kicker text-[color:var(--ink-faded)] mt-1">
            Age {child.age} · {child.grade} · {child.state}
          </p>
        </div>
      </header>

      <dl className="grid grid-cols-3 gap-3 border-y border-[color:var(--rule)] py-3">
        <div>
          <dt className="kicker text-[color:var(--ink-faded)]">XP</dt>
          <dd
            data-slot="child-xp"
            className="font-display text-xl tabular text-[color:var(--ink)] mt-0.5"
          >
            {child.xpTotal.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="kicker text-[color:var(--ink-faded)]">Streak</dt>
          <dd
            data-slot="child-streak"
            className="font-display text-xl tabular text-[color:var(--ink)] mt-0.5"
          >
            {child.streakDays}d
          </dd>
        </div>
        <div>
          <dt className="kicker text-[color:var(--ink-faded)]">Badges</dt>
          <dd
            data-slot="child-badges"
            className="font-display text-xl tabular text-[color:var(--ink)] mt-0.5"
          >
            {child.badges.length}
          </dd>
        </div>
      </dl>

      <p className="text-sm text-[color:var(--ink-soft)]">
        <span className="kicker text-[color:var(--ink-faded)] mr-2">
          Style
        </span>
        {STYLE_LABELS[child.learningStyle]}
        <span className="text-[color:var(--rule)] mx-2">·</span>
        <span className="kicker text-[color:var(--ink-faded)] mr-2">
          Approach
        </span>
        {APPROACH_LABELS[child.curriculumApproach]}
      </p>

      <details
        data-slot="child-state-req"
        className="group/req border-t border-[color:var(--rule)] pt-3"
      >
        <summary className="kicker text-[color:var(--accent-ink)] cursor-pointer list-none flex items-center justify-between min-h-11">
          <span>
            {req
              ? `${req.name} homeschool requirements`
              : `${child.state} requirements`}
          </span>
          <span
            aria-hidden
            className="transition-transform group-open/req:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="mt-3 space-y-2 text-sm">
          {req ? (
            <>
              <p className="text-[color:var(--ink-soft)]">
                <span className="kicker text-[color:var(--ink-faded)] mr-2">
                  Hours / yr
                </span>
                {req.hoursPerYear ?? "Not specified"}
              </p>
              <p className="text-[color:var(--ink-soft)]">
                <span className="kicker text-[color:var(--ink-faded)] mr-2">
                  Portfolio
                </span>
                {req.portfolioRequired ? "Required" : "Not required"}
              </p>
              <p className="text-[color:var(--ink-soft)]">
                <span className="kicker text-[color:var(--ink-faded)] mr-2">
                  Testing
                </span>
                {req.testingRequired ? "Required" : "Not required"}
              </p>
              <p className="text-[color:var(--ink-soft)]">
                <span className="kicker text-[color:var(--ink-faded)] mr-2">
                  Intent filing
                </span>
                {req.notificationOfIntent ? "Required" : "Not required"}
              </p>
              <p className="text-[color:var(--ink-soft)] leading-[1.55] pt-1">
                {req.notes}
              </p>
            </>
          ) : (
            <p className="text-[color:var(--ink-faded)] italic">
              No requirements summary on file for {child.state}.
            </p>
          )}
        </div>
      </details>
    </article>
  );
}
