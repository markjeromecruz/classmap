import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import ThreadPage from "@/app/kindleminds/rooms/[slug]/[threadId]/page";
import {
  THREADS,
  getRoom,
  getThread,
} from "@/lib/kindleminds-demo-data";

async function renderThread(slug: string, threadId: string) {
  const ui = await ThreadPage({
    params: Promise.resolve({ slug, threadId }),
  });
  return render(ui);
}

describe("ThreadPage — happy paths (all 10 prerendered threads)", () => {
  it.each(THREADS)(
    "$id renders kindleminds-thread with documented slots",
    async (thread) => {
      const { unmount } = await renderThread(thread.roomSlug, thread.id);
      const main = document.querySelector(
        '[data-slot="kindleminds-thread"]',
      ) as HTMLElement;
      expect(main).not.toBeNull();
      expect(main.getAttribute("data-thread-id")).toBe(thread.id);
      expect(main.getAttribute("data-room-slug")).toBe(thread.roomSlug);

      // h1 = thread title at thread-title slot
      const title = within(main).getByRole("heading", { level: 1 });
      expect(title.getAttribute("data-slot")).toBe("thread-title");
      expect(title.textContent).toBe(thread.title);

      // Body
      expect(
        within(main).getByText(thread.body, { collapseWhitespace: false }),
      ).toBeInTheDocument();
      expect(
        main.querySelector('[data-slot="thread-body"]')?.textContent,
      ).toBe(thread.body);

      // Stats
      expect(
        main.querySelector('[data-slot="thread-views"]')?.textContent,
      ).toBe(`${thread.views} views`);
      const replyCount = thread.replies.length;
      const replyWord = replyCount === 1 ? "reply" : "replies";
      expect(
        main.querySelector('[data-slot="thread-reply-count"]')?.textContent,
      ).toBe(`${replyCount} ${replyWord}`);

      // Replies section
      const repliesSection = main.querySelector(
        '[data-slot="thread-replies"]',
      ) as HTMLElement;
      expect(repliesSection.getAttribute("data-count")).toBe(String(replyCount));

      const replyEls = repliesSection.querySelectorAll(
        '[data-slot="thread-reply"]',
      );
      expect(replyEls).toHaveLength(replyCount);
      expect(
        Array.from(replyEls).map((el) => el.getAttribute("data-reply-id")),
      ).toEqual(thread.replies.map((r) => r.id));

      // Each reply body matches source
      for (const reply of thread.replies) {
        const item = repliesSection.querySelector(
          `[data-reply-id="${reply.id}"]`,
        ) as HTMLElement;
        const body = item.querySelector(
          '[data-slot="thread-reply-body"]',
        ) as HTMLElement;
        expect(body.textContent).toBe(reply.body);
      }

      // back link names the room
      const room = getRoom(thread.roomSlug)!;
      expect(
        within(main).getByRole("link", { name: new RegExp(room.name) }),
      ).toHaveAttribute("href", `/kindleminds/rooms/${thread.roomSlug}`);

      unmount();
    },
  );
});

describe("ThreadPage — author + date kickers", () => {
  it("thread header shows the author and 'Month D, YYYY at H:MM' for thread post", async () => {
    const t = getThread("th-cls-01")!;
    await renderThread(t.roomSlug, t.id);
    expect(screen.getAllByText(t.author)[0]).toBeInTheDocument();
    // "May 19, 2026 at" — the time portion depends on the test runner's local
    // timezone, so just assert the date prefix and the "at" separator.
    expect(
      screen.getAllByText(/May\s+19,?\s+2026\s+at/i).length,
    ).toBeGreaterThan(0);
  });

  it("each reply shows its own author kicker", async () => {
    const t = getThread("th-cls-01")!;
    await renderThread(t.roomSlug, t.id);
    for (const reply of t.replies) {
      expect(screen.getByText(reply.author)).toBeInTheDocument();
    }
  });
});

describe("ThreadPage — replies-empty branch", () => {
  it("renders the empty placeholder when a thread has no replies (uses a fixture from THREADS)", async () => {
    const empty = THREADS.find((t) => t.replies.length === 0);
    expect(empty, "demo data should include at least one empty-reply thread").toBeDefined();
    if (!empty) return;
    await renderThread(empty.roomSlug, empty.id);
    expect(
      document.querySelector('[data-slot="thread-replies-empty"]'),
    ).not.toBeNull();
    expect(
      document.querySelectorAll('[data-slot="thread-reply"]'),
    ).toHaveLength(0);
  });
});

describe("ThreadPage — generateStaticParams + dynamicParams + notFound", () => {
  it("generateStaticParams produces one entry per thread with matching slug + id", async () => {
    const mod = await import(
      "@/app/kindleminds/rooms/[slug]/[threadId]/page"
    );
    const params = mod.generateStaticParams();
    expect(params).toHaveLength(THREADS.length);
    const set = new Set(params.map((p) => `${p.slug}/${p.threadId}`));
    for (const t of THREADS) {
      expect(set.has(`${t.roomSlug}/${t.id}`)).toBe(true);
    }
  });

  it("dynamicParams = false", async () => {
    const mod = await import(
      "@/app/kindleminds/rooms/[slug]/[threadId]/page"
    );
    expect(mod.dynamicParams).toBe(false);
  });

  it("notFound() for an unknown threadId", async () => {
    await expect(
      ThreadPage({
        params: Promise.resolve({ slug: "classical", threadId: "missing" }),
      }),
    ).rejects.toThrow();
  });

  it("notFound() when slug ≠ roomSlug (defends against URL tampering)", async () => {
    // th-cls-01 belongs to 'classical'; mismatch with 'unschooling' should 404
    await expect(
      ThreadPage({
        params: Promise.resolve({
          slug: "unschooling",
          threadId: "th-cls-01",
        }),
      }),
    ).rejects.toThrow();
  });
});

describe("ThreadPage — generateMetadata", () => {
  it("returns 'Thread not found' for unknown threadId", async () => {
    const mod = await import(
      "@/app/kindleminds/rooms/[slug]/[threadId]/page"
    );
    const meta = await mod.generateMetadata({
      params: Promise.resolve({ slug: "classical", threadId: "missing" }),
    });
    expect(meta.title).toMatch(/thread not found/i);
  });

  it("returns title + 160-char description preview for a known thread", async () => {
    const mod = await import(
      "@/app/kindleminds/rooms/[slug]/[threadId]/page"
    );
    const t = getThread("th-cls-01")!;
    const meta = await mod.generateMetadata({
      params: Promise.resolve({ slug: t.roomSlug, threadId: t.id }),
    });
    expect(meta.title).toContain(t.title);
    expect(meta.description).toBe(t.body.slice(0, 160));
  });
});
