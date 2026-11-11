import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import WhatsAppButton from "@/components/layout/WhatsAppButton/WhatsAppButton";
import { SITE } from "@/config/site";
import { FONT_CLASSNAMES } from "@/themes/fonts";
import PrefsApplier from "@/themes/PrefsApplier";
import PrefsScript from "@/themes/PrefsScript";
import StyleSwitcher from "@/components/style/StyleSwitcher";
import "@/styles/globals.scss";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#14161a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: "Showcase",
  authors: [{ name: "Javi García Magaldi", url: SITE.portfolioUrl }],
  creator: "Javi García Magaldi",
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  twitter: { card: "summary_large_image" },
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
    // suppressHydrationWarning: PrefsScript sets data-style/data-color-scheme pre-paint.
    <html lang={locale} className={FONT_CLASSNAMES} suppressHydrationWarning>
      <head>
        <PrefsScript />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PrefsApplier />
          {children}
          <StyleSwitcher />
          <WhatsAppButton />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
