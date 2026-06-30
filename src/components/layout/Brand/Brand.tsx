import styles from "./Brand.module.scss";

/** Geometric mark + wordmark. The triangle uses the active theme accent. */
export default function Brand({ label = "showcase" }: { label?: string }) {
  return (
    <span className={styles.brand}>
      <svg className={styles.mark} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M3 21 L21 3 L21 21 Z" fill="var(--accent)" />
      </svg>
      <span className={styles.word}>{label}</span>
    </span>
  );
}
