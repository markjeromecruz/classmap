import Link from "next/link";
import { notFound } from "next/navigation";

import {
  THREADS,
  getRoom,
  getThread,
} from "@/lib/kindleminds-demo-data";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function generateStaticParams() {
  return THREADS.map((t) => ({
    slug: t.roomSlug,
    threadId: t.id,
  }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = getThread(threadId);
  if (!thread) return { title: "Thread not found — KindleMinds" };
  return {
    title: `${thread.title} — KindleMinds`,
    description: thread.body.slice(0, 160),
  };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string; threadId: string }>;
}) {
  const { slug, threadId } = await params;
  const thread = getThread(threadId);
  if (!thread || thread.roomSlug !== slug) notFound();
  const room = getRoom(slug);
  if (!room) notFound();

  const postedDate = new Date(thread.postedAt);

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-10 sm:py-16"
      data-slot="kindleminds-thread"
      data-thread-id={thread.id}
      data-room-slug={slug}
    >
      <Link
        href={`/kindleminds/rooms/${slug}`}
        className="kicker no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]"
      >
        ← {room.name}
      </Link>

      <article className="mt-6">
        <header className="mb-8 border-b border-[color:var(--rule)] pb-6">
          <p className="kicker">
            <span>{thread.author}</span>
            <span className="text-[color:var(--rule)] mx-2">·</span>
            <span className="tabular text-[color:var(--ink-faded)]">
              {dateFmt.format(postedDate)} at {timeFmt.format(postedDate)}
            </span>
          </p>
          <h1
            className="font-display text-[2.25rem] sm:text-[3rem] leading-[1.02] tracking-[-0.025em] text-[color:var(--ink)] mt-3"
            data-slot="thread-title"
          >
            {thread.title}
          </h1>
        </header>

        <div
          data-slot="thread-body"
          className="text-[16px] sm:text-[17px] leading-[1.7] text-[color:var(--ink)] whitespace-pre-line"
        >
          {thread.body}
        </div>

        <footer className="mt-8 pt-4 border-t border-[color:var(--rule)] flex items-baseline justify-between gap-4">
          <p className="kicker tabular text-[color:var(--ink-faded)]">
            <span data-slot="thread-views">{thread.views} views</span>
          </p>
          <p className="kicker tabular text-[color:var(--ink-faded)]">
            <span data-slot="thread-reply-count">
              {thread.replies.length}{" "}
              {thread.replies.length === 1 ? "reply" : "replies"}
            </span>
          </p>
        </footer>
      </article>

      <section
        data-slot="thread-replies"
        data-count={thread.replies.length}
        aria-label="Replies"
        className="mt-12"
      >
        {thread.replies.length === 0 ? (
          <p
            data-slot="thread-replies-empty"
            className="text-[color:var(--ink-faded)] italic text-sm"
          >
            No replies yet.
          </p>
        ) : (
          <ol className="space-y-8">
            {thread.replies.map((reply) => {
              const at = new Date(reply.postedAt);
              return (
                <li
                  key={reply.id}
                  data-slot="thread-reply"
                  data-reply-id={reply.id}
                  className="border-l border-[color:var(--rule)] pl-5 sm:pl-6"
                >
                  <p className="kicker">
                    <span>{reply.author}</span>
                    <span className="text-[color:var(--rule)] mx-2">·</span>
                    <span className="tabular text-[color:var(--ink-faded)]">
                      {dateFmt.format(at)} at {timeFmt.format(at)}
                    </span>
                  </p>
                  <p
                    data-slot="thread-reply-body"
                    className="mt-2 text-[15px] sm:text-[16px] leading-[1.7] text-[color:var(--ink-soft)] whitespace-pre-line"
                  >
                    {reply.body}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
