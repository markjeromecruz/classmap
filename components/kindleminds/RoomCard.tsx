import Link from "next/link";

import type { Room } from "@/lib/kindleminds-types";

const accentVar: Record<Room["accent"], string> = {
  ink: "var(--accent-ink)",
  sage: "var(--accent-sage)",
  clay: "var(--accent-clay)",
};

const numberFmt = new Intl.NumberFormat("en-US");

export type RoomCardProps = {
  room: Room;
  index?: number;
  basePath?: string;
};

export function RoomCard({
  room,
  index,
  basePath = "/kindleminds",
}: RoomCardProps) {
  const accent = accentVar[room.accent] ?? accentVar.ink;
  const num =
    typeof index === "number" ? String(index).padStart(2, "0") : undefined;

  return (
    <Link
      href={`${basePath}/rooms/${room.slug}`}
      className="block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--paper)]"
      data-slot="room-card"
      data-room-slug={room.slug}
    >
      <article className="group relative flex h-full flex-col bg-[color:var(--paper)] p-6 sm:p-7 border border-[color:var(--rule)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_oklch(0.2_0.02_60/0.35)]">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <p className="kicker">
            {num ? (
              <>
                Room №{num}
                <span className="text-[color:var(--rule)] mx-2">·</span>
              </>
            ) : null}
            <span className="kicker--accent">{room.tradition.split(" · ")[0]}</span>
          </p>
          <p className="kicker tabular" style={{ color: accent }}>
            {numberFmt.format(room.members)} members
          </p>
        </div>

        <hr className="rule mb-5" />

        <h2 className="font-display text-[1.75rem] sm:text-[2rem] leading-[1.02] tracking-[-0.02em] text-[color:var(--ink)] mb-3">
          {room.name}
        </h2>

        <p className="dek text-base sm:text-[17px] mb-4">{room.tradition}</p>

        <p className="text-[15px] leading-[1.6] text-[color:var(--ink-soft)] mb-6 flex-1">
          {room.blurb}
        </p>

        <div className="mt-auto pt-4 border-t border-[color:var(--rule)] flex items-center justify-between">
          <span className="kicker text-[color:var(--ink-faded)]">
            Enter the room
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
