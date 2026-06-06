import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Monogram } from "@/components/Monogram";
import { ProductCard } from "@/components/Cards";
import { BuyButton } from "@/components/BuyButton";
import { formatRub, variantLabel } from "@/lib/format";
import { SITE } from "@/lib/site";
import type { ServiceCard } from "@/lib/types";

async function loadService(id: number): Promise<ServiceCard | null> {
  try {
    return await api.service(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const svc = await loadService(Number(id));
  if (!svc) return { title: "Товар не найден" };
  const region = variantLabel(svc.category_name);
  return {
    title: `${svc.service_name}${region ? ` (${region})` : ""} — ${formatRub(
      svc.rub_price_kopecks,
    )}`,
    description: `${svc.service_name} — купить за ${formatRub(
      svc.rub_price_kopecks,
    )} с мгновенной выдачей кода. ${svc.in_stock > 0 ? "В наличии." : ""}`,
    alternates: { canonical: `/product/${id}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const svc = await loadService(Number(id));
  if (!svc) notFound();

  const region = variantLabel(svc.category_name);
  const lowStock = svc.in_stock > 0 && svc.in_stock < 5;

  const product = {
    "@type": "Product",
    name: svc.service_name,
    category: svc.category_name ?? undefined,
    brand: svc.base_name ? { "@type": "Brand", name: svc.base_name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: (svc.rub_price_kopecks / 100).toFixed(2),
      availability:
        svc.in_stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE.url}/product/${svc.ns_service_id}`,
    },
  };
  const crumbs = [
    { name: "Главная", url: SITE.url },
    { name: "Каталог", url: `${SITE.url}/catalog` },
    ...(svc.group_slug
      ? [{ name: svc.base_name ?? "Бренд", url: `${SITE.url}/catalog/${svc.group_slug}` }]
      : []),
    { name: svc.service_name, url: `${SITE.url}/product/${svc.ns_service_id}` },
  ];
  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [product, breadcrumbList],
  };

  return (
    <section className="section">
      <div className="container">
        <nav className="crumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>/</span>
          <Link href="/catalog">Каталог</Link>
          {svc.group_slug && (
            <>
              <span>/</span>
              <Link href={`/catalog/${svc.group_slug}`}>
                {svc.base_name ?? "Бренд"}
              </Link>
            </>
          )}
        </nav>

        <div className="product">
          <div className="product-hero">
            <Monogram name={svc.base_name || svc.service_name} />
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(28px,4vw,40px)" }}>
              {svc.service_name}
            </h1>
            {region && <p className="muted">Регион / платформа: {region}</p>}

            <div style={{ margin: "20px 0" }}>
              <span className="price-xl">{formatRub(svc.rub_price_kopecks)}</span>
            </div>

            <div style={{ marginBottom: 22 }}>
              {svc.in_stock > 0 ? (
                <span className={`badge ${lowStock ? "badge-low" : "badge-ok"}`}>
                  {lowStock ? `Осталось ${svc.in_stock}` : "В наличии"}
                </span>
              ) : (
                <span className="badge badge-low">Нет в наличии</span>
              )}
            </div>

            {svc.in_stock > 0 ? (
              <BuyButton serviceId={svc.ns_service_id} />
            ) : (
              <button className="btn btn-ghost btn-lg" disabled>
                Временно нет в наличии
              </button>
            )}

            <div className="callout" style={{ marginTop: 22 }}>
              ⚡ Код приходит автоматически сразу после оплаты. Оплата на сайте
              с внутреннего баланса — пополнить можно за минуту. Подробнее —{" "}
              <Link href="/payment">Оплата и доставка</Link>.
            </div>
          </div>
        </div>

        {svc.similar.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div className="section-head">
              <h2 style={{ margin: 0, fontSize: 26 }}>Другие номиналы и регионы</h2>
            </div>
            <div className="grid grid-products">
              {svc.similar.map((s) => (
                <ProductCard key={s.ns_service_id} service={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
