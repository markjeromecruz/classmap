// ClassMap v2 plan generator — headless `claude -p` shells out to produce a 5-day plan + tasks for a single child.

import { spawn } from "node:child_process";
import { z } from "zod";
import {
  type Child,
  type LessonPlan,
  type LessonTask,
  DAYS,
  SUBJECTS,
  RESOURCE_TYPES,
  ageBandFor,
} from "./types";

const SYSTEM_PROMPT = `You are an expert homeschool curriculum designer. You design developmentally appropriate weekly plans tuned to the child's age, learning style, and curriculum approach. You return ONLY valid JSON matching the schema in the user message — no prose, no markdown fences, no commentary.`;

export interface GeneratePlanInput {
  child: Child;
  weekStart: string; // YYYY-MM-DD, a Monday
  preferences?: { focus?: string; avoidTopics?: string[] };
}

export interface GeneratedPlan {
  plan: Omit<LessonPlan, "id" | "createdAt">;
  tasks: Omit<LessonTask, "id" | "planId">[];
}

/* ---------- response schema (shape returned by Claude) ---------- */

const generatedTaskSchema = z.object({
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
  status: z.literal("pending"),
  completedAt: z.null(),
});

const generatedPlanSchema = z.object({
  plan: z.object({
    childId: z.string().min(1),
    weekStart: z.string().min(8).max(10),
    aiGenerated: z.literal(true),
    rationale: z.string().min(1).max(2000),
  }),
  tasks: z.array(generatedTaskSchema).min(8).max(25),
});

/* ---------- prompt builder ---------- */

function buildUserPrompt(input: GeneratePlanInput): string {
  const { child, weekStart, preferences } = input;
  const band = ageBandFor(child.age);
  const focus = preferences?.focus?.trim();
  const avoid = preferences?.avoidTopics?.filter((t) => t.trim().length > 0) ?? [];

  return `Generate a 5-day homeschool weekly plan + task list (Monday through Friday) for ONE specific child.

CHILD PROFILE
- ID: ${child.id}
- Name: ${child.name}
- Age: ${child.age} (age band: ${band})
- Grade: ${child.grade}
- US state: ${child.state}
- Learning style: ${child.learningStyle}
- Curriculum approach: ${child.curriculumApproach}
- Priority subjects (cover EACH at least twice across the week): ${child.prioritySubjects.join(", ")}

WEEK
- Week start (Monday): ${weekStart}
${focus ? `- Parent focus this week: ${focus}` : ""}
${avoid.length > 0 ? `- Topics to avoid: ${avoid.join(", ")}` : ""}

OUTPUT SCHEMA (return JSON matching exactly, no other top-level keys):
{
  "plan": {
    "childId": "${child.id}",
    "weekStart": "${weekStart}",
    "aiGenerated": true,
    "rationale": "2-4 sentences explaining the week's shape and how it serves this learner"
  },
  "tasks": [
    {
      "childId": "${child.id}",
      "day": "Mon" | "Tue" | "Wed" | "Thu" | "Fri",
      "order": 0,
      "subject": one of [${SUBJECTS.map((s) => `"${s}"`).join(", ")}],
      "title": "short, concrete title (e.g. 'Multiplication arrays on graph paper')",
      "description": "2-4 sentences. MUST reference the child's ${child.learningStyle} learning style concretely.",
      "materials": ["0-6 common household items or free online resources"],
      "minutes": integer 15-90,
      "resourceType": one of [${RESOURCE_TYPES.map((r) => `"${r}"`).join(", ")}],
      "xpValue": integer 10-50,
      "status": "pending",
      "completedAt": null
    }
  ]
}

TASK COUNT + DISTRIBUTION
- Total of 12-22 task objects across Mon..Fri.
- 2-5 tasks per day. Keep day loads balanced.
- "order" is an integer starting at 0 per day (0, 1, 2, …).
- Cover EVERY subject in child.prioritySubjects at least twice across the week. Prefer those subjects over others.

AGE BAND TUNING (ageBandFor(${child.age}) = ${band})
- early (≤8): shorter sessions (15-30 min), heavier on "activity" and "video" resourceTypes.
- upper (9-12): mix of all five resourceTypes, sessions 30-60 min.
- teen (13+): longer sessions (45-90 min), more "reading" and "assessment".

CURRICULUM APPROACH (${child.curriculumApproach})
- classical: drill + great-books-ish reading, structured progression.
- charlotte-mason: short lessons, narration, nature study.
- unschooling: wide interest-led exploration, fewer rigid assessments.
- montessori: practical-life and sensorial work, hands-on materials.
- eclectic: balanced mix.
- traditional: textbook-style, structured.

XP VALUES
- xpValue is roughly proportional to minutes and difficulty: ~10 for a 15-min activity, ~25-35 for a 45-min lesson, ~50 for a 90-min assessment.

STATE FLAVOR
- child.state is "${child.state}". If that's a real US state code, include exactly ONE task that references state-relevant content (e.g. "Read about CA's gold-rush era" for history). Do NOT invent state laws or specific statutes.

HARD RULES
- "status" MUST always be the literal string "pending".
- "completedAt" MUST always be null.
- "aiGenerated" MUST be true.
- Materials are common household items, library books, or free online resources — no purchases required.
- Return ONLY the JSON object. No markdown fences, no prose.`;
}

/* ---------- spawn wrapper (identical contract to lib/claude.ts) ---------- */

interface RunClaudeOptions {
  prompt: string;
  systemPrompt: string;
  timeoutMs?: number;
}

function runClaude({ prompt, systemPrompt, timeoutMs = 120_000 }: RunClaudeOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-p",
      prompt,
      "--append-system-prompt",
      systemPrompt,
      "--output-format",
      "text",
    ];
    const child = spawn("claude", args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`claude headless call timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`failed to spawn claude: ${err.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`claude exited with code ${code}: ${stderr || stdout}`));
    });
  });
}

/* ---------- public entry point ---------- */

export async function generatePlanForChild(input: GeneratePlanInput): Promise<GeneratedPlan> {
  const prompt = buildUserPrompt(input);
  const raw = await runClaude({ prompt, systemPrompt: SYSTEM_PROMPT });
  const cleaned = extractJson(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `claude returned non-JSON: ${(err as Error).message}\n--- raw (first 500 chars) ---\n${raw.slice(0, 500)}`,
    );
  }

  const validated = generatedPlanSchema.parse(parsed);

  // Re-shape into the exported GeneratedPlan type (drops childId from tasks where appropriate).
  return {
    plan: {
      childId: validated.plan.childId,
      weekStart: validated.plan.weekStart,
      aiGenerated: validated.plan.aiGenerated,
      rationale: validated.plan.rationale,
    },
    tasks: validated.tasks.map((t) => ({
      childId: t.childId,
      day: t.day,
      order: t.order,
      subject: t.subject,
      title: t.title,
      description: t.description,
      materials: t.materials,
      minutes: t.minutes,
      resourceType: t.resourceType,
      xpValue: t.xpValue,
      status: t.status,
      completedAt: t.completedAt,
    })),
  };
}

/* ---------- json fence stripper (copied from lib/claude.ts) ---------- */

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}
