"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import admin from "@/app/[locale]/admin/admin.module.scss";
import { SITE } from "@/config/site";
import { type Locale, type MenuDelDia, menuDelDiaDefault, TABLES } from "@/data/restaurante";
import type { MesaEstado } from "@/lib/mesas";
import { useMesasStore } from "@/store/useMesasStore";
import { formatLongDate } from "./ReservaMesaForm";
import QrCode from "./QrCode";
import styles from "./restaurante.module.scss";

type MenuForm = Omit<MenuDelDia, "price"> & { price: string };

function toForm(m: MenuDelDia): MenuForm {
  return { ...m, price: String(m.price).replace(".", ",") };
}

/** Restaurant section of /admin: table bookings, menú del día editor, QR per table. */
export default function AdminRestaurante() {
  const t = useTranslations("restaurante");
  const ta = useTranslations("admin");
  const locale = useLocale() as Locale;
  const reservas = useMesasStore((s) => s.reservas);
  const confirm = useMesasStore((s) => s.confirm);
  const cancel = useMesasStore((s) => s.cancel);
  const stored = useMesasStore((s) => s.menuDelDia);
  const setMenuDelDia = useMesasStore((s) => s.setMenuDelDia);

  const fallback = menuDelDiaDefault[locale] ?? menuDelDiaDefault.es;
  const [form, setForm] = useState<MenuForm>(() => toForm(stored ?? fallback));
  const [menuStatus, setMenuStatus] = useState<"idle" | "saved" | "error">("idle");

  // QR targets this deployment (localhost in dev, the real domain in prod).
  const [origin, setOrigin] = useState(SITE.url);
  useEffect(() => setOrigin(window.location.origin), []);
  const base = `${origin}${locale === "es" ? "" : `/${locale}`}/restaurante/carta?mesa=`;

  const sorted = useMemo(
    () => [...reservas].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [reservas],
  );

  const statusLabel: Record<MesaEstado, string> = {
    pendiente: ta("statusPendiente"),
    confirmada: ta("statusConfirmada"),
    cancelada: ta("statusCancelada"),
  };

  function update<K extends keyof MenuForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setMenuStatus("idle");
  }

  function saveMenu(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price.replace(",", "."));
    const texts = [form.title, form.starter, form.main, form.dessert].map((s) => s.trim());
    if (texts.some((s) => !s) || !Number.isFinite(price) || price <= 0) {
      setMenuStatus("error");
      return;
    }
    const [title, starter, main, dessert] = texts;
    setMenuDelDia({ title, starter, main, dessert, price: Math.round(price * 100) / 100 });
    setMenuStatus("saved");
  }

  function resetMenu() {
    setMenuDelDia(null);
    setForm(toForm(fallback));
    setMenuStatus("idle");
  }

  return (
    <section aria-labelledby="admin-restaurante">
      <h2 id="admin-restaurante" className={admin.h2}>
        {t("adminTitle")}
      </h2>

      <h3 className={styles.panelTitle}>{t("adminReservas")}</h3>
      <div className={`${admin.tableWrap} ${styles.spaceTop}`}>
        <table className={admin.table}>
          <thead>
            <tr>
              <th>{t("colWhen")}</th>
              <th>{t("colGuests")}</th>
              <th>{t("colName")}</th>
              <th>{t("colPhone")}</th>
              <th>{t("colNotes")}</th>
              <th>{ta("colStatus")}</th>
              <th>{ta("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7}>{t("noReservas")}</td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr key={r.id}>
                  <td>
                    {formatLongDate(r.date, locale)}{" "}
                    <span className={admin.date}>{r.time}</span>
                  </td>
                  <td className={admin.date}>{r.guests}</td>
                  <td>{r.name}</td>
                  <td className={admin.date}>{r.phone}</td>
                  <td>{r.notes}</td>
                  <td>
                    <span className={`${admin.chip} ${admin[r.estado]}`}>{statusLabel[r.estado]}</span>
                  </td>
                  <td>
                    <div className={admin.actions}>
                      <button
                        type="button"
                        className={admin.action}
                        onClick={() => confirm(r.id)}
                        disabled={r.estado === "confirmada"}
                        aria-label={`${ta("confirm")}: ${r.name}, ${r.time}`}
                      >
                        {ta("confirm")}
                      </button>
                      <button
                        type="button"
                        className={admin.action}
                        onClick={() => cancel(r.id)}
                        disabled={r.estado === "cancelada"}
                        aria-label={`${ta("cancel")}: ${r.name}, ${r.time}`}
                      >
                        {ta("cancel")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`${styles.adminGrid} ${styles.spaceTopLg}`}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>{t("menuEditor")}</h3>
          <p className={styles.hint}>{t("menuEditorHint")}</p>
          <form className={styles.menuForm} onSubmit={saveMenu} noValidate>
            <Field label={t("fieldTitle")} htmlFor="menu-title">
              <Input
                id="menu-title"
                className={styles.field}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </Field>
            <Field label={t("menuStarter")} htmlFor="menu-starter">
              <Input
                id="menu-starter"
                className={styles.field}
                value={form.starter}
                onChange={(e) => update("starter", e.target.value)}
              />
            </Field>
            <Field label={t("menuMain")} htmlFor="menu-main">
              <Input
                id="menu-main"
                className={styles.field}
                value={form.main}
                onChange={(e) => update("main", e.target.value)}
              />
            </Field>
            <Field label={t("menuDessert")} htmlFor="menu-dessert">
              <Input
                id="menu-dessert"
                className={styles.field}
                value={form.dessert}
                onChange={(e) => update("dessert", e.target.value)}
              />
            </Field>
            <Field label={t("fieldPrice")} htmlFor="menu-price">
              <Input
                id="menu-price"
                className={styles.field}
                inputMode="decimal"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </Field>
            <p className={menuStatus === "error" ? styles.fieldError : styles.status} role="status">
              {menuStatus === "saved" ? t("saved") : menuStatus === "error" ? t("menuError") : ""}
            </p>
            <div className={styles.actions}>
              <Button type="submit">{t("save")}</Button>
              <Button type="button" variant="ghost" onClick={resetMenu}>
                {t("resetMenu")}
              </Button>
            </div>
          </form>
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>{t("qrTitle")}</h3>
          <p className={styles.hint}>{t("qrHint")}</p>
          <ul className={styles.qrGrid}>
            {TABLES.map((n) => (
              <li key={n} className={styles.qrCard}>
                <QrCode value={`${base}${n}`} label={t("qrAlt", { n })} />
                <span className={styles.qrLabel}>{t("mesaBanner", { n })}</span>
                <a
                  className={styles.textLink}
                  href={`${base}${n}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("ctaCarta")}
                  <span className={styles.srOnly}> ({t("mesaBanner", { n })})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
