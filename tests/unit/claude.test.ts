import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the spawn boundary. Only the subprocess (`claude -p ...`) is mocked;
// extractJson, JSON.parse, and the Zod validation in lib/claude.ts run for real.
const { mockSpawn } = vi.hoisted(() => ({ mockSpawn: vi.fn() }));
vi.mock("node:child_process", () => ({
  default: { spawn: mockSpawn },
  spawn: mockSpawn,
}));

import { generateLessonPlan } from "@/lib/claude";
import type { LessonPlan, LessonPlanInput } from "@/lib/types";

type ChildBehavior = {
  stdout?: string;
  stderr?: string;
  code?: number;
  spawnError?: Error;
  /** Don't emit close/error — used to test the timeout path. */
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

const baseInput: LessonPlanInput = {
  childAge: 9,
  learningStyle: "visual",
  subjects: ["math", "reading"],
  hoursPerWeek: 10,
};

function validPlanJson(overrides: Partial<LessonPlan> = {}): string {
  const session = {
    subject: "math",
    title: "Counting",
    description: "Count things visually.",
    materials: ["paper"],
    minutes: 30,
  };
  const plan: LessonPlan = {
    id: "ignored-overwritten-by-wrapper",
    createdAt: "2026-05-23T18:00:00.000Z",
    input: baseInput,
    summary: "A simple visual week.",
    days: [
      { day: "Mon", sessions: [session] },
      { day: "Tue", sessions: [session] },
      { day: "Wed", sessions: [session] },
      { day: "Thu", sessions: [session] },
      { day: "Fri", sessions: [session] },
    ],
    ...overrides,
  };
  return JSON.stringify(plan);
}

beforeEach(() => {
  mockSpawn.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateLessonPlan — happy paths", () => {
  it("parses bare JSON output and returns a validated LessonPlan", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson(), code: 0 }) as never,
    );
    const plan = await generateLessonPlan(baseInput);
    expect(plan.days).toHaveLength(5);
    expect(plan.days[0].day).toBe("Mon");
    expect(plan.summary).toMatch(/visual week/i);
  });

  it("strips ```json fenced output", async () => {
    const json = validPlanJson();
    const fenced = "Sure, here is the plan:\n```json\n" + json + "\n```\n";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const plan = await generateLessonPlan(baseInput);
    expect(plan.days).toHaveLength(5);
  });

  it("strips bare ``` fenced output", async () => {
    const json = validPlanJson();
    const fenced = "```\n" + json + "\n```";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const plan = await generateLessonPlan(baseInput);
    expect(plan.days).toHaveLength(5);
  });

  it("falls back to the outermost {...} when wrapped in prose", async () => {
    const json = validPlanJson();
    const wrapped = `Here you go!\n${json}\n— enjoy!`;
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: wrapped, code: 0 }) as never,
    );
    const plan = await generateLessonPlan(baseInput);
    expect(plan.days).toHaveLength(5);
  });

  it("invokes spawn with the `claude` binary and the prompt args", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson(), code: 0 }) as never,
    );
    await generateLessonPlan(baseInput);
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const call = mockSpawn.mock.calls[0];
    expect(call[0]).toBe("claude");
    const args = call[1] as string[];
    expect(args).toContain("-p");
    expect(args).toContain("--append-system-prompt");
    expect(args).toContain("--output-format");
    expect(args).toContain("text");
    // The user prompt should mention the child's subjects and hours target
    const prompt = args[args.indexOf("-p") + 1];
    expect(prompt).toContain("math");
    expect(prompt).toContain("reading");
    expect(prompt).toContain(String(baseInput.hoursPerWeek * 60));
  });
});

describe("generateLessonPlan — failure modes", () => {
  it("rejects when claude returns non-JSON text", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: "no idea what you're asking", code: 0 }) as never,
    );
    await expect(generateLessonPlan(baseInput)).rejects.toThrow(/non-JSON|JSON/i);
  });

  it("rejects when claude returns JSON that fails schema validation", async () => {
    // Missing required field `summary`
    const invalid = JSON.stringify({
      id: "x",
      createdAt: "2026-05-23T18:00:00.000Z",
      input: baseInput,
      days: [],
    });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: invalid, code: 0 }) as never,
    );
    await expect(generateLessonPlan(baseInput)).rejects.toThrow();
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
    await expect(generateLessonPlan(baseInput)).rejects.toThrow(
      /exited with code 1.*rate limited/,
    );
  });

  it("rejects when spawn itself errors (missing binary)", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ spawnError: err }) as never,
    );
    await expect(generateLessonPlan(baseInput)).rejects.toThrow(/failed to spawn/i);
  });
});
