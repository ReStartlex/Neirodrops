# NeuroDrop — сайт neurodrop.ru

Публичная витрина магазина цифровых подарочных карт и подписок. Next.js
(App Router, SSR + ISR), тёплый премиум-дизайн, SEO из коробки. Данные
берутся из бэкенда FunPay/NS-бота (FastAPI, публичный API `/api/public/*`).

## Стек
- Next.js 15 (App Router), React 19, TypeScript
- Шрифты через `next/font` (Fraunces + Manrope), без внешних запросов в рантайме
- Без UI-библиотек — собственный дизайн на CSS-переменных (`src/app/globals.css`)

## Локальный запуск
```bash
npm install
cp .env.example .env        # указать NEURODROP_API_BASE и т.д.
npm run dev                 # http://localhost:3001
```

Для данных нужен запущенный бэкенд (FastAPI) с публичным API на
`NEURODROP_API_BASE` (по умолчанию `http://127.0.0.1:8080`). Без него
страницы рендерятся, но каталог пустой (есть безопасные заглушки).

## Переменные окружения
См. `.env.example`:
- `NEURODROP_API_BASE` — адрес FastAPI (server-side, обычно localhost).
- `NEXT_PUBLIC_SITE_URL` — канонический адрес (метатеги, sitemap).
- `NEXT_PUBLIC_SHOP_BOT_URL` — ссылка на покупательский бот.
- `PORT` — порт `next start` (3001, чтобы не конфликтовать с farmcore:3000).

## Перед публикацией
- Заполнить ФИО самозанятого в `src/lib/site.ts` (`merchant.fullName`) —
  требуется в оферте/контактах и при подключении приёма платежей.
- Проверить юр-страницы: `/oferta`, `/privacy`, `/terms`, `/contacts`.

## Деплой на VPS (pm2, по образцу farmcore, порт 3001)
```bash
cd /opt/neurodrop
git pull
npm ci
rm -rf .next
npm run build

# подгрузить .env в окружение шелла
set -a
. <(sed 's/\r$//' /opt/neurodrop/.env)
set +a

pm2 delete neurodrop 2>/dev/null || true
pm2 start npm --name neurodrop -- start
pm2 save

sleep 5
pm2 status
sudo ss -tlnp | grep ':3001' || echo "3001 not listening"
git log --oneline -1
```

В реверс-прокси (nginx/Caddy) направить `neurodrop.ru` → `127.0.0.1:3001`,
выдать TLS. Бэкенд FastAPI наружу публиковать НЕ нужно — Next.js ходит к
нему по localhost.
```
