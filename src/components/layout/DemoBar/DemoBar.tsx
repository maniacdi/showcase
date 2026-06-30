import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container/Container";
import styles from "./DemoBar.module.scss";

/** Slim notice under the header: these verticals are wireframes, not final designs. */
export default function DemoBar() {
  const t = useTranslations("common");
  return (
    <div className={styles.bar}>
      <Container className={styles.inner}>
        <span className={styles.text}>{t("demoBar")}</span>
        <Link href="/" className={styles.link}>
          {t("seeAll")} →
        </Link>
      </Container>
    </div>
  );
}
