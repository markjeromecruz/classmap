import Link from "next/link";

import type { Thread } from "@/lib/kindleminds-types";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function preview(body: string, max = 200): string {
  if (body.length <= max) return body;
  const cut = body.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trimEnd()}…`;
}

export type ThreadCardProps = {
  thread: Thread;
  basePath?: string;
};

export function ThreadCard({
  thread,
  basePath = "/kindleminds",
}: ThreadCardProps) {
  const replyCount = thread.replies.length;
  const href = `${basePath}/rooms/${thread.roomSlug}/${thread.id}`;
  const posted = dateFmt.format(new Date(thread.postedAt));

  return (
    <article
      data-slot="thread-card"
      data-thread-id={thread.id}
      data-room-slug={thread.roomSlug}
      className="group border-b border-[color:var(--rule)] py-6 first:pt-0 last:border-b-0"
    >
      <Link
        href={href}
        className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
      >
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <p className="kicker">
            <span>{thread.author}</span>
            <span className="text-[color:var(--rule)] mx-2">·</span>
            <span className="tabular text-[color:var(--ink-faded)]">
              {posted}
            </span>
          </p>
          <p
            className="kicker tabular text-[color:var(--ink-faded)]"
            data-slot="thread-card-stats"
          >
            <span data-slot="thread-card-replies">
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>
            <span className="text-[color:var(--rule)] mx-2">·</span>
            <span data-slot="thread-card-views">{thread.views} views</span>
          </p>
        </div>

        <h3 className="font-display text-[1.5rem] sm:text-[1.75rem] leading-[1.1] tracking-[-0.015em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-ink)] transition-colors mb-2">
          {thread.title}
        </h3>

        <p
          data-slot="thread-card-preview"
          className="text-[15px] leading-[1.6] text-[color:var(--ink-soft)]"
        >
          {preview(thread.body)}
        </p>
      </Link>
    </article>
  );
}
