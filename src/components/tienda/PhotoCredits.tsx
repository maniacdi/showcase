import type { Photo } from "@/data/productos";
import styles from "./PhotoCredits.module.scss";

/** One line crediting every third-party photo shown on the page. */
export default function PhotoCredits({
  label,
  photos,
  className,
}: {
  label: string;
  photos: Photo[];
  className?: string;
}) {
  const credits = photos.flatMap((p) => (p.credit ? [p.credit] : []));
  if (credits.length === 0) return null;
  return (
    <p className={className ? `${styles.credits} ${className}` : styles.credits}>
      {label}:{" "}
      {credits.map((c, i) => (
        <span key={c.href}>
          <a href={c.href} target="_blank" rel="noopener noreferrer">
            {c.author}
          </a>{" "}
          ({c.license}){i < credits.length - 1 ? ", " : "."}
        </span>
      ))}
    </p>
  );
}
