"use client";

import { useEffect, useState } from "react";

// Мгновенный фильтр по брендам: карточки отрендерены сервером (SEO ок),
// а этот инпут просто скрывает/показывает их по data-name. Без перезагрузки.
export function CatalogFilter() {
  const [q, setQ] = useState("");

  useEffect(() => {
    const norm = q.trim().toLowerCase();
    const cards = document.querySelectorAll<HTMLElement>(
      "#catalog-grid [data-name]",
    );
    let visible = 0;
    cards.forEach((c) => {
      const match = !norm || (c.dataset.name || "").includes(norm);
      c.style.display = match ? "" : "none";
      if (match) visible += 1;
    });
    const empty = document.getElementById("catalog-empty");
    if (empty) empty.style.display = norm && visible === 0 ? "" : "none";
  }, [q]);

  return (
    <input
      className="field-input"
      style={{ maxWidth: 380, marginBottom: 22 }}
      placeholder="Фильтр по брендам — например, apple"
      value={q}
      onChange={(e) => setQ(e.target.value)}
      aria-label="Фильтр по брендам"
    />
  );
}
