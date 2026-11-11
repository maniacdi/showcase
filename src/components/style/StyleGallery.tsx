"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DESIGN_STYLES } from "@/themes/designStyles";
import { useSwitchStyle } from "@/themes/useSwitchStyle";
import { usePrefsStore } from "@/store/usePrefsStore";
import styles from "./StyleGallery.module.scss";

/**
 * Side-by-side live previews. Each tile carries its own data-style, so the
 * same mini-UI below renders in all six languages at once (tokens inherit
 * from the nearest data-style). Clicking applies that style to the whole site.
 */
export default function StyleGallery() {
  const t = useTranslations("styles");
  const current = usePrefsStore((s) => s.style);
  const switchStyle = useSwitchStyle();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ul className={styles.grid}>
      {DESIGN_STYLES.map((s, i) => {
        const active = mounted && s.key === current;
        return (
          <li key={s.key} className={styles.item}>
            <button
              type="button"
              data-style={s.key}
              className={styles.preview}
              aria-pressed={active}
              aria-label={`${t("apply")}: ${s.label}`}
              onClick={() => switchStyle(s.key)}
            >
              <span className={styles.pvTop}>
                <span className={styles.pvNum}>{String(i + 1).padStart(2, "0")}</span>
                {active && <span className={styles.pvActive}>{t("active")}</span>}
              </span>

              <span className={styles.pvTitle}>{s.label}</span>

              <span className={styles.pvCard}>
                <span className={styles.pvCardHead}>
                  <span className={styles.pvDot} />
                  <span className={styles.pvCardTitle}>{t("sampleCard")}</span>
                </span>
                <span className={styles.pvLine} />
                <span className={`${styles.pvLine} ${styles.pvLineShort}`} />
                <span className={styles.pvRow}>
                  <span className={styles.pvInput}>{t("sampleInput")}</span>
                  <span className={styles.pvBtn}>{t("sampleCta")}</span>
                </span>
              </span>
            </button>

            <div className={styles.meta}>
              <p className={styles.desc}>{t(`${s.key}.desc`)}</p>
              <p className={styles.traits}>{t(`${s.key}.traits`)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
