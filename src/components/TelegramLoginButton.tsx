"use client";

import { useEffect, useRef } from "react";

// Вход через Telegram в режиме РЕДИРЕКТА (data-auth-url), а не JS-колбэка:
// колбэк (data-onauth) часто молча не срабатывает во встроенных браузерах
// и в состоянии «уже авторизован». Редирект ведёт на серверный коллбэк
// /api/auth/telegram/callback, который ставит сессию и возвращает в кабинет.
// Требует, чтобы у бота в @BotFather был задан домен (/setdomain).
export function TelegramLoginButton({
  botUsername,
  next,
}: {
  botUsername: string;
  next?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";
    const authUrl =
      "/api/auth/telegram/callback" +
      (next ? `?next=${encodeURIComponent(next)}` : "");
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.setAttribute("data-telegram-login", botUsername);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "12");
    s.setAttribute("data-request-access", "write");
    s.setAttribute("data-auth-url", authUrl);
    container.appendChild(s);
    return () => {
      container.innerHTML = "";
    };
  }, [botUsername, next]);

  return <div ref={ref} aria-label="Вход через Telegram" />;
}
