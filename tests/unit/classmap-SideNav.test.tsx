import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation: usePathname for active-link state, useRouter for sign-out.
const replaceMock = vi.fn();
const pathnameMock = vi.fn<() => string | null>();
vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ replace: replaceMock, push: replaceMock }),
}));

import { SideNav } from "@/components/classmap/shell/SideNav";
import * as auth from "@/lib/classmap/auth";

const NAV_HREFS = [
  "/classmap/today",
  "/classmap/week",
  "/classmap/tutor",
  "/classmap/coach",
  "/classmap/progress",
  "/classmap/portfolio",
  "/classmap/market",
  "/classmap/connect",
  "/classmap/family",
] as const;

beforeEach(() => {
  window.localStorage.clear();
  replaceMock.mockReset();
  pathnameMock.mockReset();
  pathnameMock.mockReturnValue("/classmap/today");
});
afterEach(() => {
  window.localStorage.clear();
});

const sideNav = () =>
  document.querySelector('[data-slot="side-nav"]') as HTMLElement;

describe("SideNav — structure", () => {
  it("renders the documented data-slot + aria-label", () => {
    render(<SideNav />);
    const root = sideNav();
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-label")).toBe("Primary");
  });

  it("renders one link per ITEMS entry, in source order", () => {
    render(<SideNav />);
    const links = within(sideNav()).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([...NAV_HREFS]);
  });

  it("renders the brand kicker", () => {
    render(<SideNav />);
    expect(sideNav().textContent).toContain("ClassMap · Vol. I");
  });

  it("renders a Sign out button at the bottom", () => {
    render(<SideNav />);
    const btn = within(sideNav()).getByRole("button", { name: /sign out/i });
    expect(btn).toBeInTheDocument();
  });
});

describe("SideNav — touch-target compliance (CM-11 contract)", () => {
  // The CM-11 fix flipped nav-item links from h-10 (40px) to h-11 (44px).
  // Assert via className for stability — jsdom doesn't compute layout.
  it.each(NAV_HREFS)("nav link %s has h-11 class (44px touch target)", (href) => {
    render(<SideNav />);
    const link = sideNav().querySelector(`a[href="${href}"]`) as HTMLElement;
    expect(link).not.toBeNull();
    expect(link.className).toMatch(/(^|\s)h-11(\s|$)/);
    expect(link.className).not.toMatch(/(^|\s)h-10(\s|$)/);
  });

  it("sign-out button also has h-11", () => {
    render(<SideNav />);
    const btn = within(sideNav()).getByRole("button", { name: /sign out/i });
    expect(btn.className).toMatch(/(^|\s)h-11(\s|$)/);
  });
});

describe("SideNav — active-link highlight", () => {
  it("the active link gets aria-current=page when pathname exactly matches", () => {
    pathnameMock.mockReturnValue("/classmap/today");
    render(<SideNav />);
    const today = sideNav().querySelector(
      'a[href="/classmap/today"]',
    ) as HTMLElement;
    expect(today.getAttribute("aria-current")).toBe("page");
    const week = sideNav().querySelector(
      'a[href="/classmap/week"]',
    ) as HTMLElement;
    expect(week.getAttribute("aria-current")).toBeNull();
  });

  it("a child route (e.g. /classmap/family/123) still marks /classmap/family active", () => {
    pathnameMock.mockReturnValue("/classmap/family/abc");
    render(<SideNav />);
    const family = sideNav().querySelector(
      'a[href="/classmap/family"]',
    ) as HTMLElement;
    expect(family.getAttribute("aria-current")).toBe("page");
  });

  it("no active link when pathname is null", () => {
    pathnameMock.mockReturnValue(null);
    render(<SideNav />);
    const links = within(sideNav()).getAllByRole("link");
    for (const link of links) {
      expect(link.getAttribute("aria-current")).toBeNull();
    }
  });
});

describe("SideNav — sign out", () => {
  it("clicking Sign out clears the session and redirects to /classmap/login", async () => {
    auth.signIn({ email: "ada@example.com" });
    expect(auth.getCurrentSession()).not.toBeNull();

    const user = userEvent.setup();
    render(<SideNav />);
    await user.click(
      within(sideNav()).getByRole("button", { name: /sign out/i }),
    );

    expect(auth.getCurrentSession()).toBeNull();
    expect(replaceMock).toHaveBeenCalledWith("/classmap/login");
  });
});
