"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getCurrentSession } from "@/lib/classmap/auth";
import { getChildren } from "@/lib/classmap/db";
import { isDemoMode } from "@/lib/env";

/**
 * /classmap shell route.
 *
 * Local (full app): redirects to the right deep route based on session
 * + children state — login → onboarding → today.
 *
 * Demo (GitHub Pages): the v2 planner deep routes (/classmap/today, etc.)
 * don't exist yet, and mock auth on a static site can't actually create
 * anything useful. Short-circuit to the v1 ClassMapFlow at /classmap/result
 * so the public demo always shows a working planner experience.
 */
export default function ClassMapShellRoute() {
  const router = useRouter();

  useEffect(() => {
    if (isDemoMode) {
      router.replace("/classmap/result");
      return;
    }
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
      <noscript>
        <Link href="/classmap/result" className="kicker text-[color:var(--accent-ink)]">
          Open the planner →
        </Link>
      </noscript>
    </main>
  );
}
