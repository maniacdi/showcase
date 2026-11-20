"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import { DESIGN_STYLES, isDesignStyle, type DesignStyleKey } from "@/themes/designStyles";
import { useSwitchStyle } from "@/themes/useSwitchStyle";
import { usePrefsStore } from "@/store/usePrefsStore";
import { useMounted } from "@/lib/useMounted";
import StyleDemoBlock from "./StyleDemoBlock";
import styles from "./CompareStyles.module.scss";

const labelOf = (key: DesignStyleKey) => DESIGN_STYLES.find((s) => s.key === key)?.label ?? key;

/**
 * Two design styles side by side (stacked on phones). Each pane is a local
 * [data-style] scope: _design-styles.scss declares every token block for
 * `[data-style="…"]` on any element, so the same markup renders both styles
 * at once without touching the global switch. ?a=&b= makes it shareable.
 */
export default function CompareStyles() {
  const t = useTranslations("compare");
  const id = useId();
  const mounted = useMounted();
  const current = usePrefsStore((s) => s.style);
  const switchStyle = useSwitchStyle();
  const [a, setA] = useState<DesignStyleKey>("swiss");
  const [b, setB] = useState<DesignStyleKey>("brutalism");

  // Initial pair: ?a=&b= if valid, else the active style vs a contrasting one.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const qa = q.get("a");
    const qb = q.get("b");
    const active = usePrefsStore.getState().style;
    const first = isDesignStyle(qa) ? qa : active;
    const fallback = first === "brutalism" ? "swiss" : "brutalism";
    setA(first);
    setB(isDesignStyle(qb) && qb !== first ? qb : fallback);
  }, []);

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    if (!mounted) return;
    const url = new URL(window.location.href);
    url.searchParams.set("a", a);
    url.searchParams.set("b", b);
    window.history.replaceState(window.history.state, "", url);
  }, [a, b, mounted]);

  const panes = [
    { key: a, set: setA, label: t("first") },
    { key: b, set: setB, label: t("second") },
  ];

  return (
    <div className={styles.compare}>
      <div className={styles.controls}>
        {panes.map((p, i) => (
          <div key={i} className={styles.control}>
            <label htmlFor={`${id}-${i}`} className={styles.controlLabel}>
              {p.label}
            </label>
            <select
              id={`${id}-${i}`}
              className={styles.select}
              value={p.key}
              onChange={(e) => {
                if (isDesignStyle(e.target.value)) p.set(e.target.value);
              }}
            >
              {DESIGN_STYLES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className={styles.swap}
          onClick={() => {
            setA(b);
            setB(a);
          }}
        >
          {t("swap")}
        </Button>
      </div>

      <div className={styles.panes}>
        {panes.map((p, i) => {
          const name = labelOf(p.key);
          const active = mounted && current === p.key;
          return (
            <section
              key={i}
              className={styles.pane}
              data-style={p.key}
              aria-label={t("paneLabel", { style: name })}
            >
              <div className={styles.paneHead}>
                <span className={styles.paneName}>{name}</span>
                {active ? (
                  <span className={styles.paneActive}>{t("inUse")}</span>
                ) : (
                  <Button type="button" variant="ghost" onClick={() => switchStyle(p.key)}>
                    {t("use", { style: name })}
                  </Button>
                )}
              </div>
              <StyleDemoBlock />
            </section>
          );
        })}
      </div>
    </div>
  );
}
