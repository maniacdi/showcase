"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import { formatDayShort } from "@/components/clinica/format";
import { PEDIDOS_EJEMPLO } from "@/data/ventas";
import { csvFormat, ordersCSV } from "@/lib/adminExport";
import { formatPrice } from "@/lib/cart";
import type { Order } from "@/lib/checkout";
import { downloadCSV } from "@/lib/csv";
import { useOrdersStore } from "@/store/useOrdersStore";
import base from "@/app/[locale]/admin/admin.module.scss";
import styles from "./admin.module.scss";

const SAMPLE_ROWS = 5;

/** "Pedidos": this session's simulated orders, then the latest sample ones. */
export default function AdminOrders() {
  const t = useTranslations("orders");
  const tc = useTranslations("checkout");
  const to = useTranslations("overview");
  const locale = useLocale();
  // Rehydrated by AdminOverview on mount.
  const orders = useOrdersStore((s) => s.orders);
  const session = [...orders].reverse();
  const sample = PEDIDOS_EJEMPLO.slice(-SAMPLE_ROWS).reverse();
  const rows = [...session, ...sample];

  const shippingLabel = (o: Order) => tc(`method_${o.shippingMethod}`);
  const paymentLabel = (o: Order) =>
    o.payment === "bizum"
      ? tc("bizum")
      : o.cardLast4
        ? tc("cardEnding", { last4: o.cardLast4 })
        : tc("payCard");

  function exportOrders() {
    const csv = ordersCSV(
      [...PEDIDOS_EJEMPLO, ...orders],
      [
        t("colNumber"),
        t("colDate"),
        t("colClient"),
        t("colCity"),
        t("colItems"),
        t("colShipping"),
        t("colPayment"),
        tc("base"),
        t("colIva"),
        t("colTotal"),
        t("colDelivery"),
      ],
      shippingLabel,
      paymentLabel,
      csvFormat(locale),
    );
    downloadCSV(`pedidos-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <section aria-labelledby="orders-title">
      <div className={styles.sectionHead}>
        <h2 id="orders-title" className={base.h2}>
          {t("title")}
        </h2>
        <Button variant="outline" onClick={exportOrders}>
          {to("exportOrders")}
        </Button>
      </div>
      <p className={styles.sectionIntro}>{t("intro")}</p>
      {session.length === 0 ? (
        <p className={styles.sectionIntro}>
          {t("empty")} <Link href="/tienda">{t("goShop")}</Link>
        </p>
      ) : null}
      <div className={base.tableWrap}>
        <table className={base.table}>
          <thead>
            <tr>
              <th scope="col">{t("colNumber")}</th>
              <th scope="col">{t("colDate")}</th>
              <th scope="col">{t("colClient")}</th>
              <th scope="col">{t("colItems")}</th>
              <th scope="col">{t("colShipping")}</th>
              <th scope="col">{t("colPayment")}</th>
              <th scope="col">{t("colTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className={base.date}>
                  {o.number}
                  {o.sample ? (
                    <>
                      {" "}
                      <span className={`${base.chip} ${base.pendiente}`}>{t("sampleChip")}</span>
                    </>
                  ) : null}
                </td>
                <td className={base.date}>{formatDayShort(o.fecha, locale)}</td>
                <td>
                  {o.cliente}
                  {o.ciudad ? <span className={styles.cellSub}>{o.ciudad}</span> : null}
                </td>
                <td>
                  {o.lines.map((l) => (
                    <span key={l.id} className={styles.cellLine}>
                      {l.name} <span className={base.date}>x{l.qty}</span>
                    </span>
                  ))}
                </td>
                <td>{shippingLabel(o)}</td>
                <td>{paymentLabel(o)}</td>
                <td className={base.date}>
                  {formatPrice(o.totals.total)}
                  <span className={styles.cellSub}>
                    {t("colIva")} {formatPrice(o.totals.iva)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
