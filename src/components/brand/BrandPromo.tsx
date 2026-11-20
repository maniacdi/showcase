import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import btn from "@/components/ui/Button/Button.module.scss";

/**
 * Hub block that sends visitors to the brand configurator (/marca). Takes the
 * hub's own block classes so it sits in the page rhythm without duplicating CSS.
 */
export default function BrandPromo({
  classes,
}: {
  classes: { block: string; head: string; title: string; lead: string };
}) {
  const t = useTranslations("brand");
  return (
    <section id="tu-marca" className={classes.block} aria-labelledby="tu-marca-title">
      <div className={classes.head}>
        <h2 id="tu-marca-title" className={classes.title}>
          {t("promoTitle")}
        </h2>
        <p className={classes.lead}>{t("promoLead")}</p>
        <p>
          <Link href="/marca" className={`${btn.btn} ${btn.solid}`}>
            {t("promoCta")}
          </Link>
        </p>
      </div>
    </section>
  );
}
