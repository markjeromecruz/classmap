import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the spawn boundary; the rest of generatePlanForChild
// (extractJson, JSON.parse, Zod validation, response reshape) runs for real.
// Mirrors lib/claude.ts + lib/patriarch-claude.ts test patterns.
const { mockSpawn } = vi.hoisted(() => ({ mockSpawn: vi.fn() }));
vi.mock("node:child_process", () => ({
  default: { spawn: mockSpawn },
  spawn: mockSpawn,
}));

import { generatePlanForChild } from "@/lib/classmap/plan-claude";
import {
  ageBandFor,
  avatarColorFor,
  type Child,
  type LessonTask,
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

const child: Child = {
  id: "child-1",
  name: "Ada",
  age: 9,
  grade: "4",
  state: "CA",
  learningStyle: "visual",
  curriculumApproach: "eclectic",
  prioritySubjects: ["math", "reading", "science"],
  avatarColor: avatarColorFor("child-1"),
  ageBand: ageBandFor(9),
  xpTotal: 0,
  streakDays: 0,
  lastActiveDate: null,
  badges: [],
  createdAt: "2026-05-23T18:00:00.000Z",
};

function task(
  day: LessonTask["day"],
  order: number,
  subject: LessonTask["subject"] = "math",
): unknown {
  return {
    childId: child.id,
    day,
    order,
    subject,
    title: `Task ${day}-${order}`,
    description:
      `A short task tuned to a ${child.learningStyle} learner.`,
    materials: ["paper"],
    minutes: 30,
    resourceType: "lesson",
    xpValue: 20,
    status: "pending",
    completedAt: null,
  };
}

function validPlanJson(over: Partial<{ taskCount: number }> = {}): string {
  const n = over.taskCount ?? 10;
  const tasks: unknown[] = [];
  const days: LessonTask["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  for (let i = 0; i < n; i++) {
    const d = days[i % 5];
    tasks.push(task(d, Math.floor(i / 5)));
  }
  return JSON.stringify({
    plan: {
      childId: child.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
      rationale: "A balanced visual week with extra math focus.",
    },
    tasks,
  });
}

beforeEach(() => {
  mockSpawn.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("generatePlanForChild — happy paths", () => {
  it("parses bare JSON output, validates, and returns a reshaped GeneratedPlan", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson({ taskCount: 10 }), code: 0 }) as never,
    );
    const result = await generatePlanForChild({
      child,
      weekStart: "2026-05-18",
    });
    expect(result.plan.childId).toBe(child.id);
    expect(result.plan.weekStart).toBe("2026-05-18");
    expect(result.plan.aiGenerated).toBe(true);
    expect(result.plan.rationale).toMatch(/visual week/i);
    expect(result.tasks).toHaveLength(10);
    for (const t of result.tasks) {
      expect(t.status).toBe("pending");
      expect(t.completedAt).toBeNull();
      expect(t.childId).toBe(child.id);
    }
  });

  it("strips ```json fenced output", async () => {
    const fenced = "Here:\n```json\n" + validPlanJson() + "\n```\n";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const r = await generatePlanForChild({ child, weekStart: "2026-05-18" });
    expect(r.tasks.length).toBeGreaterThanOrEqual(8);
  });

  it("strips bare ``` fenced output", async () => {
    const fenced = "```\n" + validPlanJson() + "\n```";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: fenced, code: 0 }) as never,
    );
    const r = await generatePlanForChild({ child, weekStart: "2026-05-18" });
    expect(r.tasks.length).toBeGreaterThanOrEqual(8);
  });

  it("falls back to the outermost {...} when wrapped in prose", async () => {
    const wrapped = `Sure! ${validPlanJson()} done.`;
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: wrapped, code: 0 }) as never,
    );
    const r = await generatePlanForChild({ child, weekStart: "2026-05-18" });
    expect(r.plan.aiGenerated).toBe(true);
  });
});

