import type { Metadata } from "next";
import { api, safe } from "@/lib/api";
import { ProductCard } from "@/components/Cards";
import { SearchBar } from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "Поиск по магазину",
  description: "Найди нужную подарочную карту или подписку по названию.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results =
    query.length >= 2
      ? await safe(api.search(query), { query, items: [] })
      : { query, items: [] };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Поиск</p>
            <h2 style={{ margin: 0 }}>
              {query ? `Результаты: «${query}»` : "Поиск по магазину"}
            </h2>
          </div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <SearchBar defaultValue={query} />
        </div>

        {query.length < 2 ? (
          <div className="notice">Введи минимум 2 символа — например, «apple».</div>
        ) : results.items.length === 0 ? (
          <div className="notice">
            По запросу «{query}» ничего не нашлось. Попробуй другое слово или
            открой каталог.
          </div>
        ) : (
          <div className="grid grid-products">
            {results.items.map((s) => (
              <ProductCard key={s.ns_service_id} service={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
