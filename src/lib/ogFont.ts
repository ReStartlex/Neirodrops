// Загрузка TTF с кириллицей для OG-картинок (встроенный шрифт satori
// кириллицу не содержит). Берём готовый .ttf из @expo-google-fonts
// (CDN jsDelivr, стабильно). Кэшируем в памяти процесса; при любой
// ошибке возвращаем null — вызывающий рендерит латинский фолбэк.
let cache: ArrayBuffer | null | undefined;

const FONT_URL =
  "https://cdn.jsdelivr.net/npm/@expo-google-fonts/manrope/Manrope_700Bold.ttf";

export async function loadOgFont(): Promise<ArrayBuffer | null> {
  if (cache !== undefined) return cache;
  try {
    const res = await fetch(FONT_URL, { cache: "force-cache" });
    if (!res.ok) {
      cache = null;
      return null;
    }
    cache = await res.arrayBuffer();
    return cache;
  } catch {
    cache = null;
    return null;
  }
}
