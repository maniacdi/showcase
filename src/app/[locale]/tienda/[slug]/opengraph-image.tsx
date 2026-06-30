import { ImageResponse } from "next/og";
import { CATEGORY_COLORS, productosSeed } from "@/data/productos";
import { routing } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Producto — Showcase";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    productosSeed.map((p) => ({ locale, slug: p.slug })),
  );
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productosSeed.find((x) => x.slug === slug);
  const accent = (p && CATEGORY_COLORS[p.category]) || "#1f4fff";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fafaf9", fontFamily: "sans-serif" }}>
        <div
          style={{
            width: "40%",
            background: accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "200px",
            fontWeight: 800,
          }}
        >
          {p ? p.name.charAt(0) : "S"}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px" }}>
          <span style={{ fontSize: "26px", color: "#5b5f66", textTransform: "uppercase", letterSpacing: "4px" }}>
            {p ? p.category : "Tienda"}
          </span>
          <span style={{ fontSize: "72px", fontWeight: 800, color: "#16181d", letterSpacing: "-0.03em", marginTop: "12px" }}>
            {p ? p.name : "Showcase"}
          </span>
          <span style={{ fontSize: "56px", fontWeight: 700, color: accent, marginTop: "20px" }}>
            {p ? `${p.price.toString().replace(".", ",")} €` : ""}
          </span>
          <span style={{ fontSize: "26px", color: "#5b5f66", marginTop: "auto" }}>showcase · tienda</span>
        </div>
      </div>
    ),
    size,
  );
}
