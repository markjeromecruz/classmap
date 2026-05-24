import { describe, expect, it } from "vitest";

describe("Vitest sanity", () => {
  it("runs at all", () => {
    expect(1 + 1).toBe(2);
  });

  it("jsdom is available", () => {
    const el = document.createElement("div");
    el.textContent = "hi";
    expect(el.textContent).toBe("hi");
  });
});
