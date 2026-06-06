import type { Metadata } from "next";
import { api, safe } from "@/lib/api";
import { GroupCard } from "@/components/Cards";
import { CatalogFilter } from "@/components/CatalogFilter";
import { catalogIntro } from "@/lib/seoText";

export const metadata: Metadata = {
  title: "Каталог подарочных карт и подписок",
  description:
    "Все бренды цифровых подарочных карт и подписок: Apple, Steam, Google Play, " +
    "Spotify, PlayStation и другие. Мгновенная выдача кодов.",
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage() {
  const groups = await safe(api.groups(), []);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Каталог</p>
            <h2>Все бренды</h2>
          </div>
        </div>
        {groups.length > 0 && <CatalogFilter />}
        {groups.length > 0 ? (
          <>
            <div id="catalog-grid" className="grid grid-groups">
              {groups.map((g) => (
                <GroupCard key={g.group_slug} group={g} />
              ))}
            </div>
            <div id="catalog-empty" className="notice" style={{ display: "none" }}>
              По фильтру ничего не найдено. Очисти поле или загляни в{" "}
              <a href="/search">поиск</a>.
            </div>
          </>
        ) : (
          <div className="notice">Каталог временно обновляется. Загляни чуть позже.</div>
        )}
        {groups.length > 0 && (
          <p className="seo-text">
            {catalogIntro(
              groups.reduce((s, g) => s + g.services_count, 0),
              groups.length,
            )}
          </p>
        )}
      </div>
    </section>
  );
}
