import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { AppCard } from "@/components/portfolio/AppCard";

const baseProps = {
  index: 1,
  category: "Homeschool",
  title: "ClassMap",
  tagline: "AI homeschool lesson planner",
  description: "Generate a 5-day lesson plan tuned to your child.",
  highlights: ["5-day plan", "Subject coverage", "Saves locally"],
};

describe("AppCard — live with href", () => {
  it("wraps in a link, shows the live status, and renders the Read on affordance", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    const link = screen.getByRole("link", { name: /classmap/i });
    expect(link).toHaveAttribute("href", "/classmap");
    expect(within(link).getByText(/now serving/i)).toBeInTheDocument();
    expect(within(link).getByText(/read on/i)).toBeInTheDocument();
  });

  it("renders the title as a semantic heading", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    const heading = screen.getByRole("heading", { level: 2, name: "ClassMap" });
    expect(heading).toBeInTheDocument();
  });

  it("renders all highlights as bullet items", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    for (const h of baseProps.highlights) {
      expect(screen.getByText(h)).toBeInTheDocument();
    }
  });

  it("formats the entry index with a leading zero", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    expect(screen.getByText(/entry №01/i)).toBeInTheDocument();
  });
});

describe("AppCard — non-live variants", () => {
  it("in-progress: no link wrapper, no Read on, status label set", () => {
    render(<AppCard {...baseProps} status="in-progress" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/in press/i)).toBeInTheDocument();
    expect(screen.queryByText(/read on/i)).toBeNull();
  });

  it("coming-soon: no link wrapper, no Read on, status label set", () => {
    render(<AppCard {...baseProps} status="coming-soon" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/forthcoming/i)).toBeInTheDocument();
    expect(screen.queryByText(/read on/i)).toBeNull();
  });

  it("live without href falls back to non-interactive (no link)", () => {
    render(<AppCard {...baseProps} status="live" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByText(/read on/i)).toBeNull();
    expect(screen.getByText(/now serving/i)).toBeInTheDocument();
  });
});

describe("AppCard — content rendering", () => {
  it("renders the title in a h2 heading (ISS-03 fixed in A-09)", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("ClassMap");
  });

  it("renders tagline and description", () => {
    render(<AppCard {...baseProps} status="live" href="/classmap" />);
    expect(screen.getByText(baseProps.tagline)).toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
  });

  it("renders zero highlights without crashing", () => {
    render(<AppCard {...baseProps} highlights={[]} status="live" href="/classmap" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("ClassMap");
    for (const h of baseProps.highlights) {
      expect(screen.queryByText(h)).toBeNull();
    }
  });
});
