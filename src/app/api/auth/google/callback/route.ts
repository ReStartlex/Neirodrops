import { NextRequest, NextResponse } from "next/server";
import { googleExchange, finishOAuth, safeNext, OAUTH_STATE_COOKIE } from "@/lib/oauth";
import { SESSION_COOKIE } from "@/lib/serverApi";
import { SITE } from "@/lib/site";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const origin = SITE.url;
  const code = sp.get("code");
  const state = sp.get("state");
  const [savedState, savedNext] = (
    req.cookies.get(OAUTH_STATE_COOKIE)?.value ?? ""
  ).split("|");

  const fail = () => {
    const u = new URL("/account", origin);
    u.searchParams.set("login_error", "1");
    const r = NextResponse.redirect(u, { status: 303 });
    r.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return r;
  };

  if (!code || !state || state !== savedState) return fail();
  try {
    const token = await finishOAuth("google", await googleExchange(code));
    if (!token) return fail();
    const res = NextResponse.redirect(
      new URL(safeNext(savedNext), origin),
      { status: 303 },
    );
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return fail();
  }
}
