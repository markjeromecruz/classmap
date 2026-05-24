import Link from "next/link";
import { notFound } from "next/navigation";

import { ThreadCard } from "@/components/kindleminds/ThreadCard";
import {
  getRoom,
  getThreadsForRoom,
} from "@/lib/kindleminds-demo-data";
import { CURRICULUM_STYLES } from "@/lib/kindleminds-types";

const numberFmt = new Intl.NumberFormat("en-US");

export function generateStaticParams() {
  return CURRICULUM_STYLES.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) return { title: "Room not found — KindleMinds" };
  return {
    title: `${room.name} — KindleMinds`,
    description: room.blurb,
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();
  const threads = getThreadsForRoom(slug);

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-10 sm:py-16"
      data-slot="kindleminds-room"
      data-room-slug={room.slug}
    >
      <Link
        href="/kindleminds"
        className="kicker no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]"
      >
        ← all rooms
      </Link>

      <header className="mt-6 mb-12 border-b-2 border-[color:var(--ink)] pb-8">
        <p className="kicker kicker--accent">
          {room.tradition.split(" · ")[0]}
        </p>
        <h1 className="font-display text-[2.5rem] sm:text-[3.5rem] leading-[0.96] tracking-[-0.03em] text-[color:var(--ink)] mt-3">
          {room.name}
        </h1>
        <p className="dek text-lg sm:text-xl mt-4 max-w-2xl">
          {room.tradition}
        </p>
        <p className="text-[15px] leading-[1.6] text-[color:var(--ink-soft)] mt-4 max-w-2xl">
          {room.blurb}
        </p>
        <p className="kicker tabular text-[color:var(--ink-faded)] mt-6">
          {numberFmt.format(room.members)} members &middot; {threads.length}{" "}
          {threads.length === 1 ? "thread" : "threads"}
        </p>
      </header>

      <section
        data-slot="threads-list"
        data-count={threads.length}
        aria-label={`Threads in ${room.name}`}
      >
        {threads.length === 0 ? (
          <p
            data-slot="threads-empty"
            className="text-[color:var(--ink-soft)] italic"
          >
            No threads yet. (Demo data — feel free to imagine yours here.)
          </p>
        ) : (
          threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))
        )}
      </section>
    </main>
  );
}
