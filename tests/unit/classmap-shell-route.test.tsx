import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

// Mock next/navigation at the boundary only. Use a stable router object so
// the effect's `[router]` dep doesn't re-fire across re-renders.
const replaceMock = vi.fn();
const routerSingleton = { replace: replaceMock, push: replaceMock };
vi.mock("next/navigation", () => ({
  useRouter: () => routerSingleton,
}));

import ClassMapShellRoute from "@/app/classmap/page";
import {
  ageBandFor,
  avatarColorFor,
  type Child,
} from "@/lib/classmap/types";
import * as db from "@/lib/classmap/db";
import * as auth from "@/lib/classmap/auth";

beforeEach(() => {
  window.localStorage.clear();
  replaceMock.mockReset();
});
afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

function seedChild(over: Partial<Child> = {}): Child {
  return db.createChild({
    name: over.name ?? "Ada",
    age: over.age ?? 9,
    grade: over.grade ?? "4",
    state: over.state ?? "CA",
    learningStyle: over.learningStyle ?? "visual",
    curriculumApproach: over.curriculumApproach ?? "eclectic",
    prioritySubjects: over.prioritySubjects ?? ["math"],
  });
}

describe("ClassMapShellRoute (/classmap)", () => {
  it("renders the data-slot='classmap-shell-route' loading placeholder with a11y attrs", async () => {
    render(<ClassMapShellRoute />);
    const main = document.querySelector(
      '[data-slot="classmap-shell-route"]',
    ) as HTMLElement;
    expect(main).not.toBeNull();
    expect(main.getAttribute("aria-busy")).toBe("true");
    expect(main.getAttribute("aria-live")).toBe("polite");
    expect(main.textContent).toMatch(/loading/i);
  });

  it("no session → router.replace('/classmap/login')", async () => {
    render(<ClassMapShellRoute />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledTimes(1));
    expect(replaceMock).toHaveBeenCalledWith("/classmap/login");
  });

  it("session but zero children → router.replace('/classmap/onboarding')", async () => {
    auth.signIn({ email: "ada@example.com" });
    render(<ClassMapShellRoute />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledTimes(1));
    expect(replaceMock).toHaveBeenCalledWith("/classmap/onboarding");
  });

  it("session + ≥1 child → router.replace('/classmap/today')", async () => {
    auth.signIn({ email: "ada@example.com" });
    seedChild();
    render(<ClassMapShellRoute />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledTimes(1));
    expect(replaceMock).toHaveBeenCalledWith("/classmap/today");
  });

  it("multiple children also routes to /classmap/today (not onboarding)", async () => {
    auth.signIn({ email: "ada@example.com" });
    seedChild({ id: "k1", name: "Ada" });
    seedChild({ id: "k2", name: "Bea" });
    render(<ClassMapShellRoute />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledTimes(1));
    expect(replaceMock).toHaveBeenCalledWith("/classmap/today");
  });

  it("redirect fires exactly once (effect deps don't re-run)", async () => {
    auth.signIn({ email: "ada@example.com" });
    seedChild();
    const { rerender } = render(<ClassMapShellRoute />);
    await waitFor(() => expect(replaceMock).toHaveBeenCalledTimes(1));
    // Re-render with same router reference; effect dep array is [router] so
    // it should NOT fire again.
    rerender(<ClassMapShellRoute />);
    expect(replaceMock).toHaveBeenCalledTimes(1);
  });
});
