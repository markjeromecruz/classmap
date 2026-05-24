// Typed localStorage CRUD over a single AppState root. All reads validate via Zod; invalid data resets to empty (logged once).

import { useSyncExternalStore } from "react";
import {
  STORAGE_KEY,
  appStateSchema,
  emptyAppState,
  avatarColorFor,
  ageBandFor,
  type AppState,
  type Child,
  type ChatMessage,
  type Day,
  type Family,
  type LessonPlan,
  type LessonTask,
  type PortfolioEntry,
  type Prefs,
  type Session,
  type TutorChat,
  type WorkSample,
} from "./types";

/* ------------------------------------------------------------------ *
 * Internal constants
 * ------------------------------------------------------------------ */

const LEGACY_V1_KEY = "classmap:saved-plans:v1";
const DAY_ORDER: Record<Day, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
};

let warnedOnce = false;
let migrationAttempted = false;

/* ------------------------------------------------------------------ *
 * Environment guards
 * ------------------------------------------------------------------ */

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/* ------------------------------------------------------------------ *
 * Raw read/write
 * ------------------------------------------------------------------ */

function readRaw(): unknown {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeRaw(state: AppState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    if (!warnedOnce) {
      // eslint-disable-next-line no-console
      console.warn("[classmap/db] Failed to persist state to localStorage", err);
      warnedOnce = true;
    }
  }
}

function warnInvalidOnce(reason: unknown): void {
  if (warnedOnce) return;
  warnedOnce = true;
  // eslint-disable-next-line no-console
  console.warn(
    "[classmap/db] Stored AppState was invalid or unreadable; resetting to empty.",
    reason,
  );
}

/* ------------------------------------------------------------------ *
 * Migration (v1 -> v2)
 * ------------------------------------------------------------------ */

interface LegacyV1Session {
  subject?: unknown;
  title?: unknown;
  description?: unknown;
  materials?: unknown;
  minutes?: unknown;
}

interface LegacyV1Day {
  day?: unknown;
  sessions?: unknown;
}

interface LegacyV1Plan {
  id?: unknown;
  createdAt?: unknown;
  input?: {
    childName?: unknown;
    childAge?: unknown;
    learningStyle?: unknown;
    subjects?: unknown;
    state?: unknown;
  };
  summary?: unknown;
  days?: unknown;
}

const VALID_DAYS = new Set<Day>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
const VALID_LEARNING_STYLES = new Set([
  "visual",
  "auditory",
  "kinesthetic",
  "reading-writing",
]);
const VALID_SUBJECTS = new Set([
  "math",
  "reading",
  "writing",
  "science",
  "history",
  "geography",
  "art",
  "music",
  "physical-education",
  "foreign-language",
  "computer-science",
  "life-skills",
]);

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function clampMinutes(n: number): number {
  if (!Number.isFinite(n)) return 30;
  return Math.max(5, Math.min(240, Math.round(n)));
}

/**
 * Try to migrate legacy v1 saved plans into the v2 AppState in place.
 * Returns a (possibly mutated) AppState. Failure never throws.
 */
