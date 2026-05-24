// ClassMap v2 AI Coach — homeschool advisor speaking to the parent.
import { spawn } from "node:child_process";
import { z } from "zod";
import type { ChatMessage, Child, StateRequirement } from "./types";

const SYSTEM_PROMPT = `You are a homeschool advisor speaking to a parent. You are plainspoken, experienced, and ask one clarifying question before suggesting anything substantive. You are unsentimental — no 'every child is unique' platitudes. You reference the parent's real family data when it helps (specific child names, ages, completion stats). You do not flatter. You do not pretend to be a credentialed expert in law — for state compliance questions, summarize and refer them to HSLDA or their state's homeschool org. You return ONLY a JSON object: { "content": "<your reply>" } — no prose, no markdown.`;

export interface CoachStats {
  tasksCompletedThisWeek: number;
  currentStreak: number;
  totalXp: number;
}

export interface CoachTurnInput {
  family: {
    children: Pick<
      Child,
      | "name"
      | "age"
      | "grade"
      | "learningStyle"
      | "curriculumApproach"
      | "state"
      | "xpTotal"
      | "streakDays"
    >[];
    activeChildName?: string;
  };
  stats?: CoachStats;
  stateRequirements?: StateRequirement[];
  conversation: ChatMessage[];
  userMessage: string;
}

export interface CoachTurnOutput {
  content: string;
}

const coachOutputSchema = z.object({
  content: z.string().min(1).max(4000),
});

interface RunClaudeOptions {
  prompt: string;
  systemPrompt: string;
  timeoutMs?: number;
}

function runClaude({
  prompt,
  systemPrompt,
  timeoutMs = 60_000,
}: RunClaudeOptions): Promise<string> {
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

function buildUserPrompt(input: CoachTurnInput): string {
  const { family, stats, stateRequirements, conversation, userMessage } = input;

  const childLines =
    family.children.length > 0
      ? family.children
          .map(
            (c) =>
              `- ${c.name}, age ${c.age} (grade ${c.grade}), ${c.learningStyle}, ${c.curriculumApproach}, ${c.state}, ${c.xpTotal} XP, ${c.streakDays}-day streak`,
          )
          .join("\n")
      : "- (no children on file)";

  const activeChildBlock = family.activeChildName
    ? `\nACTIVE CHILD: ${family.activeChildName}\n`
    : "";

  const statsBlock = stats
    ? `\nRECENT STATS
- Tasks completed this week: ${stats.tasksCompletedThisWeek}
- Current streak: ${stats.currentStreak} days
- Total XP: ${stats.totalXp}\n`
    : "";

  const stateBlock =
    stateRequirements && stateRequirements.length > 0
      ? `\nSTATE REQUIREMENT REFERENCE (for compliance Qs)
${stateRequirements
  .map(
    (s) =>
      `- ${s.name} (${s.code}): hours/year ${s.hoursPerYear ?? "—"}, portfolio ${s.portfolioRequired}, testing ${s.testingRequired}, NOI ${s.notificationOfIntent}. ${s.notes}`,
  )
  .join("\n")}\n`
      : "";

  const conversationBlock =
    conversation.length > 0
      ? conversation.map((msg) => `[${msg.role}] ${msg.content}`).join("\n")
      : "(no prior turns)";

  return `FAMILY CONTEXT
${childLines}
${activeChildBlock}${statsBlock}${stateBlock}
CONVERSATION SO FAR
${conversationBlock}

PARENT JUST SAID
${userMessage}

Reply now. JSON only: { "content": "..." }`;
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

export async function generateCoachTurn(
  input: CoachTurnInput,
): Promise<CoachTurnOutput> {
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

  return coachOutputSchema.parse(parsed);
}
