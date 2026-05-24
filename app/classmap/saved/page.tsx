import Link from "next/link";

import { SavedPlansList } from "@/components/classmap/SavedPlansList";

export const metadata = {
  title: "Saved plans — ClassMap",
  description: "Your saved homeschool plans, stored locally in this browser.",
};

export default function SavedPlansPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-3">
          <Link
            href="/classmap"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← back to ClassMap
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Saved plans
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Stored in this browser only — nothing leaves your device.
          </p>
        </div>
      </header>
      <SavedPlansList />
    </main>
  );
}
