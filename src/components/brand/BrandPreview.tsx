"use client";

import { useTranslations } from "next-intl";
import type { BusinessType } from "@/themes/brand";
import styles from "./BrandStudio.module.scss";

const SERVICES = ["s1", "s2", "s3"] as const;

/**
 * Mini landing in the visitor's brand. It reads the live tokens (accent,
 * fonts, surfaces) like the rest of the site, so it re-skins with the brand
 * AND with whichever design style is active.
 */
export default function BrandPreview({
  name,
  logo,
  type,
}: {
  name: string;
  logo: string | null;
  type: BusinessType;
}) {
  const t = useTranslations("brand");
  const k = `types.${type}` as const;

  return (
    <div className={styles.preview} role="group" aria-label={t("previewLabel")}>
      <div className={styles.pvBar}>
        <span className={styles.pvBrand}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={t("logoAlt", { name })} width={32} height={32} />
          ) : (
            <span className={styles.pvMark} aria-hidden="true" />
          )}
          <span className={styles.pvName}>{name}</span>
        </span>
        <span className={styles.pvNav} aria-hidden="true">
          <span>{t("previewNavServices")}</span>
          <span>{t("previewNavContact")}</span>
        </span>
      </div>

      <div className={styles.pvHero}>
        <p className={styles.pvKicker}>{t(`${k}.label`)}</p>
        <h3 className={styles.pvHeadline}>{t(`${k}.headline`)}</h3>
        <p className={styles.pvLead}>{t(`${k}.lead`, { name })}</p>
        <div className={styles.pvCtas} aria-hidden="true">
          <span className={styles.pvCtaSolid}>{t(`${k}.cta`)}</span>
          <span className={styles.pvCtaOutline}>{t("previewSecondary")}</span>
        </div>
      </div>

      <ul className={styles.pvCards}>
        {SERVICES.map((s) => (
          <li key={s} className={styles.pvCard}>
            <span className={styles.pvCardTitle}>{t(`${k}.${s}`)}</span>
            <span className={styles.pvCardText}>{t(`${k}.${s}d`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
