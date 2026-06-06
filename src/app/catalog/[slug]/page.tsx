import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, safe } from "@/lib/api";
import { Monogram } from "@/components/Monogram";
import { ProductCard } from "@/components/Cards";
import { formatFrom, variantLabel } from "@/lib/format";
import { groupIntro } from "@/lib/seoText";

async function loadGroupName(slug: string): Promise<string | null> {
  const groups = await safe(api.groups(), []);
  const g = groups.find((x) => x.group_slug === slug);
  return g ? g.base_name : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = await loadGroupName(slug);
  if (!name) return { title: "Бренд" };
  return {
    title: `${name} — купить с мгновенной выдачей`,
    description: `${name}: выбор региона и номинала, мгновенная выдача кода после оплаты.`,
    alternates: { canonical: `/catalog/${slug}` },
  };
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const variants = await safe(api.groupVariants(slug), []);
  if (variants.length === 0) notFound();

  const baseName = (await loadGroupName(slug)) ?? "Каталог";
  const cheapest = Math.min(
    ...variants.map((v) => v.cheapest_price_kopecks),
  );
  const intro = groupIntro({
    baseName,
    variantsCount: variants.length,
    cheapestKopecks: Number.isFinite(cheapest) ? cheapest : 0,
  });

  // Один вариант → сразу показываем номиналы (нет смысла в лишнем клике).
  if (variants.length === 1) {
    const page = await safe(
      api.categoryServices(variants[0].category_id, 0, 60),
      { items: [], total: 0, page: 0, page_size: 60 },
    );
    return (
      <section className="section">
        <div className="container">
          <Breadcrumbs name={baseName} />
          <div className="section-head">
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Monogram name={baseName} />
              <h2 style={{ margin: 0 }}>{baseName}</h2>
            </div>
          </div>
          <div className="grid grid-products">
            {page.items.map((s) => (
              <ProductCard key={s.ns_service_id} service={s} />
            ))}
          </div>
          <p className="seo-text">{intro}</p>
        </div>
      </section>
    );
  }

  // Несколько регионов/платформ → карточки вариантов.
  return (
    <section className="section">
      <div className="container">
        <Breadcrumbs name={baseName} />
        <div className="section-head">
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Monogram name={baseName} />
            <div>
              <h2 style={{ margin: 0 }}>{baseName}</h2>
              <p className="muted" style={{ margin: 0 }}>
                Выбери регион или платформу
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-groups">
          {variants.map((v) => (
            <Link
              key={v.category_id}
              className="card"
              href={`/category/${v.category_id}`}
            >
              <Monogram name={baseName} />
              <div className="card-title">
                {variantLabel(v.category_name) || v.category_name}
              </div>
              <div className="card-sub">{v.services_count} номиналов</div>
              <div className="card-price">
                {formatFrom(v.cheapest_price_kopecks)}
              </div>
            </Link>
          ))}
        </div>
        <p className="seo-text">{intro}</p>
      </div>
    </section>
  );
}

function Breadcrumbs({ name }: { name: string }) {
  return (
    <nav className="crumbs" aria-label="Хлебные крошки">
      <Link href="/">Главная</Link>
      <span>/</span>
      <Link href="/catalog">Каталог</Link>
      <span>/</span>
      <span>{name}</span>
    </nav>
  );
}
