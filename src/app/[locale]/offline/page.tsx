import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container/Container";
import { NOINDEX } from "@/lib/seo";
import RetryButton from "./RetryButton";
import styles from "./offline.module.scss";

/**
 * Offline fallback served by public/sw.js when a page is neither reachable
 * nor cached. Precached in both locales (/offline, /en/offline). Kept free of
 * client data so the cached copy always renders.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offline" });
  return { title: t("metaTitle"), robots: NOINDEX };
}

export default async function OfflinePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "offline" });
  return (
    <main>
      <Container className={styles.wrap}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.text}>{t("text")}</p>
        <div className={styles.actions}>
          <RetryButton label={t("retry")} />
          <Link href="/" className={styles.home}>
            {t("home")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
