"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import styles from "./LocaleSwitcher.module.scss";

const LOCALES = ["es", "en"] as const;

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={styles.switcher}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          className={l === locale ? styles.active : ""}
          aria-current={l === locale}
          onClick={() => router.replace(pathname, { locale: l })}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
