"use client";

import { useState } from "react";

type Pin = Record<string, unknown> | string;
type FieldDef = {
  key: string;
  name?: string;
  type?: string;
  required?: boolean;
  enum?: string[] | null;
};

function renderPin(p: Pin): string {
  if (typeof p === "string") return p;
  return (p.pin || p.code || p.content || JSON.stringify(p)) as string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function BuyButton({ serviceId }: { serviceId: number }) {
  const [state, setState] = useState<
    "idle" | "working" | "fields" | "done" | "error"
  >("idle");
  const [msg, setMsg] = useState("");
  const [pins, setPins] = useState<Pin[] | null>(null);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [fieldVals, setFieldVals] = useState<Record<string, string>>({});

  async function pollOrder(orderId: number) {
    setMsg("Оплачено с баланса, получаем код…");
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

  async function submit(values?: Record<string, string>) {
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
      body: JSON.stringify({ ns_service_id: serviceId, field_values: values }),
    });
    const data = await r.json().catch(() => ({}));

    if (data.outcome === "requires_fields") {
      setFields((data.required_fields as FieldDef[]) ?? []);
      setState("fields");
      setMsg(data.field_error ?? "");
      return;
    }
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
    await pollOrder(data.order_id as number);
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

  if (state === "fields") {
    return (
      <div>
        <p style={{ fontWeight: 600, margin: "0 0 10px" }}>
          Для этого товара нужны данные:
        </p>
        {fields.map((f) => (
          <div key={f.key} style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
              {f.name || f.key}
              {f.required !== false ? " *" : ""}
            </label>
            {f.enum && f.enum.length ? (
              <select
                className="field-input"
                value={fieldVals[f.key] ?? ""}
                onChange={(e) =>
                  setFieldVals({ ...fieldVals, [f.key]: e.target.value })
                }
              >
                <option value="">— выберите —</option>
                {f.enum.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="field-input"
                value={fieldVals[f.key] ?? ""}
                onChange={(e) =>
                  setFieldVals({ ...fieldVals, [f.key]: e.target.value })
                }
                placeholder={f.name || f.key}
              />
            )}
          </div>
        ))}
        {msg && <p className="error-box">{msg}</p>}
        <button
          className="btn btn-primary btn-lg"
          onClick={() => submit(fieldVals)}
        >
          Оплатить
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        className="btn btn-primary btn-lg"
        onClick={() => submit()}
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
