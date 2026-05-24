import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createElement } from "react";

import * as auth from "@/lib/classmap/auth";
import {
  STORAGE_KEY,
  appStateSchema,
  emptyAppState,
  sessionSchema,
  type AppState,
  type Child,
  type Family,
  type Session,
} from "@/lib/classmap/types";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function readRawState(): AppState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  const parsed = appStateSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
}

/** Seed an AppState directly into localStorage to set up preconditions
 * without depending on db.ts. */
function seedState(patch: Partial<AppState>): AppState {
  const next: AppState = { ...emptyAppState(), ...patch };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function makeChild(over: Partial<Child> = {}): Child {
  return {
    id: "kid-1",
    name: "Ada",
    age: 9,
    grade: "4",
    state: "CA",
    learningStyle: "visual",
    curriculumApproach: "eclectic",
    prioritySubjects: ["math"],
    avatarColor: "oklch(0.555 0.160 38)",
    ageBand: "upper",
    xpTotal: 0,
    streakDays: 0,
    lastActiveDate: null,
    badges: [],
    createdAt: "2026-05-20T00:00:00.000Z",
    ...over,
  };
}

/* ------------------------------------------------------------------ *
 * Test setup
 * ------------------------------------------------------------------ */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

/* ================================================================== *
 * signUp                                                              *
 * ================================================================== */

describe("signUp", () => {
  it("returns a schema-valid Session", () => {
    const session = auth.signUp({
      email: "ada@example.com",
      adultName: "Ada Lovelace",
    });
    const parsed = sessionSchema.safeParse(session);
    expect(parsed.success).toBe(true);
    expect(session.email).toBe("ada@example.com");
    expect(session.userId).toBeTruthy();
    expect(session.createdAt).toMatch(/T.*Z$/);
  });

  it("persists session AND family to localStorage under STORAGE_KEY", () => {
    const session = auth.signUp({
      email: "ada@example.com",
      adultName: "Ada Lovelace",
    });
    const stored = readRawState();
    expect(stored).not.toBeNull();
    expect(stored?.session).toEqual(session);
    expect(stored?.family).toEqual({
      adultName: "Ada Lovelace",
      adultEmail: "ada@example.com",
    });
  });

  it("trims family.adultName before persisting", () => {
    auth.signUp({
      email: "ada@example.com",
      adultName: "   Ada Lovelace   ",
    });
    const stored = readRawState();
    expect(stored?.family?.adultName).toBe("Ada Lovelace");
  });

  it("generates a unique userId per call", () => {
    const a = auth.signUp({ email: "a@example.com", adultName: "A" });
    const b = auth.signUp({ email: "b@example.com", adultName: "B" });
    expect(a.userId).not.toBe(b.userId);
  });
});

/* ================================================================== *
 * signIn                                                              *
 * ================================================================== */

describe("signIn", () => {
  it("returns a schema-valid Session", () => {
    const session = auth.signIn({ email: "ada@example.com" });
    expect(sessionSchema.safeParse(session).success).toBe(true);
    expect(session.email).toBe("ada@example.com");
  });

  it("persists session only — leaves any existing family intact", () => {
    const existingFamily: Family = {
      adultName: "Pre-existing Adult",
      adultEmail: "pre@example.com",
    };
    seedState({ family: existingFamily });

    const session = auth.signIn({ email: "ada@example.com" });

    const stored = readRawState();
    expect(stored?.session).toEqual(session);
    expect(stored?.family).toEqual(existingFamily);
  });
});

/* ================================================================== *
 * signOut                                                             *
 * ================================================================== */

describe("signOut", () => {
  it("sets session to null", () => {
    auth.signUp({ email: "ada@example.com", adultName: "Ada" });
    auth.signOut();
    const stored = readRawState();
    expect(stored?.session).toBeNull();
  });

  it("preserves family + children intact", () => {
    auth.signUp({ email: "ada@example.com", adultName: "Ada" });

    // Inject a child directly (bypassing db.ts) to verify signOut doesn't
    // touch children either.
    const before = readRawState();
    expect(before).not.toBeNull();
    const child = makeChild();
    const seeded: AppState = {
      ...(before as AppState),
      children: [child],
      activeChildId: child.id,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));

    auth.signOut();

    const after = readRawState();
    expect(after?.session).toBeNull();
    expect(after?.family).toEqual({
      adultName: "Ada",
      adultEmail: "ada@example.com",
    });
    expect(after?.children).toEqual([child]);
    expect(after?.activeChildId).toBe(child.id);
  });
});

