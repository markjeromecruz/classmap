"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChildCard } from "@/components/classmap/family/ChildCard";
import { signOut } from "@/lib/classmap/auth";
import { useAppState } from "@/lib/classmap/db";

export function FamilyList() {
  const router = useRouter();
  const [state] = useAppState();
  const children = state?.children ?? [];

  function handleLogout() {
    signOut();
    router.push("/classmap/login");
  }

  return (
    <section data-slot="family" className="space-y-8">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[color:var(--rule)] pb-6">
        <div>
          <p className="kicker kicker--accent">The family</p>
          <h1 className="font-display text-[2.25rem] sm:text-[2.75rem] leading-[1.0] tracking-[-0.025em] text-[color:var(--ink)] mt-2">
            Profiles
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/classmap/onboarding"
            className="inline-flex h-11 items-center rounded-lg bg-[color:var(--accent-clay)] px-4 text-sm font-medium text-white no-underline hover:bg-[color:var(--accent-clay)]/90"
            data-slot="family-add-child"
          >
            Add a child
          </Link>
        </div>
      </header>

      {children.length === 0 ? (
        <div
          data-slot="family-empty"
          className="rounded-xl border border-dashed border-[color:var(--rule)] bg-[color:var(--paper)] p-8 sm:p-10 text-center"
        >
          <p className="font-display italic text-xl text-[color:var(--ink)]">
            No children added yet.
          </p>
          <p className="dek text-base mt-3 max-w-md mx-auto">
            Start with one. You can add more later.
          </p>
          <Link
            href="/classmap/onboarding"
            className="inline-flex h-11 items-center rounded-lg bg-[color:var(--accent-clay)] px-5 mt-6 text-sm font-medium text-white no-underline hover:bg-[color:var(--accent-clay)]/90"
          >
            Start onboarding
          </Link>
        </div>
      ) : (
        <ol
          data-slot="family-list"
          data-count={children.length}
          className="grid gap-5 sm:grid-cols-2"
          aria-label="Children in your family"
        >
          {children.map((child) => (
            <li key={child.id}>
              <ChildCard child={child} />
            </li>
          ))}
        </ol>
      )}

      <footer
        data-slot="family-actions"
        className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--rule)] pt-6"
      >
        <Link
          href="/classmap/portfolio"
          className="kicker text-[color:var(--accent-ink)] underline-offset-4 hover:underline"
          data-slot="family-portfolio-link"
        >
          Portfolio export →
        </Link>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-4"
          onClick={handleLogout}
          data-slot="family-logout"
          data-testid="family-logout"
        >
          Sign out
        </Button>
      </footer>
    </section>
  );
}
