import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты и реквизиты",
  description: "Контактные данные и реквизиты продавца NeuroDrop.",
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <div className="container prose">
      <h1>Контакты и реквизиты</h1>
      <p className="updated">Обновлено: {SITE.legalUpdatedAt}</p>

      <h2>Связь с нами</h2>
      <p>
        Электронная почта:{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        <br />
        Telegram:{" "}
        <a href={SITE.botUrl} target="_blank" rel="noopener noreferrer">
          {SITE.botUrl.replace("https://t.me/", "@")}
        </a>
        <br />
        Сайт: {SITE.domain}
      </p>
      <p>
        Мы отвечаем ежедневно. По вопросам заказов, активации кодов и возвратов
        пишите на почту или в Telegram — поможем оперативно.
      </p>

      <h2>Реквизиты продавца</h2>
      <p>
        Продавец: {SITE.merchant.legalForm}
        <br />
        ФИО: {SITE.merchant.fullName}
        <br />
        ИНН: {SITE.merchant.inn}
        <br />
        E-mail: {SITE.email}
      </p>

      {SITE.merchant.fullName === "—" && (
        <div className="callout">
          ⚠ Для публикации укажите ФИО самозанятого в{" "}
          <code>src/lib/site.ts</code> (поле <code>merchant.fullName</code>) —
          этого требуют оферта и подключение приёма платежей.
        </div>
      )}
    </div>
  );
}
