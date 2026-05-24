"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getChildren,
  getActiveChild,
  setActiveChildId,
  useAppState,
} from "@/lib/classmap/db";
import {
  STORAGE_KEY,
  appStateSchema,
  type Child,
} from "@/lib/classmap/types";

/* ------------------------------------------------------------------ *
 * Fallback readers — used if db.ts helpers throw at runtime.
 * ------------------------------------------------------------------ */

function readStateFromStorage(): {
  children: Child[];
  activeChildId: string | null;
} {
  if (typeof window === "undefined") {
    return { children: [], activeChildId: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { children: [], activeChildId: null };
    const parsed = appStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { children: [], activeChildId: null };
    return {
      children: parsed.data.children,
      activeChildId: parsed.data.activeChildId,
    };
  } catch {
    return { children: [], activeChildId: null };
  }
}

function safeGetChildren(): Child[] {
  try {
    const result = getChildren();
    if (Array.isArray(result)) return result;
  } catch {
    /* fall through */
  }
  return readStateFromStorage().children;
}

function safeGetActiveChild(): Child | null {
  try {
    const result = getActiveChild();
    if (result === null || (typeof result === "object" && "id" in result)) {
      return (result as Child | null) ?? null;
    }
  } catch {
    /* fall through */
  }
  const { children, activeChildId } = readStateFromStorage();
  return children.find((c) => c.id === activeChildId) ?? null;
}

function safeSetActiveChildId(id: string): void {
  try {
    setActiveChildId(id);
    return;
  } catch {
    /* fall through to direct storage write */
  }
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = appStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return;
    const next = { ...parsed.data, activeChildId: id };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* swallow */
  }
}

/* ------------------------------------------------------------------ *
 * Avatar
 * ------------------------------------------------------------------ */

function Avatar({ child, size = 36 }: { child: Child; size?: number }) {
  const initial = child.name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className="font-display inline-flex shrink-0 items-center justify-center rounded-full text-base text-[color:var(--paper)]"
      style={{
        width: size,
        height: size,
        backgroundColor: child.avatarColor,
        lineHeight: 1,
      }}
    >
      {initial}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export function ChildSwitcher() {
  // Pull from reactive store if available; otherwise track locally.
  let reactiveChildren: Child[] | null = null;
  let reactiveActiveId: string | null | undefined = undefined;
  try {
    const [state] = useAppState();
    if (state) {
      reactiveChildren = state.children;
      reactiveActiveId = state.activeChildId;
    }
  } catch {
    reactiveChildren = null;
  }

  const [fallbackChildren, setFallbackChildren] = useState<Child[]>([]);
  const [fallbackActive, setFallbackActive] = useState<Child | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (reactiveChildren) return;
    setFallbackChildren(safeGetChildren());
    setFallbackActive(safeGetActiveChild());
  }, [reactiveChildren]);

  const children: Child[] = reactiveChildren ?? fallbackChildren;
  const activeChild: Child | null = reactiveChildren
    ? children.find((c) => c.id === reactiveActiveId) ?? null
    : fallbackActive;

  const handleSelect = (id: string) => {
    safeSetActiveChildId(id);
    if (!reactiveChildren) {
      const next = safeGetActiveChild();
      setFallbackActive(next);
    }
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  // 0 children — onboarding link
  if (children.length === 0) {
    return (
      <div data-slot="child-switcher">
        <Link
          href="/classmap/onboarding"
          className="kicker inline-flex items-center gap-2 no-underline text-[color:var(--ink-faded)] hover:text-[color:var(--accent-ink)] transition-colors min-h-[44px] py-2"
        >
          Set up a child <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  // 1 child — non-interactive label
  if (children.length === 1) {
    const only = children[0];
    return (
      <div
        data-slot="child-switcher"
        className="flex items-center gap-3 min-h-[44px]"
      >
        <Avatar child={only} />
        <div className="flex flex-col leading-tight">
          <span className="kicker">Reading with</span>
          <span className="font-display text-base text-[color:var(--ink)]">
            {only.name}
          </span>
        </div>
      </div>
    );
  }

  // 2+ children — details/summary popover
  const display = activeChild ?? children[0];

  return (
    <div data-slot="child-switcher" className="relative">
      <details ref={detailsRef} className="group">
        <summary
          className="list-none cursor-pointer select-none flex items-center gap-3 min-h-[44px] px-2 py-1 rounded-[3px] hover:bg-[color:var(--paper-deep)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--paper)]"
          aria-haspopup="listbox"
        >
          <Avatar child={display} />
          <span className="flex flex-col leading-tight text-left">
            <span className="kicker">Reading with</span>
            <span className="font-display text-base text-[color:var(--ink)]">
              {display.name}
            </span>
          </span>
          <span
            aria-hidden
            className="ml-1 text-[color:var(--ink-faded)] transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>

        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[240px] border border-[color:var(--rule)] bg-[color:var(--paper)] shadow-[0_18px_40px_-20px_oklch(0.2_0.02_60/0.35)] p-1"
        >
          <ul className="flex flex-col">
            {children.map((c) => {
              const isActive = c.id === display.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(c.id)}
                    className={[
                      "w-full flex items-center gap-3 min-h-[44px] px-2 py-2 rounded-[3px] text-left transition-colors",
                      isActive
                        ? "bg-[color:var(--paper-deep)] text-[color:var(--accent-ink)]"
                        : "text-[color:var(--ink-soft)] hover:bg-[color:var(--paper-deep)] hover:text-[color:var(--ink)]",
                    ].join(" ")}
                  >
                    <Avatar child={c} size={32} />
                    <span className="flex flex-col leading-tight">
                      <span className="font-display text-[15px] text-[color:var(--ink)]">
                        {c.name}
                      </span>
                      <span className="kicker">
                        Age {c.age} · {c.grade}
                      </span>
                    </span>
                    {isActive ? (
                      <span
                        aria-hidden
                        className="ml-auto text-[color:var(--accent-clay)]"
                      >
                        ●
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <hr className="rule my-1 border-0 border-t border-[color:var(--rule)]" />

          <Link
            href="/classmap/onboarding"
            className="block w-full text-left px-2 py-2 min-h-[44px] flex items-center gap-2 text-sm text-[color:var(--ink-soft)] hover:text-[color:var(--accent-ink)] hover:bg-[color:var(--paper-deep)] rounded-[3px] no-underline transition-colors"
            onClick={() => {
              if (detailsRef.current) detailsRef.current.open = false;
            }}
          >
            <span className="kicker">＋ Add a child</span>
          </Link>
        </div>
      </details>
    </div>
  );
}
