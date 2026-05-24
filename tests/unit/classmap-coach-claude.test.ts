import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the spawn boundary; extractJson + JSON.parse + zod parse run for real.
const { mockSpawn } = vi.hoisted(() => ({ mockSpawn: vi.fn() }));
vi.mock("node:child_process", () => ({
  default: { spawn: mockSpawn },
  spawn: mockSpawn,
}));

import { generateCoachTurn } from "@/lib/classmap/coach-claude";
import type {
  ChatMessage,
  Child,
  StateRequirement,
} from "@/lib/classmap/types";

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

type CoachChildSummary = Pick<
  Child,
  | "name"
  | "age"
  | "grade"
  | "learningStyle"
  | "curriculumApproach"
  | "state"
  | "xpTotal"
  | "streakDays"
>;

const ada: CoachChildSummary = {
  name: "Ada",
  age: 9,
  grade: "4",
  learningStyle: "visual",
  curriculumApproach: "eclectic",
  state: "CA",
  xpTotal: 320,
  streakDays: 5,
};

const theo: CoachChildSummary = {
  name: "Theo",
  age: 7,
  grade: "2",
  learningStyle: "kinesthetic",
  curriculumApproach: "charlotte-mason",
  state: "OR",
  xpTotal: 120,
  streakDays: 0,
};

const baseInput = {
  family: { children: [ada, theo] },
  conversation: [] as ChatMessage[],
  userMessage: "What should we do about Theo's streak resetting?",
};

function reply(content: string): string {
  return JSON.stringify({ content });
}

beforeEach(() => {
  mockSpawn.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("generateCoachTurn — happy paths", () => {
  it("parses bare JSON output and returns the content", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("How many minutes is Theo working most days?"), code: 0 }) as never,
    );
    const r = await generateCoachTurn(baseInput);
    expect(r.content).toBe("How many minutes is Theo working most days?");
  });

  it("strips ```json fenced output", async () => {
    const fenced = "```json\n" + reply("Try one short subject in the morning.") + "\n```";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const r = await generateCoachTurn(baseInput);
    expect(r.content).toMatch(/short subject in the morning/);
  });

  it("strips bare ``` fenced output", async () => {
    const fenced = "```\n" + reply("Pick one subject to anchor each day.") + "\n```";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const r = await generateCoachTurn(baseInput);
    expect(r.content).toBe("Pick one subject to anchor each day.");
  });

  it("falls back to the outermost {...} when wrapped in prose", async () => {
    const wrapped = `Sure: ${reply("Anchor the morning first.")} done.`;
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: wrapped, code: 0 }) as never,
    );
    const r = await generateCoachTurn(baseInput);
    expect(r.content).toBe("Anchor the morning first.");
  });
});

describe("generateCoachTurn — prompt contract", () => {
  it("invokes spawn with the right argv and a prompt that lists every child + the user message", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn(baseInput);
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const [bin, args] = mockSpawn.mock.calls[0] as [string, string[]];
    expect(bin).toBe("claude");
    expect(args).toContain("-p");
    expect(args).toContain("--append-system-prompt");
    expect(args).toContain("--output-format");
    expect(args).toContain("text");

    const prompt = args[args.indexOf("-p") + 1];
    // Both children listed with all surfaced fields
    for (const c of [ada, theo]) {
      expect(prompt).toContain(c.name);
      expect(prompt).toContain(`age ${c.age}`);
      expect(prompt).toContain(`grade ${c.grade}`);
      expect(prompt).toContain(c.learningStyle);
      expect(prompt).toContain(c.curriculumApproach);
      expect(prompt).toContain(c.state);
      expect(prompt).toContain(`${c.xpTotal} XP`);
      expect(prompt).toContain(`${c.streakDays}-day streak`);
    }
    expect(prompt).toContain(baseInput.userMessage);
    expect(prompt).toMatch(/JSON only:\s*\{ "content"/);
  });

  it("renders '- (no children on file)' when family.children is empty", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn({ ...baseInput, family: { children: [] } });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toContain("- (no children on file)");
  });

  it("includes ACTIVE CHILD line only when activeChildName is set", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn({
      ...baseInput,
      family: { ...baseInput.family, activeChildName: "Ada" },
    });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toContain("ACTIVE CHILD: Ada");

    // And it's absent when omitted (base case)
    mockSpawn.mockReset();
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn(baseInput);
    const prompt2 = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt2).not.toContain("ACTIVE CHILD:");
  });

  it("includes RECENT STATS block only when stats is supplied", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn({
      ...baseInput,
      stats: { tasksCompletedThisWeek: 12, currentStreak: 5, totalXp: 320 },
    });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toContain("RECENT STATS");
    expect(prompt).toContain("Tasks completed this week: 12");
    expect(prompt).toContain("Current streak: 5 days");
    expect(prompt).toContain("Total XP: 320");
  });

  it("includes STATE REQUIREMENT REFERENCE block only when stateRequirements is non-empty; '—' when hoursPerYear is null", async () => {
    const stateRequirements: StateRequirement[] = [
      {
        code: "CA",
        name: "California",
        hoursPerYear: null,
        subjectsRequired: ["math", "reading"],
        portfolioRequired: false,
        testingRequired: false,
        notificationOfIntent: true,
        notes: "PSA filing required.",
      },
    ];
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn({ ...baseInput, stateRequirements });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toContain("STATE REQUIREMENT REFERENCE");
    expect(prompt).toContain("California (CA)");
    expect(prompt).toContain("hours/year —");
    expect(prompt).toContain("PSA filing required.");
  });

  it("renders '(no prior turns)' when conversation is empty", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn(baseInput);
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toMatch(/CONVERSATION SO FAR\s*\(no prior turns\)/);
  });

  it("renders prior conversation as ordered [role] content lines", async () => {
    const conversation: ChatMessage[] = [
      { id: "1", role: "user", content: "Streak dropped.", ts: "2026-05-23T18:00:00.000Z" },
      { id: "2", role: "assistant", content: "Since when?", ts: "2026-05-23T18:00:05.000Z" },
    ];
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: reply("ok"), code: 0 }) as never,
    );
    await generateCoachTurn({ ...baseInput, conversation });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toContain("[user] Streak dropped.");
    expect(prompt).toContain("[assistant] Since when?");
    expect(prompt.indexOf("Streak dropped.")).toBeLessThan(
      prompt.indexOf("Since when?"),
    );
  });
});

describe("generateCoachTurn — failure modes", () => {
  it("rejects when claude returns non-JSON text", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: "no idea", code: 0 }) as never,
    );
    await expect(generateCoachTurn(baseInput)).rejects.toThrow(/non-JSON|JSON/i);
  });

  it("rejects when content is missing", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: JSON.stringify({}), code: 0 }) as never,
    );
    await expect(generateCoachTurn(baseInput)).rejects.toThrow();
  });

  it("rejects when content is empty", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: JSON.stringify({ content: "" }), code: 0 }) as never,
    );
    await expect(generateCoachTurn(baseInput)).rejects.toThrow();
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
    await expect(generateCoachTurn(baseInput)).rejects.toThrow(
      /exited with code 1.*rate limited/,
    );
  });

  it("rejects when spawn itself errors (missing binary)", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ spawnError: err }) as never,
    );
    await expect(generateCoachTurn(baseInput)).rejects.toThrow(/failed to spawn/i);
  });
});
