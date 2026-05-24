import { NextResponse } from "next/server";
import { generateTutorTurn } from "@/lib/classmap/tutor-claude";
import { lessonTaskSchema, childSchema, chatMessageSchema } from "@/lib/classmap/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const requestBodySchema = z.object({
  task: lessonTaskSchema.pick({ subject: true, title: true, description: true, materials: true, minutes: true }),
  child: childSchema.pick({ age: true, ageBand: true, learningStyle: true, name: true }),
  conversation: z.array(chatMessageSchema).max(100),
  userMessage: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); }

  const parsed = requestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input", issues: parsed.error.issues }, { status: 422 });
  }

  try {
    const result = await generateTutorTurn(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
