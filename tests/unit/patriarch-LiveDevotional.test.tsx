import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import { LiveDevotional } from "@/components/patriarch/LiveDevotional";
import { DEVOTIONALS } from "@/lib/patriarch-demo-data";

beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

const loadingSlot = () =>
  document.querySelector('[data-slot="devotional-loading"]');
const errorSlot = () =>
  document.querySelector('[data-slot="devotional-error"]');
const devotionalSlot = () =>
  document.querySelector('[data-slot="devotional"]');

describe("LiveDevotional — loading state", () => {
  it("renders the loading skeleton with aria-busy + aria-live before fetch resolves", () => {
    // Never-resolving fetch keeps us in loading.
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<LiveDevotional />);
    const loading = loadingSlot() as HTMLElement;
    expect(loading).not.toBeNull();
    expect(loading.getAttribute("aria-busy")).toBe("true");
    expect(loading.getAttribute("aria-live")).toBe("polite");
  });
});

describe("LiveDevotional — success path", () => {
  it("swaps the skeleton for DevotionalView once a valid response arrives", async () => {
    const ok = DEVOTIONALS[0];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify(ok), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<LiveDevotional />);
    await waitFor(() => {
      expect(devotionalSlot()).not.toBeNull();
    });
    expect(loadingSlot()).toBeNull();
    expect(devotionalSlot()?.getAttribute("data-devotional-id")).toBe(ok.id);
  });

  it("POSTs an empty JSON body to /patriarch/api/devotional", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify(DEVOTIONALS[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<LiveDevotional />);
    await waitFor(() => expect(devotionalSlot()).not.toBeNull());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/patriarch/api/devotional");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe("{}");
  });
});

describe("LiveDevotional — error path", () => {
  it("renders the destructive Alert when fetch returns non-200 with body.error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "model unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<LiveDevotional />);
    await waitFor(() => {
      expect(errorSlot()).not.toBeNull();
    });
    expect(loadingSlot()).toBeNull();
    expect(devotionalSlot()).toBeNull();
    expect(screen.getByText(/model unavailable/i)).toBeInTheDocument();
    // shadcn Alert sets role="alert"
    expect(errorSlot()?.getAttribute("role")).toBe("alert");
  });

  it("renders the destructive Alert when fetch throws (network failure)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );

    render(<LiveDevotional />);
    await waitFor(() => {
      expect(errorSlot()).not.toBeNull();
    });
    expect(screen.getByText(/network down/i)).toBeInTheDocument();
  });

  it("renders the destructive Alert when the response is schema-invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ id: "x" /* missing required fields */ }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<LiveDevotional />);
    await waitFor(() => {
      expect(errorSlot()).not.toBeNull();
    });
    expect(screen.getByText(/match Devotional schema/i)).toBeInTheDocument();
  });
});
