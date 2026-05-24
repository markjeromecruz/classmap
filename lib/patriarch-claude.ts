import { spawn } from "node:child_process";
import { type Devotional, devotionalSchema } from "./patriarch-types";

const SYSTEM_PROMPT = `You are a devotional writer for "Patriarch" — a quiet, serious app for Christian husbands and fathers who want to lead their households with intentionality. Your voice is unsentimental, plainspoken, and grounded in Scripture; you avoid clichés, generic platitudes, and "Christianese." You speak to men as adults. You return ONLY valid JSON matching the schema in the user message — no prose, no markdown fences, no commentary.`;

interface BuildPromptInput {
  date: string;
  theme?: string;
  focus?: string;
  id: string;
}

function buildUserPrompt({ date, theme, focus, id }: BuildPromptInput) {
  return `Write today's daily devotional for a husband and father.

CONTEXT
- Date: ${date}
${theme ? `- Suggested theme: ${theme}` : "- Pick a theme appropriate for a man leading his household this week."}
${focus ? `- Specific focus from the reader: ${focus}` : ""}

OUTPUT SCHEMA (return JSON matching exactly):
{
  "id": "${id}",
  "date": "${date}",
  "theme": "2-5 word theme",
  "scriptureReference": "Book chapter:verse (e.g. Joshua 1:9)",
  "scriptureText": "the verse text, ESV or KJV public-domain equivalent",
  "reflection": "3-5 short paragraphs, plainspoken, no clichés, written to a man in his own house. Avoid 'Bible-study lecture' tone — this is a quiet 5-minute read.",
  "prompt": "one searching question the reader can sit with today",
  "prayer": "a brief, honest prayer (3-5 sentences) appropriate for a man leading his family"
}

VOICE RULES
- Avoid generic phrases ("walk with God", "do life", "be intentional", "step into your calling")
- Avoid sentimentality — no "your beautiful family"
- Do not flatter the reader. Treat him as capable.
- Concrete > abstract. Reference a specific household moment (the spilled milk, the late email, the bedroom-light-off ritual).
- Do not invent scripture. Use a real verse and quote it accurately.

Return only the JSON object.`;
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

export interface GenerateDevotionalInput {
  date?: string;
  theme?: string;
  focus?: string;
}

export async function generateDevotional(
  input: GenerateDevotionalInput = {},
): Promise<Devotional> {
  const id = crypto.randomUUID();
  const date =
    input.date ??
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  const prompt = buildUserPrompt({
    date,
    theme: input.theme,
    focus: input.focus,
    id,
  });

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

  return devotionalSchema.parse(parsed);
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
