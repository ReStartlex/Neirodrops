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

  // Баланс зачисляется фоново после оплаты крипты — мягко поллим.
  useEffect(() => {
    if (!me) return;
    const t = setInterval(loadMe, 15000);
    return () => clearInterval(t);
  }, [me, loadMe]);

  const onAuth = useCallback(
    async (user: Record<string, unknown>) => {
      const r = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (r.ok) {
        await loadMe();
        const next = new URLSearchParams(window.location.search).get("next");
        if (next) window.location.href = next;
      } else {
        alert("Не удалось войти. Попробуйте ещё раз.");
      }
    },
    [loadMe],
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setOrders([]);
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
    setTopupMsg(
      "Счёт создан — оплатите в открывшемся окне. Баланс обновится автоматически.",
    );
    window.open(d.pay_url, "_blank", "noopener");
  }

  if (me === undefined) return <div className="notice">Загрузка…</div>;

  if (me === null) {
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
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <TelegramLoginButton botUsername={SITE.botUsername} onAuth={onAuth} />
        </div>
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
