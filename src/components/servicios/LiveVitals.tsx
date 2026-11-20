"use client";

import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Metric } from "web-vitals";
import styles from "./LiveVitals.module.scss";

type Name = "LCP" | "CLS" | "INP" | "FCP" | "TTFB";
type Rating = Metric["rating"];
interface Reading {
  value: number;
  rating: Rating;
}

const ORDER: Name[] = ["LCP", "CLS", "INP", "FCP", "TTFB"];

// Same "good" thresholds web-vitals uses (LCPThresholds etc.), kept here so the
// labels render before the library is loaded.
const GOOD: Record<Name, number> = { LCP: 2500, CLS: 0.1, INP: 200, FCP: 1800, TTFB: 800 };

// PerformanceObserver entry type each metric needs; missing = not measurable here.
const ENTRY: Partial<Record<Name, string>> = {
  LCP: "largest-contentful-paint",
  CLS: "layout-shift",
  INP: "event",
};

/**
 * Live Core Web Vitals of THIS page, measured in the visitor's browser with
 * the `web-vitals` library (loaded lazily after mount, so SSR and the first
 * client render are identical and nothing hydrates differently).
 * Collapsed chip that expands a panel in place (user-initiated, so no CLS).
 */
export default function LiveVitals() {
  const t = useTranslations("vitals");
  const locale = useLocale();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [readings, setReadings] = useState<Partial<Record<Name, Reading>>>({});
  const [unsupported, setUnsupported] = useState<Name[]>([]);

  useEffect(() => {
    let cancelled = false;
    const supported =
      typeof PerformanceObserver !== "undefined" ? PerformanceObserver.supportedEntryTypes ?? [] : [];
    setUnsupported(ORDER.filter((n) => ENTRY[n] && !supported.includes(ENTRY[n]!)));

    const report = (m: Metric) => {
      if (cancelled) return;
      setReadings((r) => ({ ...r, [m.name]: { value: m.value, rating: m.rating } }));
    };
    import("web-vitals").then(({ onLCP, onCLS, onINP, onFCP, onTTFB }) => {
      if (cancelled) return;
      const opts = { reportAllChanges: true };
      onLCP(report, opts);
      onCLS(report, opts);
      onINP(report, opts);
      onFCP(report, opts);
      onTTFB(report, opts);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const nf = (digits: number) =>
    new Intl.NumberFormat(locale === "en" ? "en-GB" : "es-ES", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });

  function format(name: Name, value: number) {
    if (name === "CLS") return nf(2).format(value);
    return value >= 1000 ? `${nf(2).format(value / 1000)} s` : `${nf(0).format(value)} ms`;
  }

  const ratingLabel = (r: Rating) =>
    r === "good" ? t("good") : r === "poor" ? t("poor") : t("needsImprovement");

  const lcp = readings.LCP;

  return (
    <div className={styles.widget}>
      <button
        type="button"
        className={styles.chip}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.chipLabel}>{t("chip")}</span>
        <span className={styles.chipValue}>
          {lcp ? (
            <>
              <span className={styles.dot} data-rating={lcp.rating} aria-hidden="true" />
              LCP {format("LCP", lcp.value)}
            </>
          ) : (
            t("measuring")
          )}
        </span>
        <span className={styles.chipAction}>{open ? t("hide") : t("show")}</span>
      </button>

      <div id={panelId} className={styles.panel} hidden={!open}>
        <p className={styles.measured}>{t("measuredNow")}</p>
        <ul className={styles.list}>
          {ORDER.map((name) => {
            const r = readings[name];
            const isUnsupported = unsupported.includes(name);
            return (
              <li key={name} className={styles.row}>
                <span className={styles.name}>
                  <abbr className={styles.abbr} title={t(`metrics.${name}`)}>
                    {name}
                  </abbr>
                  <span className={styles.desc}>{t(`metrics.${name}`)}</span>
                </span>
                <span className={styles.value}>
                  {r ? format(name, r.value) : "–"}
                </span>
                <span className={styles.status} data-rating={r?.rating}>
                  {r ? (
                    <>
                      <span className={styles.dot} data-rating={r.rating} aria-hidden="true" />
                      {ratingLabel(r.rating)}
                    </>
                  ) : isUnsupported ? (
                    t("unsupported")
                  ) : name === "INP" ? (
                    t("inpPending")
                  ) : (
                    t("pending")
                  )}
                </span>
                <span className={styles.threshold}>
                  {t("goodUnder", { value: format(name, GOOD[name]) })}
                </span>
              </li>
            );
          })}
        </ul>
        <p className={styles.note}>{t("note")}</p>
      </div>
    </div>
  );
}
