import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Brand from "@/components/layout/Brand/Brand";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher/LocaleSwitcher";
import Container from "@/components/ui/Container/Container";
import { SITE } from "@/config/site";
import styles from "./HubFooter.module.scss";

const DEMOS = [
  { key: "servicios", href: "/servicios" },
  { key: "tienda", href: "/tienda" },
  { key: "reservas", href: "/reservas" },
  { key: "admin", href: "/admin" },
] as const;

/** Hub footer: closing CTA, sitemap columns, giant wordmark, legal bar. */
export default function HubFooter() {
  const t = useTranslations("footer");
  const th = useTranslations("hub");
  const year = new Date().getFullYear();
  const wa = `https://wa.me/${SITE.whatsapp}`;

  return (
    <footer className={styles.footer}>
      <Container>
        {/* Closing CTA */}
        <section className={styles.cta} aria-labelledby="footer-cta">
          <div className={styles.ctaText}>
            <span className={styles.kicker}>{t("ctaKicker")}</span>
            <h2 id="footer-cta" className={styles.ctaTitle}>
              {t("ctaTitle")}
            </h2>
            <p className={styles.ctaLead}>{t("ctaLead")}</p>
          </div>
          <div className={styles.ctaActions}>
            <a href={`mailto:${SITE.contactEmail}`} className={styles.ctaPrimary}>
              {t("ctaEmail")} →
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>
              WhatsApp
            </a>
            <span className={styles.ctaMeta}>{t("ctaMeta")}</span>
          </div>
        </section>

        {/* Sitemap */}
        <div className={styles.grid}>
          <div className={styles.about}>
            <Brand />
            <p>{t("about")}</p>
          </div>

          <nav className={styles.col} aria-label={t("explore")}>
            <h3 className={styles.colTitle}>{t("explore")}</h3>
            <ul>
              <li>
                <a href="#estilos">{th("stylesKicker")}</a>
              </li>
              <li>
                <a href="#demos">{th("demosKicker")}</a>
              </li>
              <li>
                <a href="#proyectos">{th("projectsKicker")}</a>
              </li>
            </ul>
          </nav>

          <nav className={styles.col} aria-label={t("demos")}>
            <h3 className={styles.colTitle}>{t("demos")}</h3>
            <ul>
              {DEMOS.map((d) => (
                <li key={d.key}>
                  <Link href={d.href}>{th(d.key)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label={t("contact")}>
            <h3 className={styles.colTitle}>{t("contact")}</h3>
            <ul>
              <li>
                <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
              </li>
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  WhatsApp ↗
                </a>
              </li>
              <li>
                <a href={SITE.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  Portfolio ↗
                </a>
              </li>
              <li>
                <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              </li>
            </ul>
          </nav>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>{t("language")}</h3>
            <LocaleSwitcher />
            <p className={styles.styleHint}>{t("styleHint")}</p>
          </div>
        </div>
      </Container>

      {/* Giant wordmark — decorative */}
      <div className={styles.wordmark} aria-hidden="true">
        showcase
      </div>

      <Container>
        <div className={styles.bar}>
          <span>
            © {year} Javi García Magaldi · {t("rights")}
          </span>
          <span>{t("built")}</span>
          <a href="#top" className={styles.toTop}>
            {t("toTop")} ↑
          </a>
        </div>
      </Container>
    </footer>
  );
}
