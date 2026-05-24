import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  STORAGE_KEY,
  ageBandFor,
  appStateSchema,
  avatarColorFor,
  emptyAppState,
  lessonPlanSchema,
  lessonTaskSchema,
  type Child,
  type ChatMessage,
  type Family,
  type PortfolioEntry,
  type Session,
  type WorkSample,
} from "@/lib/classmap/types";

import * as db from "@/lib/classmap/db";

const LEGACY_V1_KEY = "classmap:saved-plans:v1";

/* ---------- Fixtures ---------- */

const validSession: Session = {
  userId: "user-1",
  email: "ada@example.com",
  createdAt: "2026-05-23T18:00:00.000Z",
};

const validFamily: Family = {
  adultName: "Ada Lovelace Sr.",
  adultEmail: "ada@example.com",
};

const childInput: Omit<
  Child,
  | "id"
  | "avatarColor"
  | "ageBand"
  | "xpTotal"
  | "streakDays"
  | "lastActiveDate"
  | "badges"
  | "createdAt"
> = {
  name: "Ada",
  age: 9,
  grade: "4",
  state: "CA",
  learningStyle: "visual",
  curriculumApproach: "eclectic",
  prioritySubjects: ["math", "reading"],
};

function makeV1Plan(over: Partial<{ id: string; childAge: number; childName: string }> = {}) {
  return {
    id: over.id ?? "p1",
    createdAt: "2026-05-23T18:00:00.000Z",
    input: {
      childName: over.childName ?? "Mira",
      childAge: over.childAge ?? 8,
      learningStyle: "visual",
      subjects: ["math", "reading"],
      hoursPerWeek: 10,
      state: "CA",
    },
    summary: "A simple visual week.",
    days: [
      {
        day: "Mon",
        sessions: [
          {
            subject: "math",
            title: "Counting",
            description: "Count things visually.",
            materials: ["paper", "pencil"],
            minutes: 30,
          },
        ],
      },
      {
        day: "Tue",
        sessions: [
          {
            subject: "reading",
            title: "Story time",
            description: "Read aloud.",
            materials: ["picture book"],
            minutes: 25,
          },
          {
            subject: "writing",
            title: "Letters",
            description: "Practice three lowercase letters.",
            materials: ["paper"],
            minutes: 15,
          },
        ],
      },
      // intentionally omit Wed/Thu/Fri — migration should still produce a plan
      // with whatever days were present
    ],
  };
}

/* ---------- Test setup ---------- */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

/* ================================================================== *
 * Round-trip core                                                     *
 * ================================================================== */

describe("loadState / saveState — empty + round-trip", () => {
  it("returns a schema-valid emptyAppState() when storage is empty", () => {
    const s = db.loadState();
    expect(appStateSchema.safeParse(s).success).toBe(true);
    expect(s).toEqual(emptyAppState());
  });

  it("saveState writes JSON under STORAGE_KEY and loadState reads it back", () => {
    const next = { ...emptyAppState(), session: validSession };
    db.saveState(next);
    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).session).toEqual(validSession);
    // Subsequent loadState picks up the persisted value
    window.localStorage.setItem(STORAGE_KEY, raw as string);
    expect(db.loadState().session).toEqual(validSession);
  });

  it("loadState falls back to emptyAppState when storage is non-JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(db.loadState()).toEqual(emptyAppState());
  });

  it("loadState falls back to emptyAppState when storage is schema-invalid", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, totally: "wrong" }),
    );
    expect(db.loadState()).toEqual(emptyAppState());
  });
});

describe("session + family + prefs setters", () => {
  it("setSession persists nullable session", () => {
    db.setSession(validSession);
    expect(db.loadState().session).toEqual(validSession);
    db.setSession(null);
    expect(db.loadState().session).toBeNull();
  });

  it("setFamily persists nullable family", () => {
    db.setFamily(validFamily);
    expect(db.loadState().family).toEqual(validFamily);
    db.setFamily(null);
    expect(db.loadState().family).toBeNull();
  });

  it("setPrefs merges partial updates", () => {
    db.setPrefs({ activeView: "week" });
    expect(db.loadState().prefs.activeView).toBe("week");
    db.setPrefs({ theme: "dark" });
    const prefs = db.loadState().prefs;
    expect(prefs.activeView).toBe("week");
    expect(prefs.theme).toBe("dark");
  });
});

