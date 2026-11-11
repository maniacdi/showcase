import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Showcase — Desarrollo web a medida",
    short_name: "Showcase",
    description:
      "Demos de webs para comercios: tienda online, reservas, landing de servicios y panel de gestión.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#16181d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
