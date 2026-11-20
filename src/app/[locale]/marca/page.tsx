import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import BrandStudio from "@/components/brand/BrandStudio";
import DemoBar from "@/components/layout/DemoBar/DemoBar";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader/SiteHeader";
import Container from "@/components/ui/Container/Container";
import styles from "./marca.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: alternatesFor("/marca", locale),
    openGraph: { title: t("metaTitle"), description: t("metaDesc") },
  };
}

export default async function MarcaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "brand" });
  const tc = await getTranslations({ locale, namespace: "compare" });

  return (
    <>
      <SiteHeader
        nav={[
          { href: "/servicios", label: t("previewNavServices") },
          { href: "/comparar", label: tc("link") },
        ]}
        cta={{ href: "/servicios#contacto", label: t("previewNavContact") }}
      />
      <DemoBar />
      <main id="main">
        <Container>
          <header className={styles.head}>
            <p className={styles.kicker}>{t("kicker")}</p>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.lead}>{t("lead")}</p>
          </header>
          <BrandStudio />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
