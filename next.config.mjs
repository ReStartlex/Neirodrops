/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Витрина зависит от внешнего API (FastAPI на 127.0.0.1:8080), поэтому
  // сборку не валим из-за временной недоступности данных — страницы
  // рендерятся динамически с ISR (revalidate в lib/api.ts).
  experimental: {},
};

export default nextConfig;
