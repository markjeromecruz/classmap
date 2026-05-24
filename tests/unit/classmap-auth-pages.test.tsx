import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import LoginPage, { metadata as loginMetadata } from "@/app/classmap/login/page";
import SignupPage, { metadata as signupMetadata } from "@/app/classmap/signup/page";

// AuthForm calls useRouter(); stub navigation so the form renders without
// pulling in Next's runtime. The page-level shell tests don't drive the form,
// but the hook still needs to exist at mount.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
}));

beforeEach(() => {
  window.localStorage.clear();
  pushMock.mockReset();
  // Mobile breakpoint — pages must render correctly at 360x740.
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
});

/* ------------------------------------------------------------------ *
 * /classmap/login
 * ------------------------------------------------------------------ */

describe("/classmap/login page", () => {
  it("renders <AuthForm mode='signin'> via the login-form slot", () => {
    render(<LoginPage />);
    expect(document.querySelector('[data-slot="login-form"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="signup-form"]')).toBeNull();
  });

  it("wraps the form in ClassmapShell's bare mode (no nav chrome)", () => {
    render(<LoginPage />);
    // bare mode skips both navs (SideNav + MobileBottomNav).
    expect(document.querySelector('[data-slot="side-nav"]')).toBeNull();
    expect(
      document.querySelector('[data-slot="mobile-bottom-nav"]'),
    ).toBeNull();
    // The form itself should still be present.
    expect(document.querySelector('[data-slot="login-form"]')).not.toBeNull();
  });

  it("exports the expected metadata title", () => {
    expect(loginMetadata.title).toBe("Sign in — ClassMap");
  });

  it("renders a max-w-md <main> for mobile (360px viewport)", () => {
    const { container } = render(<LoginPage />);
    // The page's <main> wraps the form with max-w-md. (ClassmapShell bare
    // also renders a <main>, so query the page-level one by class.)
    const pageMain = container.querySelector("main.max-w-md") as HTMLElement;
    expect(pageMain).not.toBeNull();
    expect(pageMain.className).toContain("max-w-md");
  });

  it("renders primary CTA + email input at 360px viewport", () => {
    render(<LoginPage />);
    // Primary CTA from AuthForm (data-testid="auth-submit") with signin copy.
    const submit = screen.getByTestId("auth-submit");
    expect(submit).toBeInTheDocument();
    expect(submit.textContent).toMatch(/sign in/i);
    // Email input.
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ *
 * /classmap/signup
 * ------------------------------------------------------------------ */

describe("/classmap/signup page", () => {
  it("renders <AuthForm mode='signup'> via the signup-form slot", () => {
    render(<SignupPage />);
    expect(document.querySelector('[data-slot="signup-form"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="login-form"]')).toBeNull();
  });

  it("wraps the form in ClassmapShell's bare mode (no nav chrome)", () => {
    render(<SignupPage />);
    expect(document.querySelector('[data-slot="side-nav"]')).toBeNull();
    expect(
      document.querySelector('[data-slot="mobile-bottom-nav"]'),
    ).toBeNull();
    expect(document.querySelector('[data-slot="signup-form"]')).not.toBeNull();
  });

  it("exports the expected metadata title", () => {
    expect(signupMetadata.title).toBe("Create an account — ClassMap");
  });

  it("renders a max-w-md <main> for mobile (360px viewport)", () => {
    const { container } = render(<SignupPage />);
    const pageMain = container.querySelector("main.max-w-md") as HTMLElement;
    expect(pageMain).not.toBeNull();
    expect(pageMain.className).toContain("max-w-md");
  });

  it("renders primary CTA + email input at 360px viewport", () => {
    render(<SignupPage />);
    const submit = screen.getByTestId("auth-submit");
    expect(submit).toBeInTheDocument();
    expect(submit.textContent).toMatch(/create account/i);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
