import Link from "next/link";

import {
  FAMILY_ALTARS,
  getTodayDevotional,
} from "@/lib/patriarch-demo-data";

export const metadata = {
  title: "Patriarch — a quiet daily devotional",
  description:
    "A daily reading and a family altar plan. Austere. Unhurried. For the head of the household.",
};

const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" });

export default function PatriarchLandingPage() {
  const today = getTodayDevotional();
  const now = new Date();

  return (
    <main
      className="mx-auto max-w-4xl px-4 py-16 sm:py-24"
      data-slot="patriarch-landing"
    >
      <Link
        href="/"
        className="kicker no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]"
      >
        ← back to portfolio
      </Link>

      <header className="mt-10 mb-16 text-center">
        <p
          className="kicker tabular text-[color:var(--ink-faded)]"
          data-slot="patriarch-day"
        >
          {dayOfWeek.format(now)} · {longDate.format(now)}
        </p>
        <h1 className="font-display text-[3.5rem] sm:text-[5rem] leading-[0.92] tracking-[-0.035em] text-[color:var(--ink)] mt-6">
          Patriarch
        </h1>
        <p className="dek text-lg sm:text-xl mt-6 max-w-xl mx-auto">
          A quiet daily reading and a plan for the family altar. For the head
          of the household.
        </p>
      </header>

      <section
        data-slot="patriarch-today-card"
        className="border-y border-[color:var(--ink)] py-10 mb-16"
      >
        <p className="kicker kicker--accent text-center">Today&rsquo;s reading</p>
        <h2 className="font-display italic text-[2rem] sm:text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-center text-[color:var(--ink)] mt-5">
          {today.theme}
        </h2>
        <p
          className="kicker tabular text-center text-[color:var(--ink-faded)] mt-4"
          data-slot="patriarch-today-reference"
        >
          {today.scriptureReference}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3">
          <Link
            href="/patriarch/today"
            data-slot="patriarch-today-link"
            className="font-display italic text-[color:var(--accent-ink)] text-lg no-underline border-b border-[color:var(--accent-ink)] pb-0.5 hover:translate-y-[-1px] transition-transform inline-block"
          >
            Read today &rarr;
          </Link>
          <Link
            href="/patriarch/altar"
            data-slot="patriarch-altar-link"
            className="font-display italic text-[color:var(--ink-soft)] text-lg no-underline border-b border-[color:var(--rule)] pb-0.5 hover:text-[color:var(--ink)] hover:border-[color:var(--ink)] inline-block"
          >
            Family altar plans
          </Link>
        </div>
      </section>

      <footer className="text-center pt-2">
        <p className="kicker text-[color:var(--ink-faded)]">
          {FAMILY_ALTARS.length} altar plans &middot; demo edition
        </p>
      </footer>
    </main>
  );
}
