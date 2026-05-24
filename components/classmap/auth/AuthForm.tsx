"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, verifyOtp } from "@/lib/classmap/auth";

type Mode = "signin" | "signup";

const COPY: Record<
  Mode,
  {
    formSlot: "login-form" | "signup-form";
    kicker: string;
    title: string;
    dek: string;
    primaryCta: string;
    altRoute: string;
    altPrompt: string;
    altLabel: string;
    redirectTo: string;
  }
> = {
  signin: {
    formSlot: "login-form",
    kicker: "Edition · sign in",
    title: "Welcome back.",
    dek: "Enter the email you used to sign up. We’ll mail you a six-digit code.",
    primaryCta: "Sign in",
    altRoute: "/classmap/signup",
    altPrompt: "No account yet?",
    altLabel: "Create one",
    redirectTo: "/classmap",
  },
  signup: {
    formSlot: "signup-form",
    kicker: "Edition · join",
    title: "Open an account.",
    dek: "One adult per household to start. You can add children after signup.",
    primaryCta: "Create account",
    altRoute: "/classmap/login",
    altPrompt: "Already have an account?",
    altLabel: "Sign in",
    redirectTo: "/classmap/onboarding",
  },
};

export type AuthFormProps = {
  mode: Mode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [adultName, setAdultName] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSendCode() {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setError(null);
    setCodeSent(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedName = adultName.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (mode === "signup" && !trimmedName) {
      setError("Your name is required.");
      return;
    }
    if (!verifyOtp({ email: trimmedEmail, code: otp })) {
      setError("Invalid code. (Demo: any 6-digit code is accepted.)");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        signUp({ email: trimmedEmail, adultName: trimmedName });
      } else {
        signIn({ email: trimmedEmail });
      }
      router.push(copy.redirectTo);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-slot={copy.formSlot}
      noValidate
      className="space-y-6"
    >
      <header className="space-y-3">
        <p className="kicker kicker--accent">{copy.kicker}</p>
        <h1 className="font-display text-[2.25rem] sm:text-[2.75rem] leading-[1.0] tracking-[-0.025em] text-[color:var(--ink)]">
          {copy.title}
        </h1>
        <p className="dek text-base sm:text-lg">{copy.dek}</p>
      </header>

      <div className="space-y-4">
        {mode === "signup" ? (
          <div className="grid gap-1.5">
            <Label htmlFor="auth-name">Your name</Label>
            <Input
              id="auth-name"
              autoComplete="name"
              value={adultName}
              onChange={(e) => setAdultName(e.target.value)}
              className="h-11"
              required
            />
          </div>
        ) : null}

        <div className="grid gap-1.5">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            required
          />
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="auth-otp">Six-digit code</Label>
            <button
              type="button"
              onClick={handleSendCode}
              className="kicker text-[color:var(--accent-ink)] underline-offset-4 hover:underline"
            >
              {codeSent ? "Resend code" : "Send code"}
            </button>
          </div>
          <Input
            id="auth-otp"
            data-slot="otp-input"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="h-11 tabular tracking-[0.5em] text-center text-lg"
            placeholder="000000"
            aria-describedby="auth-otp-help"
          />
          <p
            id="auth-otp-help"
            className="kicker text-[color:var(--ink-faded)]"
          >
            Demo &middot; any 6 digits will do
          </p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive" data-slot="auth-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-[color:var(--accent-clay)] text-white hover:bg-[color:var(--accent-clay)]/90"
          data-testid="auth-submit"
        >
          {submitting ? "One moment…" : copy.primaryCta}
        </Button>

        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-[color:var(--rule)]" />
          <span className="kicker text-[color:var(--ink-faded)]">or</span>
          <span className="h-px flex-1 bg-[color:var(--rule)]" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          data-slot="google-button"
          onClick={() => setError("Google sign-in is cosmetic in the demo.")}
        >
          Continue with Google
        </Button>
      </div>

      <p className="text-center text-sm text-[color:var(--ink-soft)] pt-2">
        {copy.altPrompt}{" "}
        <a
          href={copy.altRoute}
          className="font-display italic text-[color:var(--accent-ink)] underline-offset-4 hover:underline"
        >
          {copy.altLabel}
        </a>
      </p>
    </form>
  );
}
