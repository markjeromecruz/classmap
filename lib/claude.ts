import { spawn } from "node:child_process";
import {
  type LessonPlan,
  type LessonPlanInput,
  lessonPlanSchema,
  SUBJECTS,
} from "./types";

const SYSTEM_PROMPT = `You are an expert homeschool curriculum designer. You return ONLY valid JSON conforming to the schema provided in the user message. No prose, no markdown fences, no commentary — JSON only.`;

function buildUserPrompt(input: LessonPlanInput, id: string, createdAt: string) {
  return `Generate a 5-day homeschool lesson plan (Monday through Friday).

CHILD PROFILE
- Age: ${input.childAge}
- Learning style: ${input.learningStyle}
- Hours per week target: ${input.hoursPerWeek}
- Subjects to cover (must include all): ${input.subjects.join(", ")}
${input.state ? `- US state for standards alignment hint: ${input.state}` : ""}
${input.notes ? `- Parent notes: ${input.notes}` : ""}
${input.childName ? `- Child name: ${input.childName}` : ""}

OUTPUT SCHEMA (return JSON matching exactly):
{
  "id": "${id}",
  "createdAt": "${createdAt}",
  "input": <echo the input object back>,
  "summary": "2-3 sentence overview of the week",
  "days": [
    {
      "day": "Mon" | "Tue" | "Wed" | "Thu" | "Fri",
      "sessions": [
        {
          "subject": one of [${SUBJECTS.map((s) => `"${s}"`).join(", ")}],
          "title": "short session title",
          "description": "what the child does, tuned to learning style",
          "materials": ["list", "of", "items"],
          "minutes": integer 10-180
        }
      ]
    }
  ]
}

RULES
- Exactly 5 day objects, in order Mon, Tue, Wed, Thu, Fri.
- 2-4 sessions per day. Total weekly minutes should be close to ${input.hoursPerWeek * 60}.
- Cover EVERY subject in the input at least twice across the week.
- Each session description should reference the child's ${input.learningStyle} learning style concretely.
- Materials are common household items, books, or free online resources — no purchases required.

Return only the JSON object. No prose, no markdown.`;
}

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

export async function generateLessonPlan(
  input: LessonPlanInput,
): Promise<LessonPlan> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const prompt = buildUserPrompt(input, id, createdAt);

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

  return lessonPlanSchema.parse(parsed);
}

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
