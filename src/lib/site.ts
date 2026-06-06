// Центральная конфигурация бренда и реквизитов продавца.
// ВАЖНО: значения с пометкой TODO нужно заполнить перед запуском
// (юридические страницы и подключение оплаты ЮMoney это требуют).

export const SITE = {
  brand: "NeuroDrop",
  tagline: "Цифровые подарочные карты и подписки",
  domain: "neurodrop.ru",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://neurodrop.ru",
  email: "dlyauchebitpgu@gmail.com",
  botUrl: process.env.NEXT_PUBLIC_SHOP_BOT_URL ?? "https://t.me/neirodropi_bot",

  // Реквизиты продавца для оферты/контактов.
  merchant: {
    // Режим налогообложения.
    legalForm: "Самозанятый (налог на профессиональный доход, НПД)",
    // TODO: указать ФИО самозанятого (требуется в оферте и реквизитах).
    fullName: "—",
    inn: "713203347601",
  },

  // Дата последней редакции юридических документов.
  legalUpdatedAt: "2026-06-06",
} as const;

// Палитра тёплых монограмм для плиток брендов (детерминированно по slug).
const MONOGRAM_COLORS = [
  "#1F6F5C", // эвкалипт
  "#B8612A", // терракота
  "#C9A24B", // тёплое золото
  "#7C5C3E", // кофе
  "#356A8A", // приглушённый сине-серый
  "#9A4B3F", // охра-красный
  "#4E7C59", // мох
  "#A8743C", // янтарь
] as const;

export function monogramColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return MONOGRAM_COLORS[h % MONOGRAM_COLORS.length];
}

/** Инициалы бренда для плитки без картинки («Apple Gift Card» → «AG»). */
export function monogramText(name: string): string {
  const words = name.replace(/[|].*$/, "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
