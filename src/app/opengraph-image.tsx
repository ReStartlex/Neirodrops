import { ImageResponse } from "next/og";

// Динамическая OG-картинка (превью при репосте в соцсети/мессенджеры).
// Текст латиницей: встроенный шрифт satori не содержит кириллицы —
// бренд латинский, так превью корректно рендерится без подгрузки шрифтов.
export const runtime = "nodejs";
export const alt = "NeuroDrop — digital gift cards & subscriptions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          background: "#faf6ef",
          color: "#2a2521",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#b8612a",
            }}
          />
          <div style={{ fontSize: "42px", fontWeight: 700 }}>NeuroDrop</div>
        </div>
        <div
          style={{
            fontSize: "70px",
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: "44px",
            maxWidth: "960px",
          }}
        >
          Digital gift cards & subscriptions
        </div>
        <div style={{ fontSize: "34px", color: "#6f655b", marginTop: "30px" }}>
          Instant delivery · honest prices · neurodrop.ru
        </div>
      </div>
    ),
    { ...size },
  );
}
