import Link from "next/link";

import { ClassMapFlow } from "@/components/classmap/ClassMapFlow";

export const metadata = {
  title: "Your plan — ClassMap",
  description: "Generate or view your weekly homeschool plan.",
};

export default function ClassMapResultPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 space-y-3">
        <Link
          href="/classmap"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← back
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your plan
        </h1>
      </header>
      <ClassMapFlow />
    </main>
  );
}
