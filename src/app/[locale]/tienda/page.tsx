import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DemoBar from "@/components/layout/DemoBar/DemoBar";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader/SiteHeader";
import Catalog from "@/components/tienda/Catalog";
import ThemeProvider from "@/themes/ThemeProvider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tienda" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function TiendaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tienda" });
  return (
    <ThemeProvider theme="tienda">
      <SiteHeader
        nav={[{ href: "/tienda", label: t("title") }]}
        cta={{ href: "/tienda/carrito", label: t("cart") }}
      />
      <DemoBar />
      <Catalog />
      <SiteFooter />
    </ThemeProvider>
  );
}
