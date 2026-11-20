"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { type Locale, menuDelDiaDefault } from "@/data/restaurante";
import { formatEuros } from "@/lib/carta";
import { useMesasStore } from "@/store/useMesasStore";
import styles from "./restaurante.module.scss";

/** "Menú del día" block at the top of the carta; the owner edits it in /admin. */
export default function MenuDelDiaCard() {
  const t = useTranslations("restaurante");
  const locale = useLocale() as Locale;
  const stored = useMesasStore((s) => s.menuDelDia);
  // The store rehydrates from localStorage on the client only: render the
  // default on the server and first paint, then swap to the saved menu.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const menu = (mounted && stored) || menuDelDiaDefault[locale] || menuDelDiaDefault.es;

  return (
    <section className={styles.menuDia} aria-labelledby="menu-dia-title">
      <div className={styles.menuDiaHead}>
        <h2 id="menu-dia-title" className={styles.menuDiaTitle}>
          {menu.title}
        </h2>
        <span className={styles.sampleNote}>{t("sampleData")}</span>
      </div>
      <p className={styles.menuDiaPrice}>{formatEuros(menu.price)}</p>
      <dl className={styles.menuDiaCourses}>
        <div>
          <dt>{t("menuStarter")}</dt>
          <dd>{menu.starter}</dd>
        </div>
        <div>
          <dt>{t("menuMain")}</dt>
          <dd>{menu.main}</dd>
        </div>
        <div>
          <dt>{t("menuDessert")}</dt>
          <dd>{menu.dessert}</dd>
        </div>
      </dl>
      <p className={styles.menuDiaNote}>{t("menuNote")}</p>
    </section>
  );
}