/* ================================================================== *
 * Children                                                            *
 * ================================================================== */

describe("createChild / updateChild / deleteChild", () => {
  it("createChild derives avatarColor + ageBand and auto-fills id/timestamps", () => {
    const child = db.createChild(childInput);
    expect(child.id).toBeTruthy();
    expect(child.avatarColor).toBe(avatarColorFor(child.id));
    expect(child.ageBand).toBe(ageBandFor(childInput.age));
    expect(child.xpTotal).toBe(0);
    expect(child.streakDays).toBe(0);
    expect(child.lastActiveDate).toBeNull();
    expect(child.badges).toEqual([]);
    expect(child.createdAt).toMatch(/T.*Z$/);

    const stored = db.loadState().children;
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(child);
  });

  it("createChild auto-assigns activeChildId when none is set, leaves it alone otherwise", () => {
    const first = db.createChild(childInput);
    expect(db.loadState().activeChildId).toBe(first.id);
    const second = db.createChild({ ...childInput, name: "Theo" });
    expect(db.loadState().activeChildId).toBe(first.id); // unchanged
    expect(db.loadState().children.map((c) => c.id)).toEqual([first.id, second.id]);
  });

  it("updateChild merges patch but protects id, avatarColor, createdAt; recomputes ageBand on age change", () => {
    const child = db.createChild({ ...childInput, age: 8 });
    expect(child.ageBand).toBe("early");
    const originalColor = child.avatarColor;
    const originalCreatedAt = child.createdAt;

    db.updateChild(child.id, {
      age: 13,
      name: "Renamed",
      // these should be ignored:
      id: "spoof",
      avatarColor: "spoof",
      createdAt: "spoof",
    } as Partial<Child>);

    const after = db.getChild(child.id);
    expect(after?.id).toBe(child.id);
    expect(after?.avatarColor).toBe(originalColor);
    expect(after?.createdAt).toBe(originalCreatedAt);
    expect(after?.name).toBe("Renamed");
    expect(after?.age).toBe(13);
    expect(after?.ageBand).toBe("teen");
  });

  it("deleteChild cascades plans/tasks/portfolio/uploads/tutorChats and reassigns activeChildId", () => {
    const a = db.createChild(childInput);
    const b = db.createChild({ ...childInput, name: "Bea" });
    const planA = db.createPlan({
      childId: a.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    db.replacePlanTasks(planA.id, [
      {
        childId: a.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "T1",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    const planB = db.createPlan({
      childId: b.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    db.replacePlanTasks(planB.id, [
      {
        childId: b.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "T2",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    const aTask = db.loadState().tasks.find((t) => t.childId === a.id)!;
    db.appendTutorMessage(aTask.id, {
      id: "m1",
      role: "user",
      content: "hi",
      ts: "2026-05-23T18:00:00.000Z",
    });
    db.addPortfolioEntry({
      childId: a.id,
      date: "2026-05-18",
      notes: "n",
      workSampleIds: [],
    });
    db.addWorkSample({
      childId: a.id,
      filename: "f.png",
      mimeType: "image/png",
      size: 1,
      dataUrl: "data:,",
    });
    db.setActiveChildId(a.id);

    db.deleteChild(a.id);

    const s = db.loadState();
    expect(s.children.map((c) => c.id)).toEqual([b.id]);
    expect(s.activeChildId).toBe(b.id);
    expect(s.plans.some((p) => p.childId === a.id)).toBe(false);
    expect(s.tasks.some((t) => t.childId === a.id)).toBe(false);
    expect(s.portfolio.some((e) => e.childId === a.id)).toBe(false);
    expect(s.uploads.some((u) => u.childId === a.id)).toBe(false);
    expect(s.tutorChats.some((tc) => tc.taskId === aTask.id)).toBe(false);
  });
});

/* ================================================================== *
 * Plans + tasks                                                       *
 * ================================================================== */

describe("plans + tasks", () => {
  it("createPlan + replacePlanTasks build schema-valid rows", () => {
    const child = db.createChild(childInput);
    const plan = db.createPlan({
      childId: child.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    expect(lessonPlanSchema.safeParse(plan).success).toBe(true);

    const built = db.replacePlanTasks(plan.id, [
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "Counting",
        description: "Count.",
        materials: ["paper"],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    expect(built).toHaveLength(1);
    expect(built[0].planId).toBe(plan.id);
    expect(lessonTaskSchema.safeParse(built[0]).success).toBe(true);
  });

  it("replacePlanTasks replaces only the given plan's tasks", () => {
    const child = db.createChild(childInput);
    const p1 = db.createPlan({
      childId: child.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    const p2 = db.createPlan({
      childId: child.id,
      weekStart: "2026-05-25",
      aiGenerated: true,
    });
    db.replacePlanTasks(p1.id, [
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "P1-A",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    db.replacePlanTasks(p2.id, [
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "P2-A",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    // Replace p1 again — p2's task survives
    db.replacePlanTasks(p1.id, [
      {
        childId: child.id,
        day: "Tue",
        order: 0,
        subject: "math",
        title: "P1-B",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    const tasks = db.loadState().tasks;
    expect(tasks.map((t) => t.title).sort()).toEqual(["P1-B", "P2-A"]);
  });

  it("getTasksForPlan sorts by day then order", () => {
    const child = db.createChild(childInput);
    const plan = db.createPlan({
      childId: child.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    db.replacePlanTasks(plan.id, [
      {
        childId: child.id,
        day: "Wed",
        order: 1,
        subject: "math",
        title: "W2",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "M",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
      {
        childId: child.id,
        day: "Wed",
        order: 0,
        subject: "math",
        title: "W1",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    expect(db.getTasksForPlan(plan.id).map((t) => t.title)).toEqual([
      "M",
      "W1",
      "W2",
    ]);
  });

  it("getTasksForDay returns only the active week's tasks for that day", () => {
    const child = db.createChild(childInput);
    // Older plan — weekStart in the past
    const p1 = db.createPlan({
      childId: child.id,
      weekStart: "2026-04-06",
      aiGenerated: true,
    });
    db.replacePlanTasks(p1.id, [
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "Old",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    // Newer plan — weekStart still ≤ today (we'll use a past Monday so it's
    // selected as "current"). Use 2026-05-18 which precedes the test runtime.
    const p2 = db.createPlan({
      childId: child.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    db.replacePlanTasks(p2.id, [
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "New",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    const mon = db.getTasksForDay(child.id, "Mon");
    expect(mon.map((t) => t.title)).toEqual(["New"]);
  });

  it("updateTask merges patch but protects id/planId/childId", () => {
    const child = db.createChild(childInput);
    const plan = db.createPlan({
      childId: child.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    const [task] = db.replacePlanTasks(plan.id, [
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "T",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    db.updateTask(task.id, {
      status: "done",
      completedAt: "2026-05-24T00:00:00.000Z",
      // these should be ignored:
      id: "spoof",
      planId: "spoof",
      childId: "spoof",
    } as never);
    const stored = db.loadState().tasks.find((t) => t.id === task.id)!;
    expect(stored.id).toBe(task.id);
    expect(stored.planId).toBe(plan.id);
    expect(stored.childId).toBe(child.id);
    expect(stored.status).toBe("done");
    expect(stored.completedAt).toBe("2026-05-24T00:00:00.000Z");
  });

  it("deleteTask removes the task and its tutorChat", () => {
    const child = db.createChild(childInput);
    const plan = db.createPlan({
      childId: child.id,
      weekStart: "2026-05-18",
      aiGenerated: true,
    });
    const [task] = db.replacePlanTasks(plan.id, [
      {
        childId: child.id,
        day: "Mon",
        order: 0,
        subject: "math",
        title: "T",
        description: "d",
        materials: [],
        minutes: 30,
        resourceType: "lesson",
        xpValue: 10,
        status: "pending",
        completedAt: null,
      },
    ]);
    db.appendTutorMessage(task.id, {
      id: "m1",
      role: "user",
      content: "hi",
      ts: "2026-05-23T18:00:00.000Z",
    });
    db.deleteTask(task.id);
    expect(db.loadState().tasks.find((t) => t.id === task.id)).toBeUndefined();
    expect(
      db.loadState().tutorChats.find((tc) => tc.taskId === task.id),
    ).toBeUndefined();
  });
});

/* ================================================================== *
 * Portfolio + uploads                                                 *
 * ================================================================== */

describe("portfolio + uploads", () => {
  it("addPortfolioEntry assigns id and getPortfolioEntries filters by date range and sorts desc", () => {
    const child = db.createChild(childInput);
    db.addPortfolioEntry({
      childId: child.id,
      date: "2026-05-18",
      notes: "A",
      workSampleIds: [],
    });
    db.addPortfolioEntry({
      childId: child.id,
      date: "2026-05-20",
      notes: "B",
      workSampleIds: [],
    });
    db.addPortfolioEntry({
      childId: child.id,
      date: "2026-04-01",
      notes: "old",
      workSampleIds: [],
    });
    const ranged = db.getPortfolioEntries(child.id, {
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(ranged.map((e) => e.notes)).toEqual(["B", "A"]);
  });

  it("deleteWorkSample purges sample and removes its id from portfolio entries", () => {
    const child = db.createChild(childInput);
    const sample = db.addWorkSample({
      childId: child.id,
      filename: "f.png",
      mimeType: "image/png",
      size: 1,
      dataUrl: "data:,",
    });
    const other = db.addWorkSample({
      childId: child.id,
      filename: "g.png",
      mimeType: "image/png",
      size: 1,
      dataUrl: "data:,",
    });
    db.addPortfolioEntry({
      childId: child.id,
      date: "2026-05-18",
      notes: "n",
      workSampleIds: [sample.id, other.id],
    } satisfies Omit<PortfolioEntry, "id">);
    db.deleteWorkSample(sample.id);
    const s = db.loadState();
    expect(s.uploads.find((u) => u.id === sample.id)).toBeUndefined();
    expect(s.portfolio[0].workSampleIds).toEqual([other.id]);
  });

  it("addWorkSample auto-sets uploadedAt", () => {
    const child = db.createChild(childInput);
    const sample = db.addWorkSample({
      childId: child.id,
      filename: "f.png",
      mimeType: "image/png",
      size: 1,
      dataUrl: "data:,",
    } satisfies Omit<WorkSample, "id" | "uploadedAt">);
    expect(sample.uploadedAt).toMatch(/T.*Z$/);
  });
});

/* ================================================================== *
 * Chats                                                               *
 * ================================================================== */

describe("tutor + coach chats", () => {
  function msg(content: string): ChatMessage {
    return {
      id: crypto.randomUUID(),
      role: "user",
      content,
      ts: "2026-05-23T18:00:00.000Z",
    };
  }

  it("appendTutorMessage creates a new TutorChat row on first message, appends on subsequent", () => {
    const taskId = "t-1";
    db.appendTutorMessage(taskId, msg("first"));
    expect(db.getTutorChat(taskId)?.messages).toHaveLength(1);
    db.appendTutorMessage(taskId, msg("second"));
    const chat = db.getTutorChat(taskId);
    expect(chat?.messages.map((m) => m.content)).toEqual(["first", "second"]);
  });

  it("appendCoachMessage appends to the single coach thread", () => {
    db.appendCoachMessage(msg("hi"));
    db.appendCoachMessage(msg("again"));
    expect(db.getCoachThread().map((m) => m.content)).toEqual(["hi", "again"]);
  });
});

/* ================================================================== *
 * Migration (v1 → v2) — the riskiest part                             *
 * ================================================================== */

describe("migrateLegacyV1IfPresent — the riskiest part of db.ts", () => {
  // Migration runs once per module load (the flag is module-level). For each
  // case we reset modules + re-import so the flag is reset.

  async function freshDb() {
    vi.resetModules();
    return (await import("@/lib/classmap/db")) as typeof db;
  }

  it("imports a v1 saved-plans payload into v2 LessonPlan + LessonTask[], creates an 'Imported' child, removes the v1 key", async () => {
    window.localStorage.setItem(
      LEGACY_V1_KEY,
      JSON.stringify([makeV1Plan({ id: "p1", childName: "Mira", childAge: 8 })]),
    );
    const fresh = await freshDb();
    const state = fresh.loadState();

    // v1 key cleared
    expect(window.localStorage.getItem(LEGACY_V1_KEY)).toBeNull();

    // Imported child auto-created
    expect(state.children).toHaveLength(1);
    const child = state.children[0];
    expect(child.name).toBe("Mira");
    expect(child.age).toBe(8);
    expect(child.ageBand).toBe("early");
    expect(child.avatarColor).toBe(avatarColorFor(child.id));
    expect(state.activeChildId).toBe(child.id);

    // Plan + tasks
    expect(state.plans).toHaveLength(1);
    const plan = state.plans[0];
    expect(plan.childId).toBe(child.id);
    expect(plan.aiGenerated).toBe(true);
    expect(plan.rationale).toBe("A simple visual week.");
    expect(plan.createdAt).toBe("2026-05-23T18:00:00.000Z");
    expect(lessonPlanSchema.safeParse(plan).success).toBe(true);

    // 1 Mon task + 2 Tue tasks (Wed/Thu/Fri omitted in fixture)
    const tasks = state.tasks.filter((t) => t.planId === plan.id);
    expect(tasks).toHaveLength(3);
    for (const t of tasks) {
      expect(t.childId).toBe(child.id);
      expect(t.planId).toBe(plan.id);
      expect(t.resourceType).toBe("lesson");
      expect(t.status).toBe("pending");
      expect(t.completedAt).toBeNull();
      expect(t.xpValue).toBe(10);
      expect(lessonTaskSchema.safeParse(t).success).toBe(true);
    }
    expect(tasks.map((t) => `${t.day}/${t.title}`).sort()).toEqual([
      "Mon/Counting",
      "Tue/Letters",
      "Tue/Story time",
    ]);
    // Tue tasks keep source order via `order`
    const tue = tasks.filter((t) => t.day === "Tue").sort((a, b) => a.order - b.order);
    expect(tue.map((t) => t.title)).toEqual(["Story time", "Letters"]);

    // Migrated state is persisted under the v2 key
    const v2Raw = window.localStorage.getItem(STORAGE_KEY);
    expect(v2Raw).not.toBeNull();
    expect(appStateSchema.safeParse(JSON.parse(v2Raw as string)).success).toBe(true);
  });

  it("attaches migrated plans to the existing child instead of creating 'Imported'", async () => {
    // Seed a v2 state with one child first
    const existingState = {
      ...emptyAppState(),
      children: [
        {
          id: "kid-existing",
          name: "Theo",
          age: 11,
          grade: "5",
          state: "OR",
          learningStyle: "auditory" as const,
          curriculumApproach: "charlotte-mason" as const,
          prioritySubjects: ["reading" as const],
          avatarColor: avatarColorFor("kid-existing"),
          ageBand: ageBandFor(11),
          xpTotal: 0,
          streakDays: 0,
          lastActiveDate: null,
          badges: [],
          createdAt: "2026-05-20T00:00:00.000Z",
        },
      ],
      activeChildId: "kid-existing",
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existingState));
    window.localStorage.setItem(
      LEGACY_V1_KEY,
      JSON.stringify([makeV1Plan({ id: "p1" })]),
    );

    const fresh = await freshDb();
    const state = fresh.loadState();
    expect(state.children).toHaveLength(1);
    expect(state.children[0].name).toBe("Theo"); // no new "Imported" child
    expect(state.plans.every((p) => p.childId === "kid-existing")).toBe(true);
    expect(state.tasks.every((t) => t.childId === "kid-existing")).toBe(true);
    expect(window.localStorage.getItem(LEGACY_V1_KEY)).toBeNull();
  });

  it("drops the v1 key (and does not touch v2 state) when v1 payload is corrupt JSON", async () => {
    window.localStorage.setItem(LEGACY_V1_KEY, "{not json at all");
    const fresh = await freshDb();
    const state = fresh.loadState();
    expect(window.localStorage.getItem(LEGACY_V1_KEY)).toBeNull();
    expect(state.children).toEqual([]);
    expect(state.plans).toEqual([]);
    expect(state.tasks).toEqual([]);
  });

  it("drops the v1 key when v1 payload is an empty array (no work to migrate)", async () => {
    window.localStorage.setItem(LEGACY_V1_KEY, JSON.stringify([]));
    const fresh = await freshDb();
    const state = fresh.loadState();
    expect(window.localStorage.getItem(LEGACY_V1_KEY)).toBeNull();
    expect(state.children).toEqual([]);
    expect(state.plans).toEqual([]);
  });

  it("drops the v1 key when v1 payload is not an array at all", async () => {
    window.localStorage.setItem(LEGACY_V1_KEY, JSON.stringify({ foo: "bar" }));
    const fresh = await freshDb();
    const state = fresh.loadState();
    expect(window.localStorage.getItem(LEGACY_V1_KEY)).toBeNull();
    expect(state.children).toEqual([]);
  });

  it("clamps unknown subjects to 'math' and unknown days to skip; clamps minutes into 5..240", async () => {
    window.localStorage.setItem(
      LEGACY_V1_KEY,
      JSON.stringify([
        {
          id: "p1",
          createdAt: "2026-05-23T18:00:00.000Z",
          input: {
            childName: "Ada",
            childAge: 9,
            learningStyle: "visual",
            subjects: ["math"],
            hoursPerWeek: 10,
          },
          summary: "summary",
          days: [
            {
              day: "Notaday", // skipped
              sessions: [
                {
                  subject: "math",
                  title: "X",
                  description: "d",
                  materials: [],
                  minutes: 30,
                },
              ],
            },
            {
              day: "Mon",
              sessions: [
                {
                  subject: "underwater-basket-weaving", // → math fallback
                  title: "Clamp test",
                  description: "d",
                  materials: [],
                  minutes: 9999, // → clamp to 240
                },
                {
                  subject: "math",
                  title: "Low",
                  description: "d",
                  materials: [],
                  minutes: 1, // → clamp to 5
                },
              ],
            },
          ],
        },
      ]),
    );
    const fresh = await freshDb();
    const tasks = fresh
      .loadState()
      .tasks.slice()
      .sort((a, b) => a.order - b.order);
    expect(tasks).toHaveLength(2); // Notaday's session dropped
    expect(tasks.every((t) => t.day === "Mon")).toBe(true);
    const clamp = tasks.find((t) => t.title === "Clamp test")!;
    expect(clamp.subject).toBe("math");
    expect(clamp.minutes).toBe(240);
    const low = tasks.find((t) => t.title === "Low")!;
    expect(low.minutes).toBe(5);
  });

  it("only runs migration once per module load (subsequent loadState calls leave v2 alone)", async () => {
    window.localStorage.setItem(
      LEGACY_V1_KEY,
      JSON.stringify([makeV1Plan({ id: "p1" })]),
    );
    const fresh = await freshDb();
    fresh.loadState(); // triggers migration
    expect(window.localStorage.getItem(LEGACY_V1_KEY)).toBeNull();

    // Re-create a v1 payload — must NOT be migrated again in the same module
    window.localStorage.setItem(
      LEGACY_V1_KEY,
      JSON.stringify([makeV1Plan({ id: "p2" })]),
    );
    const before = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) as string,
    );
    fresh.loadState();
    const after = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) as string,
    );
    expect(after).toEqual(before); // state unchanged
    expect(window.localStorage.getItem(LEGACY_V1_KEY)).not.toBeNull(); // still there
  });
});
