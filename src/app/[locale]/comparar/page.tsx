import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { alternatesFor } from "@/lib/seo";
import CompareStyles from "@/components/style/CompareStyles";
import HubFooter from "@/components/layout/HubFooter/HubFooter";
import Container from "@/components/ui/Container/Container";
import styles from "../marca/marca.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: alternatesFor("/comparar", locale),
    openGraph: { title: t("metaTitle"), description: t("metaDesc") },
  };
}

export default async function CompararPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "compare" });

  return (
    <>
      <main id="main">
        <Container>
          <header className={styles.head}>
            <Link href="/#estilos" className={styles.back}>
              {t("back")}
            </Link>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.lead}>{t("lead")}</p>
          </header>
          <div className={styles.body}>
            <CompareStyles />
          </div>
        </Container>
      </main>
      <HubFooter />
    </>
  );
}
