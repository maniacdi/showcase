import styles from "./SectionHead.module.scss";

export default function SectionHead({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className={styles.head}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}
