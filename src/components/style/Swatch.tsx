import styles from "./StyleSwitcher.module.scss";

/** Three overlapping dots summarising a style's palette. Decorative. */
export default function Swatch({ colors }: { colors: readonly string[] }) {
  return (
    <span className={styles.swatch} aria-hidden="true">
      {colors.map((c) => (
        <span key={c} style={{ background: c }} />
      ))}
    </span>
  );
}
