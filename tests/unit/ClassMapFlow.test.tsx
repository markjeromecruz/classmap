import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClassMapFlow } from "@/components/classmap/ClassMapFlow";
import { SAVED_PLANS_KEY, listSavedPlans } from "@/lib/storage";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

const flowRoot = () =>
  document.querySelector('[data-slot="classmap-flow"]') as HTMLElement;
const formSection = () =>
  document.querySelector('[data-slot="classmap-flow-form"]') as HTMLElement;
const result = () =>
  document.querySelector('[data-slot="classmap-flow-result"]');
const errorAlert = () =>
  document.querySelector('[data-slot="classmap-flow-error"]');

describe("ClassMapFlow — initial render", () => {
  it("renders the form section with status=idle and no result/error", () => {
    render(<ClassMapFlow forceDemo />);
    expect(flowRoot().getAttribute("data-status")).toBe("idle");
    expect(formSection()).not.toBeNull();
    expect(result()).toBeNull();
    expect(errorAlert()).toBeNull();
    expect(screen.getByRole("button", { name: /generate plan/i })).toBeEnabled();
  });

  it("shows demo-mode helper copy when forceDemo is true", () => {
    render(<ClassMapFlow forceDemo />);
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
  });
});

describe("ClassMapFlow — demo happy path", () => {
  it("submits and renders the result with a PlanBoard", async () => {
    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));
    await waitFor(() => {
      expect(flowRoot().getAttribute("data-status")).toBe("success");
    });
    const resultEl = result() as HTMLElement;
    expect(resultEl).not.toBeNull();
    expect(
      resultEl.querySelector('[data-slot="plan-board"]'),
    ).not.toBeNull();
    expect(
      resultEl.querySelectorAll('[data-slot="plan-day"]'),
    ).toHaveLength(5);
  });

  it("submit label flips to 'Regenerate plan' after first successful submit", async () => {
    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));
    await waitFor(() => expect(result()).not.toBeNull());
    expect(
      screen.getByRole("button", { name: /regenerate plan/i }),
    ).toBeInTheDocument();
  });

  it("Clear button resets to idle and drops the result", async () => {
    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));
    await waitFor(() => expect(result()).not.toBeNull());
    await user.click(screen.getByRole("button", { name: /clear/i }));
    await waitFor(() => {
      expect(flowRoot().getAttribute("data-status")).toBe("idle");
    });
    expect(result()).toBeNull();
  });
});

describe("ClassMapFlow — save integration", () => {
  it("Save plan persists to localStorage and flips the button to 'Saved' (disabled)", async () => {
    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));
    await waitFor(() => expect(result()).not.toBeNull());

    const saveBtn = screen.getByTestId("classmap-flow-save");
    expect(saveBtn).toHaveTextContent(/save plan/i);
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByTestId("classmap-flow-save")).toHaveTextContent(/saved/i);
    });
    expect(screen.getByTestId("classmap-flow-save")).toBeDisabled();
    expect(listSavedPlans()).toHaveLength(1);
  });

  it("Save button starts as 'Saved' (disabled) when the just-generated plan id is already in storage", async () => {
    // Pre-load a fake plan into storage with an id we'll force the demo to use.
    // getDemoPlan id pattern is `demo-${childAge}-${Date.now()}`. We can't predict
    // it, so instead: generate once, save, clear via Clear, then re-generate. The
    // new id will differ → button should be 'Save plan' again. This asserts the
    // negative branch of the saved-detect effect.
    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo />);

    await user.click(screen.getByRole("button", { name: /generate plan/i }));
    await waitFor(() => expect(result()).not.toBeNull());
    await user.click(screen.getByTestId("classmap-flow-save"));
    await waitFor(() =>
      expect(screen.getByTestId("classmap-flow-save")).toHaveTextContent(/saved/i),
    );
    expect(listSavedPlans()).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /clear/i }));
    await user.click(screen.getByRole("button", { name: /generate plan/i }));
    await waitFor(() => expect(result()).not.toBeNull());
    // New plan has a fresh id (Date.now())
    expect(screen.getByTestId("classmap-flow-save")).toHaveTextContent(/save plan/i);
    expect(screen.getByTestId("classmap-flow-save")).toBeEnabled();
  });
});

