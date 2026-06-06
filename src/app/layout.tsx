import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieNotice } from "@/components/CookieNotice";
import { TelegramMiniApp } from "@/components/TelegramMiniApp";
import { SITE } from "@/lib/site";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.brand} — подарочные карты и подписки с мгновенной выдачей`,
    template: `%s — ${SITE.brand}`,
  },
  description:
    "Apple, Steam, Google Play, Spotify, PlayStation и сотни других цифровых " +
    "подарочных карт и подписок. Мгновенная выдача кодов, честные цены, поддержка.",
  applicationName: SITE.brand,
  keywords: [
    "подарочные карты",
    "цифровые коды",
    "Apple Gift Card",
    "Steam",
    "Google Play",
    "Spotify",
    "PlayStation",
    "пополнение",
    "купить ключ",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE.url,
    siteName: SITE.brand,
    title: `${SITE.brand} — подарочные карты и подписки`,
    description:
      "Мгновенная выдача цифровых подарочных карт и подписок. Честные цены.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE.brand,
        url: SITE.url,
        email: SITE.email,
      },
      {
        "@type": "WebSite",
        name: SITE.brand,
        url: SITE.url,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE.url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieNotice />
        <TelegramMiniApp />
      </body>
    </html>
  );
}
