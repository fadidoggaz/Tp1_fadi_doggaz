import { NextResponse } from "next/server";
import { registerUser } from "@/lib/register";

export async function POST(req: Request) {
  const result = await registerUser(await req.json().catch(() => null));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.user, { status: 201 });
}
