import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/serverApi";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const r = await backendFetch(`/api/site/orders/${encodeURIComponent(id)}`);
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
