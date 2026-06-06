// OAuth-помощники для входа через Google и Яндекс. Обмен кода на профиль
// и server-to-server вызов бэкенда (/api/site/auth/oauth), который заводит
// аккаунт и выдаёт сессию.
export const OAUTH_STATE_COOKIE = "nd_oauth_state";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://neurodrop.ru").replace(
    /\/$/,
    "",
  );
}

export function randomState(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

type Profile = { sub: string; email?: string; firstName?: string };

export function googleAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
    redirect_uri: `${siteUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export function yandexAuthUrl(state: string): string {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: process.env.YANDEX_OAUTH_CLIENT_ID ?? "",
    redirect_uri: `${siteUrl()}/api/auth/yandex/callback`,
    state,
  });
  return `https://oauth.yandex.ru/authorize?${p.toString()}`;
}

export async function googleExchange(code: string): Promise<Profile> {
  const tok = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      redirect_uri: `${siteUrl()}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  }).then((r) => r.json());
  if (!tok.access_token) throw new Error("google token exchange failed");
  const info = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tok.access_token}` },
    cache: "no-store",
  }).then((r) => r.json());
  if (!info.sub) throw new Error("google userinfo failed");
  return {
    sub: String(info.sub),
    email: info.email,
    firstName: info.given_name || info.name,
  };
}

export async function yandexExchange(code: string): Promise<Profile> {
  const tok = await fetch("https://oauth.yandex.ru/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.YANDEX_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.YANDEX_OAUTH_CLIENT_SECRET ?? "",
    }),
    cache: "no-store",
  }).then((r) => r.json());
  if (!tok.access_token) throw new Error("yandex token exchange failed");
  const info = await fetch("https://login.yandex.ru/info?format=json", {
    headers: { Authorization: `OAuth ${tok.access_token}` },
    cache: "no-store",
  }).then((r) => r.json());
  if (!info.id) throw new Error("yandex userinfo failed");
  return {
    sub: String(info.id),
    email: info.default_email,
    firstName: info.first_name || info.real_name,
  };
}

/** Заводит/находит аккаунт на бэкенде и возвращает session-токен (или null). */
export async function finishOAuth(
  provider: "google" | "yandex",
  profile: Profile,
): Promise<string | null> {
  const base = process.env.NEURODROP_API_BASE ?? "http://127.0.0.1:8080";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.INTERNAL_AUTH_SECRET;
  if (secret) headers["X-Internal-Secret"] = secret;
  const r = await fetch(`${base}/api/site/auth/oauth`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      provider,
      sub: profile.sub,
      email: profile.email,
      first_name: profile.firstName,
    }),
    cache: "no-store",
  });
  if (!r.ok) return null;
  const data = await r.json().catch(() => ({}));
  return data.token ?? null;
}

export function safeNext(raw: string | undefined | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
}
