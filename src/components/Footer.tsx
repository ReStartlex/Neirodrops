import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-cols">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              <span className="dot" />
              {SITE.brand}
            </div>
            <p style={{ margin: 0, maxWidth: "38ch" }}>
              {SITE.tagline}. Мгновенная выдача кодов, честные цены и поддержка
              каждый день.
            </p>
          </div>
          <div>
            <h4>Магазин</h4>
            <Link href="/catalog">Каталог</Link>
            <Link href="/search">Поиск</Link>
            <Link href="/help">Как купить</Link>
            <Link href="/payment">Оплата и доставка</Link>
            <a href={SITE.botUrl} target="_blank" rel="noopener noreferrer">
              Telegram-бот
            </a>
          </div>
          <div>
            <h4>Документы</h4>
            <Link href="/oferta">Публичная оферта</Link>
            <Link href="/privacy">Политика конфиденциальности</Link>
            <Link href="/terms">Правила и возврат</Link>
            <Link href="/contacts">Контакты и реквизиты</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {SITE.brand} · {SITE.merchant.shortName} ·{" "}
            {SITE.merchant.legalForm}, ИНН {SITE.merchant.inn}
          </span>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </div>
    </footer>
  );
}