/* ================================================================== *
 * verifyOtp — cosmetic, always true                                   *
 * ================================================================== */

describe("verifyOtp", () => {
  it.each([
    ["empty string", ""],
    ["6 digits", "123456"],
    ["9 digits", "123456789"],
    ["alphabetic", "abcdef"],
    ["mixed alphanumeric", "12ab34"],
    ["unicode garbage", "🔥🔥🔥🔥🔥🔥"],
  ])("returns true for %s", (_label, code) => {
    expect(auth.verifyOtp({ email: "ada@example.com", code })).toBe(true);
  });
});

/* ================================================================== *
 * getCurrentSession                                                   *
 * ================================================================== */

describe("getCurrentSession", () => {
  it("returns null when no session is stored", () => {
    expect(auth.getCurrentSession()).toBeNull();
  });

  it("returns the current session after signUp", () => {
    const session = auth.signUp({
      email: "ada@example.com",
      adultName: "Ada",
    });
    expect(auth.getCurrentSession()).toEqual(session);
  });

  it("returns the current session after signIn", () => {
    const session = auth.signIn({ email: "ada@example.com" });
    expect(auth.getCurrentSession()).toEqual(session);
  });

  it("returns null after signOut", () => {
    auth.signUp({ email: "ada@example.com", adultName: "Ada" });
    auth.signOut();
    expect(auth.getCurrentSession()).toBeNull();
  });
});

/* ================================================================== *
 * Session persistence across "reload"                                 *
 * ================================================================== */

describe("session persistence across reload", () => {
  it("signIn writes a session that round-trips cleanly via appStateSchema", () => {
    const session = auth.signIn({ email: "ada@example.com" });

    // Simulate reload: read raw bytes back, re-parse via schema, confirm
    // the session is byte-for-byte recoverable.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = appStateSchema.safeParse(JSON.parse(raw as string));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.session).toEqual(session);
    }
  });

  it("signUp survives reload with both session and family preserved", () => {
    const session = auth.signUp({
      email: "ada@example.com",
      adultName: "Ada Lovelace",
    });
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = appStateSchema.safeParse(JSON.parse(raw as string));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.session).toEqual(session);
      expect(parsed.data.family).toEqual({
        adultName: "Ada Lovelace",
        adultEmail: "ada@example.com",
      });
    }
  });
});

/* ================================================================== *
 * requireSession                                                      *
 * ================================================================== */

describe("requireSession", () => {
  it("throws when no session exists", () => {
    expect(() => auth.requireSession()).toThrow(
      /no active ClassMap session/,
    );
  });

  it("returns the session when one exists", () => {
    const session = auth.signIn({ email: "ada@example.com" });
    expect(auth.requireSession()).toEqual(session);
  });
});

/* ================================================================== *
 * useSession hook                                                     *
 * ================================================================== */

describe("useSession", () => {
  function SessionProbe(): React.ReactElement {
    const session = auth.useSession();
    return createElement(
      "div",
      { "data-testid": "probe" },
      session === null ? "null" : session.email,
    );
  }

  it("returns null initially, then re-renders with the new session after signIn", () => {
    render(createElement(SessionProbe));
    expect(screen.getByTestId("probe").textContent).toBe("null");

    let session: Session | undefined;
    act(() => {
      session = auth.signIn({ email: "ada@example.com" });
    });

    expect(session?.email).toBe("ada@example.com");
    expect(screen.getByTestId("probe").textContent).toBe("ada@example.com");
  });

  it("re-renders with null after signOut", () => {
    render(createElement(SessionProbe));

    act(() => {
      auth.signUp({ email: "ada@example.com", adultName: "Ada" });
    });
    expect(screen.getByTestId("probe").textContent).toBe("ada@example.com");

    act(() => {
      auth.signOut();
    });
    expect(screen.getByTestId("probe").textContent).toBe("null");
  });
});
