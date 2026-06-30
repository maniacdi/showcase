"use client";

import { useTranslations } from "next-intl";
import { FONT_OPTIONS } from "@/themes/fontOptions";
import { usePrefsStore } from "@/store/usePrefsStore";
import styles from "./admin.module.scss";

export default function AdminControls() {
  const t = useTranslations("admin");
  const colorScheme = usePrefsStore((s) => s.colorScheme);
  const toggleColorScheme = usePrefsStore((s) => s.toggleColorScheme);
  const font = usePrefsStore((s) => s.font);
  const setFont = usePrefsStore((s) => s.setFont);

  return (
    <div className={styles.settings}>
      <p className={styles.settingsHint}>{t("settingsHint")}</p>

      <div className={styles.control}>
        <span>{t("darkMode")}</span>
        <button
          type="button"
          role="switch"
          aria-checked={colorScheme === "dark"}
          className={styles.switch}
          onClick={toggleColorScheme}
        >
          {colorScheme === "dark" ? "ON" : "OFF"}
        </button>
      </div>

      <div className={styles.control}>
        <label htmlFor="font-select">{t("font")}</label>
        <select
          id="font-select"
          className={styles.select}
          value={font}
          onChange={(e) => setFont(e.target.value as (typeof FONT_OPTIONS)[number]["key"])}
        >
          {FONT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
