import { describe, expect, it } from "vitest";
import { render, within } from "@testing-library/react";

import RoomPage from "@/app/kindleminds/rooms/[slug]/page";
import {
  ROOMS,
  THREADS,
  getRoom,
  getThreadsForRoom,
} from "@/lib/kindleminds-demo-data";
import { CURRICULUM_STYLES } from "@/lib/kindleminds-types";

async function renderRoom(slug: string) {
  const ui = await RoomPage({ params: Promise.resolve({ slug }) });
  return render(ui);
}

describe("RoomPage — happy paths (all 5 prerendered slugs)", () => {
  it.each(CURRICULUM_STYLES)("renders /kindleminds/rooms/%s with documented slots", async (slug) => {
    await renderRoom(slug);
    const room = getRoom(slug)!;
    const main = document.querySelector(
      '[data-slot="kindleminds-room"]',
    ) as HTMLElement;
    expect(main).not.toBeNull();
    expect(main.getAttribute("data-room-slug")).toBe(slug);

    // h1 is the room name
    expect(
      within(main).getByRole("heading", { level: 1, name: room.name }),
    ).toBeInTheDocument();

    // back link to /kindleminds
    const back = within(main).getByRole("link", { name: /all rooms/i });
    expect(back.getAttribute("href")).toBe("/kindleminds");

    // threads-list has the right data-count
    const list = document.querySelector(
      '[data-slot="threads-list"]',
    ) as HTMLElement;
    const expectedThreads = getThreadsForRoom(slug);
    expect(list.getAttribute("data-count")).toBe(String(expectedThreads.length));
  });

  it("threads-list contains one thread-card per thread, in source order", async () => {
    await renderRoom("classical");
    const cards = document.querySelectorAll('[data-slot="thread-card"]');
    const expected = getThreadsForRoom("classical").map((t) => t.id);
    expect(Array.from(cards).map((c) => c.getAttribute("data-thread-id"))).toEqual(
      expected,
    );
  });

  it("each thread-card carries the room slug it belongs to", async () => {
    await renderRoom("charlotte-mason");
    const cards = document.querySelectorAll('[data-slot="thread-card"]');
    for (const card of Array.from(cards)) {
      expect(card.getAttribute("data-room-slug")).toBe("charlotte-mason");
    }
  });

  it("renders room blurb and tradition in the masthead", async () => {
    await renderRoom("unschooling");
    const room = getRoom("unschooling")!;
    const main = document.querySelector(
      '[data-slot="kindleminds-room"]',
    ) as HTMLElement;
    expect(within(main).getByText(room.blurb)).toBeInTheDocument();
    expect(
      within(main).getByText(room.tradition, { exact: false }),
    ).toBeInTheDocument();
  });

  it("masthead shows comma-formatted member count and pluralized thread count", async () => {
    await renderRoom("classical");
    const room = getRoom("classical")!;
    const count = getThreadsForRoom("classical").length;
    const word = count === 1 ? "thread" : "threads";
    const main = document.querySelector(
      '[data-slot="kindleminds-room"]',
    ) as HTMLElement;
    expect(
      within(main).getByText(
        new RegExp(`${room.members.toLocaleString()}\\s+members\\s*·\\s*${count}\\s+${word}`),
      ),
    ).toBeInTheDocument();
  });
});

describe("RoomPage — generateStaticParams + dynamicParams=false", () => {
  it("generateStaticParams covers exactly CURRICULUM_STYLES", async () => {
    const mod = await import("@/app/kindleminds/rooms/[slug]/page");
    const params = mod.generateStaticParams();
    expect(params.map((p) => p.slug).sort()).toEqual([...CURRICULUM_STYLES].sort());
  });

  it("exports dynamicParams = false (Next 16 will 404 on miss instead of trying to render)", async () => {
    const mod = await import("@/app/kindleminds/rooms/[slug]/page");
    expect(mod.dynamicParams).toBe(false);
  });

  it("calls notFound() (throws NEXT_HTTP_ERROR_FALLBACK;404) on unknown slug", async () => {
    await expect(
      RoomPage({ params: Promise.resolve({ slug: "not-a-real-room" }) }),
    ).rejects.toThrow();
  });
});

describe("RoomPage — sanity against THREADS fixture", () => {
  it("the total of thread-cards rendered across all rooms equals THREADS.length", async () => {
    let total = 0;
    for (const slug of CURRICULUM_STYLES) {
      const { unmount } = await renderRoom(slug);
      total += document.querySelectorAll('[data-slot="thread-card"]').length;
      unmount();
    }
    expect(total).toBe(THREADS.length);
  });

  it("every room has at least one rendered thread (matches demo-data invariant)", async () => {
    for (const room of ROOMS) {
      const { unmount } = await renderRoom(room.slug);
      const cards = document.querySelectorAll('[data-slot="thread-card"]');
      expect(cards.length).toBeGreaterThan(0);
      unmount();
    }
  });
});

describe("RoomPage — generateMetadata", () => {
  it("returns 'Room not found' title for unknown slug", async () => {
    const mod = await import("@/app/kindleminds/rooms/[slug]/page");
    const meta = await mod.generateMetadata({
      params: Promise.resolve({ slug: "not-real" }),
    });
    expect(meta.title).toMatch(/room not found/i);
  });

  it("returns the room name + blurb for a known slug", async () => {
    const mod = await import("@/app/kindleminds/rooms/[slug]/page");
    const meta = await mod.generateMetadata({
      params: Promise.resolve({ slug: "classical" }),
    });
    const room = getRoom("classical")!;
    expect(meta.title).toContain(room.name);
    expect(meta.description).toBe(room.blurb);
  });
});
