"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import { formatDayLong, formatDayShort } from "@/components/clinica/format";
import type { Cita, CitaEstado } from "@/data/citas";
import { AGENDA_HOY, HISTORIAL_EJEMPLO, PROFESIONALES } from "@/data/clinica";
import { PEDIDOS_EJEMPLO, VISTAS_EJEMPLO } from "@/data/ventas";
import { citasCSV, csvFormat, productosCSV } from "@/lib/adminExport";
import { formatPrice } from "@/lib/cart";
import { downloadCSV } from "@/lib/csv";
import { citasPorDia, computeKpis, topProductos, ventasPorSemana } from "@/lib/stats";
import { rehydrateCitas, useCitasStore } from "@/store/useCitasStore";
import { rehydrateOrders, useOrdersStore } from "@/store/useOrdersStore";
import { useProductsStore } from "@/store/useProductsStore";
import { ColumnChart, HBarChart, LineChart } from "./Charts";
import styles from "./admin.module.scss";

const ESTADO_KEY: Record<CitaEstado, string> = {
  pendiente: "statusPendiente",
  confirmada: "statusConfirmada",
  cancelada: "statusCancelada",
  asistio: "statusAsistio",
  no_presentado: "statusNoPresentado",
};

const compactEUR = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** "8/6" (es) / "6/8" (en): compact week label for the axis. */
function dayMonth(date: string, locale: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

/**
 * Admin "Resumen": KPI tiles, three charts and CSV exports. Everything is
 * anchored to the demo's fixed today (AGENDA_HOY): session citas/orders are
 * merged with the deterministic sample history, so SSR and the client agree.
 */
export default function AdminOverview() {
  const t = useTranslations("overview");
  const ta = useTranslations("admin");
  const locale = useLocale();
  const citas = useCitasStore((s) => s.citas);
  const orders = useOrdersStore((s) => s.orders);
  const productos = useProductsStore((s) => s.productos);

  useEffect(() => {
    void rehydrateCitas();
    void rehydrateOrders();
  }, []);

  const allCitas: Cita[] = [...HISTORIAL_EJEMPLO, ...citas];
  const allOrders = [...PEDIDOS_EJEMPLO, ...orders];
  const kpis = computeKpis(allCitas, allOrders, productos, AGENDA_HOY);
  const today = formatDayShort(AGENDA_HOY, locale);

  const porDia = citasPorDia(allCitas, AGENDA_HOY, 14).map((p) => ({
    key: p.key,
    short: String(Number(p.key.slice(8))),
    label: formatDayLong(p.key, locale),
    value: p.value,
  }));
  const porSemana = ventasPorSemana(allOrders, AGENDA_HOY, 8).map((p) => ({
    key: p.key,
    short: dayMonth(p.key, locale),
    label: formatDayLong(p.key, locale),
    value: p.value,
  }));
  const top = topProductos(VISTAS_EJEMPLO, productos, 5).map((p) => ({
    key: p.id,
    short: p.name,
    label: p.name,
    value: p.value,
  }));

  const num = (n: number) => new Intl.NumberFormat(locale).format(n);
  const stamp = () => new Date().toISOString().slice(0, 10);

  function exportCitas() {
    const csv = citasCSV(
      citas,
      [
        t("csvId"),
        ta("colClient"),
        ta("colService"),
        ta("colDate"),
        t("csvTime"),
        ta("colStatus"),
        t("csvProfessional"),
        t("csvPhone"),
      ],
      (c) => ta(ESTADO_KEY[c.estado]),
      (id) => PROFESIONALES.find((p) => p.id === id)?.nombre ?? "",
      csvFormat(locale),
    );
    downloadCSV(`citas-${stamp()}.csv`, csv);
  }

  function exportProductos() {
    const csv = productosCSV(
      productos,
      [
        t("csvId"),
        t("csvSlug"),
        ta("colName"),
        ta("colCategory"),
        ta("colPrice"),
        ta("colStock"),
        ta("colActive"),
        t("csvViews"),
      ],
      (b) => (b ? ta("on") : ta("off")),
      VISTAS_EJEMPLO,
      csvFormat(locale),
    );
    downloadCSV(`productos-${stamp()}.csv`, csv);
  }

  const tiles = [
    { label: t("kpiCitas"), value: num(kpis.citasSemana), detail: t("kpiCitasDetail") },
    {
      label: t("kpiVentas"),
      value: formatPrice(kpis.ventasMes),
      detail: t("kpiVentasDetail", { n: kpis.pedidosMes }),
    },
    { label: t("kpiTicket"), value: formatPrice(kpis.ticketMedio), detail: t("kpiTicketDetail") },
    {
      label: t("kpiProductos"),
      value: num(kpis.productosActivos),
      detail: t("kpiProductosDetail", { total: productos.length }),
    },
  ];

  return (
    <section className={styles.overview} aria-labelledby="overview-title">
      <div className={styles.overviewHead}>
        <h2 id="overview-title" className={styles.overviewTitle}>
          {t("title")}
        </h2>
        <span className={styles.sampleTag}>{t("sampleData")}</span>
      </div>
      <p className={styles.overviewIntro}>
        {t("intro", { date: today })} {t("sampleNote", { date: today })}
      </p>

      <ul className={styles.kpis}>
        {tiles.map((k) => (
          <li key={k.label} className={styles.kpi}>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiDetail}>{k.detail}</span>
          </li>
        ))}
      </ul>

      <div className={styles.charts}>
        <ColumnChart
          title={t("chartCitas")}
          desc={t("chartCitasDesc")}
          keyHeader={t("colDay")}
          valueHeader={t("colCitas")}
          data={porDia}
          format={num}
          tip={(d) => t("tipCitas", { n: d.value })}
        />
        <LineChart
          title={t("chartVentas")}
          desc={t("chartVentasDesc")}
          keyHeader={t("colWeek")}
          valueHeader={t("colSales")}
          data={porSemana}
          format={formatPrice}
          axisFormat={(n) => compactEUR.format(n)}
          tip={(d) => formatPrice(d.value)}
        />
        <HBarChart
          title={t("chartTop")}
          desc={t("chartTopDesc")}
          keyHeader={t("colProduct")}
          valueHeader={t("colViews")}
          data={top}
          format={num}
        />
      </div>

      <div className={styles.exportBar}>
        <div className={styles.exportCopy}>
          <h3 className={styles.exportTitle}>{t("exportTitle")}</h3>
          <p className={styles.exportHint}>{t("exportHint")}</p>
        </div>
        <div className={styles.exportActions}>
          <Button variant="outline" onClick={exportCitas}>
            {t("exportCitas")}
          </Button>
          <Button variant="outline" onClick={exportProductos}>
            {t("exportProducts")}
          </Button>
        </div>
      </div>
    </section>
  );
}
