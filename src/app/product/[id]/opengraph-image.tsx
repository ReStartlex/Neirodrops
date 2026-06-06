import { ImageResponse } from "next/og";
import { api } from "@/lib/api";
import { loadOgFont } from "@/lib/ogFont";
import { formatRub, variantLabel } from "@/lib/format";

export const runtime = "nodejs";
export const alt = "NeuroDrop — товар";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const font = await loadOgFont();

  // Без кириллического шрифта рисуем безопасный латинский баннер
  // (иначе кириллица превратится в «квадраты»).
  if (!font) {
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
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#b8612a",
              }}
            />
            <div style={{ fontSize: "40px", fontWeight: 700 }}>NeuroDrop</div>
          </div>
          <div style={{ fontSize: "64px", fontWeight: 800, marginTop: "40px" }}>
            Digital gift cards & subscriptions
          </div>
          <div style={{ fontSize: "32px", color: "#6f655b", marginTop: "24px" }}>
            Instant delivery · neurodrop.ru
          </div>
        </div>
      ),
      { ...size },
    );
  }

  let name = "";
  let region = "";
  let price = "";
  try {
    const svc = await api.service(Number(id));
    name = svc.service_name;
    region = variantLabel(svc.category_name);
    price = formatRub(svc.rub_price_kopecks);
  } catch {
    // товар не найден — общий брендовый баннер с кириллицей
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#faf6ef",
          color: "#2a2521",
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "#b8612a",
            }}
          />
          <div style={{ fontSize: "38px", fontWeight: 700 }}>NeuroDrop</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "60px",
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: "1040px",
            }}
          >
            {name || "Цифровые подарочные карты и подписки"}
          </div>
          {region ? (
            <div style={{ fontSize: "30px", color: "#6f655b", marginTop: "16px" }}>
              Регион: {region}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: "52px", fontWeight: 700, color: "#1f6f5c" }}>
            {price}
          </div>
          <div style={{ fontSize: "26px", color: "#6f655b" }}>
            мгновенная выдача · neurodrop.ru
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: font, weight: 700, style: "normal" },
      ],
    },
  );
}
