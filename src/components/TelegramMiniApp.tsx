"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Интеграция с Telegram Mini App: подключается ТОЛЬКО когда сайт открыт
// как Mini App (в URL есть #tgWebApp... или уже есть window.Telegram).
// Делает: tg.ready()+expand(), авто-вход по initData, нативную кнопку
// «назад». На обычном вебе не грузит SDK и ничего не делает.
declare global {
  interface Window {
    Telegram?: { WebApp?: Record<string, any> };
  }
}

let authStarted = false;

export function TelegramMiniApp() {
  const pathname = usePathname();

  useEffect(() => {
    const isMiniApp =
      typeof window !== "undefined" &&
      (window.location.hash.includes("tgWebApp") || !!window.Telegram?.WebApp);
    if (!isMiniApp) return;

    function init() {
      const tg = window.Telegram?.WebApp;
      if (!tg) return;
      try {
        tg.ready();
        tg.expand?.();
      } catch {
        /* no-op */
      }
      try {
        tg.BackButton?.onClick(() => history.back());
      } catch {
        /* no-op */
      }
      if (!authStarted && tg.initData) {
        authStarted = true;
        fetch("/api/auth/webapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ init_data: tg.initData }),
        })
          .then((r) => {
            if (r.ok) window.dispatchEvent(new Event("nd-auth"));
          })
          .catch(() => {});
      }
    }

    if (window.Telegram?.WebApp) {
      init();
      return;
    }
    if (!document.getElementById("tg-webapp-sdk")) {
      const s = document.createElement("script");
      s.id = "tg-webapp-sdk";
      s.src = "https://telegram.org/js/telegram-web-app.js";
      s.onload = init;
      document.head.appendChild(s);
    }
  }, []);

  // Нативная кнопка «назад» Telegram: видна везде, кроме главной.
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;
    try {
      if (pathname && pathname !== "/") tg.BackButton.show();
      else tg.BackButton.hide();
    } catch {
      /* no-op */
    }
  }, [pathname]);

  return null;
}
