import { AppCard } from "@/components/portfolio/AppCard";
import { isDemoMode } from "@/lib/env";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <header className="mb-12">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Kindle Minds · App Portfolio
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
          AI-native apps for the things people actually do.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          A working portfolio. Each app starts as a focused MVP, gets a public
          demo, then grows from there.{" "}
          {isDemoMode ? (
            <span className="text-foreground font-medium">
              You&apos;re viewing the static demo — try ClassMap to see a
              pre-canned plan render.
            </span>
          ) : (
            <span className="text-foreground font-medium">
              You&apos;re running locally — ClassMap will call Claude live for
              real lesson plans.
            </span>
          )}
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AppCard
          title="ClassMap"
          tagline="AI homeschool planner"
          description="Parents enter a child's age, learning style, and subjects. Claude returns a 5-day lesson plan tuned to how the child actually learns."
          href="/classmap"
          status="live"
          highlights={[
            "5-day weekly plan with materials + time estimates",
            "Save plans to localStorage and reopen later",
            "Static demo on GitHub Pages, live AI when run locally",
          ]}
        />
        <AppCard
          title="KindleMinds"
          tagline="Homeschool social hub"
          description="Private community for homeschool families: parent forums by curriculum style, live virtual co-op classes, child-safe messaging, local meetups."
          status="coming-soon"
          highlights={[
            "Curriculum-style forums (Classical, Charlotte Mason, unschooling)",
            "Live co-op class scheduling",
            "Local meetup finder",
          ]}
        />
        <AppCard
          title="Patriarch"
          tagline="Faith-based family leadership"
          description="A focused app for men who want to lead their households with faith and intention. Daily devotional, Family Altar plans, accountability circles, AI Faith Coach."
          status="coming-soon"
          highlights={[
            "5-minute daily devotional written for husbands and fathers",
            "Pre-built family devotions you can run tonight",
            "Iron Circle accountability groups of 4–6 men",
          ]}
        />
      </section>

      <footer className="mt-16 border-t pt-8 text-sm text-muted-foreground">
        <p>
          Built with a 3-agent coordination protocol (A = PM, B = dev, C = QA).
          Source on{" "}
          <a
            className="underline underline-offset-4 hover:text-foreground"
            href="https://github.com/markjeromecruz/classmap"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
