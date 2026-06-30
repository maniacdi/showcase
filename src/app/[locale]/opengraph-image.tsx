import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Showcase — Desarrollo web a medida para comercios";

// Branded social card for any page under [locale] (unless a deeper segment overrides).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#16181d",
          color: "#fafaf9",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative", width: "44px", height: "44px", display: "flex" }}>
            <div style={{ position: "absolute", inset: 0, border: "3px solid #fafaf9" }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "#1f4fff",
                clipPath: "polygon(8% 92%, 92% 8%, 92% 92%)",
              }}
            />
          </div>
          <span style={{ fontSize: "34px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            showcase
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "68px", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "900px" }}>
            Desarrollo web a medida para comercios
          </span>
          <span style={{ marginTop: "24px", fontSize: "30px", color: "#a4a8b0" }}>
            Tienda online · Reservas · Landing · Panel — rápido y optimizado para SEO
          </span>
        </div>

        <div style={{ display: "flex", height: "10px" }}>
          <div style={{ flex: 1, background: "#1f4fff" }} />
          <div style={{ flex: 1, background: "#0e7c5a" }} />
          <div style={{ flex: 1, background: "#c2410c" }} />
        </div>
      </div>
    ),
    size,
  );
}
