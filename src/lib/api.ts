// Серверный клиент публичного API витрины. Все вызовы — server-side
// (App Router server components), к FastAPI на 127.0.0.1:8080.
// ISR: ответы кэшируются на `revalidate` секунд, витрина не дёргает
// бэкенд на каждый запрос и переживает всплески трафика.
import type {
  Group,
  CategoryVariant,
  ServicesPage,
  ServiceCard,
  SearchResult,
  Stats,
  SitemapData,
} from "./types";

const BASE = process.env.NEURODROP_API_BASE ?? "http://127.0.0.1:8080";

async function get<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `API ${path} → ${res.status}`);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  groups: () => get<Group[]>("/api/public/catalog/groups"),
  groupVariants: (slug: string) =>
    get<CategoryVariant[]>(
      `/api/public/catalog/groups/${encodeURIComponent(slug)}`,
    ),
  categoryServices: (id: number, page = 0, size = 40) =>
    get<ServicesPage>(
      `/api/public/catalog/categories/${id}?page=${page}&page_size=${size}`,
    ),
  service: (id: number) =>
    get<ServiceCard>(`/api/public/catalog/services/${id}`),
  search: (q: string) =>
    get<SearchResult>(`/api/public/search?q=${encodeURIComponent(q)}`),
  stats: () => get<Stats>("/api/public/stats", 120),
  sitemap: () => get<SitemapData>("/api/public/sitemap", 300),
};

/** Каталог иногда временно недоступен (бэкенд перезапускается) —
 *  возвращаем безопасные значения, чтобы страница не падала в 500. */
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}
