import { describe, expect, it } from "vitest";

import {
  CURRICULUM_STYLES,
  roomSchema,
  threadSchema,
} from "@/lib/kindleminds-types";
import {
  ROOMS,
  THREADS,
  getRoom,
  getThread,
  getThreadsForRoom,
} from "@/lib/kindleminds-demo-data";

describe("KindleMinds ROOMS — schema conformance", () => {
  it.each(ROOMS)("$slug parses cleanly against roomSchema", (room) => {
    const r = roomSchema.safeParse(room);
    if (!r.success) {
      throw new Error(
        `${room.slug} failed: ${r.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" | ")}`,
      );
    }
    expect(r.success).toBe(true);
  });

  it("covers every CURRICULUM_STYLES slug exactly once", () => {
    const slugs = ROOMS.map((r) => r.slug).sort();
    const expected = [...CURRICULUM_STYLES].sort();
    expect(slugs).toEqual(expected);
  });

  it("each room has a positive member count", () => {
    for (const room of ROOMS) {
      expect(room.members).toBeGreaterThan(0);
    }
  });
});

describe("KindleMinds THREADS — schema conformance", () => {
  it.each(THREADS)("$id parses cleanly against threadSchema", (thread) => {
    const r = threadSchema.safeParse(thread);
    if (!r.success) {
      throw new Error(
        `${thread.id} failed: ${r.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" | ")}`,
      );
    }
    expect(r.success).toBe(true);
  });

  it("every thread.roomSlug references an existing room", () => {
    const roomSlugs = new Set(ROOMS.map((r) => r.slug));
    for (const thread of THREADS) {
      expect(roomSlugs.has(thread.roomSlug)).toBe(true);
    }
  });

  it("thread ids are unique", () => {
    const ids = THREADS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reply ids within a thread are unique (ids may repeat across threads, that's fine)", () => {
    for (const thread of THREADS) {
      const ids = thread.replies.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("each room has at least one thread (so a non-empty room page is reachable)", () => {
    for (const room of ROOMS) {
      const threads = THREADS.filter((t) => t.roomSlug === room.slug);
      expect(threads.length).toBeGreaterThan(0);
    }
  });
});

describe("KindleMinds lookup helpers", () => {
  it("getRoom returns the matching room", () => {
    expect(getRoom("classical")?.name).toBe("The Classical Room");
  });

  it("getRoom returns undefined for an unknown slug", () => {
    expect(getRoom("not-a-room")).toBeUndefined();
  });

  it("getThreadsForRoom returns only threads in that room", () => {
    const result = getThreadsForRoom("classical");
    expect(result.length).toBeGreaterThan(0);
    for (const thread of result) {
      expect(thread.roomSlug).toBe("classical");
    }
  });

  it("getThreadsForRoom returns [] for an unknown slug", () => {
    expect(getThreadsForRoom("not-a-room")).toEqual([]);
  });

  it("getThread returns the matching thread by id", () => {
    const t = getThread("th-cls-01");
    expect(t?.title).toMatch(/latin/i);
  });

  it("getThread returns undefined for an unknown id", () => {
    expect(getThread("missing")).toBeUndefined();
  });
});
