"use client";

import { useCallback, useEffect, useState } from "react";
import { TelegramLoginButton } from "./TelegramLoginButton";
import { SITE } from "@/lib/site";
import { formatRub } from "@/lib/format";

type Me = {
  telegram_user_id: number;
  username: string | null;
  first_name: string | null;
  balance_kopecks: number;
  total_spent_kopecks: number;
  invited_count: number;
  earned_via_referrals_kopecks: number;
  referral_percent: number;
};

type Pin = Record<string, unknown> | string;
type Order = {
  id: number;
  ns_service_name: string;
  total_rub_kopecks: number;
  status: string;
  pins: Pin[] | null;
};

function renderPin(p: Pin): string {
  if (typeof p === "string") return p;
  return (p.pin || p.code || p.content || JSON.stringify(p)) as string;
}

function orderStatus(s: string): string {
  const map: Record<string, string> = {
    delivered: "Выполнен",
    paid: "Оплачен, выдаём…",
    delivering: "Выдаём…",
    failed: "Не выполнен (возврат)",
    refunded: "Возврат",
  };
  return map[s] ?? s;
}

export function AccountClient() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);
  const [amount, setAmount] = useState("500");
  const [topupMsg, setTopupMsg] = useState("");
  const [busy, setBusy] = useState(false);
  // Баланс на момент создания счёта — чтобы кнопка «Проверить» поняла,
  // что оплата зачислилась (баланс вырос).
  const [topupBaseline, setTopupBaseline] = useState<number | null>(null);
  const [checkMsg, setCheckMsg] = useState("");

  const loadOrders = useCallback(async () => {
    const r = await fetch("/api/orders?page=0&page_size=20");
    if (r.ok) {
      const d = await r.json();
      setOrders(d.orders ?? []);
    }
  }, []);

  const loadMe = useCallback(async () => {
    const r = await fetch("/api/me");
    if (r.status === 401) {
      setMe(null);
      return;
    }
    if (r.ok) {
      setMe(await r.json());
      loadOrders();
    }
  }, [loadOrders]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  // Авто-вход в Telegram Mini App завершился — обновим профиль без перезагрузки.
  useEffect(() => {
    const h = () => loadMe();
    window.addEventListener("nd-auth", h);
    return () => window.removeEventListener("nd-auth", h);
  }, [loadMe]);

  // Баланс зачисляется фоново после оплаты крипты — мягко поллим.
  useEffect(() => {
    if (!me) return;
    const t = setInterval(loadMe, 15000);
    return () => clearInterval(t);
  }, [me, loadMe]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setOrders([]);
    window.dispatchEvent(new Event("nd-auth")); // обновить кнопку в шапке
  }

  async function topup() {
    setBusy(true);
    setTopupMsg("");
    const rub = Number(amount.replace(",", "."));
    if (!rub || rub <= 0) {
      setTopupMsg("Введите сумму числом.");
      setBusy(false);
      return;
    }
    const r = await fetch("/api/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_rub: rub }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setTopupMsg(d.detail || "Не удалось создать счёт. Попробуйте позже.");
      return;
    }
    setTopupBaseline(me?.balance_kopecks ?? 0);
    setCheckMsg("");
    setTopupMsg(
      "Счёт создан — оплатите в открывшемся окне. После оплаты нажмите " +
        "«Я оплатил — проверить» (или подождите — баланс обновится сам).",
    );
    window.open(d.pay_url, "_blank", "noopener");
  }

  async function checkPayment() {
    setCheckMsg("Проверяю оплату…");
    const r = await fetch("/api/me");
    if (!r.ok) {
      setCheckMsg("Не удалось проверить — попробуйте ещё раз через секунду.");
      return;
    }
    const fresh = await r.json();
    setMe(fresh);
    if (topupBaseline !== null && fresh.balance_kopecks > topupBaseline) {
      setCheckMsg(`✅ Оплата зачислена! Баланс: ${formatRub(fresh.balance_kopecks)}`);
      setTopupBaseline(null);
    } else {
      setCheckMsg(
        "Пока не вижу оплату — обычно зачисляется за 10–30 сек. " +
          "Нажмите ещё раз чуть позже.",
      );
    }
  }

  if (me === undefined) return <div className="notice">Загрузка…</div>;

  if (me === null) {
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const next = params?.get("next") ?? undefined;
    const loginError = params?.get("login_error") === "1";
    return (
      <div
        className="card"
        style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}
      >
        <h2 style={{ marginTop: 0 }}>Вход</h2>
        <p className="muted">
          Войдите через Telegram, чтобы пополнять баланс и покупать. Аккаунт
          общий с нашим ботом — баланс и история едины.
        </p>
        {loginError && (
          <div className="error-box" style={{ textAlign: "left" }}>
            Не удалось войти через Telegram. Попробуйте ещё раз.
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <TelegramLoginButton botUsername={SITE.botUsername} next={next} />
        </div>
        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          <a
            className="btn btn-ghost"
            href={`/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          >
            Войти через Google
          </a>
          <a
            className="btn btn-ghost"
            href={`/api/auth/yandex${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          >
            Войти через Яндекс
          </a>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>
          Вход по e-mail добавим позже.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h2 style={{ margin: 0 }}>Привет, {me.first_name || "друг"}!</h2>
        </div>
        <button className="btn btn-ghost" onClick={logout}>
          Выйти
        </button>
      </div>

      <div className="account-grid">
        <div className="card">
          <div className="card-title">Баланс</div>
          <div className="balance-amount">{formatRub(me.balance_kopecks)}</div>
          <div className="topup">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Сумма пополнения, ₽"
            />
            <button className="btn btn-primary" onClick={topup} disabled={busy}>
              {busy ? "Создаём счёт…" : "Пополнить криптой"}
            </button>
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
            Оплата через CryptoBot (USDT, TON и др.). Баланс зачислится
            автоматически после оплаты.
          </p>
          {topupMsg && (
            <p className="muted" style={{ marginTop: 8 }}>
              {topupMsg}
            </p>
          )}
          {topupBaseline !== null && (
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-ghost" onClick={checkPayment}>
                Я оплатил — проверить
              </button>
              {checkMsg && (
                <p className="muted" style={{ marginTop: 8 }}>
                  {checkMsg}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Рефералы</div>
          <p style={{ margin: "8px 0" }}>
            Приглашено: <b>{me.invited_count}</b>
          </p>
          <p style={{ margin: "8px 0" }}>
            Кэшбэк получено: <b>{formatRub(me.earned_via_referrals_kopecks)}</b>
          </p>
          <p className="muted" style={{ fontSize: 13 }}>
            {me.referral_percent}% с покупок приглашённых — на ваш баланс.
          </p>
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>Мои заказы</h3>
      {orders.length === 0 ? (
        <div className="notice">Заказов пока нет.</div>
      ) : (
        <div className="orders">
          {orders.map((o) => (
            <div key={o.id} className="card order-row">
              <div>
                <div style={{ fontWeight: 600 }}>{o.ns_service_name}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  #{o.id} · {orderStatus(o.status)}
                </div>
                {o.pins && o.pins.length > 0 ? (
                  <div className="pins">
                    {o.pins.map((p, i) => (
                      <code key={i} className="pin">
                        {renderPin(p)}
                      </code>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="card-price" style={{ paddingTop: 0 }}>
                {formatRub(o.total_rub_kopecks)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
