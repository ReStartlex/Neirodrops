"use client";

import { useEffect, useRef } from "react";

// Виджет входа Telegram. Требует, чтобы у бота в @BotFather был задан
// домен (/setdomain → neurodrop.ru), иначе кнопка не отрендерится.
type TgUser = Record<string, unknown>;

declare global {
  interface Window {
    onNDTelegramAuth?: (user: TgUser) => void;
  }
}

export function TelegramLoginButton({
  botUsername,
  onAuth,
}: {
  botUsername: string;
  onAuth: (user: TgUser) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.onNDTelegramAuth = (user) => onAuth(user);
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.setAttribute("data-telegram-login", botUsername);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "12");
    s.setAttribute("data-request-access", "write");
    s.setAttribute("data-onauth", "onNDTelegramAuth(user)");
    container.appendChild(s);
    return () => {
      container.innerHTML = "";
    };
  }, [botUsername, onAuth]);

  return <div ref={ref} aria-label="Вход через Telegram" />;
}
