import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import ReservaMesaForm from "@/components/restaurante/ReservaMesaForm";
import RestauranteShell from "@/components/restaurante/RestauranteShell";
import styles from "@/components/restaurante/restaurante.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "restaurante" });
  return {
    title: t("reservarMetaTitle"),
    description: t("reservarMetaDesc"),
    alternates: alternatesFor("/restaurante/reservar", locale),
    openGraph: { title: t("reservarMetaTitle"), description: t("reservarMetaDesc") },
  };
}

export default async function ReservarMesaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <RestauranteShell locale={locale}>
      <Section className={styles.hero}>
        <Container>
          <ReservaMesaForm />
        </Container>
      </Section>
    </RestauranteShell>
  );
}
