import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import ThemeProvider from "@/themes/ThemeProvider";
import DemoBar from "@/components/layout/DemoBar/DemoBar";
import SiteHeader from "@/components/layout/SiteHeader/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import SectionHead from "@/components/ui/SectionHead/SectionHead";
import ContactForm from "@/components/servicios/ContactForm";
import BudgetButton from "@/components/servicios/BudgetButton";
import BudgetModal from "@/components/servicios/BudgetModal";
import LiveVitals from "@/components/servicios/LiveVitals";
import ReviewsSummary from "@/components/servicios/ReviewsSummary";
import Photo from "@/components/tienda/Photo";
import PhotoCredits from "@/components/tienda/PhotoCredits";
import { aboutPhoto, business, plans, services, ventajas } from "@/data/servicios";
import styles from "./page.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicios" });
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: alternatesFor("/servicios", locale),
    openGraph: { title: t("metaTitle"), description: t("metaDesc") },
  };
}

export default async function ServiciosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "servicios" });
  const tv = await getTranslations({ locale, namespace: "vitals" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    telephone: business.phone,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.street,
      addressLocality: business.city,
    },
  };

  // OpenStreetMap embed around the (demo) location; ~1 km wide.
  const { lat, lon } = business;
  const bbox = [lon - 0.006, lat - 0.0033, lon + 0.006, lat + 0.0033]
    .map((n) => n.toFixed(4))
    .join(",");
  const mapEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lon}`;
  const mapPage = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  const directionsUrl = `https://www.openstreetmap.org/directions?to=${lat}%2C${lon}`;

  return (
    <ThemeProvider theme="servicios">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader
        nav={[
          { href: "/servicios#servicios", label: t("servicesTitle") },
          { href: "/servicios#por-que", label: t("whyTitle") },
          { href: "/servicios#precios", label: t("navPricing") },
        ]}
        cta={{ href: "/servicios#contacto", label: t("contactTitle") }}
      />
      <DemoBar />

      <main>
        <Section className={styles.hero}>
          <Container className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
              <p className={styles.heroText}>{t("heroText")}</p>
              <div className={styles.heroCta}>
                <BudgetButton>{t("heroCta")}</BudgetButton>
                <span className={styles.perfBadge}>{t("perfBadge")}</span>
              </div>
            </div>
            <div className={styles.heroAside}>
              <div className={styles.heroAccent} aria-hidden="true" />
              <dl className={styles.heroStats}>
                <div>
                  <dt>{t("statProjects")}</dt>
                  <dd>+50</dd>
                </div>
                <div>
                  <dt>{t("statSince")}</dt>
                  <dd>2019</dd>
                </div>
                <div>
                  <dt>{t("statReviews")}</dt>
                  <dd>4,9/5</dd>
                </div>
              </dl>
              <p className={styles.sampleNote}>{t("sampleData")}</p>
            </div>
          </Container>
        </Section>

        <Section id="servicios" alt>
          <Container>
            <SectionHead title={t("servicesTitle")} />
            <div className={styles.services}>
              {services.map((s, i) => (
                <div key={s.title} className={styles.service}>
                  <span className={styles.serviceNum}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <p className={styles.serviceText}>{s.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="por-que">
          <Container>
            <SectionHead title={t("whyTitle")} />
            <div className={styles.ventajas}>
              {ventajas.map((v) => (
                <div key={v.num} className={styles.ventaja}>
                  <span className={styles.ventajaNum}>{v.num}</span>
                  <h3 className={styles.ventajaTitle}>{v.title}</h3>
                  <p className={styles.ventajaText}>{v.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="precios" alt>
          <Container>
            <SectionHead title={t("pricingTitle")} />
            <p className={styles.pricingLead}>{t("pricingLead")}</p>
            <div className={styles.plans}>
              {plans.map((p) => (
                <div key={p.name} className={`${styles.plan} ${p.popular ? styles.popular : ""}`}>
                  {p.popular && <span className={styles.popularTag}>{t("popular")}</span>}
                  <h3 className={styles.planName}>{p.name}</h3>
                  <p className={styles.planPrice}>
                    <span className={styles.planFrom}>{t("priceFrom")}</span>
                    {p.price}
                  </p>
                  <ul className={styles.planFeatures}>
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <BudgetButton
                    plan={p.name}
                    variant={p.popular ? "solid" : "outline"}
                    className={styles.planCta}
                  >
                    {t("choose")}
                  </BudgetButton>
                </div>
              ))}
            </div>
            <p className={styles.pricingNote} role="note">
              {t("pricingNote")}
            </p>
          </Container>
        </Section>

        <Section id="sobre">
          <Container>
            <div className={styles.aboutGrid}>
              <Photo
                photo={aboutPhoto}
                sizes="(min-width: 1024px) 560px, 100vw"
                className={styles.aboutPhoto}
              />
              <div className={styles.aboutBody}>
                <SectionHead title={t("aboutTitle")} />
                <p className={styles.sampleNote}>{t("aboutSample")}</p>
                <p className={styles.about}>{t("aboutText")}</p>
                <p className={styles.about}>{t("aboutText2")}</p>
                <p className={styles.about}>{t("aboutText3")}</p>
                <PhotoCredits
                  label={t("photos")}
                  photos={[aboutPhoto]}
                  className={styles.aboutCredit}
                />
              </div>
            </div>
          </Container>
        </Section>

        <Section id="opiniones" alt>
          <Container>
            <SectionHead title={t("testimonialsTitle")} />
            <ReviewsSummary sampleLabel={t("sampleData")} />
          </Container>
        </Section>

        <Section id="rendimiento">
          <Container>
            <SectionHead title={tv("title")} />
            <p className={styles.vitalsLead}>{tv("lead")}</p>
            <LiveVitals />
          </Container>
        </Section>

        <Section id="contacto">
          <Container>
            <SectionHead title={t("contactTitle")} />
            <div className={styles.contactGrid}>
              <ContactForm />
              <aside className={styles.location}>
                <iframe
                  className={styles.map}
                  src={mapEmbed}
                  title={t("mapTitle")}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  className={styles.mapLink}
                  href={mapPage}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("mapLink")}
                </a>
                <h3 className={styles.locationTitle}>{t("locationTitle")}</h3>
                <address className={styles.address}>
                  <span>{business.street}</span>
                  <span>{business.postal}</span>
                  <a
                    href={`tel:${business.phone.replace(/\s/g, "")}`}
                    className={styles.addressMeta}
                  >
                    {business.phone}
                  </a>
                  <a href={`mailto:${business.email}`} className={styles.addressMeta}>
                    {business.email}
                  </a>
                </address>
                <a
                  className={styles.directions}
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("directions")}
                </a>
              </aside>
            </div>
          </Container>
        </Section>
      </main>

      <SiteFooter />
      <BudgetModal />
    </ThemeProvider>
  );
}
