import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/serverApi";

export async function GET(req: NextRequest) {
  const r = await backendFetch(`/api/site/orders${req.nextUrl.search}`);
  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
