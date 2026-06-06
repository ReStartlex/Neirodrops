import { NextRequest, NextResponse } from "next/server";
import { API_BASE, SESSION_COOKIE } from "@/lib/serverApi";

// Авто-вход внутри Telegram Mini App: фронт присылает initData,
// бэкенд проверяет подпись и выдаёт сессию; ставим httpOnly-cookie.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const r = await fetch(`${API_BASE}/api/site/auth/webapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return NextResponse.json(data, { status: r.status });

  const { token, ...me } = data as { token?: string };
  const res = NextResponse.json(me);
  if (token) {
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
