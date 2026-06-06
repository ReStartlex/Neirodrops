import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Как купить",
  description:
    "Как купить подарочную карту или подписку в NeuroDrop: выбор товара, " +
    "оплата и мгновенное получение кода.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return (
    <div className="container prose">
      <h1>Как купить</h1>
      <p className="updated">Всё просто — три шага и код у тебя.</p>

      <h2>1. Выбери товар</h2>
      <p>
        Открой <Link href="/catalog">каталог</Link> или воспользуйся{" "}
        <Link href="/search">поиском</Link>. Выбери бренд, нужный регион и
        номинал. На странице товара видна актуальная цена и наличие.
      </p>

      <h2>2. Оплати</h2>
      <p>
        Нажми «Купить» и оплати заказ на сайте банковской картой или через СБП.
        Платёж проходит по защищённому соединению, реквизиты карты мы не храним.
        После оплаты придёт чек. Подробнее — на странице{" "}
        <Link href="/payment">Оплата и доставка</Link>.
      </p>

      <h2>3. Получи код</h2>
      <p>
        Сразу после оплаты код приходит автоматически и сохраняется в истории
        заказов. Среднее время выдачи — несколько секунд.
      </p>

      <h2>Если что-то пошло не так</h2>
      <p>
        Напиши нам на{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> или в Telegram-бот —
        поможем с активацией или вернём средства согласно{" "}
        <Link href="/terms">правилам</Link>.
      </p>

      <div className="callout">
        Покупая в {SITE.brand}, ты соглашаешься с{" "}
        <Link href="/oferta">публичной офертой</Link> и{" "}
        <Link href="/privacy">политикой конфиденциальности</Link>.
      </div>
    </div>
  );
}
