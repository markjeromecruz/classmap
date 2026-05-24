import type { Devotional } from "@/lib/patriarch-types";

export type DevotionalViewProps = {
  devotional: Devotional;
};

export function DevotionalView({ devotional }: DevotionalViewProps) {
  return (
    <article data-slot="devotional" data-devotional-id={devotional.id}>
      <header className="mb-12 text-center">
        <p className="kicker kicker--accent" data-slot="devotional-theme">
          {devotional.theme}
        </p>
        <h1
          className="font-display text-[2.5rem] sm:text-[3.5rem] leading-[1.02] tracking-[-0.03em] text-[color:var(--ink)] mt-4"
          data-slot="devotional-reference"
        >
          {devotional.scriptureReference}
        </h1>
      </header>

      <blockquote
        data-slot="devotional-scripture"
        className="border-l-2 border-[color:var(--accent-clay)] pl-6 sm:pl-8 my-12 max-w-2xl mx-auto"
      >
        <p className="font-display italic text-xl sm:text-2xl leading-[1.45] text-[color:var(--ink)]">
          {devotional.scriptureText}
        </p>
      </blockquote>

      <section
        data-slot="devotional-reflection"
        className="max-w-2xl mx-auto mt-12"
      >
        <p className="kicker text-[color:var(--ink-faded)] mb-3">Reflection</p>
        <p className="lead text-[17px] sm:text-lg leading-[1.65] text-[color:var(--ink)] drop-cap">
          {devotional.reflection}
        </p>
      </section>

      <section
        data-slot="devotional-prompt"
        className="max-w-2xl mx-auto mt-12 border-y border-[color:var(--rule)] py-8"
      >
        <p className="kicker text-[color:var(--ink-faded)] mb-3">For today</p>
        <p className="font-display italic text-lg sm:text-xl leading-[1.5] text-[color:var(--ink)]">
          {devotional.prompt}
        </p>
      </section>

      <section
        data-slot="devotional-prayer"
        className="max-w-2xl mx-auto mt-12 mb-6"
      >
        <p className="kicker text-[color:var(--ink-faded)] mb-3">Prayer</p>
        <p className="text-[16px] leading-[1.7] text-[color:var(--ink-soft)]">
          {devotional.prayer}
        </p>
      </section>
    </article>
  );
}
