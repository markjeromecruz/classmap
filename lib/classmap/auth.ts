// Mock auth — no real network, no real OTP, no real OAuth. localStorage session.
// Replace with NextAuth + Supabase to ship real auth.

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  STORAGE_KEY,
  appStateSchema,
  emptyAppState,
  sessionSchema,
  familySchema,
  type AppState,
  type Session,
  type Family,
} from "./types";

/* ------------------------------------------------------------------ *
 * Public input types
 * ------------------------------------------------------------------ */

export interface SignUpInput {
  email: string;
  adultName: string;
}

export interface SignInInput {
  email: string;
}

export interface OtpVerifyInput {
  email: string;
  code: string;
}

/* ------------------------------------------------------------------ *
 * Internal: SSR-safe localStorage AppState access.
 *
 * We don't assume lib/classmap/db.ts exists yet — read/write the
 * AppState root directly via STORAGE_KEY + appStateSchema.safeParse.
 * ------------------------------------------------------------------ */

const STORAGE_EVENT = "classmap:state:changed";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function readAppState(): AppState {
  if (!hasWindow()) return emptyAppState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAppState();
    const json: unknown = JSON.parse(raw);
    const parsed = appStateSchema.safeParse(json);
    if (!parsed.success) return emptyAppState();
    return parsed.data;
  } catch {
    return emptyAppState();
  }
}

function writeAppState(next: AppState): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Same-tab listeners (storage event only fires cross-tab).
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Quota or serialization failure — swallow; mock auth shouldn't crash UI.
  }
}

function mutateAppState(mutator: (state: AppState) => AppState): AppState {
  const current = readAppState();
  const next = mutator(current);
  writeAppState(next);
  return next;
}

/* ------------------------------------------------------------------ *
 * Pure-function API
 * ------------------------------------------------------------------ */

function makeSession(email: string): Session {
  const session: Session = {
    userId: crypto.randomUUID(),
    email,
    createdAt: new Date().toISOString(),
  };
  // Defensive: if the schema ever tightens, fail fast in dev.
  return sessionSchema.parse(session);
}

function makeFamily(adultName: string, adultEmail: string): Family {
  const family: Family = {
    adultName: adultName.trim(),
    adultEmail,
  };
  return familySchema.parse(family);
}

export function signUp(input: SignUpInput): Session {
  const session = makeSession(input.email);
  const family = makeFamily(input.adultName, input.email);
  mutateAppState((state) => ({
    ...state,
    session,
    family,
  }));
  return session;
}

export function signIn(input: SignInInput): Session {
  const session = makeSession(input.email);
  mutateAppState((state) => ({
    ...state,
    session,
  }));
  return session;
}

export function verifyOtp(_input: OtpVerifyInput): boolean {
  // Mock: any 6-digit code is "valid". The screen flow can pretend.
  void _input;
  return true;
}

export function signOut(): void {
  mutateAppState((state) => ({
    ...state,
    session: null,
    // Preserve family + children intact.
  }));
}

export function getCurrentSession(): Session | null {
  if (!hasWindow()) return null;
  return readAppState().session;
}

/* ------------------------------------------------------------------ *
 * Session store (useSyncExternalStore)
 *
 * Subscribes to both same-tab mutations (custom event) and cross-tab
 * storage events. Snapshot is the raw localStorage string so React
 * sees a referentially-stable value when nothing changed.
 * ------------------------------------------------------------------ */

const sessionStore = {
  subscribe(onChange: () => void): () => void {
    if (!hasWindow()) return () => {};
    const handleStorage = (e: StorageEvent): void => {
      if (e.key === null || e.key === STORAGE_KEY) onChange();
    };
    const handleCustom = (): void => onChange();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(STORAGE_EVENT, handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STORAGE_EVENT, handleCustom);
    };
  },
  getSnapshot(): string | null {
    if (!hasWindow()) return null;
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  getServerSnapshot(): string | null {
    return null;
  },
};

export function useSession(): Session | null {
  const snapshot = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  );
  if (snapshot === null) return null;
  try {
    const json: unknown = JSON.parse(snapshot);
    const parsed = appStateSchema.safeParse(json);
    if (!parsed.success) return null;
    return parsed.data.session;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Guards
 * ------------------------------------------------------------------ */

/**
 * Throws if no session. Pure function — safe in server-only guard utils
 * (will throw on the server since localStorage is unavailable, which is
 * the correct behavior for a "must be signed in" check).
 */
export function requireSession(): Session {
  const session = getCurrentSession();
  if (!session) {
    throw new Error("requireSession: no active ClassMap session");
  }
  return session;
}

/**
 * Client hook — redirects to `redirectTo` (default `/classmap/login`)
 * when the session is null. Uses next/navigation's router.replace.
 *
 * Pass `{ enabled: false }` to no-op the redirect while keeping hook order
 * stable across renders (e.g. for /classmap/login itself which is bare).
 */
export function useRedirectIfNoSession(
  opts?: { enabled?: boolean; redirectTo?: string },
): void {
  const session = useSession();
  const router = useRouter();
  const enabled = opts?.enabled ?? true;
  const target = opts?.redirectTo ?? "/classmap/login";
  useEffect(() => {
    if (enabled && session === null) {
      router.replace(target);
    }
  }, [enabled, session, router, target]);
}
