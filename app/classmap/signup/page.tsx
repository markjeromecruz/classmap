import Link from "next/link";

import { AuthForm } from "@/components/classmap/auth/AuthForm";
import { ClassmapShell } from "@/components/classmap/shell/ClassmapShell";
import { isDemoMode } from "@/lib/env";

export const metadata = {
  title: "Create an account — ClassMap",
  description: "Open a ClassMap account.",
};

export default function ClassMapSignupPage() {
  // Demo (GitHub Pages): the mock auth has nowhere useful to land after
  // signup (the v2 planner routes aren't built yet on Pages). Show a
  // tight notice and link to the v1 planner instead.
  if (isDemoMode) {
    return (
      <ClassmapShell bare>
        <main className="mx-auto w-full max-w-md px-5 py-16">
          <p className="kicker kicker--accent mb-4">Edition · Demo</p>
          <h1 className="font-display text-4xl leading-[1.02] tracking-[-0.025em] text-[color:var(--ink)] mb-4">
            Sign-up is off in the demo.
          </h1>
          <p className="dek text-lg mb-8">
            Run the app locally to create profiles, onboard children, and use
            the v2 planner. For now, the v1 lesson-plan generator is open below.
          </p>
          <Link
            href="/classmap/result"
            className="kicker inline-flex items-center gap-2 text-[color:var(--accent-ink)] hover:text-[color:var(--accent-clay)] transition-colors"
          >
            Open the planner <span aria-hidden>→</span>
          </Link>
        </main>
      </ClassmapShell>
    );
  }

  return (
    <ClassmapShell bare>
      <main className="mx-auto w-full max-w-md px-5 py-10 sm:py-16">
        <AuthForm mode="signup" />
      </main>
    </ClassmapShell>
  );
}
