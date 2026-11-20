import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor, localeUrl } from "@/lib/seo";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import CartaView from "@/components/restaurante/CartaView";
import MenuDelDiaCard from "@/components/restaurante/MenuDelDiaCard";
import RestauranteShell from "@/components/restaurante/RestauranteShell";
import styles from "@/components/restaurante/restaurante.module.scss";
import { CARTA_SECTIONS, dishes, type Locale, restaurant } from "@/data/restaurante";
import { matchesDiet } from "@/lib/carta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "restaurante" });
  return {
    title: t("cartaMetaTitle"),
    description: t("cartaMetaDesc"),
    // ?mesa=N variants all canonicalise to the plain carta.
    alternates: alternatesFor("/restaurante/carta", locale),
    openGraph: { title: t("cartaMetaTitle"), description: t("cartaMetaDesc") },
  };
}

/** ?mesa=7 → 7 (1-99); anything else → null. */
function parseMesa(raw: string | string[] | undefined): number | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !/^\d{1,2}$/.test(v)) return null;
  const n = Number(v);
  return n >= 1 ? n : null;
}

export default async function CartaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "restaurante" });
  const mesa = parseMesa((await searchParams).mesa);
  const lang = (locale === "en" ? "en" : "es") as Locale;

  const diets = (d: (typeof dishes)[number]) => [
    ...(d.vegan ? ["https://schema.org/VeganDiet"] : []),
    ...(matchesDiet(d, "vegetarian") ? ["https://schema.org/VegetarianDiet"] : []),
    ...(matchesDiet(d, "glutenFree") ? ["https://schema.org/GlutenFreeDiet"] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${t("cartaTitle")}, ${restaurant.name}`,
    url: localeUrl("/restaurante/carta", locale),
    inLanguage: lang,
    hasMenuSection: CARTA_SECTIONS.map((section) => ({
      "@type": "MenuSection",
      name: t(`sections.${section}`),
      hasMenuItem: dishes
        .filter((d) => d.section === section)
        .map((d) => {
          const suitableForDiet = diets(d);
          return {
            "@type": "MenuItem",
            name: d.name[lang],
            description: d.description[lang],
            offers: { "@type": "Offer", price: d.price.toFixed(2), priceCurrency: "EUR" },
            ...(suitableForDiet.length ? { suitableForDiet } : {}),
          };
        }),
    })),
  };

  return (
    <RestauranteShell locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Section className={styles.hero}>
        <Container>
          {mesa !== null ? (
            <div className={styles.mesaBanner} role="status">
              <span className={styles.mesaBannerTitle}>{t("mesaBanner", { n: mesa })}</span>
              <span className={styles.mesaBannerText}>{t("mesaBannerText")}</span>
            </div>
          ) : null}

          <div className={styles.cartaHead}>
            <h1 className={styles.pageTitle}>{t("cartaTitle")}</h1>
            <p className={styles.lead}>{t("cartaIntro")}</p>
            <p className={styles.sampleNote}>{t("sampleData")}</p>
          </div>

          <MenuDelDiaCard />
          <CartaView />
        </Container>
      </Section>
    </RestauranteShell>
  );
}
