import type { ReactNode } from "react";
import styles from "./Container.module.scss";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${styles.container} ${className}`.trim()}>{children}</div>;
}
