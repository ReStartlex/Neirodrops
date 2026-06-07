"use client";

import { useCallback, useEffect, useState } from "react";

type Msg = { sender: string; text: string; created_at: string };
type Ticket = {
  id: number;
  subject: string;
  status: string;
  order_id: number | null;
  messages?: Msg[];
};

export function TicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mode, setMode] = useState<"list" | "new" | "thread">("list");
  const [active, setActive] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/tickets");
    if (r.ok) setTickets((await r.json()).tickets ?? []);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // Открытие формы из кнопки «Сообщить о проблеме» у заказа.
  useEffect(() => {
    const h = (e: Event) => {
      const det = (e as CustomEvent).detail || {};
      setOrderId(det.orderId ?? null);
      setSubject(det.subject || "Проблема с заказом");
      setMessage("");
      setMode("new");
    };
    window.addEventListener("nd-new-ticket", h);
    return () => window.removeEventListener("nd-new-ticket", h);
  }, []);

  async function openTicket(id: number) {
    const r = await fetch(`/api/tickets/${id}`);
    if (r.ok) {
      setActive(await r.json());
      setMode("thread");
    }
  }

  async function create() {
    if (!message.trim()) return;
    setBusy(true);
    const r = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: subject || "Обращение в поддержку",
        message,
        order_id: orderId,
      }),
    });
    setBusy(false);
    if (r.ok) {
      const t = await r.json();
      setSubject("");
      setMessage("");
      setOrderId(null);
      await load();
      setActive(t);
      setMode("thread");
    }
  }

  async function sendReply() {
    if (!active || !reply.trim()) return;
    setBusy(true);
    const r = await fetch(`/api/tickets/${active.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: reply }),
    });
    setBusy(false);
    if (r.ok) {
      setActive(await r.json());
      setReply("");
      load();
    }
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="section-head" style={{ marginBottom: 12 }}>
        <div className="card-title" style={{ margin: 0 }}>
          Поддержка
        </div>
        {mode !== "list" ? (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setMode("list");
              setActive(null);
              load();
            }}
          >
            ← К списку
          </button>
        ) : (
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSubject("");
              setMessage("");
              setOrderId(null);
              setMode("new");
            }}
          >
            Новое обращение
          </button>
        )}
      </div>

      {mode === "new" && (
        <div>
          {orderId && (
            <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
              По заказу #{orderId}
            </p>
          )}
          <input
            className="field-input"
            placeholder="Тема"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <textarea
            className="field-input"
            placeholder="Опишите проблему — оператор ответит здесь же"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            style={{ marginBottom: 8, resize: "vertical" }}
          />
          <button className="btn btn-primary" onClick={create} disabled={busy}>
            {busy ? "Отправляем…" : "Отправить"}
          </button>
        </div>
      )}

      {mode === "list" &&
        (tickets.length === 0 ? (
          <p className="muted">
            Обращений пока нет. Если возникнет проблема — нажми «Новое
            обращение» или кнопку у заказа.
          </p>
        ) : (
          <div className="orders">
            {tickets.map((t) => (
              <button
                key={t.id}
                className="card order-row"
                style={{ cursor: "pointer" }}
                onClick={() => openTicket(t.id)}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t.subject}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    #{t.id} · {t.status === "open" ? "открыто" : "закрыто"}
                    {t.order_id ? ` · заказ #${t.order_id}` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}

      {mode === "thread" && active && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{active.subject}</div>
          <div className="ticket-thread">
            {(active.messages ?? []).map((m, i) => (
              <div
                key={i}
                className={`ticket-msg ${m.sender === "operator" ? "op" : "me"}`}
              >
                <div className="ticket-msg-who">
                  {m.sender === "operator" ? "Поддержка" : "Вы"}
                </div>
                <div>{m.text}</div>
              </div>
            ))}
          </div>
          <textarea
            className="field-input"
            placeholder="Ваш ответ"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            style={{ margin: "10px 0 8px", resize: "vertical" }}
          />
          <button className="btn btn-primary" onClick={sendReply} disabled={busy}>
            Отправить
          </button>
        </div>
      )}
    </div>
  );
}
