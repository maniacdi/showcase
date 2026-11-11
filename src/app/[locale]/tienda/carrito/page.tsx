import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoBar from "@/components/layout/DemoBar/DemoBar";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader/SiteHeader";
import CartView from "@/components/tienda/CartView";
import ThemeProvider from "@/themes/ThemeProvider";

export const metadata: Metadata = { title: "Carrito", robots: NOINDEX };

export default async function CarritoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tienda" });
  return (
    <ThemeProvider theme="tienda">
      <SiteHeader nav={[{ href: "/tienda", label: t("title") }]} cta={{ href: "/tienda/carrito", label: t("cart") }} />
      <DemoBar />
      <CartView />
      <SiteFooter />
    </ThemeProvider>
  );
}
