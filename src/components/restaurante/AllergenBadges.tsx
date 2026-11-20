import { useTranslations } from "next-intl";
import type { Allergen } from "@/data/restaurante";
import styles from "./restaurante.module.scss";

/**
 * Allergens as short text badges ("GL", "HU"…). The code is decorative; the
 * full name is in the accessible text and the tooltip, and the legend at the
 * bottom of the menu maps each code.
 */
export default function AllergenBadges({ allergens }: { allergens: Allergen[] }) {
  const t = useTranslations("restaurante");
  if (allergens.length === 0) {
    return <span className={styles.noAllergens}>{t("noAllergens")}</span>;
  }
  return (
    <ul className={styles.badges} aria-label={t("allergensLabel")}>
      {allergens.map((a) => (
        <li key={a}>
          <AllergenBadge allergen={a} />
        </li>
      ))}
    </ul>
  );
}

export function AllergenBadge({ allergen }: { allergen: Allergen }) {
  const t = useTranslations("restaurante");
  const name = t(`allergen.${allergen}`);
  return (
    <span className={styles.badge} title={name}>
      <span aria-hidden="true">{t(`allergenShort.${allergen}`)}</span>
      <span className={styles.srOnly}>{name}</span>
    </span>
  );
}
