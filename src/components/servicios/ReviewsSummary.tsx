import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import { reviewSummary, summarizeRatings } from "@/data/servicios";
import styles from "./ReviewsSummary.module.scss";

const STAR_PATH =
  "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

function StarRow({ size }: { size: number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </>
  );
}

/** Five stars, filled proportionally to `value`; announced as "4,9 de 5". */
function Stars({ value, label, size = 18 }: { value: number; label: string; size?: number }) {
  const hidden = 100 - (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <span className={styles.stars} role="img" aria-label={label}>
      <span className={styles.starsBase}>
        <StarRow size={size} />
      </span>
      <span className={styles.starsFill} style={{ clipPath: `inset(0 ${hidden}% 0 0)` }}>
        <StarRow size={size} />
      </span>
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeDate(daysAgo: number, locale: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (daysAgo < 7) return rtf.format(-daysAgo, "day");
  if (daysAgo < 30) return rtf.format(-Math.round(daysAgo / 7), "week");
  if (daysAgo < 365) return rtf.format(-Math.round(daysAgo / 30), "month");
  return rtf.format(-Math.round(daysAgo / 365), "year");
}

/**
 * Review summary laid out like a business profile card (overall rating,
 * distribution bars, recent reviews). Mock data, always tagged as such.
 * No third-party logos or brand colours: everything reads design tokens.
 */
export default function ReviewsSummary({ sampleLabel }: { sampleLabel: string }) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const { distribution, reviews } = reviewSummary;
  const { count, average } = summarizeRatings(distribution);
  const max = Math.max(...distribution);
  const nf = new Intl.NumberFormat(locale === "en" ? "en-GB" : "es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const avgText = nf.format(average);

  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        <span className={styles.sample}>{sampleLabel}</span>
        <span className={styles.caption}>{t("caption")}</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.overview}>
          <div className={styles.score}>
            <p className={styles.average} aria-hidden="true">
              {avgText}
            </p>
            <Stars value={average} label={t("rating", { rating: avgText })} size={20} />
            <p className={styles.count}>{t("count", { count })}</p>
          </div>

          <ul className={styles.bars} aria-label={t("distribution")}>
            {distribution.map((n, i) => {
              const stars = 5 - i;
              return (
                <li key={stars} className={styles.bar}>
                  <span className={styles.barNum} aria-hidden="true">
                    {stars}
                  </span>
                  <span className={styles.barTrack} aria-hidden="true">
                    <span
                      className={styles.barFill}
                      style={{ transform: `scaleX(${max ? n / max : 0})` }}
                    />
                  </span>
                  <span className={styles.srOnly}>{t("bar", { stars, count: n })}</span>
                </li>
              );
            })}
          </ul>

          <div className={styles.cta}>
            <p className={styles.ctaText}>{t("ctaText")}</p>
            <Button as="a" href="#contacto" variant="outline">
              {t("cta")}
            </Button>
          </div>
        </div>

        <ul className={styles.list} aria-label={t("listLabel")}>
          {reviews.map((r) => (
            <li key={r.author} className={styles.card}>
              <article className={styles.review}>
                <header className={styles.reviewHead}>
                  <span className={styles.avatar} aria-hidden="true">
                    {initials(r.author)}
                  </span>
                  <span className={styles.who}>
                    <strong className={styles.name}>{r.author}</strong>
                    <span className={styles.when}>{relativeDate(r.daysAgo, locale)}</span>
                  </span>
                </header>
                <Stars
                  value={r.rating}
                  label={t("rating", { rating: String(r.rating) })}
                  size={16}
                />
                <p className={styles.text}>{r.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
