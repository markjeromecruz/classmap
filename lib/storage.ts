import { lessonPlanSchema, type LessonPlan } from "./types";

export const SAVED_PLANS_KEY = "classmap:saved-plans:v1";

function readRaw(): unknown {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SAVED_PLANS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeRaw(plans: LessonPlan[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
}

export function listSavedPlans(): LessonPlan[] {
  const raw = readRaw();
  if (!Array.isArray(raw)) return [];
  const out: LessonPlan[] = [];
  for (const entry of raw) {
    const parsed = lessonPlanSchema.safeParse(entry);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export function savePlan(plan: LessonPlan): LessonPlan[] {
  const existing = listSavedPlans();
  const next = [plan, ...existing.filter((p) => p.id !== plan.id)];
  writeRaw(next);
  return next;
}

export function deletePlan(id: string): LessonPlan[] {
  const next = listSavedPlans().filter((p) => p.id !== id);
  writeRaw(next);
  return next;
}

export function isPlanSaved(id: string): boolean {
  return listSavedPlans().some((p) => p.id === id);
}
