import type { MetadataRoute } from "next";
import { productosSeed } from "@/data/productos";
import { SITE } from "@/config/site";

const BASE = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/servicios",
    "/reservas",
    "/tienda",
    ...productosSeed.map((p) => `/tienda/${p.slug}`),
  ];
  const entries: MetadataRoute.Sitemap = [];
  for (const p of paths) {
    entries.push({ url: `${BASE}${p || "/"}`, changeFrequency: "monthly", priority: 0.7 });
    entries.push({ url: `${BASE}/en${p}`, changeFrequency: "monthly", priority: 0.5 });
  }
  return entries;
}
