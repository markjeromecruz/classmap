"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getActiveChild,
  useAppState,
} from "@/lib/classmap/db";
import { useRedirectIfNoSession } from "@/lib/classmap/auth";
import type { Child } from "@/lib/classmap/types";
import { SideNav } from "./SideNav";
import { MobileBottomNav } from "./MobileBottomNav";
import { ChildSwitcher } from "./ChildSwitcher";

interface ClassmapShellProps {
  children: React.ReactNode;
  /** When true, skip rendering the chrome (useful for /classmap/login + /classmap/signup before auth). */
  bare?: boolean;
}

export function ClassmapShell({ children, bare = false }: ClassmapShellProps) {
  // Always run the session redirect when not bare. Hook order must be stable,
  // so call it unconditionally with a flag.
  useRedirectIfNoSession({ enabled: !bare });

  if (bare) {
    return (
      <main className="min-h-dvh bg-[color:var(--paper)] text-[color:var(--ink)]">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr] bg-[color:var(--paper)] text-[color:var(--ink)]">
      <SideNav />
      <div className="flex min-h-dvh flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[color:var(--rule)] bg-[color:var(--paper)]/95 px-6 sm:px-10 py-3 backdrop-blur-sm">
          <p className="kicker">ClassMap</p>
          <ChildSwitcher />
        </header>

        <main className="flex-1 mx-auto w-full max-w-5xl px-6 sm:px-10 py-8 pb-24 md:pb-8">
          {children}
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Route guards
 * ------------------------------------------------------------------ */

/**
 * Returns the active child, or redirects to /classmap/onboarding if none.
 * Returns null while resolving (initial mount) and during the redirect.
 */
export function useRequireChild(): Child | null {
  const router = useRouter();
  // Try the reactive hook first; if it throws or isn't ready, we fall back
  // to a one-shot read inside the effect below.
  let activeFromState: Child | null = null;
  try {
    const [state] = useAppState();
    if (state) {
      activeFromState =
        state.children.find((c) => c.id === state.activeChildId) ?? null;
    }
  } catch {
    activeFromState = null;
  }

  useEffect(() => {
    if (activeFromState) return;
    const active = getActiveChild();
    if (!active) {
      router.replace("/classmap/onboarding");
    }
  }, [activeFromState, router]);

  return activeFromState ?? getActiveChild() ?? null;
}
