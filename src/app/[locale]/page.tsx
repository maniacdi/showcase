import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container/Container";
import StyleGallery from "@/components/style/StyleGallery";
import BrandPromo from "@/components/brand/BrandPromo";
import HubFooter from "@/components/layout/HubFooter/HubFooter";
import { SITE } from "@/config/site";
import { proyectos } from "@/data/proyectos";
import { DESIGN_STYLES } from "@/themes/designStyles";
import { alternatesFor } from "@/lib/seo";
import styles from "./page.module.scss";

const ITEMS = [
  { key: "servicios", href: "/servicios", glyph: "◧" },
  { key: "tienda", href: "/tienda", glyph: "◩" },
  { key: "reservas", href: "/reservas", glyph: "◫" },
  { key: "restaurante", href: "/restaurante", glyph: "◪" },
  { key: "admin", href: "/admin", glyph: "◨" },
] as const;

/** Stack tags shown per project card; the full list stays in src/data. */
const MAX_STACK = 4;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor("", locale) };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HubContent />;
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: "Showcase",
      url: SITE.url,
      description:
        "Desarrollo web a medida para comercios: tiendas online, reservas de citas, landings y paneles de gestión.",
    },
    {
      "@type": "ProfessionalService",
      name: "Javi García Magaldi — Desarrollo web a medida",
      url: SITE.portfolioUrl,
      email: SITE.contactEmail,
      areaServed: "ES",
      description:
        "Diseño y desarrollo web a medida para comercios y negocios locales: tiendas online, reservas de citas, landings y paneles de gestión. Rápido y optimizado para SEO.",
      sameAs: [SITE.portfolioUrl],
    },
  ],
};

function HubContent() {
  const t = useTranslations("hub");
  const tp = useTranslations("projects");
  return (
    <>
      <main id="top" className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Container>
        {/* ---------- Hero ---------- */}
        <header className={styles.head}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>
            {t("subtitle", {
              styles: DESIGN_STYLES.length,
              demos: ITEMS.length,
              projects: proyectos.length,
            })}
          </p>
          <div className={styles.heroCtas}>
            <a href="#estilos" className={styles.ctaPrimary}>
              {t("ctaStyles")}
            </a>
            <a href="#demos" className={styles.ctaSecondary}>
              {t("ctaDemos")}
            </a>
          </div>
          <p className={styles.byline}>
            {t.rich("byline", {
              link: (chunks) => (
                <a href={SITE.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  {chunks}
                </a>
              ),
            })}
          </p>
        </header>

        {/* ---------- Style gallery ---------- */}
        <section
          id="estilos"
          className={`${styles.block} ${styles.blockFirst}`}
          aria-labelledby="estilos-title"
        >
          <div className={styles.blockHead}>
            <h2 id="estilos-title" className={styles.blockTitle}>
              {t("stylesTitle")}
            </h2>
            <p className={styles.blockLead}>{t("stylesLead")}</p>
          </div>
          <StyleGallery />
        </section>

        {/* ---------- Tu negocio aquí (brand configurator) ---------- */}
        <BrandPromo
          classes={{
            block: styles.block,
            head: styles.blockHead,
            title: styles.blockTitle,
            lead: styles.blockLead,
          }}
        />

        {/* ---------- Demos (bento) ---------- */}
        <section id="demos" className={styles.block} aria-labelledby="demos-title">
          <div className={styles.blockHead}>
            <h2 id="demos-title" className={styles.blockTitle}>
              {t("demosTitle")}
            </h2>
            <p className={styles.blockLead}>{t("seoLead")}</p>
          </div>

          <aside className={styles.disclaimer} role="note">
            <span className={styles.disclaimerTag}>{t("disclaimerTag")}</span>
            <p>{t("disclaimer")}</p>
          </aside>

          <ul className={styles.demos}>
            {ITEMS.map((item, i) => (
              <li key={item.key} className={styles.demo}>
                <Link href={item.href} className={styles.demoLink}>
                  <span className={styles.demoTop}>
                    <span className={styles.demoNum}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.demoGlyph} aria-hidden="true">
                      {item.glyph}
                    </span>
                  </span>
                  <span className={styles.demoName}>{t(item.key)}</span>
                  <span className={styles.demoDesc}>{t(`${item.key}Desc`)}</span>
                  <span className={styles.demoGo}>{t("open")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Real projects ---------- */}
        <section id="proyectos" className={styles.block} aria-labelledby="proyectos-title">
          <div className={styles.blockHead}>
            <h2 id="proyectos-title" className={styles.blockTitle}>
              {t("projectsTitle")}
            </h2>
            <p className={styles.blockLead}>{t("projectsLead")}</p>
          </div>

          <ul className={styles.projects}>
            {proyectos.map((p) => (
              <li
                key={p.key}
                className={`${styles.project} ${p.featured ? styles.projectFeatured : ""}`}
              >
                <div className={styles.projectTop}>
                  <span className={styles.projectKind}>{tp(`kind.${p.kind}`)}</span>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.projectLink}
                    >
                      {tp("visit")}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <span className={styles.projectPrivate}>{tp("private")}</span>
                  )}
                </div>
                <h3 className={styles.projectName}>{tp(`${p.key}.name`)}</h3>
                <p className={styles.projectDesc}>{tp(`${p.key}.desc`)}</p>
                <ul className={styles.stack} aria-label="Stack">
                  {p.stack.slice(0, MAX_STACK).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

      </Container>
      </main>
      <HubFooter />
    </>
  );
}
