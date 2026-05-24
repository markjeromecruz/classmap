import Link from "next/link";
import { notFound } from "next/navigation";

import {
  FAMILY_ALTARS,
  getFamilyAltarById,
} from "@/lib/patriarch-demo-data";

export function generateStaticParams() {
  return FAMILY_ALTARS.map((a) => ({ id: a.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const altar = getFamilyAltarById(id);
  if (!altar) return { title: "Altar plan not found — Patriarch" };
  return {
    title: `${altar.title} — Patriarch`,
    description: `${altar.ageRange} · ${altar.minutes} min · ${altar.scripture.reference}`,
  };
}

export default async function AltarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const altar = getFamilyAltarById(id);
  if (!altar) notFound();

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-12 sm:py-20"
      data-slot="altar-detail"
      data-altar-id={altar.id}
    >
      <Link
        href="/patriarch/altar"
        className="kicker no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--ink-soft)]"
      >
        ← all plans
      </Link>

      <header className="mt-8 mb-12">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-4">
          <p className="kicker kicker--accent">{altar.ageRange}</p>
          <span className="text-[color:var(--rule)]">·</span>
          <p className="kicker tabular text-[color:var(--ink-faded)]">
            {altar.minutes} minutes
          </p>
        </div>
        <h1 className="font-display text-[2.5rem] sm:text-[3.5rem] leading-[1.0] tracking-[-0.03em] text-[color:var(--ink)]">
          {altar.title}
        </h1>
      </header>

      <blockquote
        data-slot="altar-scripture"
        className="border-l-2 border-[color:var(--accent-clay)] pl-6 sm:pl-8 my-10"
      >
        <p className="kicker text-[color:var(--ink-faded)] mb-2">
          {altar.scripture.reference}
        </p>
        <p className="font-display italic text-xl sm:text-2xl leading-[1.45] text-[color:var(--ink)]">
          {altar.scripture.text}
        </p>
      </blockquote>

      <section data-slot="altar-opening-question" className="mt-12">
        <p className="kicker text-[color:var(--ink-faded)] mb-3">Open with</p>
        <p className="font-display italic text-xl leading-[1.5] text-[color:var(--ink)]">
          {altar.openingQuestion}
        </p>
      </section>

      <section
        data-slot="altar-activity"
        className="mt-12 border-y border-[color:var(--rule)] py-8"
      >
        <p className="kicker text-[color:var(--ink-faded)] mb-3">Together</p>
        <p className="text-[16px] leading-[1.7] text-[color:var(--ink)]">
          {altar.activity}
        </p>
      </section>

      <section data-slot="altar-closing-prayer" className="mt-12 mb-6">
        <p className="kicker text-[color:var(--ink-faded)] mb-3">
          Closing prayer
        </p>
        <p className="text-[16px] leading-[1.7] text-[color:var(--ink-soft)]">
          {altar.closingPrayer}
        </p>
      </section>
    </main>
  );
}
