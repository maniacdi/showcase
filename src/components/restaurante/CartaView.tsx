"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import { ALLERGENS, CARTA_SECTIONS, dishes, type Locale } from "@/data/restaurante";
import { DIET_FILTERS, type DietFilter, filterDishes, formatEuros } from "@/lib/carta";
import AllergenBadges, { AllergenBadge } from "./AllergenBadges";
import styles from "./restaurante.module.scss";

function CheckIcon() {
  return (
    <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg className={styles.leaf} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M3 13c0-6 4-10 10-10 0 6-4 10-10 10zm0 0l5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CartaView() {
  const t = useTranslations("restaurante");
  const locale = useLocale() as Locale;
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<DietFilter[]>([]);

  const visible = useMemo(
    () => filterDishes(dishes, filters, query, locale),
    [filters, query, locale],
  );

  function toggle(f: DietFilter) {
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  }

  const active = filters.length > 0 || query.trim() !== "";

  return (
    <>
      <div className={styles.controls}>
        <Field label={t("search")} htmlFor="carta-search">
          <Input
            id="carta-search"
            type="search"
            className={styles.field}
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <fieldset className={styles.filterGroup}>
          <legend className={styles.filterLegend}>{t("filtersLabel")}</legend>
          <div className={styles.chips}>
            {DIET_FILTERS.map((f) => {
              const on = filters.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  className={styles.chip}
                  aria-pressed={on}
                  onClick={() => toggle(f)}
                >
                  {on ? <CheckIcon /> : null}
                  {t(`filter.${f}`)}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className={styles.resultsBar}>
        <p aria-live="polite">{t("results", { count: visible.length })}</p>
        {active ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              setFilters([]);
              setQuery("");
            }}
          >
            {t("clearFilters")}
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? <p className={styles.empty}>{t("noResults")}</p> : null}

      {CARTA_SECTIONS.map((section) => {
        const items = visible.filter((d) => d.section === section);
        if (items.length === 0) return null;
        return (
          <section
            key={section}
            className={styles.cartaSection}
            aria-labelledby={`carta-${section}`}
          >
            <h2 id={`carta-${section}`} className={styles.sectionTitle}>
              {t(`sections.${section}`)}
            </h2>
            <ul className={styles.dishes}>
              {items.map((d) => (
                <li key={d.id} className={styles.dish}>
                  <h3 className={styles.dishName}>{d.name[locale]}</h3>
                  <span className={styles.dishPrice}>{formatEuros(d.price)}</span>
                  <p className={styles.dishDesc}>{d.description[locale]}</p>
                  <div className={styles.dishMeta}>
                    <AllergenBadges allergens={d.allergens} />
                    {d.vegan ? (
                      <span className={styles.dietTag}>
                        <LeafIcon />
                        {t("veganTag")}
                      </span>
                    ) : d.vegetarian ? (
                      <span className={styles.dietTag}>
                        <LeafIcon />
                        {t("vegetarianTag")}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className={styles.legend} aria-labelledby="carta-legend">
        <h2 id="carta-legend" className={styles.blockTitle}>
          {t("legendTitle")}
        </h2>
        <ul className={styles.legendList}>
          {ALLERGENS.map((a) => (
            <li key={a}>
              <AllergenBadge allergen={a} />
              <span aria-hidden="true">{t(`allergen.${a}`)}</span>
            </li>
          ))}
        </ul>
        <p className={`${styles.sampleNote} ${styles.legendNote}`}>{t("allergenNote")}</p>
      </section>
    </>
  );
}
