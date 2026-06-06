import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <p className="eyebrow">Ошибка 404</p>
        <h1>Страница не найдена</h1>
        <p className="muted" style={{ maxWidth: "44ch", margin: "0 auto 24px" }}>
          Возможно, товар закончился или ссылка устарела. Загляни в каталог —
          наверняка найдётся то, что нужно.
        </p>
        <Link className="btn btn-primary btn-lg" href="/catalog">
          Открыть каталог
        </Link>
      </div>
    </section>
  );
}
