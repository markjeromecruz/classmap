import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { ThreadCard } from "@/components/kindleminds/ThreadCard";
import type { Thread } from "@/lib/kindleminds-types";
import { THREADS } from "@/lib/kindleminds-demo-data";

const baseThread: Thread = {
  id: "th-test",
  roomSlug: "classical",
  title: "When did you start formal Latin?",
  author: "@helena_p",
  postedAt: "2026-05-19T14:12:00.000Z",
  body: "We have a 7yo who's been doing English grammar and is asking for Latin.",
  views: 318,
  replies: [
    {
      id: "rp-1",
      author: "@thomasr",
      postedAt: "2026-05-19T15:42:00.000Z",
      body: "We started at 6 with Song School Latin and never regretted it.",
    },
    {
      id: "rp-2",
      author: "@meganhs",
      postedAt: "2026-05-19T20:01:00.000Z",
      body: "Started ours at 8. Honestly it was fine.",
    },
  ],
};

describe("ThreadCard — data slots + link", () => {
  it("exposes documented data-* attributes on the article root", () => {
    render(<ThreadCard thread={baseThread} />);
    const card = document.querySelector('[data-slot="thread-card"]') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.getAttribute("data-thread-id")).toBe(baseThread.id);
    expect(card.getAttribute("data-room-slug")).toBe(baseThread.roomSlug);
  });

  it("links to /kindleminds/rooms/<slug>/<id> by default", () => {
    render(<ThreadCard thread={baseThread} />);
    const card = document.querySelector('[data-slot="thread-card"]') as HTMLElement;
    const link = within(card).getByRole("link");
    expect(link.getAttribute("href")).toBe(
      `/kindleminds/rooms/${baseThread.roomSlug}/${baseThread.id}`,
    );
  });

  it("respects a custom basePath", () => {
    render(<ThreadCard thread={baseThread} basePath="/classmap/kindleminds" />);
    const link = document.querySelector(
      '[data-slot="thread-card"] a',
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe(
      `/classmap/kindleminds/rooms/${baseThread.roomSlug}/${baseThread.id}`,
    );
  });
});

describe("ThreadCard — content", () => {
  it("renders the title as an h3", () => {
    render(<ThreadCard thread={baseThread} />);
    expect(
      screen.getByRole("heading", { level: 3, name: baseThread.title }),
    ).toBeInTheDocument();
  });

  it("shows author and formatted date in the kicker", () => {
    render(<ThreadCard thread={baseThread} />);
    expect(screen.getByText(baseThread.author)).toBeInTheDocument();
    // formatted: "May 19, 2026" via Intl en-US short/numeric/numeric
    expect(screen.getByText(/May\s+19,?\s+2026/)).toBeInTheDocument();
  });
});

describe("ThreadCard — reply/view stats and pluralization", () => {
  it("'2 replies' for 2 replies", () => {
    render(<ThreadCard thread={baseThread} />);
    const stats = document.querySelector(
      '[data-slot="thread-card-stats"]',
    ) as HTMLElement;
    expect(within(stats).getByText(/2\s+replies/)).toBeInTheDocument();
    expect(within(stats).getByText(/318\s+views/)).toBeInTheDocument();
  });

  it("'1 reply' for a single reply", () => {
    const t = { ...baseThread, replies: [baseThread.replies[0]] };
    render(<ThreadCard thread={t} />);
    expect(
      document.querySelector('[data-slot="thread-card-replies"]')?.textContent,
    ).toMatch(/^1\s+reply$/);
  });

  it("'0 replies' for no replies", () => {
    const t = { ...baseThread, replies: [] };
    render(<ThreadCard thread={t} />);
    expect(
      document.querySelector('[data-slot="thread-card-replies"]')?.textContent,
    ).toMatch(/^0\s+replies$/);
  });
});

describe("ThreadCard — body preview", () => {
  it("renders the full body verbatim when ≤ 200 chars", () => {
    render(<ThreadCard thread={baseThread} />);
    const preview = document.querySelector(
      '[data-slot="thread-card-preview"]',
    ) as HTMLElement;
    expect(preview.textContent).toBe(baseThread.body);
  });

  it("truncates bodies > 200 chars at a word boundary with an ellipsis", () => {
    const long = "x ".repeat(150).trim(); // ~300 chars, lots of spaces
    const t = { ...baseThread, body: long };
    render(<ThreadCard thread={t} />);
    const preview = document.querySelector(
      '[data-slot="thread-card-preview"]',
    ) as HTMLElement;
    const text = preview.textContent ?? "";
    expect(text.endsWith("…")).toBe(true);
    // Truncated portion stays within 201 chars (200 + ellipsis)
    expect(text.length).toBeLessThanOrEqual(201);
    // No trailing whitespace before the ellipsis
    expect(text).not.toMatch(/\s…$/);
  });

  it("if there is no word boundary in the first 200 chars, hard-cuts at 200 + …", () => {
    const noSpaces = "y".repeat(300);
    const t = { ...baseThread, body: noSpaces };
    render(<ThreadCard thread={t} />);
    const preview = (
      document.querySelector('[data-slot="thread-card-preview"]') as HTMLElement
    ).textContent;
    expect(preview).toBe(`${"y".repeat(200)}…`);
  });
});

describe("ThreadCard — sanity against THREADS fixture", () => {
  it.each(THREADS)("$id renders without error and links to its room+id", (thread) => {
    const { unmount } = render(<ThreadCard thread={thread} />);
    const card = document.querySelector('[data-slot="thread-card"]') as HTMLElement;
    expect(card.getAttribute("data-thread-id")).toBe(thread.id);
    const link = within(card).getByRole("link");
    expect(link.getAttribute("href")).toBe(
      `/kindleminds/rooms/${thread.roomSlug}/${thread.id}`,
    );
    unmount();
  });
});
