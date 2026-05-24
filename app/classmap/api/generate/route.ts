import { NextResponse } from "next/server";
import { generateLessonPlan } from "@/lib/claude";
import { lessonPlanInputSchema } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = lessonPlanInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid input", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const plan = await generateLessonPlan(parsed.data);
    return NextResponse.json(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
