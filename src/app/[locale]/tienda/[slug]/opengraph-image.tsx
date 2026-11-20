import { ImageResponse } from "next/og";
import { CATEGORY_COLORS, productosSeed } from "@/data/productos";
import { routing } from "@/i18n/routing";
import { OG_TOKENS as T } from "@/lib/ogTokens";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Producto de la tienda Showcase";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    productosSeed.map((p) => ({ locale, slug: p.slug })),
  );
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productosSeed.find((x) => x.slug === slug);
  const accent = (p && CATEGORY_COLORS[p.category]) || T.accent;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: T.paper, fontFamily: "sans-serif" }}>
        <div
          style={{
            width: "40%",
            background: accent,
            color: T.accentInk,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "200px",
            fontWeight: T.weightBold,
          }}
        >
          {p ? p.name.charAt(0) : "S"}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px" }}>
          <span style={{ fontSize: "28px", color: T.inkSoft }}>
            {p ? p.category : "Tienda"}
          </span>
          <span style={{ fontSize: "72px", fontWeight: T.weightBold, color: T.ink, letterSpacing: "-0.03em", marginTop: "12px" }}>
            {p ? p.name : "Showcase"}
          </span>
          <span style={{ fontSize: "56px", fontWeight: T.weightBold, color: accent, marginTop: "20px" }}>
            {p ? `${p.price.toString().replace(".", ",")} €` : ""}
          </span>
          <span style={{ fontSize: "26px", color: T.inkSoft, marginTop: "auto" }}>Showcase, tienda demo</span>
        </div>
      </div>
    ),
    size,
  );
}
