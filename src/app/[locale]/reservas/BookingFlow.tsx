"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import Section from "@/components/ui/Section/Section";
import type { Cita } from "@/data/citas";
import { availableSlots, BOOKABLE_SERVICES, BOOKING_DATES } from "@/data/reservas";
import { useCitasStore } from "@/store/useCitasStore";
import styles from "./reservas.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.?[^\s@]*$/;

export default function BookingFlow() {
  const t = useTranslations("reservas");
  const citas = useCitasStore((s) => s.citas);
  const book = useCitasStore((s) => s.book);

  const [service, setService] = useState(BOOKABLE_SERVICES[0]);
  const [date, setDate] = useState(BOOKING_DATES[0]);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Cita | null>(null);

  const slots = useMemo(() => availableSlots(citas, date), [citas, date]);

  // Preselect the first free slot (and re-pick when the day changes) so the
  // form is submittable without the user hunting for the required hour.
  useEffect(() => {
    setTime((current) => (current && slots.includes(current) ? current : (slots[0] ?? "")));
  }, [slots]);

  function reset() {
    setConfirmed(null);
    setService(BOOKABLE_SERVICES[0]);
    setDate(BOOKING_DATES[0]);
    setTime("");
    setName("");
    setEmail("");
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email) || !time) {
      setError(t("errorFields"));
      return;
    }
    const cita = book({ cliente: name.trim(), servicio: service, fecha: `${date}T${time}` });
    setConfirmed(cita);
  }

  if (confirmed) {
    return (
      <Section>
        <Container className={styles.confirmWrap}>
          <h1 className={styles.title}>{t("confirmedTitle")}</h1>
          <p className={styles.intro}>{t("confirmedText")}</p>
          <dl className={styles.summary}>
            <div>
              <dt>{t("service")}</dt>
              <dd>{confirmed.servicio}</dd>
            </div>
            <div>
              <dt>{t("date")}</dt>
              <dd className={styles.mono}>{confirmed.fecha.slice(0, 10)}</dd>
            </div>
            <div>
              <dt>{t("time")}</dt>
              <dd className={styles.mono}>{confirmed.fecha.slice(11, 16)}</dd>
            </div>
            <div>
              <dt>{t("name")}</dt>
              <dd>{confirmed.cliente}</dd>
            </div>
          </dl>
          <Button variant="outline" onClick={reset}>
            {t("another")}
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className={styles.wrap}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.intro}>{t("intro")}</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <Field label={t("service")} htmlFor="service">
            <select
              id="service"
              className={styles.select}
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {BOOKABLE_SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("date")} htmlFor="date">
            <select
              id="date"
              className={styles.select}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
            >
              {BOOKING_DATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("time")} htmlFor="time">
            {slots.length === 0 ? (
              <p className={styles.noSlots}>{t("noSlots")}</p>
            ) : (
              <div className={styles.slots}>
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.slot} ${time === s ? styles.slotActive : ""}`}
                    aria-pressed={time === s}
                    onClick={() => setTime(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </Field>

          <Field label={t("name")} htmlFor="name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t("email")} htmlFor="email" error={error ?? undefined}>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>

          <Button type="submit" disabled={slots.length === 0}>
            {t("submit")}
          </Button>
        </form>
      </Container>
    </Section>
  );
}
