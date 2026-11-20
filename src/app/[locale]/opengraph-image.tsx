import { ImageResponse } from "next/og";
import { OG_TOKENS as T } from "@/lib/ogTokens";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Showcase: desarrollo web a medida para comercios";

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
          background: T.ink,
          color: T.paper,
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative", width: "44px", height: "44px", display: "flex" }}>
            <div style={{ position: "absolute", inset: 0, border: `3px solid ${T.paper}` }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: T.accent,
                clipPath: "polygon(8% 92%, 92% 8%, 92% 92%)",
              }}
            />
          </div>
          <span style={{ fontSize: "34px", fontWeight: T.weightBold, letterSpacing: "-0.02em" }}>
            showcase
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "68px", fontWeight: T.weightBold, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: "900px" }}>
            Desarrollo web a medida para comercios
          </span>
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              flexDirection: "column",
              fontSize: "30px",
              color: T.inkSoftOnDark,
            }}
          >
            <span>Tienda online, reservas, landing y panel.</span>
            <span>Rápido y optimizado para SEO.</span>
          </div>
        </div>

        <div style={{ display: "flex", height: "10px" }}>
          <div style={{ flex: 1, background: T.accent }} />
          <div style={{ flex: 1, background: T.accentTienda }} />
          <div style={{ flex: 1, background: T.accentReservas }} />
        </div>
      </div>
    ),
    size,
  );
}
