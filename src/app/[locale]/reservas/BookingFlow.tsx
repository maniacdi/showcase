"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Avatar from "@/components/clinica/Avatar";
import ReminderPreview from "@/components/clinica/ReminderPreview";
import { formatDayLong, formatDayShort, formatWeekday, workingDaysLabel } from "@/components/clinica/format";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import Section from "@/components/ui/Section/Section";
import type { Cita } from "@/data/citas";
import { CLINICA_DIAS, PROFESIONALES, SERVICIOS_CLINICA, type ServicioId } from "@/data/clinica";
import { DEFAULT_DURACION, slotsFor, worksOn, type SlotAsignado } from "@/lib/agenda";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { type BookingErrors, validateBooking } from "@/lib/validation";
import { rehydrateCitas, useCitasStore } from "@/store/useCitasStore";
import styles from "./reservas.module.scss";

const ANY = "any";
const STEP_KEYS = ["stepService", "stepPro", "stepDay", "stepTime", "stepDetails"] as const;
type View = "flow" | "confirmed" | "manage" | "cancelled" | "notFound";

function servicioIdOf(nombre: string): ServicioId {
  return SERVICIOS_CLINICA.find((s) => s.nombre === nombre)?.id ?? SERVICIOS_CLINICA[0].id;
}

