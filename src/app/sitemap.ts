import type { MetadataRoute } from "next";
import { api, safe } from "@/lib/api";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/payment`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/oferta`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/contacts`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [groups, data] = await Promise.all([
    safe(api.groups(), []),
    safe(api.sitemap(), { groups: [], services: [] }),
  ]);

  const groupEntries: MetadataRoute.Sitemap = groups.map((g) => ({
    url: `${base}/catalog/${g.group_slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = data.services.map((s) => ({
    url: `${base}/product/${s.ns_service_id}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticEntries, ...groupEntries, ...productEntries];
}
