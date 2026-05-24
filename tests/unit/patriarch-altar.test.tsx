import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import PatriarchAltarPage from "@/app/patriarch/altar/page";
import AltarDetailPage from "@/app/patriarch/altar/[id]/page";
import { AltarCard } from "@/components/patriarch/AltarCard";
import { FAMILY_ALTARS } from "@/lib/patriarch-demo-data";

async function renderDetail(id: string) {
  const ui = await AltarDetailPage({ params: Promise.resolve({ id }) });
  return render(ui);
}

describe("PatriarchAltarPage — grid", () => {
  it("exposes the documented data-slots", () => {
    render(<PatriarchAltarPage />);
    expect(
      document.querySelector('[data-slot="patriarch-altar"]'),
    ).not.toBeNull();
    const grid = document.querySelector(
      '[data-slot="altar-grid"]',
    ) as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.getAttribute("data-count")).toBe(String(FAMILY_ALTARS.length));
  });

  it("renders one altar-card per FAMILY_ALTARS entry, in source order", () => {
    render(<PatriarchAltarPage />);
    const cards = document.querySelectorAll('[data-slot="altar-card"]');
    expect(cards).toHaveLength(FAMILY_ALTARS.length);
    expect(
      Array.from(cards).map((c) => c.getAttribute("data-altar-id")),
    ).toEqual(FAMILY_ALTARS.map((a) => a.id));
  });

  it("each card links to /patriarch/altar/<id>", () => {
    render(<PatriarchAltarPage />);
    for (const a of FAMILY_ALTARS) {
      const card = document.querySelector(
        `[data-altar-id="${a.id}"]`,
      ) as HTMLAnchorElement;
      expect(card.getAttribute("href")).toBe(`/patriarch/altar/${a.id}`);
    }
  });

  it("masthead h1 + dek + back link present", () => {
    render(<PatriarchAltarPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /plans for tonight/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/short, structured plans/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/patriarch",
    );
  });
});

describe("AltarCard (in isolation)", () => {
  const a = FAMILY_ALTARS[0];

  it("default link goes to /patriarch/altar/<id>", () => {
    render(<AltarCard altar={a} />);
    const link = document.querySelector(
      '[data-slot="altar-card"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe(`/patriarch/altar/${a.id}`);
    expect(link.getAttribute("data-altar-id")).toBe(a.id);
  });

  it("respects a custom basePath", () => {
    render(<AltarCard altar={a} basePath="/classmap/patriarch" />);
    const link = document.querySelector(
      '[data-slot="altar-card"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe(`/classmap/patriarch/altar/${a.id}`);
  });

  it("renders title as h2, plus ageRange, minutes, scriptureReference, openingQuestion", () => {
    render(<AltarCard altar={a} />);
    expect(
      screen.getByRole("heading", { level: 2, name: a.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(a.ageRange)).toBeInTheDocument();
    expect(screen.getByText(`${a.minutes} min`)).toBeInTheDocument();
    expect(screen.getByText(a.scripture.reference)).toBeInTheDocument();
    expect(screen.getByText(a.openingQuestion)).toBeInTheDocument();
  });
});

describe("AltarDetailPage — happy paths (all altars prerendered)", () => {
  it.each(FAMILY_ALTARS)(
    "$id renders with all 5 documented sub-slots",
    async (altar) => {
      const { unmount } = await renderDetail(altar.id);
      const root = document.querySelector(
        '[data-slot="altar-detail"]',
      ) as HTMLElement;
      expect(root).not.toBeNull();
      expect(root.getAttribute("data-altar-id")).toBe(altar.id);

      for (const slot of [
        "altar-scripture",
        "altar-opening-question",
        "altar-activity",
        "altar-closing-prayer",
      ]) {
        expect(
          root.querySelector(`[data-slot="${slot}"]`),
          `missing ${slot} on ${altar.id}`,
        ).not.toBeNull();
      }
      unmount();
    },
  );

  it("h1 is the altar title; ageRange + minutes show in masthead", async () => {
    const a = FAMILY_ALTARS[0];
    await renderDetail(a.id);
    expect(
      screen.getByRole("heading", { level: 1, name: a.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(a.ageRange)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${a.minutes}\\s+minutes`))).toBeInTheDocument();
  });

  it("scripture block contains reference + text (rendered in blockquote)", async () => {
    const a = FAMILY_ALTARS[0];
    await renderDetail(a.id);
    const scripture = document.querySelector(
      '[data-slot="altar-scripture"]',
    ) as HTMLElement;
    expect(scripture.tagName.toLowerCase()).toBe("blockquote");
    expect(within(scripture).getByText(a.scripture.reference)).toBeInTheDocument();
    expect(within(scripture).getByText(a.scripture.text)).toBeInTheDocument();
  });

  it("each text section renders its corresponding altar field", async () => {
    const a = FAMILY_ALTARS[0];
    await renderDetail(a.id);
    expect(
      document.querySelector('[data-slot="altar-opening-question"]')?.textContent,
    ).toContain(a.openingQuestion);
    expect(
      document.querySelector('[data-slot="altar-activity"]')?.textContent,
    ).toContain(a.activity);
    expect(
      document.querySelector('[data-slot="altar-closing-prayer"]')?.textContent,
    ).toContain(a.closingPrayer);
  });

  it("back link goes to /patriarch/altar", async () => {
    await renderDetail(FAMILY_ALTARS[0].id);
    expect(screen.getByRole("link", { name: /all plans/i })).toHaveAttribute(
      "href",
      "/patriarch/altar",
    );
  });
});

describe("AltarDetailPage — generateStaticParams + dynamicParams + notFound", () => {
  it("generateStaticParams covers exactly FAMILY_ALTARS", async () => {
    const mod = await import("@/app/patriarch/altar/[id]/page");
    const params = mod.generateStaticParams();
    expect(params.map((p) => p.id).sort()).toEqual(
      FAMILY_ALTARS.map((a) => a.id).sort(),
    );
  });

  it("dynamicParams = false", async () => {
    const mod = await import("@/app/patriarch/altar/[id]/page");
    expect(mod.dynamicParams).toBe(false);
  });

  it("notFound() throws for unknown id", async () => {
    await expect(
      AltarDetailPage({ params: Promise.resolve({ id: "not-an-altar" }) }),
    ).rejects.toThrow();
  });
});

describe("AltarDetailPage — generateMetadata", () => {
  it("returns 'not found' title for unknown id", async () => {
    const mod = await import("@/app/patriarch/altar/[id]/page");
    const meta = await mod.generateMetadata({
      params: Promise.resolve({ id: "nope" }),
    });
    expect(meta.title).toMatch(/not found/i);
  });

  it("returns the altar title and description for a known id", async () => {
    const a = FAMILY_ALTARS[0];
    const mod = await import("@/app/patriarch/altar/[id]/page");
    const meta = await mod.generateMetadata({
      params: Promise.resolve({ id: a.id }),
    });
    expect(meta.title).toContain(a.title);
    expect(meta.description).toContain(a.scripture.reference);
    expect(meta.description).toContain(`${a.minutes} min`);
    expect(meta.description).toContain(a.ageRange);
  });
});
