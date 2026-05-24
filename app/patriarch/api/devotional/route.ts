import { NextResponse } from "next/server";
import { generateDevotional } from "@/lib/patriarch-claude";

export const dynamic = "force-dynamic";

interface RequestBody {
  date?: string;
  theme?: string;
  focus?: string;
}

export async function POST(request: Request) {
  let body: RequestBody = {};
  try {
    const raw: unknown = await request.json();
    if (raw && typeof raw === "object") body = raw as RequestBody;
  } catch {
    // Empty body is fine — generateDevotional will use defaults.
  }

  try {
    const devotional = await generateDevotional(body);
    return NextResponse.json(devotional);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
