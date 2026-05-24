// ClassMap v2 Portfolio Report — generates a compliance-ready markdown report.
import { spawn } from "node:child_process";
import type {
  Child,
  LessonTask,
  PortfolioEntry,
  StateRequirement,
} from "./types";

const SYSTEM_PROMPT = `You are a homeschool portfolio-report writer. You produce a clear, factual, compliance-ready markdown document a parent can submit to a school district or state evaluator. You use only the data the user provides — you do not invent grades, dates, or hours. You speak plainly. You are not editorial. You do not flatter. You return the markdown text directly — no JSON wrapper, no fences, no commentary before or after.`;

export interface PortfolioReportInput {
  child: Child;
  dateRange: { from: string; to: string }; // ISO dates YYYY-MM-DD
  tasks: LessonTask[]; // completed tasks in range
  portfolio: PortfolioEntry[]; // portfolio entries in range
  workSamples?: { id: string; filename: string }[]; // just names for the report
  stateRequirement?: StateRequirement;
}

export interface PortfolioReportOutput {
  markdown: string;
}

interface RunClaudeOptions {
  prompt: string;
  systemPrompt: string;
  timeoutMs?: number;
}

function runClaude({
  prompt,
  systemPrompt,
  timeoutMs = 120_000,
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

function isoDateOnly(value: string): string {
  // Accept either YYYY-MM-DD or full ISO; return YYYY-MM-DD slice.
  if (value.length >= 10) return value.slice(0, 10);
  return value;
}

function buildUserPrompt(input: PortfolioReportInput): string {
  const { child, dateRange, tasks, portfolio, workSamples, stateRequirement } =
    input;

  const sortedTasks = [...tasks].sort((a, b) => {
    const aTs = a.completedAt ?? "";
    const bTs = b.completedAt ?? "";
    if (aTs < bTs) return -1;
    if (aTs > bTs) return 1;
    return 0;
  });

  const tasksBlock =
    sortedTasks.length > 0
      ? sortedTasks
          .map((t) => {
            const when = t.completedAt ? isoDateOnly(t.completedAt) : "—";
            return `- [${when}] ${t.subject} · ${t.minutes}m · ${t.title}`;
          })
          .join("\n")
      : "(none)";

  const portfolioBlock =
    portfolio.length > 0
      ? portfolio
          .map((e) => {
            const subj = e.subject ?? "—";
            const notes = e.notes.slice(0, 200);
            return `- [${e.date}] ${subj}: ${notes}`;
          })
          .join("\n")
      : "(none)";

  const workSamplesBlock =
    workSamples && workSamples.length > 0
      ? `\nWORK SAMPLES ON FILE\n${workSamples
          .map((w) => `- ${w.filename}`)
          .join("\n")}\n`
      : "";

  const stateBlock = stateRequirement
    ? `\nSTATE COMPLIANCE REFERENCE — ${stateRequirement.name} (${stateRequirement.code})
- Hours/year required: ${stateRequirement.hoursPerYear ?? "no minimum"}
- Subjects required: ${
        stateRequirement.subjectsRequired.length > 0
          ? stateRequirement.subjectsRequired.join(", ")
          : "none specified"
      }
- Portfolio required: ${stateRequirement.portfolioRequired ? "yes" : "no"}
- Standardized testing required: ${stateRequirement.testingRequired ? "yes" : "no"}
- Notice of intent required: ${stateRequirement.notificationOfIntent ? "yes" : "no"}
- Notes: ${stateRequirement.notes}\n`
    : "";

  const stateSection = stateRequirement
    ? `\n## State Compliance — ${stateRequirement.name} (${stateRequirement.code})
(Restate the requirements above. Then a Status line: "Hours instructed: X — meets/below the <Y>-hour annual minimum." Acknowledge gaps factually without commentary.)
`
    : "";

  return `PORTFOLIO REPORT REQUEST

CHILD
- Name: ${child.name}
- Age: ${child.age}
- Grade: ${child.grade}
- State: ${child.state}
- Learning approach: ${child.curriculumApproach}, ${child.learningStyle} style

DATE RANGE
${dateRange.from} to ${dateRange.to}

COMPLETED TASKS (${tasks.length} total)
${tasksBlock}

PORTFOLIO ENTRIES (${portfolio.length} total)
${portfolioBlock}
${workSamplesBlock}${stateBlock}
WRITE THE REPORT NOW. Markdown only. Structure:

# Homeschool Portfolio — ${child.name}, Grade ${child.grade}
**Period:** ${dateRange.from} to ${dateRange.to}

## Summary
(2-3 sentence overview)

## Subjects Covered
(Bulleted list of subjects taught with task counts and total minutes per subject. Sum from the COMPLETED TASKS above.)

## Total Instructional Time
(One line: total minutes, total hours.)

## Sample Activities
(3-5 short bullets pulling from task titles.)

## Portfolio Entries
(One line per entry: date, subject, brief from notes.)

## Work Samples
(List filenames if any; else "None on file for this period.")
${stateSection}
End with this exact line:
*Report generated from parent-provided data. Verify all figures before submitting.*`;
}

function stripLeadingFence(text: string): string {
  const trimmed = text.trim();
  // Strip a wrapping ```markdown ... ``` (or ``` ... ```) fence if present.
  const fenced = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
  if (fenced) return fenced[1].trim();
  // Strip just a leading fence line if present without a closing match.
  if (trimmed.startsWith("```")) {
    const firstNewline = trimmed.indexOf("\n");
    if (firstNewline !== -1) {
      let body = trimmed.slice(firstNewline + 1);
      if (body.endsWith("```")) body = body.slice(0, -3);
      return body.trim();
    }
  }
  return trimmed;
}

export async function generatePortfolioReport(
  input: PortfolioReportInput,
): Promise<PortfolioReportOutput> {
  const prompt = buildUserPrompt(input);
  const raw = await runClaude({ prompt, systemPrompt: SYSTEM_PROMPT });
  const markdown = stripLeadingFence(raw);
  return { markdown };
}
