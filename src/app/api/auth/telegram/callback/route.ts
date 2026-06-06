import { NextRequest, NextResponse } from "next/server";
import { API_BASE, SESSION_COOKIE } from "@/lib/serverApi";
import { SITE } from "@/lib/site";

// Серверный коллбэк Telegram Login Widget (режим data-auth-url).
// Telegram редиректит сюда с подписанными query-параметрами (id, hash,
// auth_date, ...). Проверяем на бэкенде, ставим httpOnly-сессию,
// возвращаем пользователя в кабинет (или в ?next).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  // Публичный адрес, а не внутренний (за nginx req.origin = localhost:3001).
  const origin = SITE.url;

  const nextRaw = sp.get("next") || "/account";
  const safeNext =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";

  const payload: Record<string, string> = {};
  for (const [k, v] of sp.entries()) {
    if (k !== "next") payload[k] = v;
  }

  const errorRedirect = () => {
    const u = new URL("/account", origin);
    u.searchParams.set("login_error", "1");
    return NextResponse.redirect(u, { status: 303 });
  };

  let data: { token?: string } = {};
  try {
    const r = await fetch(`${API_BASE}/api/site/auth/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    data = await r.json().catch(() => ({}));
    if (!r.ok || !data.token) return errorRedirect();
  } catch {
    return errorRedirect();
  }

  const res = NextResponse.redirect(new URL(safeNext, origin), { status: 303 });
  res.cookies.set(SESSION_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
