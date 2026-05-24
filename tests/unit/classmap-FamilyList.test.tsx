import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FamilyList } from "@/components/classmap/family/FamilyList";
import * as db from "@/lib/classmap/db";
import { getCurrentSession, signIn } from "@/lib/classmap/auth";
import type { Child } from "@/lib/classmap/types";

// Mock next/navigation at the router boundary only. The real lib/classmap/db
// and lib/classmap/auth modules are allowed to run and read/write jsdom's
// window.localStorage directly.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
}));

// ----- fixtures -----------------------------------------------------------

const childInputBase: Omit<
  Child,
  | "id"
  | "avatarColor"
  | "ageBand"
  | "xpTotal"
  | "streakDays"
  | "lastActiveDate"
  | "badges"
  | "createdAt"
> = {
  name: "Ada",
  age: 9,
  grade: "4",
  state: "CA",
  learningStyle: "visual",
  curriculumApproach: "eclectic",
  prioritySubjects: ["math", "reading"],
};

// ----- selector helpers ---------------------------------------------------

const root = () =>
  document.querySelector('[data-slot="family"]') as HTMLElement | null;
const empty = () =>
  document.querySelector('[data-slot="family-empty"]') as HTMLElement | null;
const list = () =>
  document.querySelector('[data-slot="family-list"]') as HTMLOListElement | null;
const actions = () =>
  document.querySelector('[data-slot="family-actions"]') as HTMLElement | null;
const addChildLink = () =>
  document.querySelector(
    '[data-slot="family-add-child"]',
  ) as HTMLAnchorElement | null;
const portfolioLink = () =>
  document.querySelector(
    '[data-slot="family-portfolio-link"]',
  ) as HTMLAnchorElement | null;
const childCards = () =>
  Array.from(
    document.querySelectorAll('[data-slot="child-card"]'),
  ) as HTMLElement[];

// --------------------------------------------------------------------------

beforeEach(() => {
  window.localStorage.clear();
  pushMock.mockReset();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("FamilyList — empty state", () => {
  it("renders family-empty (not family-list) when no children are stored", () => {
    render(<FamilyList />);
    expect(root()).not.toBeNull();
    expect(empty()).not.toBeNull();
    expect(list()).toBeNull();
  });

  it("still shows the header 'Add a child' CTA and the footer actions", () => {
    render(<FamilyList />);
    expect(addChildLink()).not.toBeNull();
    expect(actions()).not.toBeNull();
    expect(portfolioLink()).not.toBeNull();
    expect(screen.getByTestId("family-logout")).toBeInTheDocument();
  });
});

describe("FamilyList — populated state", () => {
  it("renders family-list with data-count and one ChildCard per child", () => {
    const a = db.createChild({ ...childInputBase, name: "Ada" });
    const b = db.createChild({ ...childInputBase, name: "Bea" });

    render(<FamilyList />);

    const ol = list();
    expect(ol).not.toBeNull();
    expect(ol?.getAttribute("data-count")).toBe("2");
    expect(empty()).toBeNull();

    const cards = childCards();
    expect(cards).toHaveLength(2);
    const ids = cards
      .map((c) => c.getAttribute("data-child-id"))
      .filter((v): v is string => v !== null);
    expect(ids).toEqual(expect.arrayContaining([a.id, b.id]));
  });

  it("renders the list as an <ol> with aria-label='Children in your family'", () => {
    db.createChild({ ...childInputBase, name: "Ada" });
    db.createChild({ ...childInputBase, name: "Bea" });

    render(<FamilyList />);

    const ol = list();
    expect(ol).not.toBeNull();
    expect(ol?.tagName).toBe("OL");
    expect(ol?.getAttribute("aria-label")).toBe("Children in your family");
  });
});

describe("FamilyList — header copy", () => {
  it("shows the 'The family' kicker, the 'Profiles' h1, and the 'Add a child' CTA", () => {
    render(<FamilyList />);
    expect(screen.getByText(/^the family$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /^profiles$/i }),
    ).toBeInTheDocument();
    const cta = addChildLink();
    expect(cta).not.toBeNull();
    expect(cta).toHaveTextContent(/add a child/i);
  });
});

describe("FamilyList — navigation links", () => {
  it("header 'Add a child' link points to /classmap/onboarding", () => {
    render(<FamilyList />);
    expect(addChildLink()).toHaveAttribute("href", "/classmap/onboarding");
  });

  it("footer portfolio link points to /classmap/portfolio", () => {
    render(<FamilyList />);
    expect(portfolioLink()).toHaveAttribute("href", "/classmap/portfolio");
  });
});

describe("FamilyList — logout flow", () => {
  it("clears the session and routes to /classmap/login when Sign out is clicked", async () => {
    const user = userEvent.setup();

    // Seed a session so signOut() actually has something to clear.
    signIn({ email: "ada@example.com" });
    expect(getCurrentSession()).not.toBeNull();
    expect(getCurrentSession()?.email).toBe("ada@example.com");

    render(<FamilyList />);

    const logoutBtn = screen.getByTestId("family-logout") as HTMLButtonElement;
    expect(logoutBtn).toBeInTheDocument();
    expect(logoutBtn.tagName).toBe("BUTTON");

    await user.click(logoutBtn);

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/classmap/login"),
    );
    expect(getCurrentSession()).toBeNull();
  });
});
