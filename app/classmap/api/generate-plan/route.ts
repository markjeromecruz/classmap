import { NextResponse } from "next/server";
import { generatePlanForChild } from "@/lib/classmap/plan-claude";
import { childSchema } from "@/lib/classmap/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const requestBodySchema = z.object({
  child: childSchema,
  weekStart: z.string().min(8).max(10),
  preferences: z
    .object({
      focus: z.string().max(200).optional(),
      avoidTopics: z.array(z.string().max(80)).max(20).optional(),
    })
    .optional(),
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
    const result = await generatePlanForChild(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
