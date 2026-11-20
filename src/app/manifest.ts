import type { MetadataRoute } from "next";
import { OG_TOKENS } from "@/lib/ogTokens";

/**
 * Web app manifest (served at /manifest.webmanifest). Together with
 * public/sw.js it makes the showcase installable. PNG icons are generated
 * by scripts/generate-pwa-icons.mjs from the same mark as app/icon.svg.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Showcase: demos de webs para comercios",
    short_name: "Showcase",
    description:
      "Demos de webs para comercios: tienda online, reservas, landing de servicios y panel de gestión.",
    lang: "es",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: OG_TOKENS.paper,
    theme_color: OG_TOKENS.ink,
    categories: ["business", "shopping", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Tienda", url: "/tienda", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      {
        name: "Reservas",
        url: "/reservas",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      { name: "Panel", url: "/admin", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
