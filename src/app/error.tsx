"use client";

import Link from "next/link";

// Брендовый обработчик ошибок сегмента: вместо «голой» 500 показываем
// дружелюбный экран с кнопкой повтора. Шапка/подвал остаются на месте.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <p className="eyebrow">Упс</p>
        <h1>Что-то пошло не так</h1>
        <p className="muted" style={{ maxWidth: "46ch", margin: "0 auto 24px" }}>
          Похоже, сервис на секунду недоступен. Обычно помогает обновить
          страницу.
        </p>
        <div
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
        >
          <button className="btn btn-primary btn-lg" onClick={() => reset()}>
            Обновить
          </button>
          <Link className="btn btn-ghost btn-lg" href="/catalog">
            В каталог
          </Link>
        </div>
      </div>
    </section>
  );
}
