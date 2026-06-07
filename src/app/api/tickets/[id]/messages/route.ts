import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/serverApi";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const r = await backendFetch(
    `/api/site/tickets/${encodeURIComponent(id)}/messages`,
    { method: "POST", json: body },
  );
  const d = await r.json().catch(() => ({}));
  return NextResponse.json(d, { status: r.status });
}
