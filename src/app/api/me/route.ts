import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/serverApi";

export async function GET() {
  const r = await backendFetch("/api/site/me");
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
