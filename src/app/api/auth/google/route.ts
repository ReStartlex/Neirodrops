import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl, randomState, safeNext, OAUTH_STATE_COOKIE } from "@/lib/oauth";

export async function GET(req: NextRequest) {
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  const state = randomState();
  const res = NextResponse.redirect(googleAuthUrl(state));
  res.cookies.set(OAUTH_STATE_COOKIE, `${state}|${next}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
