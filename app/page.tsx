import { AppCard } from "@/components/portfolio/AppCard";
import { isDemoMode } from "@/lib/env";

const ISSUE_DATE = "May · MMXXVI";

export default function Home() {
  return (
    <main className="relative">
      {/* Decorative corner ornaments */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-6 top-6 h-3 w-3 border-l border-t border-[color:var(--ink-faded)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 top-6 h-3 w-3 border-r border-t border-[color:var(--ink-faded)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-6 bottom-6 h-3 w-3 border-l border-b border-[color:var(--ink-faded)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-6 bottom-6 h-3 w-3 border-r border-b border-[color:var(--ink-faded)]"
      />

      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
        {/* ===== Masthead ===== */}
        <header className="mb-14 sm:mb-20">
          <div className="flex items-baseline justify-between gap-6 mb-3">
            <p className="kicker">Vol. I · No. 1</p>
            <p className="kicker tabular">{ISSUE_DATE}</p>
          </div>

          <hr className="rule--double mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-4 items-end">
            <h1 className="lg:col-span-9 font-display text-[clamp(3.25rem,9vw,7.5rem)] leading-[0.86] tracking-[-0.04em] text-[color:var(--ink)]">
              Kindle
              <span className="font-display-italic text-[color:var(--accent-clay)]">
                {" "}
                Minds
              </span>
            </h1>
            <p className="lg:col-span-3 lg:text-right kicker leading-relaxed">
              A field guide
              <br />
              to AI-native apps
            </p>
          </div>

          <hr className="rule mt-8 mb-6" />

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="kicker">
              Edited &amp; built by{" "}
              <span className="text-[color:var(--ink-soft)] tracking-normal normal-case">
                Mark Jerome Cruz
              </span>
            </p>
            <p
              className="kicker"
              style={{
                color: isDemoMode
                  ? "var(--accent-clay)"
                  : "var(--accent-sage)",
              }}
            >
              {isDemoMode
                ? "Reading the static demo"
                : "Live · local server"}
            </p>
          </div>
        </header>

        {/* ===== Lead ===== */}
        <section className="mb-20 sm:mb-24 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 lg:col-start-2">
            <p className="kicker kicker--accent mb-4">
              From the editor
            </p>
            <p className="lead text-2xl sm:text-[1.75rem] text-[color:var(--ink)] drop-cap">
              Most software is built for engagement; this is built for use.
              Each entry in this volume is a small, focused application aimed
              at a particular human problem — first homeschool planning,
              then communities of practice, then the slow, quiet work of
              leading a family well.
            </p>
            <p className="mt-6 text-[15px] leading-[1.7] text-[color:var(--ink-soft)] max-w-prose">
              Every app ships as a working MVP, gets a public demo, and grows
              from there. The first is below. The others are next door, in
              press. If anything here is useful to you, take it, fork it,
              improve it — the source is at the bottom of the page.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <hr className="rule--accent" />
              <p className="font-display italic text-[color:var(--ink-soft)]">
                — The editor
              </p>
            </div>
          </div>
        </section>

        {/* ===== In this volume ===== */}
        <section className="mb-20">
          <div className="flex items-baseline justify-between gap-6 mb-6">
            <h2 className="kicker text-[color:var(--ink)] text-xs">
              In this volume
            </h2>
            <p className="kicker tabular">Three entries</p>
          </div>
          <hr className="rule mb-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[color:var(--rule)]">
            <AppCard
              index={1}
              category="Homeschool"
              title="ClassMap"
              tagline="An AI lesson planner for parents teaching at home."
              description="Enter a child's age, learning style, and the subjects you want to cover. Claude returns a five-day plan tuned to how the child actually learns — with materials, time estimates, and a printable layout."
              href="/classmap"
              status="live"
              highlights={[
                "Weekly plan with materials and time estimates",
                "Save plans to your device and reopen later",
                "Static demo on GitHub Pages; live AI when run locally",
              ]}
            />
            <AppCard
              index={2}
              category="Community"
              title="KindleMinds"
              tagline="A private social hub for homeschool families."
              description="Curriculum-style forums (Classical, Charlotte Mason, unschooling), live co-op class scheduling, child-safe messaging, and a finder for local meetups — the slow, useful infrastructure of a community."
              status="coming-soon"
              highlights={[
                "Forums organized by curriculum style",
                "Live co-op class scheduling",
                "Local meetup finder",
              ]}
            />
            <AppCard
              index={3}
              category="Faith"
              title="Patriarch"
              tagline="A focused app for men leading their households well."
              description="A daily five-minute devotional written for husbands and fathers, a Family Altar tool with pre-built devotions you can run tonight, Iron Circle accountability groups of four to six men, and an AI Faith Coach for the questions you can't quite ask anyone else."
              status="coming-soon"
              highlights={[
                "Daily devotional written for husbands and fathers",
                "Pre-built family devotions, run tonight",
                "Iron Circle accountability groups of 4–6",
              ]}
            />
          </div>
        </section>

        {/* ===== Method ===== */}
        <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-3">
            <p className="kicker kicker--accent">Method</p>
            <h3 className="font-display text-3xl sm:text-4xl leading-[0.95] tracking-[-0.02em] text-[color:var(--ink)] mt-3">
              Three agents,
              <br />
              one workshop.
            </h3>
          </div>
          <div className="lg:col-span-8 lg:col-start-5 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
            <Column
              letter="A"
              role="Editor"
              body="Scopes the work, builds foundation pieces, reviews each handoff before it lands."
            />
            <Column
              letter="B"
              role="Compositor"
              body="Picks up TODO entries, ships components, and hands them across the desk for verification."
            />
            <Column
              letter="C"
              role="Proofreader"
              body="Writes the tests, runs the suites, and either signs the work off or files an issue."
            />
          </div>
        </section>

        {/* ===== Colophon ===== */}
        <footer className="pt-10 border-t border-[color:var(--rule)]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <p className="kicker">Colophon</p>
            <p className="text-[13px] text-[color:var(--ink-faded)] leading-relaxed max-w-2xl">
              Set in <span className="font-display italic">Fraunces</span> for
              display and <span className="smallcaps">Instrument Sans</span>{" "}
              for body. Built with Next.js, Tailwind, shadcn primitives, and
              the Claude Code SDK. Source on{" "}
              <a
                href="https://github.com/markjeromecruz/classmap"
                className="text-[color:var(--accent-ink)] underline underline-offset-[5px] decoration-[color:var(--rule)] hover:decoration-[color:var(--accent-ink)]"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Column({
  letter,
  role,
  body,
}: {
  letter: string;
  role: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-display text-5xl leading-none text-[color:var(--accent-clay)]">
          {letter}
        </span>
        <span className="kicker">{role}</span>
      </div>
      <hr className="rule mb-3" />
      <p className="text-sm leading-[1.6] text-[color:var(--ink-soft)]">
        {body}
      </p>
    </div>
  );
}