describe("generatePlanForChild — prompt contract", () => {
  it("invokes spawn with the right argv and a prompt that mentions child profile + week", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson(), code: 0 }) as never,
    );
    await generatePlanForChild({
      child,
      weekStart: "2026-05-18",
      preferences: { focus: "fractions", avoidTopics: ["war", "death"] },
    });
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const [bin, args] = mockSpawn.mock.calls[0] as [string, string[]];
    expect(bin).toBe("claude");
    expect(args).toContain("-p");
    expect(args).toContain("--append-system-prompt");
    expect(args).toContain("--output-format");
    expect(args).toContain("text");
    const prompt = args[args.indexOf("-p") + 1];
    expect(prompt).toContain(child.name);
    expect(prompt).toContain(child.state);
    expect(prompt).toContain(child.learningStyle);
    expect(prompt).toContain(child.curriculumApproach);
    expect(prompt).toContain("2026-05-18");
    // priority subjects mentioned
    for (const s of child.prioritySubjects) {
      expect(prompt).toContain(s);
    }
    // age band derived from child.age
    expect(prompt).toContain(`age band: ${ageBandFor(child.age)}`);
    // preferences threaded in
    expect(prompt).toContain("fractions");
    expect(prompt).toContain("war");
    expect(prompt).toContain("death");
  });

  it("omits the focus/avoid lines when preferences are absent or empty", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson(), code: 0 }) as never,
    );
    await generatePlanForChild({ child, weekStart: "2026-05-18" });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).not.toMatch(/Parent focus this week:/);
    expect(prompt).not.toMatch(/Topics to avoid:/);
  });

  it("drops whitespace-only avoidTopics entries", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson(), code: 0 }) as never,
    );
    await generatePlanForChild({
      child,
      weekStart: "2026-05-18",
      preferences: { avoidTopics: ["  ", "", "real-topic"] },
    });
    const prompt = (mockSpawn.mock.calls[0][1] as string[])[
      (mockSpawn.mock.calls[0][1] as string[]).indexOf("-p") + 1
    ];
    expect(prompt).toMatch(/Topics to avoid:\s+real-topic/);
  });
});

describe("generatePlanForChild — failure modes", () => {
  it("rejects when claude returns non-JSON text", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: "no idea", code: 0 }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow(/non-JSON|JSON/i);
  });

  it("rejects when the response is missing the `tasks` array", async () => {
    const invalid = JSON.stringify({
      plan: {
        childId: child.id,
        weekStart: "2026-05-18",
        aiGenerated: true,
        rationale: "ok",
      },
    });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: invalid, code: 0 }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow();
  });

  it("rejects when tasks.length < 8 (the documented min)", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson({ taskCount: 5 }), code: 0 }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow();
  });

  it("rejects when tasks.length > 25 (the documented max)", async () => {
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: validPlanJson({ taskCount: 26 }), code: 0 }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow();
  });

  it("rejects when a task carries status != 'pending' (literal)", async () => {
    const bad = JSON.parse(validPlanJson());
    bad.tasks[0].status = "done";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: JSON.stringify(bad), code: 0 }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow();
  });

  it("rejects when a task carries completedAt != null", async () => {
    const bad = JSON.parse(validPlanJson());
    bad.tasks[0].completedAt = "2026-05-18T00:00:00.000Z";
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: JSON.stringify(bad), code: 0 }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow();
  });

  it("rejects when aiGenerated is not the literal true", async () => {
    const bad = JSON.parse(validPlanJson());
    bad.plan.aiGenerated = false;
    mockSpawn.mockImplementation(
      () => makeFakeChild({ stdout: JSON.stringify(bad), code: 0 }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow();
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
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow(/exited with code 1.*rate limited/);
  });

  it("rejects when spawn itself errors (missing binary)", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    mockSpawn.mockImplementation(
      () => makeFakeChild({ spawnError: err }) as never,
    );
    await expect(
      generatePlanForChild({ child, weekStart: "2026-05-18" }),
    ).rejects.toThrow(/failed to spawn/i);
  });
});
