import Link from "next/link";

import type { FamilyAltar } from "@/lib/patriarch-types";

export type AltarCardProps = {
  altar: FamilyAltar;
  basePath?: string;
};

export function AltarCard({ altar, basePath = "/patriarch" }: AltarCardProps) {
  return (
    <Link
      href={`${basePath}/altar/${altar.id}`}
      className="block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--paper)]"
      data-slot="altar-card"
      data-altar-id={altar.id}
    >
      <article className="group relative flex h-full flex-col bg-[color:var(--paper)] p-6 sm:p-7 border border-[color:var(--rule)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_oklch(0.2_0.02_60/0.35)]">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <p className="kicker kicker--accent">{altar.ageRange}</p>
          <p className="kicker tabular text-[color:var(--ink-faded)]">
            {altar.minutes} min
          </p>
        </div>

        <hr className="rule mb-4" />

        <h2 className="font-display text-[1.5rem] sm:text-[1.75rem] leading-[1.05] tracking-[-0.02em] text-[color:var(--ink)] mb-3">
          {altar.title}
        </h2>

        <p className="dek text-base mb-4">{altar.scripture.reference}</p>

        <p className="text-[14px] leading-[1.6] text-[color:var(--ink-soft)] flex-1">
          {altar.openingQuestion}
        </p>

        <div className="mt-5 pt-4 border-t border-[color:var(--rule)] flex items-center justify-between">
          <span className="kicker text-[color:var(--ink-faded)]">
            Open the plan
          </span>
          <span
            className="font-display italic text-[color:var(--accent-ink)] text-base inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          >
            ⟶
          </span>
        </div>
      </article>
    </Link>
  );
}
