// Форматирование рублёвых цен (приходят из API в копейках Integer).

const RU = new Intl.NumberFormat("ru-RU");

/** 4000000 коп → «40 000 ₽» (округление до рубля для витрины). */
export function formatRub(kopecks: number): string {
  return `${RU.format(Math.round(kopecks / 100))} ₽`;
}

/** «от 396 ₽» для группы/категории. */
export function formatFrom(kopecks: number): string {
  return `от ${formatRub(kopecks)}`;
}

/** Разбор «Apple Gift Card | US» → регион «US» (часть после `|`). */
export function variantLabel(categoryName: string | null): string {
  if (!categoryName) return "";
  const idx = categoryName.indexOf("|");
  return idx >= 0 ? categoryName.slice(idx + 1).trim() : categoryName.trim();
}