function migrateLegacyV1IfPresent(state: AppState): AppState {
  if (migrationAttempted) return state;
  migrationAttempted = true;
  if (!isBrowser()) return state;

  try {
    const raw = window.localStorage.getItem(LEGACY_V1_KEY);
    if (!raw) return state;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Corrupt — drop it and move on.
      window.localStorage.removeItem(LEGACY_V1_KEY);
      return state;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.removeItem(LEGACY_V1_KEY);
      return state;
    }

    let working: AppState = { ...state };

    // Ensure we have a child to attach migrated plans to.
    let targetChild: Child | undefined = working.children[0];
    if (!targetChild) {
      const first = parsed[0] as LegacyV1Plan | undefined;
      const inferredAge = asNumber(first?.input?.childAge, 9);
      const rawLs = asString(first?.input?.learningStyle, "visual");
      const learningStyle = (
        VALID_LEARNING_STYLES.has(rawLs) ? rawLs : "visual"
      ) as Child["learningStyle"];

      const childId = crypto.randomUUID();
      const importedChild: Child = {
        id: childId,
        name: asString(first?.input?.childName, "Imported") || "Imported",
        age: Math.max(3, Math.min(18, Math.round(inferredAge))),
        grade: "Unspecified",
        state: "NA",
        learningStyle,
        curriculumApproach: "eclectic",
        prioritySubjects: ["math"],
        avatarColor: avatarColorFor(childId),
        ageBand: ageBandFor(Math.max(3, Math.min(18, Math.round(inferredAge)))),
        xpTotal: 0,
        streakDays: 0,
        lastActiveDate: null,
        badges: [],
        createdAt: new Date().toISOString(),
      };
      working = {
        ...working,
        children: [...working.children, importedChild],
        activeChildId: working.activeChildId ?? importedChild.id,
      };
      targetChild = importedChild;
    }

    const newPlans: LessonPlan[] = [];
    const newTasks: LessonTask[] = [];
    const todayIso = new Date().toISOString().slice(0, 10);

    for (const entry of parsed as LegacyV1Plan[]) {
      const planId = crypto.randomUUID();
      const createdAt = asString(entry?.createdAt, new Date().toISOString());
      const plan: LessonPlan = {
        id: planId,
        childId: targetChild.id,
        weekStart: todayIso,
        aiGenerated: true,
        rationale: asString(entry?.summary, "").slice(0, 2000) || undefined,
        createdAt: createdAt || new Date().toISOString(),
      };
      newPlans.push(plan);

      const days = Array.isArray(entry?.days) ? (entry.days as LegacyV1Day[]) : [];
      for (const d of days) {
        const dayName = asString(d?.day) as Day;
        if (!VALID_DAYS.has(dayName)) continue;
        const sessions = Array.isArray(d?.sessions)
          ? (d.sessions as LegacyV1Session[])
          : [];
        sessions.forEach((s, idx) => {
          const rawSubject = asString(s?.subject, "math");
          const subject = (
            VALID_SUBJECTS.has(rawSubject) ? rawSubject : "math"
          ) as LessonTask["subject"];
          const title = asString(s?.title, "Untitled").slice(0, 120) || "Untitled";
          const description =
            asString(s?.description, title).slice(0, 800) || title;
          const materials = asStringArray(s?.materials)
            .slice(0, 10)
            .map((m) => m.slice(0, 80));
          const minutes = clampMinutes(asNumber(s?.minutes, 30));

          const task: LessonTask = {
            id: crypto.randomUUID(),
            planId,
            childId: targetChild!.id,
            day: dayName,
            order: idx,
            subject,
            title,
            description,
            materials,
            minutes,
            resourceType: "lesson",
            xpValue: 10,
            status: "pending",
            completedAt: null,
          };
          newTasks.push(task);
        });
      }
    }

    working = {
      ...working,
      plans: [...working.plans, ...newPlans],
      tasks: [...working.tasks, ...newTasks],
    };

    // Persist migrated state then drop the v1 key so this only happens once.
    writeRaw(working);
    window.localStorage.removeItem(LEGACY_V1_KEY);
    return working;
  } catch (err) {
    // Migration failure must never block the app.
    // eslint-disable-next-line no-console
    console.warn("[classmap/db] Legacy v1 migration failed (ignored).", err);
    return state;
  }
}

/* ------------------------------------------------------------------ *
 * State root
 * ------------------------------------------------------------------ */

export function loadState(): AppState {
  if (!isBrowser()) {
    // SSR: silent empty state.
    return emptyAppState();
  }

  const raw = readRaw();
  let state: AppState;

  if (raw === null) {
    state = emptyAppState();
  } else {
    const parsed = appStateSchema.safeParse(raw);
    if (parsed.success) {
      state = parsed.data;
    } else {
      warnInvalidOnce(parsed.error);
      state = emptyAppState();
    }
  }

  // Run legacy migration on the first load of a session.
  const migrated = migrateLegacyV1IfPresent(state);
  return migrated;
}

export function saveState(next: AppState): void {
  writeRaw(next);
  notifyListeners();
}

export function resetState(): void {
  const empty = emptyAppState();
  writeRaw(empty);
  notifyListeners();
}

/* ------------------------------------------------------------------ *
 * Reactive store (cross-tab via storage event)
 * ------------------------------------------------------------------ */

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedSnapshot: AppState | null = null;
let crossTabBound = false;

function notifyListeners(): void {
  cachedSnapshot = null;
  for (const l of listeners) l();
}

function bindCrossTabOnce(): void {
  if (crossTabBound || !isBrowser()) return;
  crossTabBound = true;
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      notifyListeners();
    }
  });
}

