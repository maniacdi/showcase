import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
import { business, plans, services, testimonios, ventajas } from "@/data/servicios";
import styles from "./page.module.scss";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "servicios" });
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default async function ServiciosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "servicios" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    telephone: business.phone,
    email: business.email,
    address: { "@type": "PostalAddress", addressLocality: business.city },
  };

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
          { href: "/servicios#precios", label: t("pricingTitle") },
        ]}
        cta={{ href: "/servicios#contacto", label: t("contactTitle") }}
      />
      <DemoBar />

      <main>
        <Section className={styles.hero}>
          <Container className={styles.heroGrid}>
            <div className={styles.heroMain}>
              <span className={styles.heroKicker}>{business.name} · {business.city}</span>
              <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
              <p className={styles.heroText}>{t("heroText")}</p>
              <div className={styles.heroCta}>
                <BudgetButton>{t("heroCta")}</BudgetButton>
                <span className={styles.perfBadge}>{t("perfBadge")}</span>
              </div>
            </div>
            <div className={styles.heroAside} aria-hidden="true">
              <div className={styles.heroAccent} />
              <dl className={styles.heroStats}>
                <div>
                  <dt>Proyectos</dt>
                  <dd>+50</dd>
                </div>
                <div>
                  <dt>Desde</dt>
                  <dd>2019</dd>
                </div>
                <div>
                  <dt>Reseñas</dt>
                  <dd>4,9/5</dd>
                </div>
              </dl>
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
            <div className={styles.plans}>
              {plans.map((p) => (
                <div key={p.name} className={`${styles.plan} ${p.popular ? styles.popular : ""}`}>
                  {p.popular && <span className={styles.popularTag}>{t("popular")}</span>}
                  <h3 className={styles.planName}>{p.name}</h3>
                  <p className={styles.planPrice}>{p.price}</p>
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
          </Container>
        </Section>

        <Section id="sobre">
          <Container>
            <SectionHead title={t("aboutTitle")} />
            <p className={styles.about}>{t("aboutText")}</p>
          </Container>
        </Section>

        <Section id="opiniones" alt>
          <Container>
            <SectionHead title={t("testimonialsTitle")} />
            <div className={styles.testimonials}>
              {testimonios.map((tt) => (
                <figure key={tt.author} className={styles.testimonial}>
                  <blockquote className={styles.quote}>“{tt.quote}”</blockquote>
                  <figcaption className={styles.author}>
                    <strong>{tt.author}</strong>
                    <span>{tt.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </Section>

        <Section id="contacto">
          <Container>
            <SectionHead title={t("contactTitle")} />
            <div className={styles.contactGrid}>
              <ContactForm />
              <aside className={styles.location}>
                <div className={styles.map} aria-hidden="true">
                  <span className={styles.mapPin} />
                </div>
                <h3 className={styles.locationTitle}>{t("locationTitle")}</h3>
                <p className={styles.address}>{business.address}</p>
                <p className={styles.addressMeta}>
                  {business.phone} · {business.email}
                </p>
                <a
                  className={styles.directions}
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(business.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("directions")} →
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
