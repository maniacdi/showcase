import type { ReactNode } from "react";
import styles from "./Section.module.scss";

export default function Section({
  children,
  alt = false,
  id,
  className = "",
}: {
  children: ReactNode;
  alt?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`${styles.section} ${alt ? styles.alt : ""} ${className}`.trim()}>
      {children}
    </section>
  );
}
