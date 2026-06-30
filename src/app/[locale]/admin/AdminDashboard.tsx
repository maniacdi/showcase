"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import type { CitaEstado } from "@/data/citas";
import { formatPrice } from "@/lib/cart";
import { useAuth } from "@/lib/auth/useAuth";
import { useCitasStore } from "@/store/useCitasStore";
import { useProductsStore } from "@/store/useProductsStore";
import AdminControls from "./AdminControls";
import styles from "./admin.module.scss";

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const { logout } = useAuth();
  const router = useRouter();
  const citas = useCitasStore((s) => s.citas);
  const confirm = useCitasStore((s) => s.confirm);
  const cancel = useCitasStore((s) => s.cancel);
  const productos = useProductsStore((s) => s.productos);
  const toggleActive = useProductsStore((s) => s.toggleActive);

  const total = citas.length;
  const pending = citas.filter((c) => c.estado === "pendiente").length;
  const confirmed = citas.filter((c) => c.estado === "confirmada").length;

  const statusLabel: Record<CitaEstado, string> = {
    pendiente: t("statusPendiente"),
    confirmada: t("statusConfirmada"),
    cancelada: t("statusCancelada"),
  };

  return (
    <main>
      <Container className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>{t("title")}</h1>
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            {t("logout")}
          </Button>
        </header>

        <section className={styles.metrics} aria-label={t("citasTitle")}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{total}</span>
            <span className={styles.metricLabel}>{t("metricTotal")}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{pending}</span>
            <span className={styles.metricLabel}>{t("metricPending")}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{confirmed}</span>
            <span className={styles.metricLabel}>{t("metricConfirmed")}</span>
          </div>
        </section>

        <h2 className={styles.h2}>{t("citasTitle")}</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("colClient")}</th>
                <th>{t("colService")}</th>
                <th>{t("colDate")}</th>
                <th>{t("colStatus")}</th>
                <th>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id}>
                  <td>{c.cliente}</td>
                  <td>{c.servicio}</td>
                  <td className={styles.date}>{c.fecha.replace("T", " ")}</td>
                  <td>
                    <span className={`${styles.chip} ${styles[c.estado]}`}>
                      {statusLabel[c.estado]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.action}
                        onClick={() => confirm(c.id)}
                        disabled={c.estado === "confirmada"}
                      >
                        {t("confirm")}
                      </button>
                      <button
                        type="button"
                        className={styles.action}
                        onClick={() => cancel(c.id)}
                        disabled={c.estado === "cancelada"}
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={styles.h2}>{t("productsTitle")}</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("colName")}</th>
                <th>{t("colCategory")}</th>
                <th>{t("colPrice")}</th>
                <th>{t("colStock")}</th>
                <th>{t("colActive")}</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td className={styles.date}>{formatPrice(p.price)}</td>
                  <td className={styles.date}>{p.stock}</td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.active}
                      className={styles.switch}
                      onClick={() => toggleActive(p.id)}
                    >
                      {p.active ? "ON" : "OFF"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={styles.h2}>{t("settingsTitle")}</h2>
        <AdminControls />
      </Container>
    </main>
  );
}
