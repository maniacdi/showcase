import { useTranslations } from "next-intl";
import Brand from "@/components/layout/Brand/Brand";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher/LocaleSwitcher";
import Container from "@/components/ui/Container/Container";
import { SITE } from "@/config/site";
import styles from "./SiteFooter.module.scss";

export default function SiteFooter() {
  const t = useTranslations("common");
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.hire}>
          <div className={styles.hireCopy}>
            <span className={styles.hireTitle}>{t("hireTitle")}</span>
            <span className={styles.hireText}>{t("hireText")}</span>
          </div>
          <a
            className={styles.hireCta}
            href={SITE.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("hireCta")} →
          </a>
        </div>

        <div className={styles.inner}>
          <div className={styles.left}>
            <Brand />
            <span className={styles.notice}>{t("demoNotice")}</span>
          </div>
          <LocaleSwitcher />
        </div>
      </Container>
    </footer>
  );
}
