import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, safe } from "@/lib/api";
import { ProductCard } from "@/components/Cards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const page = await safe(api.categoryServices(Number(id), 0, 1), {
    items: [],
    total: 0,
    page: 0,
    page_size: 1,
  });
  const name = page.items[0]?.category_name ?? "Категория";
  return {
    title: name,
    description: `${name}: номиналы в наличии, мгновенная выдача кода после оплаты.`,
    alternates: { canonical: `/category/${id}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageRaw } = await searchParams;
  const page = Math.max(0, Number(pageRaw ?? 0) || 0);
  const size = 40;

  const data = await safe(api.categoryServices(Number(id), page, size), {
    items: [],
    total: 0,
    page,
    page_size: size,
  });
  if (data.total === 0 && page === 0) notFound();

  const name = data.items[0]?.category_name ?? "Категория";
  const totalPages = Math.max(1, Math.ceil(data.total / size));

  return (
    <section className="section">
      <div className="container">
        <nav className="crumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span>/</span>
          <Link href="/catalog">Каталог</Link>
          <span>/</span>
          <span>{name}</span>
        </nav>
        <div className="section-head">
          <h2 style={{ margin: 0 }}>{name}</h2>
          <span className="muted">{data.total} в наличии</span>
        </div>
        <div className="grid grid-products">
          {data.items.map((s) => (
            <ProductCard key={s.ns_service_id} service={s} />
          ))}
        </div>
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 32,
              alignItems: "center",
            }}
          >
            {page > 0 && (
              <Link className="btn btn-ghost" href={`/category/${id}?page=${page - 1}`}>
                ← Назад
              </Link>
            )}
            <span className="muted">
              {page + 1} из {totalPages}
            </span>
            {page + 1 < totalPages && (
              <Link className="btn btn-ghost" href={`/category/${id}?page=${page + 1}`}>
                Вперёд →
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
