"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Кнопка в шапке: «Кабинет», если пользователь вошёл, иначе «Войти».
// Узнаёт статус по /api/me и обновляется на событие nd-auth (вход в Mini App).
export function AuthButton() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let alive = true;
    const check = () =>
      fetch("/api/me")
        .then((r) => {
          if (alive) setAuthed(r.ok);
        })
        .catch(() => {
          if (alive) setAuthed(false);
        });
    check();
    window.addEventListener("nd-auth", check);
    return () => {
      alive = false;
      window.removeEventListener("nd-auth", check);
    };
  }, []);

  return (
    <Link className="btn btn-ghost" href="/account">
      {authed ? "Кабинет" : "Войти"}
    </Link>
  );
}
