import { NextResponse } from "next/server";
import { generatePortfolioReport } from "@/lib/classmap/portfolio-claude";
import {
  childSchema,
  lessonTaskSchema,
  portfolioEntrySchema,
  stateRequirementSchema,
} from "@/lib/classmap/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const requestBodySchema = z.object({
  child: childSchema,
  dateRange: z.object({
    from: z.string().min(8).max(10),
    to: z.string().min(8).max(10),
  }),
  tasks: z.array(lessonTaskSchema).max(2000),
  portfolio: z.array(portfolioEntrySchema).max(2000),
  workSamples: z
    .array(z.object({ id: z.string(), filename: z.string().max(200) }))
    .max(500)
    .optional(),
  stateRequirement: stateRequirementSchema.optional(),
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
    const result = await generatePortfolioReport(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
