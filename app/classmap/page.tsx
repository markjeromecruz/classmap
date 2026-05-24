import Link from "next/link";

import { ClassMapFlow } from "@/components/classmap/ClassMapFlow";

export const metadata = {
  title: "ClassMap — AI homeschool lesson planner",
  description:
    "Generate a 5-day homeschool plan tailored to your child's age, learning style, and subjects.",
};

export default function ClassMapPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 space-y-3">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← back to portfolio
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          ClassMap
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          An AI lesson planner for homeschooling parents. Tell it about your
          child and it lays out a balanced week across the subjects you pick.
        </p>
      </header>
      <ClassMapFlow />
    </main>
  );
}