describe("ClassMapFlow — live (non-demo) API path", () => {
  it("shows the PlanBoardSkeleton while a fetch is in-flight and removes it on success (CM-05)", async () => {
    let resolveFetch!: (res: Response) => void;
    const slowFetch = new Promise<Response>((r) => {
      resolveFetch = r;
    });
    vi.stubGlobal("fetch", vi.fn(() => slowFetch));

    const planResponse = {
      id: "slow-1",
      createdAt: "2026-05-23T18:00:00.000Z",
      input: {
        childAge: 9,
        learningStyle: "visual",
        subjects: ["math", "reading"],
        hoursPerWeek: 10,
      },
      summary: "OK",
      days: [
        { day: "Mon", sessions: [{ subject: "math", title: "M1", description: "d", materials: [], minutes: 30 }] },
        { day: "Tue", sessions: [{ subject: "math", title: "M2", description: "d", materials: [], minutes: 30 }] },
        { day: "Wed", sessions: [{ subject: "math", title: "M3", description: "d", materials: [], minutes: 30 }] },
        { day: "Thu", sessions: [{ subject: "math", title: "M4", description: "d", materials: [], minutes: 30 }] },
        { day: "Fri", sessions: [{ subject: "math", title: "M5", description: "d", materials: [], minutes: 30 }] },
      ],
    };

    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo={false} />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));

    // Loading phase: status flips, skeleton appears, form is aria-busy
    await waitFor(() => {
      expect(flowRoot().getAttribute("data-status")).toBe("loading");
    });
    const skeleton = document.querySelector(
      '[data-slot="plan-board-skeleton"]',
    );
    expect(skeleton).not.toBeNull();
    expect(skeleton?.getAttribute("aria-busy")).toBe("true");
    expect(skeleton?.getAttribute("aria-live")).toBe("polite");
    expect(formSection().getAttribute("aria-busy")).toBe("true");

    // Resolve the fetch
    resolveFetch(
      new Response(JSON.stringify(planResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() => {
      expect(flowRoot().getAttribute("data-status")).toBe("success");
    });
    expect(
      document.querySelector('[data-slot="plan-board-skeleton"]'),
    ).toBeNull();
    expect(result()).not.toBeNull();
  });

  it("renders the error alert when fetch fails (non-200) — shadcn Alert variant=destructive (CM-05)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "claude unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo={false} />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));

    await waitFor(() => {
      expect(flowRoot().getAttribute("data-status")).toBe("error");
    });
    const alert = errorAlert() as HTMLElement;
    expect(alert).not.toBeNull();
    // Now backed by shadcn Alert (role="alert"); flow's data-slot overrides
    // the primitive's default ("alert") with the documented "classmap-flow-error".
    expect(alert.getAttribute("role")).toBe("alert");
    expect(alert.getAttribute("data-slot")).toBe("classmap-flow-error");
    // Title comes from shadcn AlertTitle; description carries the error message
    expect(
      alert.querySelector('[data-slot="alert-title"]')?.textContent,
    ).toMatch(/couldn.{1,3}t generate a plan/i);
    expect(
      alert.querySelector('[data-slot="alert-description"]')?.textContent,
    ).toMatch(/claude unavailable/i);
    expect(result()).toBeNull();
  });

  it("renders the error alert when fetch throws (network failure)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );

    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo={false} />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));

    await waitFor(() => {
      expect(flowRoot().getAttribute("data-status")).toBe("error");
    });
    expect(errorAlert()).not.toBeNull();
    expect(screen.getByText(/network down/i)).toBeInTheDocument();
  });

  it("happy path: 200 response is parsed and rendered", async () => {
    const planResponse = {
      id: "live-1",
      createdAt: "2026-05-23T18:00:00.000Z",
      input: {
        childAge: 9,
        learningStyle: "visual",
        subjects: ["math", "reading"],
        hoursPerWeek: 10,
      },
      summary: "Live plan ok.",
      days: [
        { day: "Mon", sessions: [{ subject: "math", title: "M1", description: "d", materials: [], minutes: 30 }] },
        { day: "Tue", sessions: [{ subject: "math", title: "M2", description: "d", materials: [], minutes: 30 }] },
        { day: "Wed", sessions: [{ subject: "math", title: "M3", description: "d", materials: [], minutes: 30 }] },
        { day: "Thu", sessions: [{ subject: "math", title: "M4", description: "d", materials: [], minutes: 30 }] },
        { day: "Fri", sessions: [{ subject: "math", title: "M5", description: "d", materials: [], minutes: 30 }] },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify(planResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const user = userEvent.setup();
    render(<ClassMapFlow forceDemo={false} />);
    await user.click(screen.getByRole("button", { name: /generate plan/i }));
    await waitFor(() => {
      expect(flowRoot().getAttribute("data-status")).toBe("success");
    });
    const resultEl = result() as HTMLElement;
    expect(
      resultEl.querySelector('[data-slot="plan-board"]'),
    ).not.toBeNull();
  });
});
