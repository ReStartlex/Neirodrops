// Генерация осмысленных описаний для страниц каталога. Тексты
// параметризованы данными (бренд, регион, число вариантов, цена), поэтому
// уникальны от страницы к странице — это лучше для SEO, чем пустые списки
// или одинаковый шаблон. Без «воды» и переспама ключами.
import { formatRub, variantLabel } from "./format";
import type { Service } from "./types";

export function catalogIntro(productsCount: number, groupsCount: number): string {
  const tail =
    productsCount > 0
      ? `Сейчас в наличии ${productsCount} товаров от ${groupsCount} брендов.`
      : "";
  return (
    "Каталог цифровых подарочных карт, ключей и подписок NeuroDrop: " +
    "Apple, Steam, Google Play, PlayStation, Spotify и сотни других. " +
    "Выберите бренд, регион и номинал — код приходит автоматически сразу " +
    `после оплаты, без ожидания оператора. ${tail}`
  ).trim();
}

export function groupIntro(args: {
  baseName: string;
  variantsCount: number;
  cheapestKopecks: number;
}): string {
  const { baseName, variantsCount, cheapestKopecks } = args;
  const variants =
    variantsCount > 1
      ? `${variantsCount} вариантов под разные регионы и номиналы`
      : "доступные номиналы";
  return (
    `${baseName} — цифровые подарочные карты и коды пополнения с моментальной ` +
    `выдачей. В каталоге NeuroDrop ${variants}, цены от ` +
    `${formatRub(cheapestKopecks)}. Оплатите картой, через СБП или с баланса — ` +
    `код придёт автоматически сразу после оплаты. Все коды проверены, ` +
    `поддержка отвечает каждый день.`
  );
}

export function categoryIntro(args: {
  categoryName: string;
  count: number;
  cheapestKopecks: number;
}): string {
  const { categoryName, count, cheapestKopecks } = args;
  const region = variantLabel(categoryName);
  const regionPart = region ? ` (регион: ${region})` : "";
  return (
    `${categoryName}${regionPart}: ${count} номиналов в наличии, от ` +
    `${formatRub(cheapestKopecks)}. Купить можно за минуту — после оплаты код ` +
    `активации приходит мгновенно и сохраняется в истории заказов. ` +
    `Перед покупкой проверьте регион в названии товара.`
  );
}

export function productIntro(svc: Service): string {
  const region = variantLabel(svc.category_name);
  const regionPart = region ? ` для региона ${region}` : "";
  const stockPart =
    svc.in_stock > 0
      ? "Товар в наличии — выдача моментальная после оплаты."
      : "Сейчас нет в наличии — загляните позже или выберите другой номинал.";
  return (
    `${svc.service_name}${regionPart} — купить за ${formatRub(svc.rub_price_kopecks)} ` +
    `в NeuroDrop. ${stockPart} Оплата на сайте картой, через СБП или с ` +
    `внутреннего баланса; после оплаты вы получаете код и чек. ` +
    `Активируйте код согласно инструкции платформы для указанного региона.`
  );
}
