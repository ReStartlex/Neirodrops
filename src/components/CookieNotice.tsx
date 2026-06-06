"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "nd_cookie_ok";

export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // localStorage недоступен (приватный режим) — баннер не показываем.
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* no-op */
    }
    setShow(false);
  };

  return (
    <div className="cookie-bar" role="dialog" aria-label="Уведомление о cookie">
      <span>
        Мы используем cookie для работы сайта и авторизации. Продолжая
        пользоваться сайтом, вы соглашаетесь с{" "}
        <Link href="/privacy">политикой конфиденциальности</Link>.
      </span>
      <button className="btn btn-primary" onClick={accept}>
        Принять
      </button>
    </div>
  );
}
