"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCopyBrandLink } from "@/components/brand/useCopyBrandLink";
import { useBrandStore } from "@/store/useBrandStore";
import { DESIGN_STYLES } from "@/themes/designStyles";
import { useSwitchStyle } from "@/themes/useSwitchStyle";
import { usePrefsStore } from "@/store/usePrefsStore";
import Swatch from "./Swatch";
import styles from "./StyleSwitcher.module.scss";

/** Floating dock (bottom-left, every page): pick a design style + dark mode. */
export default function StyleSwitcher() {
  const t = useTranslations("styles");
  const tb = useTranslations("brand");
  const brand = useBrandStore((s) => s.brand);
  const { copy, state: copyState, link } = useCopyBrandLink();
  const current = usePrefsStore((s) => s.style);
  const colorScheme = usePrefsStore((s) => s.colorScheme);
  const toggleColorScheme = usePrefsStore((s) => s.toggleColorScheme);
  const switchStyle = useSwitchStyle();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Persisted prefs only exist client-side; avoid a label mismatch on hydration.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const active = DESIGN_STYLES.find((s) => s.key === current) ?? DESIGN_STYLES[0];
  const isNeo = current === "neofuturism";
  const shown = mounted ? active : DESIGN_STYLES[0];

  return (
    <div ref={rootRef} className={styles.dock}>
      {open && (
        <div id={panelId} className={styles.panel} role="dialog" aria-label={t("dockTitle")}>
          <p className={styles.panelTitle}>{t("dockTitle")}</p>
          <ul className={styles.options} role="radiogroup" aria-label={t("dockTitle")}>
            {DESIGN_STYLES.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mounted && s.key === current}
                  className={styles.option}
                  onClick={() => switchStyle(s.key)}
                >
                  <Swatch colors={s.swatch} />
                  <span className={styles.optionText}>
                    <span className={styles.optionName}>{s.label}</span>
                    <span className={styles.optionDesc}>{t(`${s.key}.short`)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            role="switch"
            aria-checked={mounted && colorScheme === "dark"}
            className={styles.darkToggle}
            onClick={toggleColorScheme}
            disabled={isNeo}
            title={isNeo ? t("darkOnly") : undefined}
          >
            <span>{t("dark")}</span>
            <span className={styles.darkState}>
              {isNeo ? t("darkOnlyShort") : mounted && colorScheme === "dark" ? "ON" : "OFF"}
            </span>
          </button>
          {/* "Tu negocio aquí": brand configurator + share link */}
          <div className={styles.brandRow}>
            <Link href="/marca" className={styles.brandLink} onClick={() => setOpen(false)}>
              {tb("dock")}
            </Link>
            {mounted && brand && (
              <button type="button" className={styles.brandLink} onClick={copy}>
                {copyState === "copied" ? tb("copied") : tb("dockCopy")}
              </button>
            )}
            {copyState === "manual" && (
              <input
                className={styles.brandManual}
                readOnly
                value={link}
                aria-label={tb("copyFallback")}
                onFocus={(e) => e.currentTarget.select()}
              />
            )}
            <span className={styles.srOnly} role="status">
              {copyState === "copied" ? tb("copied") : ""}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <Swatch colors={shown.swatch} />
        {/* Visible: swatch + style name. The "Style:" prefix is for screen readers. */}
        <span className={styles.triggerLabel}>
          <span className={styles.srOnly}>{t("dockLabel")}: </span>
          {shown.label}
        </span>
        <span aria-hidden="true" className={styles.chevron}>
          {open ? "▾" : "▴"}
        </span>
      </button>
    </div>
  );
}
