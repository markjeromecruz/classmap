import Link from "next/link";

import { DevotionalView } from "@/components/patriarch/DevotionalView";
import { LiveDevotional } from "@/components/patriarch/LiveDevotional";
import { isDemoMode } from "@/lib/env";
import { getTodayDevotional } from "@/lib/patriarch-demo-data";

const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const metadata = {
  title: "Today — Patriarch",
  description: "Today's devotional reading.",
};

export default function PatriarchTodayPage() {
  const today = isDemoMode ? getTodayDevotional() : null;
  const date = longDate.format(new Date());

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-12 sm:py-20"
      data-slot="patriarch-today"
      data-mode={isDemoMode ? "demo" : "live"}
    >
      <Link
        href="/patriarch"
        className="kicker no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]"
      >
        ← back
      </Link>

      <p
        className="kicker tabular text-center text-[color:var(--ink-faded)] mt-8"
        data-slot="patriarch-today-date"
      >
        {date}
      </p>

      <div className="mt-8">
        {today ? <DevotionalView devotional={today} /> : <LiveDevotional />}
      </div>
    </main>
  );
}