function subscribe(listener: Listener): () => void {
  bindCrossTabOnce();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AppState {
  if (cachedSnapshot === null) {
    cachedSnapshot = loadState();
  }
  return cachedSnapshot;
}

const SSR_SNAPSHOT = emptyAppState();
function getServerSnapshot(): AppState {
  return SSR_SNAPSHOT;
}

/** Mutate the AppState via an updater function and persist. */
function update(updater: (s: AppState) => AppState): void {
  const current = loadState();
  const next = updater(current);
  writeRaw(next);
  notifyListeners();
}

export function useAppState(): [AppState, (updater: (s: AppState) => AppState) => void] {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [state, update];
}

/* ------------------------------------------------------------------ *
 * Session + family
 * ------------------------------------------------------------------ */

export function setSession(session: Session | null): void {
  update((s) => ({ ...s, session }));
}

export function setFamily(family: Family | null): void {
  update((s) => ({ ...s, family }));
}

/* ------------------------------------------------------------------ *
 * Children
 * ------------------------------------------------------------------ */

export function createChild(
  input: Omit<
    Child,
    | "id"
    | "avatarColor"
    | "ageBand"
    | "xpTotal"
    | "streakDays"
    | "lastActiveDate"
    | "badges"
    | "createdAt"
  >,
): Child {
  const id = crypto.randomUUID();
  const child: Child = {
    ...input,
    id,
    avatarColor: avatarColorFor(id),
    ageBand: ageBandFor(input.age),
    xpTotal: 0,
    streakDays: 0,
    lastActiveDate: null,
    badges: [],
    createdAt: new Date().toISOString(),
  };
  update((s) => ({
    ...s,
    children: [...s.children, child],
    activeChildId: s.activeChildId ?? child.id,
  }));
  return child;
}

export function updateChild(id: string, patch: Partial<Child>): void {
  update((s) => ({
    ...s,
    children: s.children.map((c) => {
      if (c.id !== id) return c;
      const merged: Child = { ...c, ...patch };
      // Keep derived fields consistent.
      if (patch.age !== undefined) merged.ageBand = ageBandFor(merged.age);
      // Never allow id, avatarColor, createdAt rewrites via patch.
      merged.id = c.id;
      merged.avatarColor = c.avatarColor;
      merged.createdAt = c.createdAt;
      return merged;
    }),
  }));
}

export function deleteChild(id: string): void {
  update((s) => {
    const remainingChildren = s.children.filter((c) => c.id !== id);
    const childTaskIds = new Set(
      s.tasks.filter((t) => t.childId === id).map((t) => t.id),
    );
    const remainingPlans = s.plans.filter((p) => p.childId !== id);
    const remainingTasks = s.tasks.filter((t) => t.childId !== id);
    const remainingPortfolio = s.portfolio.filter((e) => e.childId !== id);
    const remainingUploads = s.uploads.filter((u) => u.childId !== id);
    const remainingTutorChats = s.tutorChats.filter(
      (tc) => !childTaskIds.has(tc.taskId),
    );

    let nextActive: string | null = s.activeChildId;
    if (nextActive === id) {
      nextActive = remainingChildren[0]?.id ?? null;
    }

    return {
      ...s,
      children: remainingChildren,
      activeChildId: nextActive,
      plans: remainingPlans,
      tasks: remainingTasks,
      portfolio: remainingPortfolio,
      uploads: remainingUploads,
      tutorChats: remainingTutorChats,
    };
  });
}

export function getChild(id: string): Child | undefined {
  return loadState().children.find((c) => c.id === id);
}

export function getChildren(): Child[] {
  return loadState().children;
}

export function setActiveChildId(id: string | null): void {
  update((s) => ({ ...s, activeChildId: id }));
}

export function getActiveChild(): Child | undefined {
  const s = loadState();
  if (!s.activeChildId) return undefined;
  return s.children.find((c) => c.id === s.activeChildId);
}

/* ------------------------------------------------------------------ *
 * Plans + tasks
 * ------------------------------------------------------------------ */

export function createPlan(input: Omit<LessonPlan, "id" | "createdAt">): LessonPlan {
  const plan: LessonPlan = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  update((s) => ({ ...s, plans: [...s.plans, plan] }));
  return plan;
}

export function replacePlanTasks(
  planId: string,
  tasks: Omit<LessonTask, "id" | "planId">[],
): LessonTask[] {
  const built: LessonTask[] = tasks.map((t) => ({
    ...t,
    id: crypto.randomUUID(),
    planId,
  }));
  update((s) => ({
    ...s,
    tasks: [...s.tasks.filter((t) => t.planId !== planId), ...built],
  }));
  return built;
}

export function getPlanForWeek(
  childId: string,
  weekStart: string,
): LessonPlan | undefined {
  return loadState().plans.find(
    (p) => p.childId === childId && p.weekStart === weekStart,
  );
}

export function getTasksForPlan(planId: string): LessonTask[] {
  return loadState()
    .tasks.filter((t) => t.planId === planId)
    .slice()
    .sort((a, b) => {
      const da = DAY_ORDER[a.day] - DAY_ORDER[b.day];
      if (da !== 0) return da;
      return a.order - b.order;
    });
}

/** Find the most recent plan for `childId` with weekStart <= today (ISO YYYY-MM-DD). */
function getCurrentPlan(childId: string, state: AppState): LessonPlan | undefined {
  const today = new Date().toISOString().slice(0, 10);
  return state.plans
    .filter((p) => p.childId === childId && p.weekStart <= today)
    .slice()
    .sort((a, b) => (a.weekStart < b.weekStart ? 1 : a.weekStart > b.weekStart ? -1 : 0))[0];
}

export function getTasksForDay(childId: string, day: Day): LessonTask[] {
  const s = loadState();
  const plan = getCurrentPlan(childId, s);
  if (!plan) return [];
  return s.tasks
    .filter((t) => t.planId === plan.id && t.day === day)
    .slice()
    .sort((a, b) => a.order - b.order);
}

export function getTasksForWeek(childId: string, weekStart: string): LessonTask[] {
  const s = loadState();
  const plan = s.plans.find(
    (p) => p.childId === childId && p.weekStart === weekStart,
  );
  if (!plan) return [];
  return s.tasks
    .filter((t) => t.planId === plan.id)
    .slice()
    .sort((a, b) => {
      const da = DAY_ORDER[a.day] - DAY_ORDER[b.day];
      if (da !== 0) return da;
      return a.order - b.order;
    });
}

export function updateTask(id: string, patch: Partial<LessonTask>): void {
  update((s) => ({
    ...s,
    tasks: s.tasks.map((t) => {
      if (t.id !== id) return t;
      const merged: LessonTask = { ...t, ...patch };
      // Protect identity fields.
      merged.id = t.id;
      merged.planId = t.planId;
      merged.childId = t.childId;
      return merged;
    }),
  }));
}

export function deleteTask(id: string): void {
  update((s) => ({
    ...s,
    tasks: s.tasks.filter((t) => t.id !== id),
    tutorChats: s.tutorChats.filter((tc) => tc.taskId !== id),
  }));
}

export function addTask(input: Omit<LessonTask, "id">): LessonTask {
  const task: LessonTask = { ...input, id: crypto.randomUUID() };
  update((s) => ({ ...s, tasks: [...s.tasks, task] }));
  return task;
}

/* ------------------------------------------------------------------ *
 * Portfolio + uploads
 * ------------------------------------------------------------------ */

export function addPortfolioEntry(
  input: Omit<PortfolioEntry, "id">,
): PortfolioEntry {
  const entry: PortfolioEntry = { ...input, id: crypto.randomUUID() };
  update((s) => ({ ...s, portfolio: [...s.portfolio, entry] }));
  return entry;
}

export function getPortfolioEntries(
  childId: string,
  dateRange?: { from?: string; to?: string },
): PortfolioEntry[] {
  const entries = loadState().portfolio.filter((e) => e.childId === childId);
  const from = dateRange?.from;
  const to = dateRange?.to;
  return entries
    .filter((e) => {
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      return true;
    })
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function addWorkSample(
  input: Omit<WorkSample, "id" | "uploadedAt">,
): WorkSample {
  const sample: WorkSample = {
    ...input,
    id: crypto.randomUUID(),
    uploadedAt: new Date().toISOString(),
  };
  update((s) => ({ ...s, uploads: [...s.uploads, sample] }));
  return sample;
}

export function getWorkSample(id: string): WorkSample | undefined {
  return loadState().uploads.find((u) => u.id === id);
}

export function deleteWorkSample(id: string): void {
  update((s) => ({
    ...s,
    uploads: s.uploads.filter((u) => u.id !== id),
    portfolio: s.portfolio.map((e) => ({
      ...e,
      workSampleIds: e.workSampleIds.filter((wid) => wid !== id),
    })),
  }));
}

/* ------------------------------------------------------------------ *
 * Tutor + coach chats
 * ------------------------------------------------------------------ */

export function appendTutorMessage(taskId: string, message: ChatMessage): void {
  update((s) => {
    const existing = s.tutorChats.find((tc) => tc.taskId === taskId);
    if (existing) {
      return {
        ...s,
        tutorChats: s.tutorChats.map((tc) =>
          tc.taskId === taskId
            ? { ...tc, messages: [...tc.messages, message] }
            : tc,
        ),
      };
    }
    const fresh: TutorChat = { taskId, messages: [message] };
    return { ...s, tutorChats: [...s.tutorChats, fresh] };
  });
}

export function getTutorChat(taskId: string): TutorChat | undefined {
  return loadState().tutorChats.find((tc) => tc.taskId === taskId);
}

export function appendCoachMessage(message: ChatMessage): void {
  update((s) => ({ ...s, coachChats: [...s.coachChats, message] }));
}

export function getCoachThread(): ChatMessage[] {
  return loadState().coachChats;
}

/* ------------------------------------------------------------------ *
 * Prefs
 * ------------------------------------------------------------------ */

export function setPrefs(patch: Partial<Prefs>): void {
  update((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
}
