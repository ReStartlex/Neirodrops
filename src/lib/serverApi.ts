// Серверный прокси-слой: браузер ходит в Next.js (/api/*), а Next.js
// server-side обращается к FastAPI на 127.0.0.1:8080 и подставляет Bearer
// из httpOnly-cookie nd_session. Сам бэкенд наружу не торчит.
import { cookies } from "next/headers";

const BASE = process.env.NEURODROP_API_BASE ?? "http://127.0.0.1:8080";

export const SESSION_COOKIE = "nd_session";

export async function backendFetch(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<Response> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const body =
    init?.json !== undefined ? JSON.stringify(init.json) : init?.body;
  return fetch(`${BASE}${path}`, {
    ...init,
    headers,
    body,
    cache: "no-store",
  });
}

export const API_BASE = BASE;
