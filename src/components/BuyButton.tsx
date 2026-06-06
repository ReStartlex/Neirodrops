"use client";

import { useState } from "react";

type Pin = Record<string, unknown> | string;

function renderPin(p: Pin): string {
  if (typeof p === "string") return p;
  return (p.pin || p.code || p.content || JSON.stringify(p)) as string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function BuyButton({ serviceId }: { serviceId: number }) {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">(
    "idle",
  );
  const [msg, setMsg] = useState("");
  const [pins, setPins] = useState<Pin[] | null>(null);

  async function buy() {
    setState("working");
    setMsg("Проверяем вход…");

    const meR = await fetch("/api/me");
    if (meR.status === 401) {
      window.location.href = `/account?next=/product/${serviceId}`;
      return;
    }

    setMsg("Оформляем заказ…");
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ns_service_id: serviceId }),
    });
    const data = await r.json().catch(() => ({}));

    if (data.outcome === "insufficient_balance") {
      window.location.href = `/account?topup=1&next=/product/${serviceId}`;
      return;
    }
    if (!r.ok || data.outcome !== "ok") {
      setState("error");
      setMsg(
        data.outcome === "out_of_stock"
          ? "Товар только что закончился."
          : "Не удалось оформить заказ. Попробуйте ещё раз.",
      );
      return;
    }

    setMsg("Оплачено с баланса, получаем код…");
    const orderId = data.order_id as number;
    for (let i = 0; i < 40; i++) {
      await sleep(2000);
      const oR = await fetch(`/api/orders/${orderId}`);
      if (!oR.ok) continue;
      const o = await oR.json();
      if (o.status === "delivered") {
        setPins((o.pins as Pin[]) ?? []);
        setState("done");
        setMsg("");
        return;
      }
      if (o.status === "failed") {
        setState("error");
        setMsg("Заказ не выполнен — средства возвращены на баланс.");
        return;
      }
    }
    setState("done");
    setMsg("Заказ оформлен. Код появится в Личном кабинете в течение пары минут.");
  }

  if (state === "done" && pins && pins.length > 0) {
    return (
      <div className="success-box">
        <strong>Готово! Ваши коды:</strong>
        <div className="pins">
          {pins.map((p, i) => (
            <code key={i} className="pin">
              {renderPin(p)}
            </code>
          ))}
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.85 }}>
          Сохраните коды — они также доступны в истории заказов.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <a className="btn btn-ghost" href="/account">
            История заказов
          </a>
          <a className="btn btn-ghost" href="/catalog">
            В каталог
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        className="btn btn-primary btn-lg"
        onClick={buy}
        disabled={state === "working"}
      >
        {state === "working" ? "Обработка…" : "Купить — выдача за секунды"}
      </button>
      {msg && (
        <p
          className={state === "error" ? "error-box" : "muted"}
          style={{ marginTop: 12 }}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
