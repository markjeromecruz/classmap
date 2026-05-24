import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import FamilyPage, { metadata } from "@/app/classmap/family/page";
import { setSession } from "@/lib/classmap/db";

// ClassmapShell + SideNav + FamilyList all call useRouter/usePathname.
// Stub navigation so the page renders without Next's runtime.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
  usePathname: () => "/classmap/family",
}));

beforeEach(() => {
  // Mobile breakpoint — page must render correctly at 360x740.
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 360,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 740,
  });
  window.dispatchEvent(new Event("resize"));
  window.localStorage.clear();
  pushMock.mockReset();

  // ClassmapShell (non-bare) calls useRedirectIfNoSession({ enabled: true }).
  // Without a seeded session the effect would router.replace("/classmap/login"),
  // which obscures what we're actually testing here. Seed a valid session so
  // the shell renders its chrome + children normally.
  setSession({
    userId: "00000000-0000-0000-0000-000000000001",
    email: "parent@example.com",
    createdAt: new Date().toISOString(),
  });
});

/* ------------------------------------------------------------------ *
 * /classmap/family
 * ------------------------------------------------------------------ */

describe("/classmap/family page", () => {
  it("exports the expected metadata title", () => {
    expect(metadata.title).toBe("Family — ClassMap");
  });

  it("wraps content in ClassmapShell's non-bare mode (nav chrome renders)", () => {
    render(<FamilyPage />);
    // Non-bare branch renders both SideNav + MobileBottomNav; responsive
    // CSS (hidden md:flex / md:hidden) decides which is visible, but both
    // are in the DOM at all viewports.
    expect(document.querySelector('[data-slot="side-nav"]')).not.toBeNull();
    expect(
      document.querySelector('[data-slot="mobile-bottom-nav"]'),
    ).not.toBeNull();
  });

  it("does not redirect to /classmap/login when a session is present", () => {
    render(<FamilyPage />);
    // useRedirectIfNoSession should be a no-op with a valid session.
    expect(pushMock).not.toHaveBeenCalledWith("/classmap/login");
  });

  it("mounts <FamilyList /> inside the shell", () => {
    render(<FamilyPage />);
    expect(document.querySelector('[data-slot="family"]')).not.toBeNull();
  });

  it("renders correctly at the 360px mobile viewport", () => {
    render(<FamilyPage />);
    // At 360px the page must still mount the shell's mobile bottom nav,
    // the page header (top bar), and FamilyList — all without throwing.
    expect(window.innerWidth).toBe(360);
    expect(
      document.querySelector('[data-slot="mobile-bottom-nav"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-slot="family"]')).not.toBeNull();
  });
});
