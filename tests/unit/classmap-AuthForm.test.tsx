import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthForm } from "@/components/classmap/auth/AuthForm";
import { STORAGE_KEY } from "@/lib/classmap/types";

// Mock next/navigation at the router boundary only. The real lib/classmap/auth
// is allowed to run and write to jsdom's window.localStorage.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
}));

beforeEach(() => {
  window.localStorage.clear();
  pushMock.mockReset();
});

// ----- small selector helpers ---------------------------------------------

const loginForm = () =>
  document.querySelector('[data-slot="login-form"]') as HTMLFormElement | null;
const signupForm = () =>
  document.querySelector('[data-slot="signup-form"]') as HTMLFormElement | null;
const otpInput = () =>
  document.querySelector('[data-slot="otp-input"]') as HTMLInputElement;
const googleBtn = () =>
  document.querySelector('[data-slot="google-button"]') as HTMLButtonElement;
const authError = () =>
  document.querySelector('[data-slot="auth-error"]') as HTMLElement | null;
const submitBtn = () => screen.getByTestId("auth-submit") as HTMLButtonElement;
const emailInput = () =>
  screen.getByLabelText(/^email$/i) as HTMLInputElement;
const nameInput = () =>
  screen.getByLabelText(/your name/i) as HTMLInputElement;

function readStoredState(): unknown {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

// --------------------------------------------------------------------------

describe("AuthForm — mode='signin' render", () => {
  it("renders login-form slot (not signup-form), correct kicker, h1, CTA, and alt link", () => {
    render(<AuthForm mode="signin" />);
    expect(loginForm()).not.toBeNull();
    expect(signupForm()).toBeNull();
    expect(screen.getByText(/edition\s*·\s*sign in/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /welcome back\./i }),
    ).toBeInTheDocument();
    expect(submitBtn()).toHaveTextContent(/^sign in$/i);
    const alt = screen.getByRole("link", { name: /create one/i });
    expect(alt).toHaveAttribute("href", "/classmap/signup");
  });

  it("does not render a name field in signin mode", () => {
    render(<AuthForm mode="signin" />);
    expect(screen.queryByLabelText(/your name/i)).toBeNull();
  });
});

describe("AuthForm — mode='signup' render", () => {
  it("renders signup-form slot, correct kicker, h1, CTA, alt link, and a name field", () => {
    render(<AuthForm mode="signup" />);
    expect(signupForm()).not.toBeNull();
    expect(loginForm()).toBeNull();
    expect(screen.getByText(/edition\s*·\s*join/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /open an account\./i }),
    ).toBeInTheDocument();
    expect(submitBtn()).toHaveTextContent(/^create account$/i);
    const alt = screen.getByRole("link", { name: /^sign in$/i });
    expect(alt).toHaveAttribute("href", "/classmap/login");
    expect(nameInput()).toBeInTheDocument();
  });
});

describe("AuthForm — validation", () => {
  it("signin: empty email → submit shows 'Email is required.'", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);
    await user.click(submitBtn());
    await waitFor(() => expect(authError()).not.toBeNull());
    expect(authError()).toHaveTextContent(/email is required\./i);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("signup: name empty (with email filled) → submit shows 'Your name is required.'", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await user.type(emailInput(), "parent@example.com");
    await user.click(submitBtn());
    await waitFor(() => expect(authError()).not.toBeNull());
    expect(authError()).toHaveTextContent(/your name is required\./i);
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe("AuthForm — OTP input", () => {
  it("strips non-digits and caps at 6 characters", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);
    const input = otpInput();
    await user.type(input, "12ab345678");
    expect(input.value).toBe("123456");
  });

  it("submits successfully even with empty OTP (verifyOtp is cosmetic)", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);
    await user.type(emailInput(), "parent@example.com");
    // intentionally do NOT touch the OTP input
    await user.click(submitBtn());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/classmap"));
    expect(authError()).toBeNull();
  });
});

describe("AuthForm — Send code / Resend code toggle", () => {
  it("flips label from 'Send code' to 'Resend code' after a click with a filled email", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);
    await user.type(emailInput(), "parent@example.com");
    const sendBtn = screen.getByRole("button", { name: /^send code$/i });
    await user.click(sendBtn);
    expect(
      screen.getByRole("button", { name: /^resend code$/i }),
    ).toBeInTheDocument();
    expect(authError()).toBeNull();
  });

  it("click with empty email shows 'Enter your email first.' in auth-error", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);
    const sendBtn = screen.getByRole("button", { name: /^send code$/i });
    await user.click(sendBtn);
    await waitFor(() => expect(authError()).not.toBeNull());
    expect(authError()).toHaveTextContent(/enter your email first\./i);
    // label should not flip when validation failed
    expect(
      screen.queryByRole("button", { name: /^resend code$/i }),
    ).toBeNull();
  });
});

describe("AuthForm — Google button", () => {
  it("shows the friendly cosmetic note in auth-error when clicked", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);
    await user.click(googleBtn());
    await waitFor(() => expect(authError()).not.toBeNull());
    expect(authError()).toHaveTextContent(
      /google sign-in is cosmetic in the demo\./i,
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe("AuthForm — happy paths (real lib/classmap/auth)", () => {
  it("signin: writes a session to localStorage under STORAGE_KEY and routes to /classmap", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signin" />);
    await user.type(emailInput(), "parent@example.com");
    await user.type(otpInput(), "123456");
    await user.click(submitBtn());

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/classmap"));

    const stored = readStoredState() as {
      session: { email: string; userId: string; createdAt: string } | null;
    } | null;
    expect(stored).not.toBeNull();
    expect(stored?.session).not.toBeNull();
    expect(stored?.session?.email).toBe("parent@example.com");
    expect(typeof stored?.session?.userId).toBe("string");
    expect(typeof stored?.session?.createdAt).toBe("string");
  });

  it("signup: persists session + family (trimmed adultName) and routes to /classmap/onboarding", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await user.type(nameInput(), "   Mira Cruz   ");
    await user.type(emailInput(), "mira@example.com");
    await user.type(otpInput(), "654321");
    await user.click(submitBtn());

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/classmap/onboarding"),
    );

    const stored = readStoredState() as {
      session: { email: string } | null;
      family: { adultName: string; adultEmail: string } | null;
    } | null;
    expect(stored).not.toBeNull();
    expect(stored?.session?.email).toBe("mira@example.com");
    expect(stored?.family).not.toBeNull();
    expect(stored?.family?.adultName).toBe("Mira Cruz");
    expect(stored?.family?.adultEmail).toBe("mira@example.com");
  });
});

describe("AuthForm — touch-target heights (44px)", () => {
  it("primary submit Button has h-11", () => {
    render(<AuthForm mode="signin" />);
    expect(submitBtn().classList.contains("h-11")).toBe(true);
  });

  it("email Input has h-11", () => {
    render(<AuthForm mode="signin" />);
    expect(emailInput().classList.contains("h-11")).toBe(true);
  });
});
