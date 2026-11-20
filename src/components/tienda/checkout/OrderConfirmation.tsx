"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import { formatDayLong } from "@/components/clinica/format";
import { formatPrice } from "@/lib/cart";
import type { Order } from "@/lib/checkout";
import OrderSummary from "./OrderSummary";
import styles from "./checkout.module.scss";

/** Final step: order number, delivery estimate and a preview of the email. */
export default function OrderConfirmation({ order, address }: { order: Order; address: string }) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const pickup = order.shippingMethod === "recogida";
  const firstName = order.cliente.split(/\s+/)[0] || order.cliente;
  const paid =
    order.payment === "bizum"
      ? t("bizum")
      : order.cardLast4
        ? t("cardEnding", { last4: order.cardLast4 })
        : t("payCard");
  const shippingLabel = t(`method_${order.shippingMethod}`);

  return (
    <div className={styles.done}>
      <div className={styles.doneMain}>
        <p>{t("doneLead", { name: firstName, number: order.number })}</p>
        <p className={styles.orderNumber}>{order.number}</p>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>{pickup ? t("pickupReady") : t("delivery")}</dt>
            <dd>{formatDayLong(order.entrega, locale)}</dd>
          </div>
          <div className={styles.fact}>
            <dt>{t("paidWith")}</dt>
            <dd>{paid}</dd>
          </div>
          <div className={styles.fact}>
            <dt>{t("shipping")}</dt>
            <dd>{shippingLabel}</dd>
          </div>
          {pickup ? null : (
            <div className={styles.fact}>
              <dt>{t("shipTo")}</dt>
              <dd>{address}</dd>
            </div>
          )}
        </dl>
        <OrderSummary
          as="div"
          items={order.lines}
          totals={order.totals}
          shippingLabel={shippingLabel}
        />
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => router.push("/tienda")}>
            {t("keepShopping")}
          </Button>
          <Link href="/admin" className={styles.back}>
            {t("viewInAdmin")}
          </Link>
        </div>
      </div>

      <article className={styles.email} aria-labelledby="email-preview-title">
        <h2 id="email-preview-title" className={styles.emailTitle}>
          {t("emailPreviewTitle")}
        </h2>
        <dl className={styles.emailHead}>
          <dt>{t("emailFrom")}</dt>
          <dd>{t("emailFromValue")}</dd>
          <dt>{t("emailTo")}</dt>
          <dd>{order.email}</dd>
          <dt>{t("emailSubject")}</dt>
          <dd>{t("emailSubjectValue", { number: order.number })}</dd>
        </dl>
        <div className={styles.emailBody}>
          <p>{t("emailGreeting", { name: firstName })}</p>
          <p>{pickup ? t("emailBodyPickup") : t("emailBody")}</p>
          <ul className={styles.summaryLines}>
            {order.lines.map((l) => (
              <li key={l.id} className={styles.summaryLine}>
                <span>
                  {l.name} <span className={styles.mono}>x{l.qty}</span>
                </span>
                <span>{formatPrice(l.price * l.qty)}</span>
              </li>
            ))}
            <li className={styles.summaryLine}>
              <span>{t("total")}</span>
              <span>{formatPrice(order.totals.total)}</span>
            </li>
          </ul>
          <p>
            {pickup ? t("pickupReady") : t("delivery")}: {formatDayLong(order.entrega, locale)}
          </p>
          <p>{t("emailSign")}</p>
        </div>
        <p className={styles.emailNote}>{t("emailPreviewNote")}</p>
      </article>
    </div>
  );
}
