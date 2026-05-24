import { describe, expect, it } from "vitest";

import {
  devotionalSchema,
  familyAltarSchema,
  journalEntrySchema,
} from "@/lib/patriarch-types";
import {
  DEVOTIONALS,
  FAMILY_ALTARS,
  JOURNAL_ENTRIES,
  getDevotionalById,
  getFamilyAltarById,
  getTodayDevotional,
} from "@/lib/patriarch-demo-data";

describe("Patriarch DEVOTIONALS — schema conformance", () => {
  it.each(DEVOTIONALS)("$id parses cleanly against devotionalSchema", (d) => {
    const r = devotionalSchema.safeParse(d);
    if (!r.success) {
      throw new Error(
        `${d.id} failed: ${r.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" | ")}`,
      );
    }
    expect(r.success).toBe(true);
  });

  it("ids are unique across DEVOTIONALS", () => {
    const ids = DEVOTIONALS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("the seeded set has at least 3 devotionals", () => {
    expect(DEVOTIONALS.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Patriarch FAMILY_ALTARS — schema conformance", () => {
  it.each(FAMILY_ALTARS)("$id parses cleanly against familyAltarSchema", (a) => {
    const r = familyAltarSchema.safeParse(a);
    if (!r.success) {
      throw new Error(
        `${a.id} failed: ${r.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" | ")}`,
      );
    }
    expect(r.success).toBe(true);
  });

  it("ids are unique across FAMILY_ALTARS", () => {
    const ids = FAMILY_ALTARS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("minutes stay within the documented 5..45 bound", () => {
    for (const a of FAMILY_ALTARS) {
      expect(a.minutes).toBeGreaterThanOrEqual(5);
      expect(a.minutes).toBeLessThanOrEqual(45);
    }
  });
});

describe("Patriarch JOURNAL_ENTRIES — schema conformance", () => {
  it.each(JOURNAL_ENTRIES)(
    "$id parses cleanly against journalEntrySchema",
    (e) => {
      const r = journalEntrySchema.safeParse(e);
      if (!r.success) {
        throw new Error(
          `${e.id} failed: ${r.error.issues
            .slice(0, 3)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join(" | ")}`,
        );
      }
      expect(r.success).toBe(true);
    },
  );

  it("ids are unique across JOURNAL_ENTRIES", () => {
    const ids = JOURNAL_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Patriarch lookup helpers", () => {
  it("getTodayDevotional returns a schema-valid devotional", () => {
    const d = getTodayDevotional();
    expect(devotionalSchema.safeParse(d).success).toBe(true);
  });

  it("getTodayDevotional returns the first entry in DEVOTIONALS (deterministic for demo)", () => {
    expect(getTodayDevotional().id).toBe(DEVOTIONALS[0].id);
  });

  it("getDevotionalById returns the matching entry", () => {
    const first = DEVOTIONALS[0];
    expect(getDevotionalById(first.id)?.id).toBe(first.id);
  });

  it("getDevotionalById returns undefined for an unknown id", () => {
    expect(getDevotionalById("missing")).toBeUndefined();
  });

  it("getFamilyAltarById returns the matching entry", () => {
    const first = FAMILY_ALTARS[0];
    expect(getFamilyAltarById(first.id)?.title).toBe(first.title);
  });

  it("getFamilyAltarById returns undefined for an unknown id", () => {
    expect(getFamilyAltarById("missing")).toBeUndefined();
  });
});
