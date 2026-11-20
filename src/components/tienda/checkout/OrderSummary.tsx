"use client";

import { useTranslations } from "next-intl";
import type { CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/cart";
import type { Totals } from "@/lib/checkout";
import styles from "./checkout.module.scss";

/** Lines + totals with the IVA breakdown (prices include IVA). */
export default function OrderSummary({
  items,
  totals,
  shippingLabel,
  title,
  as: Tag = "aside",
}: {
  items: CartItem[];
  totals: Totals;
  shippingLabel: string;
  title?: string;
  as?: "aside" | "div";
}) {
  const t = useTranslations("checkout");
  return (
    <Tag className={styles.summary} aria-label={title ?? t("summaryTitle")}>
      <h2 className={styles.summaryTitle}>{title ?? t("summaryTitle")}</h2>
      <ul className={styles.summaryLines}>
        {items.map((i) => (
          <li key={i.id} className={styles.summaryLine}>
            <span>
              {i.name} <span className={styles.mono}>x{i.qty}</span>
            </span>
            <span>{formatPrice(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className={styles.totals}>
        <dt>{t("subtotal")}</dt>
        <dd>{formatPrice(totals.subtotal)}</dd>
        <dt>{shippingLabel}</dt>
        <dd>{totals.shipping === 0 ? t("free") : formatPrice(totals.shipping)}</dd>
        <dt className={styles.totalRow}>{t("total")}</dt>
        <dd className={styles.totalRow}>{formatPrice(totals.total)}</dd>
        <dt className={styles.taxRow}>{t("base")}</dt>
        <dd className={styles.taxRow}>{formatPrice(totals.base)}</dd>
        <dt className={styles.taxRow}>{t("iva")}</dt>
        <dd className={styles.taxRow}>{formatPrice(totals.iva)}</dd>
      </dl>
      <p className={styles.ivaNote}>{t("ivaNote")}</p>
    </Tag>
  );
}
