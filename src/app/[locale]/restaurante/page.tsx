import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { alternatesFor, localeUrl } from "@/lib/seo";
import { SITE } from "@/config/site";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import SectionHead from "@/components/ui/SectionHead/SectionHead";
import btn from "@/components/ui/Button/Button.module.scss";
import Photo from "@/components/tienda/Photo";
import RestauranteShell from "@/components/restaurante/RestauranteShell";
import styles from "@/components/restaurante/restaurante.module.scss";
import {
  galleryPhotos,
  heroPhoto,
  type Locale,
  OPENING,
  OPENING_SCHEMA,
  restaurant,
} from "@/data/restaurante";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "restaurante" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: alternatesFor("/restaurante", locale),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDesc"),
      images: [{ url: `${SITE.url}${heroPhoto.src}`, width: heroPhoto.width, height: heroPhoto.height }],
    },
  };
}

export default async function RestaurantePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "restaurante" });
  const lang = (locale === "en" ? "en" : "es") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: t("heroText"),
    url: localeUrl("/restaurante", locale),
    image: `${SITE.url}${heroPhoto.src}`,
    telephone: restaurant.phone,
    email: restaurant.email,
    priceRange: restaurant.priceRange,
    servesCuisine: restaurant.cuisine[lang],
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.street,
      postalCode: restaurant.postal,
      addressLocality: restaurant.city,
      addressRegion: restaurant.region,
      addressCountry: restaurant.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: restaurant.lat, longitude: restaurant.lon },
    openingHours: OPENING_SCHEMA,
    hasMenu: localeUrl("/restaurante/carta", locale),
    acceptsReservations: localeUrl("/restaurante/reservar", locale),
  };

  // OpenStreetMap embed (same pattern as /servicios), ~1 km wide.
  const { lat, lon } = restaurant;
  const bbox = [lon - 0.006, lat - 0.0033, lon + 0.006, lat + 0.0033].map((n) => n.toFixed(4)).join(",");
  const mapEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lon}`;
  const mapPage = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  const directionsUrl = `https://www.openstreetmap.org/directions?to=${lat}%2C${lon}`;

  const tueSat = OPENING[2];
  const sun = OPENING[0];
  const range = (r?: [string, string]) => (r ? `${r[0]}–${r[1]}` : "");

  const features = [
    { title: t("feature1"), text: t("feature1d") },
    { title: t("feature2"), text: t("feature2d") },
    { title: t("feature3"), text: t("feature3d") },
  ];

  return (
    <RestauranteShell locale={locale} photos={[heroPhoto, ...galleryPhotos]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Section className={styles.hero}>
        <Container className={styles.heroGrid}>
          <div className={styles.heroBody}>
            <p className={styles.heroPlace}>{t("heroPlace")}</p>
            <h1 className={styles.heroTitle}>{restaurant.name}</h1>
            <p className={styles.lead}>{t("heroText")}</p>
            <div className={`${styles.actions} ${styles.heroActions}`}>
              <Link
                href="/restaurante/reservar"
                className={`${btn.btn} ${btn.solid}`}
                data-variant="solid"
              >
                {t("ctaReserve")}
              </Link>
              <Link
                href="/restaurante/carta"
                className={`${btn.btn} ${btn.outline}`}
                data-variant="outline"
              >
                {t("ctaCarta")}
              </Link>
            </div>
            <p className={styles.sampleNote}>{t("sampleNote")}</p>
          </div>
          <Photo photo={heroPhoto} priority sizes="(min-width: 1024px) 560px, 100vw" className={styles.heroPhoto} />
        </Container>
      </Section>

      <Section alt>
        <Container>
          <SectionHead title={t("featuresTitle")} />
          <div className={styles.features}>
            {features.map((f, i) => (
              <div key={f.title} className={styles.feature}>
                <span className={styles.featureNum}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHead title={t("galleryTitle")} />
          <div className={styles.gallery}>
            {galleryPhotos.map((p) => (
              <Photo key={p.src} photo={p} sizes="(min-width: 768px) 360px, 100vw" className={styles.galleryPhoto} />
            ))}
          </div>
        </Container>
      </Section>

      <Section id="contacto" alt>
        <Container>
          <SectionHead title={t("contactTitle")} />
          <div className={styles.visitGrid}>
            <div className={styles.visitInfo}>
              <div>
                <h3 className={styles.blockTitle}>{t("hoursTitle")}</h3>
                <dl className={styles.hours}>
                  <div className={styles.hoursRow}>
                    <dt>{t("daysTueSat")}</dt>
                    <dd>
                      <span>
                        {t("lunch")} <span className={styles.mono}>{range(tueSat.lunch)}</span>
                      </span>
                      <span>
                        {t("dinner")} <span className={styles.mono}>{range(tueSat.dinner)}</span>
                      </span>
                    </dd>
                  </div>
                  <div className={styles.hoursRow}>
                    <dt>{t("daysSun")}</dt>
                    <dd>
                      <span>
                        {t("lunch")} <span className={styles.mono}>{range(sun.lunch)}</span>
                      </span>
                    </dd>
                  </div>
                  <div className={styles.hoursRow}>
                    <dt>{t("daysMon")}</dt>
                    <dd>{t("closed")}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className={styles.blockTitle}>{restaurant.name}</h3>
                <address className={styles.address}>
                  <span>{restaurant.street}</span>
                  <span>
                    {restaurant.postal} {restaurant.city}
                  </span>
                  <a className={`${styles.textLink} ${styles.mono}`} href={`tel:${restaurant.phone.replace(/\s/g, "")}`}>
                    {restaurant.phone}
                  </a>
                  <a className={`${styles.textLink} ${styles.mono}`} href={`mailto:${restaurant.email}`}>
                    {restaurant.email}
                  </a>
                </address>
              </div>
              <div className={styles.actions}>
                <Link href="/restaurante/reservar" className={`${btn.btn} ${btn.solid}`} data-variant="solid">
                  {t("ctaReserve")}
                </Link>
                <a className={styles.textLink} href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  {t("directions")}
                </a>
              </div>
              <p className={styles.sampleNote}>{t("sampleData")}</p>
            </div>
            <div>
              <iframe
                className={styles.map}
                src={mapEmbed}
                title={t("mapTitle")}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a className={styles.textLink} href={mapPage} target="_blank" rel="noopener noreferrer">
                {t("mapLink")}
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </RestauranteShell>
  );
}
