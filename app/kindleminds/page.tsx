import Link from "next/link";

import { RoomCard } from "@/components/kindleminds/RoomCard";
import { ROOMS } from "@/lib/kindleminds-demo-data";

export const metadata = {
  title: "KindleMinds — a quiet forum for homeschoolers",
  description:
    "Five rooms organized by curriculum tradition. A reading room, not a feed.",
};

const todayLong = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function KindleMindsLandingPage() {
  const issueDate = todayLong.format(new Date());

  return (
    <main
      className="mx-auto max-w-6xl px-4 py-10 sm:py-16"
      data-slot="kindleminds-landing"
    >
      <Link
        href="/"
        className="kicker no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]"
      >
        ← back to portfolio
      </Link>

      <header className="mt-6 mb-10 border-b-2 border-[color:var(--ink)] pb-8">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <p className="kicker kicker--accent">Vol. I · Edition 01</p>
          <p className="kicker tabular text-[color:var(--ink-faded)]">
            {issueDate}
          </p>
        </div>
        <h1 className="font-display text-[3rem] sm:text-[4.25rem] leading-[0.94] tracking-[-0.03em] text-[color:var(--ink)]">
          KindleMinds
        </h1>
        <p className="dek text-lg sm:text-xl mt-4 max-w-2xl">
          A quiet forum for homeschooling parents. Five rooms, organized by
          tradition. A reading room, not a feed.
        </p>
      </header>

      <section
        aria-label="Rooms"
        data-slot="rooms-grid"
        data-count={ROOMS.length}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {ROOMS.map((room, idx) => (
          <RoomCard key={room.slug} room={room} index={idx + 1} />
        ))}
      </section>

      <footer className="mt-16 pt-8 border-t border-[color:var(--rule)] flex flex-wrap items-baseline justify-between gap-4">
        <p className="kicker text-[color:var(--ink-faded)]">
          Demo edition · no real accounts
        </p>
        <p className="kicker text-[color:var(--ink-faded)]">
          {ROOMS.reduce((n, r) => n + r.members, 0).toLocaleString()} members
          across all rooms
        </p>
      </footer>
    </main>
  );
}
