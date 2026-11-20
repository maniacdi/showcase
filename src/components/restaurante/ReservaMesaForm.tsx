"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";
import btn from "@/components/ui/Button/Button.module.scss";
import {
  MAX_GUESTS,
  MIN_GUESTS,
  type MesaErrors,
  type MesaReserva,
  slotsFor,
  toIsoDate,
  type Turno,
  turnosFor,
  validateMesa,
} from "@/lib/mesas";
import { useMesasStore } from "@/store/useMesasStore";
import styles from "./restaurante.module.scss";

const GUEST_OPTIONS = Array.from({ length: MAX_GUESTS - MIN_GUESTS + 1 }, (_, i) => i + MIN_GUESTS);

export function formatLongDate(date: string, locale: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default function ReservaMesaForm() {
  const t = useTranslations("restaurante");
  const locale = useLocale();
  const reservas = useMesasStore((s) => s.reservas);
  const book = useMesasStore((s) => s.book);

  // "Today" comes from the browser after mount (no server/client date mismatch).
  const [today, setToday] = useState("");
  useEffect(() => setToday(toIsoDate(new Date())), []);

  const [date, setDate] = useState("");
  const [turno, setTurno] = useState<Turno>("comida");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<MesaErrors>({});
  const [confirmed, setConfirmed] = useState<MesaReserva | null>(null);
  const confirmRef = useRef<HTMLHeadingElement>(null);

  const turnos = useMemo(() => turnosFor(date), [date]);
  const slots = useMemo(() => slotsFor(reservas, date, turno, guests), [reservas, date, turno, guests]);
  const anyFree = slots.some((s) => s.available);

  // Keep turno/time consistent when the day or party size changes.
  useEffect(() => {
    if (turnos.length > 0 && !turnos.includes(turno)) setTurno(turnos[0]);
  }, [turnos, turno]);
  useEffect(() => {
    if (time && !slots.some((s) => s.time === time && s.available)) setTime("");
  }, [slots, time]);

  useEffect(() => {
    if (confirmed) confirmRef.current?.focus();
  }, [confirmed]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateMesa({ date, turno, time, guests, name, phone }, today);
    if (time && !slots.some((s) => s.time === time && s.available)) next.time = "required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setConfirmed(
      book({ date, turno, time, guests, name: name.trim(), phone: phone.trim(), notes: notes.trim() }),
    );
  }

  function reset() {
    setConfirmed(null);
    setDate("");
    setTime("");
    setGuests(2);
    setName("");
    setPhone("");
    setNotes("");
    setErrors({});
  }

  const err = (field: keyof MesaErrors) => {
    const code = errors[field];
    if (!code) return undefined;
    return code === "closed" ? t("errors.closed") : t(`errors.${field}`);
  };

  if (confirmed) {
    return (
      <div className={styles.confirmWrap}>
        <h1 ref={confirmRef} tabIndex={-1} className={styles.pageTitle}>
          {t("confirmedTitle")}
        </h1>
        <p className={styles.lead}>{t("confirmedText")}</p>
        <dl className={styles.summary}>
          <div>
            <dt>{t("date")}</dt>
            <dd>{formatLongDate(confirmed.date, locale)}</dd>
          </div>
          <div>
            <dt>{t("time")}</dt>
            <dd className={styles.mono}>{confirmed.time}</dd>
          </div>
          <div>
            <dt>{t("guests")}</dt>
            <dd>{confirmed.guests}</dd>
          </div>
          <div>
            <dt>{t("name")}</dt>
            <dd>{confirmed.name}</dd>
          </div>
        </dl>
        <div className={styles.actions}>
          <Button variant="outline" onClick={reset}>
            {t("another")}
          </Button>
          <Link href="/restaurante/carta" className={`${btn.btn} ${btn.ghost}`} data-variant="ghost">
            {t("ctaCarta")}
          </Link>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={styles.formWrap}>
      <h1 className={styles.pageTitle}>{t("reservarTitle")}</h1>
      <p className={styles.lead}>{t("reservarIntro")}</p>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.row}>
          <Field label={t("date")} htmlFor="mesa-date" error={err("date")}>
            <input
              id="mesa-date"
              type="date"
              className={styles.dateInput}
              min={today || undefined}
              value={date}
              aria-invalid={errors.date ? true : undefined}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label={t("guests")} htmlFor="mesa-guests" error={err("guests")}>
            <select
              id="mesa-guests"
              className={styles.select}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            >
              {GUEST_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className={styles.hint}>{t("groupNote")}</p>

        {!date ? (
          <p className={styles.hint}>{t("pickDate")}</p>
        ) : turnos.length === 0 ? (
          <p className={styles.formError} role="status">
            {t("closedDay")}
          </p>
        ) : (
          <>
            <fieldset className={styles.filterGroup}>
              <legend className={styles.filterLegend}>{t("turno")}</legend>
              <div className={styles.segmented}>
                {turnos.map((tu) => (
                  <button
                    key={tu}
                    type="button"
                    className={styles.chip}
                    aria-pressed={turno === tu}
                    onClick={() => setTurno(tu)}
                  >
                    {tu === "comida" ? t("turnoComida") : t("turnoCena")}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className={styles.filterGroup}>
              <legend className={styles.filterLegend}>{t("time")}</legend>
              {anyFree ? (
                <div className={styles.slots}>
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      className={styles.slot}
                      aria-pressed={time === s.time}
                      disabled={!s.available}
                      onClick={() => setTime(s.time)}
                    >
                      <span className={styles.slotTime}>{s.time}</span>
                      <span className={styles.slotLeft}>
                        {s.left === 0 ? t("full") : t("left", { n: s.left })}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.hint} role="status">
                  {t("noSlots", { n: guests })}
                </p>
              )}
              {err("time") ? (
                <span className={styles.fieldError} role="alert">
                  {err("time")}
                </span>
              ) : null}
              <span className={`${styles.sampleNote} ${styles.legendNote}`}>
                {t("occupancyNote")}
              </span>
            </fieldset>
          </>
        )}

        <div className={styles.row}>
          <Field label={t("name")} htmlFor="mesa-name" error={err("name")}>
            <Input
              id="mesa-name"
              className={styles.field}
              autoComplete="name"
              value={name}
              aria-invalid={errors.name ? true : undefined}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label={t("phone")} htmlFor="mesa-phone" error={err("phone")}>
            <Input
              id="mesa-phone"
              type="tel"
              inputMode="tel"
              className={styles.field}
              autoComplete="tel"
              value={phone}
              aria-invalid={errors.phone ? true : undefined}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
        </div>
        <Field label={t("notes")} htmlFor="mesa-notes">
          <Textarea
            id="mesa-notes"
            className={styles.field}
            rows={3}
            placeholder={t("notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        {hasErrors ? (
          <p className={styles.formError} role="alert">
            {t("errorSummary")}
          </p>
        ) : null}

        <Button type="submit">{t("submit")}</Button>
      </form>
    </div>
  );
}
