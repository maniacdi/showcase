import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/en/admin", "/tienda/carrito", "/en/tienda/carrito"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
