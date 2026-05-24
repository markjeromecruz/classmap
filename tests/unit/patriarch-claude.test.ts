import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the spawn boundary; the rest of generateDevotional (JSON extract,
// JSON.parse, Zod validation) runs for real. Mirrors the A-02 claude.test
// pattern.
const { mockSpawn } = vi.hoisted(() => ({ mockSpawn: vi.fn() }));
vi.mock("node:child_process", () => ({
  default: { spawn: mockSpawn },
  spawn: mockSpawn,
}));

import { generateDevotional } from "@/lib/patriarch-claude";
import type { Devotional } from "@/lib/patriarch-types";

type ChildBehavior = {
  stdout?: string;
  stderr?: string;
  code?: number;
  spawnError?: Error;
  hang?: boolean;
};

function makeFakeChild(behavior: ChildBehavior) {
  const child = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter;
    stderr: EventEmitter;
    kill: ReturnType<typeof vi.fn>;
  };
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = vi.fn();
  if (!behavior.hang) {
    setImmediate(() => {
      if (behavior.spawnError) {
        child.emit("error", behavior.spawnError);
        return;
      }
      if (behavior.stdout) {
        child.stdout.emit("data", Buffer.from(behavior.stdout, "utf8"));
      }
      if (behavior.stderr) {
        child.stderr.emit("data", Buffer.from(behavior.stderr, "utf8"));
      }
      child.emit("close", behavior.code ?? 0);
    });
  }
  return child;
}

function validDevotionalJson(overrides: Partial<Devotional> = {}): string {
  const base: Devotional = {
    id: "ignored-overwritten",
    date: "Monday, January 1",
    theme: "Quiet courage",
    scriptureReference: "Joshua 1:9",
    scriptureText:
      "Be strong and courageous. Do not be frightened, for the Lord your God is with you wherever you go.",
    reflection:
      "Courage in a household is rarely loud. It is showing up at dinner, apologizing first, keeping a low voice when the milk spills again.",
    prompt: "Where is fear telling you to disappear today?",
    prayer:
      "Father, make me reliable in the small rooms of my house. Strengthen me when no one is watching.",
    ...overrides,
  };
  return JSON.stringify(base);
}

beforeEach(() => {
  mockSpawn.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("generateDevotional — happy paths", () => {
  it("parses bare JSON output and returns a validated Devotional", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validDevotionalJson(), code: 0 }) as never,
    );
    const d = await generateDevotional();
    expect(d.theme).toBe("Quiet courage");
    expect(d.scriptureReference).toBe("Joshua 1:9");
  });

  it("strips ```json fenced output", async () => {
    const fenced = "Sure:\n```json\n" + validDevotionalJson() + "\n```\n";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const d = await generateDevotional();
    expect(d.theme).toBe("Quiet courage");
  });

  it("strips bare ``` fenced output", async () => {
    const fenced = "```\n" + validDevotionalJson() + "\n```";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const d = await generateDevotional();
    expect(d.scriptureReference).toBe("Joshua 1:9");
  });

  it("falls back to the outermost {...} when wrapped in prose", async () => {
    const wrapped = `Here you go!\n${validDevotionalJson()}\n— enjoy!`;
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: wrapped, code: 0 }) as never,
    );
    const d = await generateDevotional();
    expect(d.theme).toBe("Quiet courage");
  });

  it("invokes spawn with the `claude` binary and the right argv", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validDevotionalJson(), code: 0 }) as never,
    );
    await generateDevotional({ theme: "On being interruptible", focus: "evening" });
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const [bin, args] = mockSpawn.mock.calls[0] as [string, string[]];
    expect(bin).toBe("claude");
    expect(args).toContain("-p");
    expect(args).toContain("--append-system-prompt");
    expect(args).toContain("--output-format");
    expect(args).toContain("text");
    const prompt = args[args.indexOf("-p") + 1];
    expect(prompt).toContain("On being interruptible");
    expect(prompt).toContain("evening");
  });

  it("threads the caller-supplied date into the prompt", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validDevotionalJson(), code: 0 }) as never,
    );
    await generateDevotional({ date: "Tuesday, March 5" });
    const args = mockSpawn.mock.calls[0][1] as string[];
    const prompt = args[args.indexOf("-p") + 1];
    expect(prompt).toContain("Tuesday, March 5");
  });
});

describe("generateDevotional — failure modes", () => {
  it("rejects when claude returns non-JSON text", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: "no idea", code: 0 }) as never,
    );
    await expect(generateDevotional()).rejects.toThrow(/non-JSON|JSON/i);
  });

  it("rejects when claude returns JSON that fails schema validation", async () => {
    const invalid = JSON.stringify({
      id: "x",
      date: "Monday",
      theme: "Quiet courage",
      // missing scripture / reflection / prompt / prayer
    });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: invalid, code: 0 }) as never,
    );
    await expect(generateDevotional()).rejects.toThrow();
  });

  it("rejects when claude exits non-zero, surfacing stderr", async () => {
    mockSpawn.mockImplementation(
      () =>
        makeFakeChild({
          stdout: "",
          stderr: "rate limited",
          code: 1,
        }) as never,
    );
    await expect(generateDevotional()).rejects.toThrow(
      /exited with code 1.*rate limited/,
    );
  });

  it("rejects when spawn itself errors (missing binary)", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ spawnError: err }) as never,
    );
    await expect(generateDevotional()).rejects.toThrow(/failed to spawn/i);
  });
});
