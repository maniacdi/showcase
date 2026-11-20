"use client";

import { useMounted } from "@/lib/useMounted";
import { useBrandStore } from "@/store/useBrandStore";
import styles from "./Brand.module.scss";

/**
 * Geometric mark + wordmark. The triangle uses the active theme accent.
 * When a visitor set their own brand (/marca), demo verticals show their name
 * and logo instead. SSR always renders the default; the swap happens after
 * mount so hydration never mismatches. `fixed` keeps the showcase's own mark
 * (hub chrome).
 */
export default function Brand({
  label = "showcase",
  fixed = false,
}: {
  label?: string;
  fixed?: boolean;
}) {
  const mounted = useMounted();
  const brand = useBrandStore((s) => s.brand);
  const logo = useBrandStore((s) => s.logo);
  const custom = !fixed && mounted && brand ? brand : null;
  const name = custom?.name.trim() || label;

  return (
    <span className={styles.brand}>
      {custom && logo ? (
        // Data URL from the visitor's upload: next/image adds nothing here.
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.logo} src={logo} alt="" width={28} height={28} />
      ) : (
        <svg className={styles.mark} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M3 21 L21 3 L21 21 Z" fill="var(--accent)" />
        </svg>
      )}
      <span className={`${styles.word} ${custom ? styles.wordCustom : ""}`.trim()}>{name}</span>
    </span>
  );
}
