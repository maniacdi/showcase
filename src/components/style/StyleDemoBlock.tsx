"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import styles from "./CompareStyles.module.scss";

/**
 * Representative slice of a site (hero + card + form) built from the real UI
 * primitives. It has no style of its own: wrap it in a [data-style] scope and
 * it renders in that style's tokens.
 */
export default function StyleDemoBlock() {
  const t = useTranslations("compare.demo");
  const id = useId();
  const [sent, setSent] = useState(false);

  return (
    <div className={styles.demo}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>{t("eyebrow")}</p>
        <h3 className={styles.headline}>{t("headline")}</h3>
        <p className={styles.lead}>{t("lead")}</p>
        <div className={styles.ctas}>
          <Button type="button">{t("cta")}</Button>
          <Button type="button" variant="outline">
            {t("secondary")}
          </Button>
        </div>
      </div>

      <div className={styles.row}>
        <article className={styles.card}>
          <h4 className={styles.cardTitle}>{t("cardTitle")}</h4>
          <p className={styles.cardText}>{t("cardText")}</p>
          <div className={styles.cardFoot}>
            <span className={styles.price}>{t("cardPrice")}</span>
            <Button type="button" variant="outline">
              {t("cardCta")}
            </Button>
          </div>
        </article>

        <form
          className={styles.form}
          aria-labelledby={`${id}-ft`}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <h4 id={`${id}-ft`} className={styles.cardTitle}>
            {t("formTitle")}
          </h4>
          <Field label={t("formName")} htmlFor={`${id}-n`}>
            <Input id={`${id}-n`} autoComplete="off" />
          </Field>
          <Field label={t("formPhone")} htmlFor={`${id}-p`}>
            <Input id={`${id}-p`} type="tel" inputMode="tel" autoComplete="off" />
          </Field>
          <Button type="submit">{t("formSubmit")}</Button>
          <p className={styles.sent} role="status">
            {sent ? t("formSent") : ""}
          </p>
        </form>
      </div>
    </div>
  );
}
