import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import Home from "@/app/page";

describe("Portfolio landing — masthead", () => {
  it("renders the KindleMinds h1 with the italic Minds half", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Kindle\s*Minds/i }),
    ).toBeInTheDocument();
  });

  it("shows the editor + volume kickers and the editorial italic byline", () => {
    render(<Home />);
    expect(screen.getByText(/Vol\.\s*I\s*·\s*No\.\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/Mark Jerome Cruz/)).toBeInTheDocument();
    expect(screen.getByText(/— The editor/)).toBeInTheDocument();
  });
});

describe("Portfolio landing — In this volume", () => {
  function getCard(title: string): HTMLElement {
    return screen.getByRole("link", { name: new RegExp(title, "i") });
  }

  it("renders three live app cards: ClassMap, KindleMinds, Patriarch (KM-05 + PT-04 contract)", () => {
    render(<Home />);
    for (const title of ["ClassMap", "KindleMinds", "Patriarch"]) {
      const link = getCard(title);
      expect(link).toBeInTheDocument();
      // Live status surfaces the "Now serving" copy from AppCard
      expect(within(link).getByText(/now serving/i)).toBeInTheDocument();
      // And the Read-on affordance
      expect(within(link).getByText(/read on/i)).toBeInTheDocument();
    }
  });

  it("ClassMap card → /classmap", () => {
    render(<Home />);
    expect(getCard("ClassMap")).toHaveAttribute("href", "/classmap");
  });

  it("KindleMinds card → /kindleminds (KM-05)", () => {
    render(<Home />);
    expect(getCard("KindleMinds")).toHaveAttribute("href", "/kindleminds");
  });

  it("Patriarch card → /patriarch", () => {
    render(<Home />);
    expect(getCard("Patriarch")).toHaveAttribute("href", "/patriarch");
  });

  it("none of the three cards show the non-live 'Awaiting volume' footer", () => {
    render(<Home />);
    for (const title of ["ClassMap", "KindleMinds", "Patriarch"]) {
      const link = getCard(title);
      expect(within(link).queryByText(/awaiting volume/i)).toBeNull();
    }
  });

  it("KindleMinds card category is 'Community'", () => {
    render(<Home />);
    const link = getCard("KindleMinds");
    // Category appears in both the Entry kicker and the Vol. I footer.
    expect(within(link).getAllByText(/Community/).length).toBeGreaterThan(0);
  });

  it("KindleMinds card highlights mention the 5 rooms (proof the copy was rewritten, not stale)", () => {
    render(<Home />);
    const link = getCard("KindleMinds");
    expect(within(link).getByText(/five rooms/i)).toBeInTheDocument();
  });
});

describe("Portfolio landing — method + colophon", () => {
  it("renders the three-agent method columns A / B / C", () => {
    render(<Home />);
    expect(screen.getByText(/Editor/)).toBeInTheDocument();
    expect(screen.getByText(/Compositor/)).toBeInTheDocument();
    expect(screen.getByText(/Proofreader/)).toBeInTheDocument();
  });

  it("colophon links to the GitHub repo", () => {
    render(<Home />);
    // Card descriptions mention "GitHub Pages", so match the exact GitHub link
    // by its visible text (just "GitHub", inside the colophon paragraph).
    expect(
      screen.getByRole("link", { name: /^github$/i }),
    ).toHaveAttribute("href", "https://github.com/markjeromecruz/classmap");
  });
});
