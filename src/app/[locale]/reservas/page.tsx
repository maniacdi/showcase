import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import DemoBar from "@/components/layout/DemoBar/DemoBar";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader/SiteHeader";
import ThemeProvider from "@/themes/ThemeProvider";
import BookingFlow from "./BookingFlow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservas" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: alternatesFor("/reservas", locale),
    openGraph: { title: t("metaTitle"), description: t("metaDesc") },
  };
}

export default async function ReservasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "reservas" });

  return (
    <ThemeProvider theme="reservas">
      <SiteHeader nav={[{ href: "/reservas", label: t("title") }]} cta={{ href: "/reservas", label: t("submit") }} />
      <DemoBar />
      <BookingFlow />
      <SiteFooter />
    </ThemeProvider>
  );
}
