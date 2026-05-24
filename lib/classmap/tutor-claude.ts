// ClassMap v2 AI Tutor — Socratic, age-appropriate, never gives the answer outright.
import { spawn } from "node:child_process";
import { z } from "zod";
import type { ChatMessage, Child, LessonTask } from "./types";

const SYSTEM_PROMPT = `You are a homeschool tutor speaking directly to a child. You are Socratic — you ask the next concrete question and never hand over the answer. You are warm, brief (1-4 sentences), and age-appropriate. You reference the child's learning style concretely when it helps. You never lecture. You never use clichés. You never say 'great question!' or 'awesome!' You match the child's energy without being saccharine. If the child gives up or asks for the answer, you redirect with a smaller next step. Return ONLY a JSON object: { "content": "<your reply>" } — no prose, no markdown fences.`;

export interface TutorTurnInput {
  task: Pick<LessonTask, "subject" | "title" | "description" | "materials" | "minutes">;
  child: Pick<Child, "age" | "ageBand" | "learningStyle" | "name">;
  conversation: ChatMessage[];
  userMessage: string;
}

export interface TutorTurnOutput {
  content: string;
}

const tutorOutputSchema = z.object({
  content: z.string().min(1).max(2000),
});

interface RunClaudeOptions {
  prompt: string;
  systemPrompt: string;
  timeoutMs?: number;
}

function runClaude({ prompt, systemPrompt, timeoutMs = 60_000 }: RunClaudeOptions): Promise<string> {
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

function buildUserPrompt(input: TutorTurnInput): string {
  const { task, child, conversation, userMessage } = input;
  const materials =
    task.materials.length > 0 ? task.materials.join(", ") : "none listed";
  const conversationBlock =
    conversation.length > 0
      ? conversation.map((msg) => `[${msg.role}] ${msg.content}`).join("\n")
      : "(no prior turns)";

  return `LESSON CONTEXT
- Subject: ${task.subject}
- Title: ${task.title}
- Description: ${task.description}
- Materials available: ${materials}
- Target minutes: ${task.minutes}

CHILD CONTEXT
- Name: ${child.name}
- Age: ${child.age} (band: ${child.ageBand})
- Learning style: ${child.learningStyle}

CONVERSATION SO FAR
${conversationBlock}

CHILD JUST SAID
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

export async function generateTutorTurn(
  input: TutorTurnInput,
): Promise<TutorTurnOutput> {
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

  return tutorOutputSchema.parse(parsed);
}
