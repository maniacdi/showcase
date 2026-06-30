import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import WhatsAppButton from "@/components/layout/WhatsAppButton/WhatsAppButton";
import { SITE } from "@/config/site";
import { FONT_CLASSNAMES } from "@/themes/fonts";
import PrefsApplier from "@/themes/PrefsApplier";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Showcase — Desarrollo web a medida para comercios",
    template: "%s · Showcase",
  },
  description:
    "Diseño y desarrollo web a medida para comercios y negocios locales: tiendas online, webs para clínicas y restaurantes, reservas de citas y paneles de gestión. Rápido, accesible y optimizado para SEO con Next.js.",
  keywords: [
    "desarrollo web a medida",
    "diseño web para comercios",
    "tienda online",
    "web para clínica dental",
    "web para restaurante",
    "reservas de citas online",
    "SEO local",
    "Next.js",
    "página web negocio local",
  ],
  openGraph: {
    type: "website",
    siteName: "Showcase",
    title: "Showcase — Desarrollo web a medida para comercios",
    description:
      "Demos de webs para comercios: tienda online, reservas de citas, landing de servicios y panel de administración. Rápidas y optimizadas para SEO.",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={FONT_CLASSNAMES}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PrefsApplier />
          {children}
          <WhatsAppButton />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
