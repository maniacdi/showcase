import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container/Container";
import { SITE } from "@/config/site";
import styles from "./page.module.scss";

const ITEMS = [
  { key: "servicios", href: "/servicios", active: true },
  { key: "tienda", href: "/tienda", active: true },
  { key: "reservas", href: "/reservas", active: true },
  { key: "admin", href: "/admin", active: true },
] as const;

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
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Container>
        <header className={styles.head}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
          <p className={styles.seoLead}>{t("seoLead")}</p>
        </header>

        <aside className={styles.disclaimer} role="note">
          <span className={styles.disclaimerTag}>{t("disclaimerTag")}</span>
          <p>{t("disclaimer")}</p>
        </aside>

        <ul className={styles.list}>
          {ITEMS.map((item) => (
            <li key={item.key} className={styles.item}>
              <Link href={item.href} className={styles.link}>
                <span className={styles.name}>{t(item.key)}</span>
                <span className={styles.desc}>{t(`${item.key}Desc`)}</span>
                {!item.active && <span className={styles.soon}>{t("soon")}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <footer className={styles.hubFoot}>
          <span>Plantilla de Javi García Magaldi · Next.js</span>
          <nav className={styles.hubLinks}>
            <a href={SITE.portfolioUrl} target="_blank" rel="noopener noreferrer">
              Portfolio
            </a>
            <a href={`mailto:${SITE.contactEmail}`}>Email</a>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </nav>
        </footer>
      </Container>
    </main>
  );
}