export default function BookingFlow() {
  const t = useTranslations("reservas");
  const tc = useTranslations("clinica");
  const locale = useLocale();
  const citas = useCitasStore((s) => s.citas);
  const book = useCitasStore((s) => s.book);
  const cancel = useCitasStore((s) => s.cancel);

  const [view, setView] = useState<View>("flow");
  const [step, setStep] = useState(0);
  const [servicio, setServicio] = useState<ServicioId>(SERVICIOS_CLINICA[0].id);
  const [proChoice, setProChoice] = useState<string>(ANY);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<SlotAsignado | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<BookingErrors>({});
  const [citaId, setCitaId] = useState<string | null>(null);
  const [rescheduleOf, setRescheduleOf] = useState<Cita | null>(null);
  const [basePath, setBasePath] = useState("/reservas");

  const panelRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const cita = citaId ? (citas.find((c) => c.id === citaId) ?? null) : null;

  // Session persistence + deep link (?cita=ID from the reminder / manage link).
  const syncFromUrl = useCallback(() => {
    const id = new URLSearchParams(window.location.search).get("cita");
    if (!id) {
      setView((v) => (v === "manage" || v === "notFound" ? "flow" : v));
      return;
    }
    const found = useCitasStore.getState().citas.find((c) => c.id === id);
    setCitaId(id);
    setView(found ? "manage" : "notFound");
  }, []);

  useEffect(() => {
    setBasePath(window.location.pathname);
    rehydrateCitas().then(syncFromUrl);
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [syncFromUrl]);

  // Move focus to the new step/view so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (!moved.current) return;
    panelRef.current?.focus();
  }, [step, view]);

  function go(next: number) {
    moved.current = true;
    setStep(next);
  }
  function show(next: View) {
    moved.current = true;
    setView(next);
  }

  // Availability ignores the cita being rescheduled: its own slot stays choosable.
  const busyCitas = useMemo(
    () => (rescheduleOf ? citas.filter((c) => c.id !== rescheduleOf.id) : citas),
    [citas, rescheduleOf],
  );
  const pros = useMemo(() => PROFESIONALES.filter((p) => p.servicios[servicio]), [servicio]);
  const proId = proChoice === ANY ? null : proChoice;
  const selectedPro = PROFESIONALES.find((p) => p.id === proId) ?? null;

  const days = useMemo(
    () =>
      CLINICA_DIAS.map((d) => {
        const off = selectedPro ? !worksOn(selectedPro, d) : !pros.some((p) => worksOn(p, d));
        return { date: d, off, slots: off ? [] : slotsFor(PROFESIONALES, proId, servicio, d, busyCitas) };
      }),
    [selectedPro, pros, proId, servicio, busyCitas],
  );
  const slots = useMemo(() => days.find((d) => d.date === date)?.slots ?? [], [days, date]);

  // Drop a chosen time that is no longer free (another booking, a cancel elsewhere).
  // With "anyone", keep the assigned professional in sync with the current load.
  useEffect(() => {
    if (!slot) return;
    const match = slots.find((s) => s.time === slot.time) ?? null;
    if (match?.profesionalId !== slot.profesionalId) setSlot(match);
  }, [slots, slot]);

  const durationOf = (pid: string) => PROFESIONALES.find((p) => p.id === pid)?.servicios[servicio] ?? DEFAULT_DURACION;
  const proName = (pid?: string) => PROFESIONALES.find((p) => p.id === pid)?.nombre ?? "";
  const serviceLabel = (nombre: string) => tc(`services.${servicioIdOf(nombre)}`);

  function chooseService(id: ServicioId) {
    setServicio(id);
    if (selectedPro && !selectedPro.servicios[id]) setProChoice(ANY);
    setDate(null);
    setSlot(null);
  }
  function choosePro(id: string) {
    setProChoice(id);
    setDate(null);
    setSlot(null);
  }

  function resetFlow() {
    setStep(0);
    setServicio(SERVICIOS_CLINICA[0].id);
    setProChoice(ANY);
    setDate(null);
    setSlot(null);
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
    setRescheduleOf(null);
    setCitaId(null);
  }

  function clearUrl() {
    if (window.location.search) window.history.replaceState(null, "", basePath);
  }

  const manageHref = (id: string) => `${basePath}?cita=${encodeURIComponent(id)}`;
  function openManage(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    window.history.pushState(null, "", manageHref(id));
    setCitaId(id);
    show("manage");
  }

  const canContinue = [true, true, !!date && slots.length > 0, !!slot, true][step];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEP_KEYS.length - 1) {
      if (canContinue) go(step + 1);
      return;
    }
    const errs = validateBooking({ name, email, phone });
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !slot || !date) return;
    const nombre = SERVICIOS_CLINICA.find((s) => s.id === servicio)!.nombre;
    const created = book({
      cliente: name.trim(),
      servicio: nombre,
      fecha: `${date}T${slot.time}`,
      profesionalId: slot.profesionalId,
      duracion: durationOf(slot.profesionalId),
      telefono: phone.trim(),
    });
    if (rescheduleOf) cancel(rescheduleOf.id);
    setRescheduleOf(null);
    setCitaId(created.id);
    clearUrl();
    show("confirmed");
  }

  function startReschedule(c: Cita) {
    resetFlow();
    setRescheduleOf(c);
    setServicio(servicioIdOf(c.servicio));
    setProChoice(c.profesionalId ?? ANY);
    setName(c.cliente);
    setPhone(c.telefono ?? "");
    setStep(2);
    clearUrl();
    show("flow");
  }

  function addToCalendar(c: Cita) {
    const url = `${window.location.origin}${manageHref(c.id)}`;
    const ics = buildIcs({
      uid: `${c.id}-${c.fecha.replace(/\D/g, "")}@showcase-demo`,
      start: c.fecha,
      durationMin: c.duracion ?? DEFAULT_DURACION,
      summary: `${serviceLabel(c.servicio)} (${proName(c.profesionalId)})`,
      description: tc("icsDescription", { url }),
    });
    downloadIcs(`cita-${c.fecha.slice(0, 10)}.ics`, ics);
  }

  function summaryList(c: Cita) {
    return (
      <dl className={styles.summary}>
        <div>
          <dt>{t("service")}</dt>
          <dd>{serviceLabel(c.servicio)}</dd>
        </div>
        {c.profesionalId ? (
          <div>
            <dt>{tc("professional")}</dt>
            <dd>{proName(c.profesionalId)}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t("date")}</dt>
          <dd>{formatDayLong(c.fecha.slice(0, 10), locale)}</dd>
        </div>
        <div>
          <dt>{t("time")}</dt>
          <dd className={styles.mono}>{c.fecha.slice(11, 16)}</dd>
        </div>
        <div>
          <dt>{tc("duration")}</dt>
          <dd className={styles.mono}>{tc("minutes", { min: c.duracion ?? DEFAULT_DURACION })}</dd>
        </div>
        <div>
          <dt>{t("name")}</dt>
          <dd>{c.cliente}</dd>
        </div>
      </dl>
    );
  }

  /* ---------------- Confirmation + reminder ---------------- */
  if (view === "confirmed" && cita) {
    return (
      <Section>
        <Container className={styles.confirmWrap}>
          <div ref={panelRef} tabIndex={-1} className={styles.panelFocus}>
            <h1 className={styles.title}>{t("confirmedTitle")}</h1>
            <p className={styles.intro}>{tc("confirmedText")}</p>
          </div>
          {summaryList(cita)}

          <h2 className={styles.h2}>{tc("reminderTitle")}</h2>
          <p className={styles.note}>{tc("reminderIntro")}</p>
          <ReminderPreview
            cita={cita}
            serviceLabel={serviceLabel(cita.servicio)}
            proName={proName(cita.profesionalId)}
            manageHref={manageHref(cita.id)}
            onManage={(e) => openManage(e, cita.id)}
          />

          <div className={styles.actions}>
            <Button onClick={() => addToCalendar(cita)}>{tc("addToCalendar")}</Button>
            <Button variant="outline" as="a" href={manageHref(cita.id)} onClick={(e) => openManage(e, cita.id)}>
              {tc("manageLink")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                resetFlow();
                show("flow");
              }}
            >
              {t("another")}
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  /* ---------------- Manage (cancel / change) ---------------- */
  if (view === "manage" || view === "notFound" || view === "cancelled") {
    const cancelled = cita?.estado === "cancelada";
    return (
      <Section>
        <Container className={styles.confirmWrap}>
          <div ref={panelRef} tabIndex={-1} className={styles.panelFocus}>
            <h1 className={styles.title}>{view === "cancelled" ? tc("cancelledTitle") : tc("manageTitle")}</h1>
            <p className={styles.intro} role={view === "cancelled" ? "status" : undefined}>
              {view === "notFound" || !cita
                ? tc("notFound")
                : view === "cancelled"
                  ? tc("cancelledText")
                  : cancelled
                    ? tc("alreadyCancelled")
                    : tc("manageIntro")}
            </p>
          </div>
          {cita && view !== "notFound" ? summaryList(cita) : null}
          <div className={styles.actions}>
            {cita && view === "manage" && !cancelled ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    cancel(cita.id);
                    clearUrl();
                    show("cancelled");
                  }}
                >
                  {tc("cancelCita")}
                </Button>
                <Button variant="outline" onClick={() => startReschedule(cita)}>
                  {tc("changeCita")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    clearUrl();
                    show("confirmed");
                  }}
                >
                  {tc("keepCita")}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  clearUrl();
                  resetFlow();
                  show("flow");
                }}
              >
                {t("another")}
              </Button>
            )}
          </div>
        </Container>
      </Section>
    );
  }

  /* ---------------- Booking steps ---------------- */
  const stepLabel = (i: number) => tc(STEP_KEYS[i]);

  return (
    <Section>
      <Container className={styles.flowWrap}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.intro}>{tc("intro")}</p>

        {rescheduleOf ? (
          <p className={styles.notice}>
            {tc("rescheduling", {
              date: formatDayLong(rescheduleOf.fecha.slice(0, 10), locale),
              time: rescheduleOf.fecha.slice(11, 16),
            })}
          </p>
        ) : null}

        <nav aria-label={tc("stepsLabel")} className={styles.stepsNav}>
          <p className={styles.stepOf}>{tc("stepOf", { current: step + 1, total: STEP_KEYS.length })}</p>
          <ol className={styles.steps}>
            {STEP_KEYS.map((key, i) => (
              <li
                key={key}
                className={`${styles.stepItem} ${i === step ? styles.stepCurrent : ""} ${i < step ? styles.stepDone : ""}`}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? (
                  <button
                    type="button"
                    className={styles.stepBtn}
                    aria-label={tc("editStep", { step: stepLabel(i), n: i + 1 })}
                    onClick={() => go(i)}
                  >
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span>{stepLabel(i)}</span>
                  </button>
                ) : (
                  <span className={styles.stepBtn}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span>{stepLabel(i)}</span>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div ref={panelRef} tabIndex={-1} className={styles.panelFocus}>
            {step === 0 ? (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{tc("legendService")}</legend>
                <div className={styles.options}>
                  {SERVICIOS_CLINICA.map((s) => {
                    const durations = PROFESIONALES.map((p) => p.servicios[s.id]).filter(
                      (n): n is number => !!n,
                    );
                    const min = Math.min(...durations);
                    const max = Math.max(...durations);
                    return (
                      <label key={s.id} className={styles.option}>
                        <input
                          type="radio"
                          name="servicio"
                          className={styles.radio}
                          value={s.id}
                          checked={servicio === s.id}
                          onChange={() => chooseService(s.id)}
                        />
                        <span className={styles.optionText}>
                          <span className={styles.optionTitle}>{tc(`services.${s.id}`)}</span>
                          <span className={styles.optionMeta}>
                            {min === max ? tc("minutes", { min }) : tc("minutesRange", { min, max })}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{tc("legendPro")}</legend>
                <div className={styles.options}>
                  <label className={styles.option}>
                    <input
                      type="radio"
                      name="profesional"
                      className={styles.radio}
                      value={ANY}
                      checked={proChoice === ANY}
                      onChange={() => choosePro(ANY)}
                    />
                    <span className={styles.optionText}>
                      <span className={styles.optionTitle}>{tc("anyPro")}</span>
                      <span className={styles.optionMeta}>{tc("anyProHint")}</span>
                    </span>
                  </label>
                  {pros.map((p) => (
                    <label key={p.id} className={styles.option}>
                      <input
                        type="radio"
                        name="profesional"
                        className={styles.radio}
                        value={p.id}
                        checked={proChoice === p.id}
                        onChange={() => choosePro(p.id)}
                      />
                      <Avatar name={p.nombre} />
                      <span className={styles.optionText}>
                        <span className={styles.optionTitle}>{p.nombre}</span>
                        <span className={styles.optionMeta}>{tc(`specialties.${p.especialidad}`)}</span>
                        <span className={styles.optionMeta}>
                          {tc("worksDays", { days: workingDaysLabel(p, locale) })}
                        </span>
                        <span className={`${styles.optionMeta} ${styles.mono}`}>
                          {tc("minutes", { min: p.servicios[servicio] ?? DEFAULT_DURACION })}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{tc("legendDay")}</legend>
                <div className={styles.days}>
                  {days.map((d) => {
                    const disabled = d.off || d.slots.length === 0;
                    return (
                      <label
                        key={d.date}
                        className={`${styles.option} ${styles.day} ${disabled ? styles.optionDisabled : ""}`}
                      >
                        <input
                          type="radio"
                          name="dia"
                          className={styles.radio}
                          value={d.date}
                          checked={date === d.date}
                          disabled={disabled}
                          onChange={() => {
                            setDate(d.date);
                            setSlot(null);
                          }}
                        />
                        <span className={styles.optionText}>
                          <span className={styles.optionTitle}>
                            <span className={styles.weekday}>{formatWeekday(d.date, locale)}</span>{" "}
                            {formatDayShort(d.date, locale)}
                          </span>
                          <span className={styles.optionMeta}>
                            {d.off
                              ? tc("dayOff")
                              : d.slots.length === 0
                                ? tc("dayFull")
                                : tc("freeCount", { count: d.slots.length })}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            {step === 3 ? (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{tc("legendTime")}</legend>
                {date ? <p className={styles.note}>{formatDayLong(date, locale)}</p> : null}
                {slots.length === 0 ? (
                  <p className={styles.noSlots}>{tc("noSlots")}</p>
                ) : (
                  <div className={styles.times}>
                    {slots.map((s) => (
                      <label key={s.time} className={`${styles.option} ${styles.timeOption}`}>
                        <input
                          type="radio"
                          name="hora"
                          className={styles.radio}
                          value={s.time}
                          checked={slot?.time === s.time}
                          onChange={() => setSlot(s)}
                        />
                        <span className={styles.mono}>{s.time}</span>
                      </label>
                    ))}
                  </div>
                )}
                {slot ? (
                  <p className={styles.assigned} role="status">
                    <Avatar name={proName(slot.profesionalId)} size="s" />
                    {tc("assigned", { name: proName(slot.profesionalId) })}
                  </p>
                ) : null}
              </fieldset>
            ) : null}

            {step === 4 ? (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>{tc("legendDetails")}</legend>
                {slot && date ? (
                  <dl className={styles.summary}>
                    <div>
                      <dt>{t("service")}</dt>
                      <dd>{tc(`services.${servicio}`)}</dd>
                    </div>
                    <div>
                      <dt>{tc("professional")}</dt>
                      <dd>{proName(slot.profesionalId)}</dd>
                    </div>
                    <div>
                      <dt>{t("date")}</dt>
                      <dd>
                        {formatDayLong(date, locale)}, <span className={styles.mono}>{slot.time}</span>
                      </dd>
                    </div>
                  </dl>
                ) : null}
                <div className={styles.fields}>
                  <Field label={t("name")} htmlFor="name" error={errors.name ? tc("errorName") : undefined}>
                    <Input
                      id="name"
                      autoComplete="name"
                      value={name}
                      aria-invalid={!!errors.name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <Field label={t("email")} htmlFor="email" error={errors.email ? tc("errorEmail") : undefined}>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      aria-invalid={!!errors.email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field label={tc("phone")} htmlFor="phone" error={errors.phone ? tc("errorPhone") : undefined}>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      aria-invalid={!!errors.phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>
                </div>
              </fieldset>
            ) : null}
          </div>

          <div className={styles.nav}>
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => go(step - 1)}>
                {tc("back")}
              </Button>
            ) : null}
            <Button type="submit" disabled={!canContinue}>
              {step === STEP_KEYS.length - 1 ? t("submit") : tc("next")}
            </Button>
          </div>
        </form>
      </Container>
    </Section>
  );
}
