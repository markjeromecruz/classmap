import Link from "next/link";

type Status = "live" | "in-progress" | "coming-soon";

const statusCopy: Record<Status, string> = {
  live: "Now serving",
  "in-progress": "In press",
  "coming-soon": "Forthcoming",
};

const statusColor: Record<Status, string> = {
  live: "var(--accent-sage)",
  "in-progress": "var(--accent-clay)",
  "coming-soon": "var(--ink-faded)",
};

interface AppCardProps {
  index: number;
  category: string;
  title: string;
  tagline: string;
  description: string;
  href?: string;
  status: Status;
  highlights: string[];
}

export function AppCard({
  index,
  category,
  title,
  tagline,
  description,
  href,
  status,
  highlights,
}: AppCardProps) {
  const interactive = status === "live" && href;
  const num = String(index).padStart(2, "0");

  const article = (
    <article
      className="group relative flex h-full flex-col bg-[color:var(--paper)] p-7 sm:p-8 border border-[color:var(--rule)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_oklch(0.2_0.02_60/0.35)]"
      data-status={status}
    >
      {/* Top kicker row */}
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <p className="kicker">
          Entry №{num}{" "}
          <span className="text-[color:var(--rule)] mx-1">·</span>{" "}
          {category}
        </p>
        <p
          className="kicker tabular"
          style={{ color: statusColor[status] }}
        >
          {statusCopy[status]}
        </p>
      </div>

      <hr className="rule mb-6" />

      <h2 className="font-display text-[2rem] sm:text-[2.25rem] leading-[0.98] tracking-[-0.025em] text-[color:var(--ink)] mb-3">
        {title}
      </h2>

      <p className="dek text-base sm:text-lg mb-5">{tagline}</p>

      <p className="text-[15px] leading-[1.6] text-[color:var(--ink-soft)] mb-5">
        {description}
      </p>

      <ul className="space-y-1.5 mb-6 text-sm leading-[1.55] text-[color:var(--ink-soft)] flex-1">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-3">
            <span
              aria-hidden
              className="mt-[0.55em] block h-px w-3 shrink-0 bg-[color:var(--ink-faded)]"
            />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5 border-t border-[color:var(--rule)] flex items-center justify-between">
        <span className="kicker">
          Vol. I · {category.split(" ")[0]}
        </span>
        {interactive ? (
          <span className="font-display italic text-[color:var(--accent-ink)] text-base inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
            Read on
            <span aria-hidden>⟶</span>
          </span>
        ) : (
          <span className="kicker text-[color:var(--ink-faded)]">
            Awaiting volume
          </span>
        )}
      </div>
    </article>
  );

  if (interactive) {
    return (
      <Link
        href={href}
        className="block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ink)] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--paper)]"
      >
        {article}
      </Link>
    );
  }
  return <div className="h-full opacity-90">{article}</div>;
}
