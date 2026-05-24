import { NextResponse } from "next/server";
import { generateCoachTurn } from "@/lib/classmap/coach-claude";
import {
  childSchema,
  chatMessageSchema,
  stateRequirementSchema,
} from "@/lib/classmap/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const childPicked = childSchema.pick({
  name: true,
  age: true,
  grade: true,
  learningStyle: true,
  curriculumApproach: true,
  state: true,
  xpTotal: true,
  streakDays: true,
});

const requestBodySchema = z.object({
  family: z.object({
    children: z.array(childPicked).max(12),
    activeChildName: z.string().max(40).optional(),
  }),
  stats: z
    .object({
      tasksCompletedThisWeek: z.number().int().min(0),
      currentStreak: z.number().int().min(0),
      totalXp: z.number().int().min(0),
    })
    .optional(),
  stateRequirements: z.array(stateRequirementSchema).max(5).optional(),
  conversation: z.array(chatMessageSchema).max(100),
  userMessage: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = requestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const result = await generateCoachTurn(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
