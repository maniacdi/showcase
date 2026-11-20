import styles from "./SectionHead.module.scss";

/**
 * Section heading. The eyebrow is off by default: a label above every heading
 * repeats what the heading already says. `eyebrow` is still accepted so older
 * callers keep compiling; pass `showEyebrow` to actually render it.
 */
export default function SectionHead({
  eyebrow,
  showEyebrow = false,
  title,
}: {
  eyebrow?: string;
  showEyebrow?: boolean;
  title: string;
}) {
  return (
    <div className={styles.head}>
      {showEyebrow && eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}
