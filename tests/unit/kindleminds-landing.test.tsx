import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import KindleMindsLandingPage from "@/app/kindleminds/page";
import { RoomCard } from "@/components/kindleminds/RoomCard";
import { ROOMS } from "@/lib/kindleminds-demo-data";
import { CURRICULUM_STYLES } from "@/lib/kindleminds-types";

describe("KindleMinds landing page", () => {
  it("exposes the documented data-slot on <main>", () => {
    render(<KindleMindsLandingPage />);
    expect(
      document.querySelector('[data-slot="kindleminds-landing"]'),
    ).not.toBeNull();
  });

  it("renders the masthead h1 + dek + back link", () => {
    render(<KindleMindsLandingPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /kindleminds/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/a quiet forum/i)).toBeInTheDocument();
    const back = screen.getByRole("link", { name: /back to portfolio/i });
    expect(back).toHaveAttribute("href", "/");
  });

  it("renders the rooms grid with data-count = 5", () => {
    render(<KindleMindsLandingPage />);
    const grid = document.querySelector(
      '[data-slot="rooms-grid"]',
    ) as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.getAttribute("data-count")).toBe("5");
  });

  it("renders exactly 5 room cards, one per CURRICULUM_STYLES slug", () => {
    render(<KindleMindsLandingPage />);
    const cards = document.querySelectorAll('[data-slot="room-card"]');
    expect(cards).toHaveLength(5);
    const slugs = Array.from(cards)
      .map((c) => c.getAttribute("data-room-slug"))
      .sort();
    expect(slugs).toEqual([...CURRICULUM_STYLES].sort());
  });

  it("each card links to /kindleminds/rooms/<slug>", () => {
    render(<KindleMindsLandingPage />);
    const cards = document.querySelectorAll('[data-slot="room-card"]');
    for (const card of Array.from(cards)) {
      const slug = card.getAttribute("data-room-slug");
      expect(card.getAttribute("href")).toBe(`/kindleminds/rooms/${slug}`);
    }
  });

  it("each card shows its room name as an h2", () => {
    render(<KindleMindsLandingPage />);
    for (const room of ROOMS) {
      const card = document.querySelector(
        `[data-room-slug="${room.slug}"]`,
      ) as HTMLElement;
      expect(
        within(card).getByRole("heading", { level: 2, name: room.name }),
      ).toBeInTheDocument();
    }
  });

  it("footer shows the sum of all members, comma-formatted", () => {
    render(<KindleMindsLandingPage />);
    const total = ROOMS.reduce((n, r) => n + r.members, 0);
    expect(
      screen.getByText(
        new RegExp(`${total.toLocaleString()}\\s+members across all rooms`, "i"),
      ),
    ).toBeInTheDocument();
  });

  it("renders the Vol. I · Edition 01 kicker", () => {
    render(<KindleMindsLandingPage />);
    expect(screen.getByText(/vol\.\s*i\s*·\s*edition\s*01/i)).toBeInTheDocument();
  });
});

describe("RoomCard (in isolation)", () => {
  const room = ROOMS[0];

  it("renders link to /kindleminds/rooms/<slug> by default", () => {
    render(<RoomCard room={room} />);
    const link = document.querySelector(
      '[data-slot="room-card"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe(`/kindleminds/rooms/${room.slug}`);
    expect(link.getAttribute("data-room-slug")).toBe(room.slug);
  });

  it("respects a custom basePath", () => {
    render(<RoomCard room={room} basePath="/classmap/kindleminds" />);
    const link = document.querySelector(
      '[data-slot="room-card"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe(
      `/classmap/kindleminds/rooms/${room.slug}`,
    );
  });

  it("zero-pads the index in the kicker when provided", () => {
    render(<RoomCard room={room} index={3} />);
    expect(screen.getByText(/Room\s+№03/)).toBeInTheDocument();
  });

  it("keeps two-digit indexes verbatim", () => {
    render(<RoomCard room={room} index={12} />);
    expect(screen.getByText(/Room\s+№12/)).toBeInTheDocument();
  });

  it("omits the Room №NN kicker when no index is supplied", () => {
    render(<RoomCard room={room} />);
    expect(screen.queryByText(/Room\s+№/)).toBeNull();
  });

  it("shows comma-formatted member count", () => {
    render(<RoomCard room={ROOMS.find((r) => r.members >= 1000)!} />);
    const card = document.querySelector(
      '[data-slot="room-card"]',
    ) as HTMLElement;
    // members value contains a comma when ≥ 1000
    const memberCount = ROOMS.find((r) => r.members >= 1000)!.members;
    expect(
      within(card).getByText(
        new RegExp(`${memberCount.toLocaleString()}\\s+members`, "i"),
      ),
    ).toBeInTheDocument();
  });

  it("renders the room blurb body", () => {
    render(<RoomCard room={room} />);
    expect(screen.getByText(room.blurb)).toBeInTheDocument();
  });

  it("falls back gracefully on an unknown accent (treats as ink)", () => {
    const odd = { ...room, accent: "not-a-color" };
    render(<RoomCard room={odd} />);
    // Should not throw, link still renders
    expect(document.querySelector('[data-slot="room-card"]')).not.toBeNull();
  });
});
