import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const r = await backendFetch("/api/site/topup", { method: "POST", json: body });
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
