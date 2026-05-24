import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { AppCard } from "@/components/portfolio/AppCard";

const baseProps = {
  title: "ClassMap",
  tagline: "AI homeschool lesson planner",
  description: "Generate a 5-day lesson plan tuned to your child.",
  highlights: ["5-day plan", "Subject coverage", "Saves locally"],
};

describe("AppCard — live with href", () => {
  it("wraps in a link, shows the live status, and renders the Open demo affordance", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    const link = screen.getByRole("link", { name: /classmap/i });
    expect(link).toHaveAttribute("href", "/classmap");
    expect(within(link).getByText(/live demo/i)).toBeInTheDocument();
    expect(within(link).getByText(/open demo/i)).toBeInTheDocument();
  });

  it("renders all highlights as bullet items", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    for (const h of baseProps.highlights) {
      expect(screen.getByText(h)).toBeInTheDocument();
    }
  });
});

describe("AppCard — non-live variants", () => {
  it("in-progress: no link wrapper, no Open demo, status label set", () => {
    render(<AppCard {...baseProps} status="in-progress" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.queryByText(/open demo/i)).toBeNull();
  });

  it("coming-soon: no link wrapper, no Open demo, status label set", () => {
    render(<AppCard {...baseProps} status="coming-soon" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
    expect(screen.queryByText(/open demo/i)).toBeNull();
  });

  it("live without href falls back to non-interactive (no link)", () => {
    render(<AppCard {...baseProps} status="live" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText(/open demo/i)).toBeNull();
    // status badge still visible
    expect(screen.getByText(/live demo/i)).toBeInTheDocument();
  });
});

describe("AppCard — content rendering", () => {
  it("renders the title in the card-title slot (note: CardTitle is a <div>, see ISS-03)", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    const title = document.querySelector('[data-slot="card-title"]');
    expect(title).not.toBeNull();
    expect(title).toHaveTextContent("ClassMap");
  });

  it("renders tagline and description", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    expect(screen.getByText(baseProps.tagline)).toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
  });

  it("renders zero highlights without crashing", () => {
    render(<AppCard {...baseProps} highlights={[]} status="live" href="/classmap" />);
    // Title still present in card-title slot
    expect(document.querySelector('[data-slot="card-title"]')).toHaveTextContent(
      "ClassMap",
    );
    // No bullet item with our highlight strings
    for (const h of baseProps.highlights) {
      expect(screen.queryByText(h)).toBeNull();
    }
  });
});
