import Link from "next/link";

import { AltarCard } from "@/components/patriarch/AltarCard";
import { FAMILY_ALTARS } from "@/lib/patriarch-demo-data";

export const metadata = {
  title: "Family altars — Patriarch",
  description: "Short, structured plans for family worship.",
};

export default function PatriarchAltarPage() {
  return (
    <main
      className="mx-auto max-w-5xl px-4 py-12 sm:py-20"
      data-slot="patriarch-altar"
    >
      <Link
        href="/patriarch"
        className="kicker no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]"
      >
        ← back
      </Link>

      <header className="mt-8 mb-12 border-b border-[color:var(--rule)] pb-8">
        <p className="kicker kicker--accent">For the family altar</p>
        <h1 className="font-display text-[2.5rem] sm:text-[3.5rem] leading-[0.98] tracking-[-0.03em] text-[color:var(--ink)] mt-3">
          Plans for tonight
        </h1>
        <p className="dek text-lg sm:text-xl mt-4 max-w-2xl">
          Short, structured plans for family worship. Pick one by the age you
          have at the table and the minutes you have on the clock.
        </p>
      </header>

      <section
        data-slot="altar-grid"
        data-count={FAMILY_ALTARS.length}
        className="grid gap-6 md:grid-cols-2"
        aria-label="Family altar plans"
      >
        {FAMILY_ALTARS.map((altar) => (
          <AltarCard key={altar.id} altar={altar} />
        ))}
      </section>
    </main>
  );
}
