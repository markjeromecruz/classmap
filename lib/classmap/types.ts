import { z } from "zod";

/* ------------------------------------------------------------------ *
 * ClassMap v2 — full domain model.
 * Replaces lib/types.ts for the planner. lib/types.ts kept for the
 * legacy /classmap/saved + /classmap/result pages until Phase 2
 * removes them.
 * ------------------------------------------------------------------ */

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export type Day = (typeof DAYS)[number];

export const SUBJECTS = [
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
] as const;
export type Subject = (typeof SUBJECTS)[number];

export const LEARNING_STYLES = [
  "visual",
  "auditory",
  "kinesthetic",
  "reading-writing",
] as const;
export type LearningStyle = (typeof LEARNING_STYLES)[number];

export const CURRICULUM_APPROACHES = [
  "classical",
  "charlotte-mason",
  "unschooling",
  "eclectic",
  "montessori",
  "traditional",
] as const;
export type CurriculumApproach = (typeof CURRICULUM_APPROACHES)[number];

export const RESOURCE_TYPES = [
  "lesson",
  "reading",
  "video",
  "activity",
  "assessment",
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const TASK_STATUSES = [
  "pending",
  "in-progress",
  "done",
  "skipped",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const AGE_BANDS = ["early", "upper", "teen"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

/** Compute age band from age. Early ≤8, Upper 9–12, Teen 13+. */
export function ageBandFor(age: number): AgeBand {
  if (age <= 8) return "early";
  if (age <= 12) return "upper";
  return "teen";
}

/* ---------- Session + family ---------- */

export const sessionSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});
export type Session = z.infer<typeof sessionSchema>;

export const familySchema = z.object({
  adultName: z.string().trim().min(1).max(60),
  adultEmail: z.string().email(),
});
export type Family = z.infer<typeof familySchema>;

/* ---------- Child ---------- */

export const badgeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(40),
  earnedAt: z.string().datetime(),
});
export type Badge = z.infer<typeof badgeSchema>;

export const childSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(40),
  age: z.number().int().min(3).max(18),
  grade: z.string().min(1).max(20),
  state: z.string().min(2).max(2), // 2-letter US state code
  learningStyle: z.enum(LEARNING_STYLES),
  curriculumApproach: z.enum(CURRICULUM_APPROACHES),
  prioritySubjects: z.array(z.enum(SUBJECTS)).min(1).max(SUBJECTS.length),
  avatarColor: z.string().min(1).max(40), // OKLCH or token name
  ageBand: z.enum(AGE_BANDS),
  xpTotal: z.number().int().min(0),
  streakDays: z.number().int().min(0),
  lastActiveDate: z.string().nullable(), // ISO date (YYYY-MM-DD)
  badges: z.array(badgeSchema),
  createdAt: z.string().datetime(),
});
export type Child = z.infer<typeof childSchema>;

/* ---------- Plans + tasks ---------- */

export const lessonPlanSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  weekStart: z.string().min(8).max(10), // YYYY-MM-DD (always a Monday)
  aiGenerated: z.boolean(),
  rationale: z.string().max(2000).optional(),
  createdAt: z.string().datetime(),
});
export type LessonPlan = z.infer<typeof lessonPlanSchema>;

export const lessonTaskSchema = z.object({
  id: z.string().min(1),
  planId: z.string().min(1),
  childId: z.string().min(1),
  day: z.enum(DAYS),
  order: z.number().int().min(0),
  subject: z.enum(SUBJECTS),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(800),
  materials: z.array(z.string().min(1).max(80)).max(10),
  minutes: z.number().int().min(5).max(240),
  resourceType: z.enum(RESOURCE_TYPES),
  xpValue: z.number().int().min(1).max(200),
  status: z.enum(TASK_STATUSES),
  completedAt: z.string().datetime().nullable(),
});
export type LessonTask = z.infer<typeof lessonTaskSchema>;

/* ---------- Portfolio + uploads ---------- */

export const workSampleSchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  filename: z.string().min(1).max(200),
  mimeType: z.string().min(1).max(120),
  size: z.number().int().min(0),
  dataUrl: z.string().min(1), // capped at ~1.4 MB after base64
  uploadedAt: z.string().datetime(),
});
export type WorkSample = z.infer<typeof workSampleSchema>;

export const portfolioEntrySchema = z.object({
  id: z.string().min(1),
  childId: z.string().min(1),
  date: z.string().min(8).max(10), // YYYY-MM-DD
  taskId: z.string().optional(),
  subject: z.enum(SUBJECTS).optional(),
  notes: z.string().trim().max(2000),
  workSampleIds: z.array(z.string()).max(20),
});
export type PortfolioEntry = z.infer<typeof portfolioEntrySchema>;

/* ---------- Chat (tutor + coach) ---------- */

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
  ts: z.string().datetime(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const tutorChatSchema = z.object({
  taskId: z.string().min(1),
  messages: z.array(chatMessageSchema).max(200),
});
export type TutorChat = z.infer<typeof tutorChatSchema>;

/* ---------- State requirements (static reference) ---------- */

export const stateRequirementSchema = z.object({
  code: z.string().min(2).max(2),
  name: z.string().min(1).max(40),
  hoursPerYear: z.number().int().nullable(),
  subjectsRequired: z.array(z.enum(SUBJECTS)),
  portfolioRequired: z.boolean(),
  testingRequired: z.boolean(),
  notificationOfIntent: z.boolean(),
  notes: z.string().max(800),
});
export type StateRequirement = z.infer<typeof stateRequirementSchema>;

/* ---------- Root app state ---------- */

export const prefsSchema = z.object({
  activeView: z.enum(["today", "week"]).default("today"),
  theme: z.enum(["light", "dark"]).optional(),
});
export type Prefs = z.infer<typeof prefsSchema>;

export const appStateSchema = z.object({
  schemaVersion: z.literal(2),
  session: sessionSchema.nullable(),
  family: familySchema.nullable(),
  children: z.array(childSchema),
  activeChildId: z.string().nullable(),
  plans: z.array(lessonPlanSchema),
  tasks: z.array(lessonTaskSchema),
  portfolio: z.array(portfolioEntrySchema),
  uploads: z.array(workSampleSchema),
  tutorChats: z.array(tutorChatSchema),
  coachChats: z.array(chatMessageSchema),
  prefs: prefsSchema,
});
export type AppState = z.infer<typeof appStateSchema>;

export const STORAGE_KEY = "classmap:state:v2";

export function emptyAppState(): AppState {
  return {
    schemaVersion: 2,
    session: null,
    family: null,
    children: [],
    activeChildId: null,
    plans: [],
    tasks: [],
    portfolio: [],
    uploads: [],
    tutorChats: [],
    coachChats: [],
    prefs: { activeView: "today" },
  };
}

/* ---------- Helpers ---------- */

/** Deterministic avatar color from child id — 7 OKLCH stops in the editorial palette. */
const AVATAR_COLORS = [
  "oklch(0.555 0.160 38)", // clay
  "oklch(0.300 0.085 248)", // ink-blue
  "oklch(0.520 0.060 135)", // sage
  "oklch(0.660 0.130 78)", // ochre
  "oklch(0.480 0.110 320)", // wine
  "oklch(0.420 0.080 200)", // teal
  "oklch(0.620 0.090 25)", // brick
] as const;

export function avatarColorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
