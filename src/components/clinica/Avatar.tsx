import { initials } from "@/lib/agenda";
import styles from "./clinica.module.scss";

/** Photo-less avatar: initials on a token-coloured square (decorative; the name is always shown next to it). */
export default function Avatar({ name, size = "m" }: { name: string; size?: "s" | "m" }) {
  return (
    <span className={`${styles.avatar} ${size === "s" ? styles.avatarSmall : ""}`.trim()} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
