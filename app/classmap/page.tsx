"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getCurrentSession } from "@/lib/classmap/auth";
import { getChildren } from "@/lib/classmap/db";

export default function ClassMapShellRoute() {
  const router = useRouter();

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      router.replace("/classmap/login");
      return;
    }
    const children = getChildren();
    if (children.length === 0) {
      router.replace("/classmap/onboarding");
      return;
    }
    router.replace("/classmap/today");
  }, [router]);

  return (
    <main
      data-slot="classmap-shell-route"
      className="grid min-h-dvh place-items-center bg-[color:var(--paper)] text-[color:var(--ink)]"
      aria-busy
      aria-live="polite"
    >
      <p className="kicker text-[color:var(--ink-faded)]">Loading…</p>
    </main>
  );
}
