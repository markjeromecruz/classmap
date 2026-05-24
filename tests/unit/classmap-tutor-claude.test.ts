import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the spawn boundary; extractJson + JSON.parse + zod parse run for real.
// Same vi.hoisted pattern as claude.test + patriarch-claude.test + plan-claude.test.
const { mockSpawn } = vi.hoisted(() => ({ mockSpawn: vi.fn() }));
vi.mock("node:child_process", () => ({
  default: { spawn: mockSpawn },
  spawn: mockSpawn,
}));

import { generateTutorTurn } from "@/lib/classmap/tutor-claude";
import type { ChatMessage, Child, LessonTask } from "@/lib/classmap/types";

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

const task: TutorTurnInputTask = {
  subject: "math",
  title: "Multiplication arrays on graph paper",
  description: "Build six 4×3 arrays and label them with the matching products.",
  materials: ["graph paper", "colored pencils"],
  minutes: 30,
};
type TutorTurnInputTask = Pick<
  LessonTask,
  "subject" | "title" | "description" | "materials" | "minutes"
>;

const childCtx: Pick<Child, "age" | "ageBand" | "learningStyle" | "name"> = {
  name: "Ada",
  age: 9,
  ageBand: "upper",
  learningStyle: "visual",
};

const baseInput = {
  task,
  child: childCtx,
  conversation: [] as ChatMessage[],
  userMessage: "I don't get how arrays work.",
};

function turn(content: string): string {
  return JSON.stringify({ content });
}

beforeEach(() => {
  mockSpawn.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("generateTutorTurn — happy paths", () => {
  it("parses bare JSON output and returns the content", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: turn("What does 4 + 4 + 4 look like?"), code: 0 }) as never,
    );
    const r = await generateTutorTurn(baseInput);
    expect(r.content).toBe("What does 4 + 4 + 4 look like?");
  });

  it("strips ```json fenced output", async () => {
    const fenced = "```json\n" + turn("Try drawing one row first.") + "\n```";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const r = await generateTutorTurn(baseInput);
    expect(r.content).toMatch(/drawing one row/);
  });

  it("strips bare ``` fenced output", async () => {
    const fenced = "```\n" + turn("Show me four rows.") + "\n```";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const r = await generateTutorTurn(baseInput);
    expect(r.content).toBe("Show me four rows.");
  });

  it("falls back to the outermost {...} when wrapped in prose", async () => {
    const wrapped = `Sure: ${turn("Count one row.")} done.`;
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: wrapped, code: 0 }) as never,
    );
    const r = await generateTutorTurn(baseInput);
    expect(r.content).toBe("Count one row.");
  });
});

describe("generateTutorTurn — prompt contract", () => {
  it("invokes spawn with the right argv and a prompt carrying lesson + child + user message", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: turn("ok"), code: 0 }) as never,
    );
    await generateTutorTurn(baseInput);
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const [bin, args] = mockSpawn.mock.calls[0] as [string, string[]];
    expect(bin).toBe("claude");
    expect(args).toContain("-p");
    expect(args).toContain("--append-system-prompt");
    expect(args).toContain("--output-format");
    expect(args).toContain("text");

    const prompt = args[args.indexOf("-p") + 1];
    expect(prompt).toContain(task.subject);
    expect(prompt).toContain(task.title);
    expect(prompt).toContain(task.description);
    expect(prompt).toContain("graph paper");
    expect(prompt).toContain("colored pencils");
    expect(prompt).toContain(String(task.minutes));
    expect(prompt).toContain(childCtx.name);
    expect(prompt).toContain(`${childCtx.age}`);
    expect(prompt).toContain(`band: ${childCtx.ageBand}`);
    expect(prompt).toContain(childCtx.learningStyle);
    expect(prompt).toContain("I don't get how arrays work.");
    expect(prompt).toMatch(/JSON only:\s*\{ "content"/);
  });

  it("renders 'none listed' when materials is empty", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: turn("ok"), code: 0 }) as never,
    );
    await generateTutorTurn({ ...baseInput, task: { ...task, materials: [] } });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toMatch(/Materials available:\s+none listed/);
  });

  it("renders '(no prior turns)' when conversation is empty", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: turn("ok"), code: 0 }) as never,
    );
    await generateTutorTurn(baseInput);
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toMatch(/CONVERSATION SO FAR\s*\(no prior turns\)/);
  });

  it("renders prior conversation as [role] content lines in order", async () => {
    const conversation: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "What are arrays?",
        ts: "2026-05-23T18:00:00.000Z",
      },
      {
        id: "2",
        role: "assistant",
        content: "What does 4 + 4 + 4 look like?",
        ts: "2026-05-23T18:00:05.000Z",
      },
      {
        id: "3",
        role: "user",
        content: "Twelve?",
        ts: "2026-05-23T18:00:30.000Z",
      },
    ];
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: turn("Yes — draw it."), code: 0 }) as never,
    );
    await generateTutorTurn({ ...baseInput, conversation });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toContain("[user] What are arrays?");
    expect(prompt).toContain("[assistant] What does 4 + 4 + 4 look like?");
    expect(prompt).toContain("[user] Twelve?");
    // Order preserved
    const u1 = prompt.indexOf("What are arrays?");
    const a = prompt.indexOf("What does 4 + 4 + 4");
    const u2 = prompt.indexOf("Twelve?");
    expect(u1).toBeLessThan(a);
    expect(a).toBeLessThan(u2);
  });
});

describe("generateTutorTurn — failure modes", () => {
  it("rejects when claude returns non-JSON text", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: "no idea", code: 0 }) as never,
    );
    await expect(generateTutorTurn(baseInput)).rejects.toThrow(/non-JSON|JSON/i);
  });

  it("rejects when content is missing", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: JSON.stringify({}), code: 0 }) as never,
    );
    await expect(generateTutorTurn(baseInput)).rejects.toThrow();
  });

  it("rejects when content is empty", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: JSON.stringify({ content: "" }), code: 0 }) as never,
    );
    await expect(generateTutorTurn(baseInput)).rejects.toThrow();
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
    await expect(generateTutorTurn(baseInput)).rejects.toThrow(
      /exited with code 1.*rate limited/,
    );
  });

  it("rejects when spawn itself errors (missing binary)", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ spawnError: err }) as never,
    );
    await expect(generateTutorTurn(baseInput)).rejects.toThrow(/failed to spawn/i);
  });
});
