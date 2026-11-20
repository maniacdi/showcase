"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Cita, CitaEstado } from "@/data/citas";
import { AGENDA_HOY, HISTORIAL_EJEMPLO, PROFESIONALES, SERVICIOS_CLINICA } from "@/data/clinica";
import {
  addDays,
  DEFAULT_DURACION,
  fromMinutes,
  noShowRate,
  startOfWeek,
  toMinutes,
  weekdayOf,
} from "@/lib/agenda";
import { rehydrateCitas, useCitasStore, type Asistencia } from "@/store/useCitasStore";
import Avatar from "./Avatar";
import { formatDayLong, formatDayShort, formatPercent, formatWeekday } from "./format";
import shared from "./clinica.module.scss";
import styles from "./AdminAgenda.module.scss";

type ViewMode = "day" | "week";
const ALL = "all";

/**
 * Admin "Agenda": day/week view per professional, attendance marking and the
 * no-show rate for the last 30 days (sample history + this session's marks).
 */
export default function AdminAgenda() {
  const t = useTranslations("clinica");
  const ta = useTranslations("clinica.agenda");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const citas = useCitasStore((s) => s.citas);
  const markAttendance = useCitasStore((s) => s.markAttendance);

  const [mode, setMode] = useState<ViewMode>("day");
  const [date, setDate] = useState(AGENDA_HOY);
  const [proFilter, setProFilter] = useState(ALL);

  useEffect(() => {
    void rehydrateCitas();
  }, []);

  const all = useMemo(() => [...HISTORIAL_EJEMPLO, ...citas], [citas]);
  const sampleIds = useMemo(() => new Set(HISTORIAL_EJEMPLO.map((c) => c.id)), []);
  const pros = proFilter === ALL ? PROFESIONALES : PROFESIONALES.filter((p) => p.id === proFilter);

  const statusLabel: Record<CitaEstado, string> = {
    pendiente: tAdmin("statusPendiente"),
    confirmada: tAdmin("statusConfirmada"),
    cancelada: tAdmin("statusCancelada"),
    asistio: tAdmin("statusAsistio"),
    no_presentado: tAdmin("statusNoPresentado"),
  };

  const citasOf = (proId: string, day: string) =>
    all
      .filter((c) => c.profesionalId === proId && c.fecha.startsWith(day))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const serviceLabel = (nombre: string) => {
    const s = SERVICIOS_CLINICA.find((x) => x.nombre === nombre);
    return s ? t(`services.${s.id}`) : nombre;
  };

  const weekStart = startOfWeek(date);
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)); // Mon–Sat
  const stepDays = mode === "day" ? 1 : 7;

  const stats = noShowRate(all, AGENDA_HOY, 30, proFilter === ALL ? undefined : proFilter);
  const byPro = PROFESIONALES.map((p) => ({ p, s: noShowRate(all, AGENDA_HOY, 30, p.id) }));

  function toggle(c: Cita, value: Asistencia) {
    markAttendance(c.id, c.estado === value ? null : value);
  }

  function renderCita(c: Cita) {
    const start = c.fecha.slice(11, 16);
    const end = fromMinutes(toMinutes(start) + (c.duracion ?? DEFAULT_DURACION));
    const isSample = sampleIds.has(c.id);
    const markable = !isSample && c.estado !== "cancelada" && c.fecha.slice(0, 10) <= AGENDA_HOY;
    return (
      <li key={c.id} className={styles.cita}>
        <div className={styles.citaHead}>
          <span className={styles.time}>{ta("timeRange", { start, end })}</span>
          <span className={`${shared.chip} ${shared[c.estado]}`}>{statusLabel[c.estado]}</span>
        </div>
        <p className={styles.client}>{c.cliente}</p>
        <p className={styles.service}>{serviceLabel(c.servicio)}</p>
        {markable ? (
          <div className={styles.marks} role="group" aria-label={`${c.cliente}, ${start}`}>
            {(["asistio", "no_presentado"] as const).map((value) => {
              const action = value === "asistio" ? ta("markAttended") : ta("markNoShow");
              return (
                <button
                  key={value}
                  type="button"
                  className={`${styles.mark} ${value === "no_presentado" ? styles.markNoShow : ""}`}
                  aria-pressed={c.estado === value}
                  aria-label={ta("markLabel", { action, client: c.cliente, time: start })}
                  onClick={() => toggle(c, value)}
                >
                  {action}
                </button>
              );
            })}
          </div>
        ) : null}
      </li>
    );
  }

  const periodLabel =
    mode === "day"
      ? formatDayLong(date, locale)
      : ta("weekOf", { date: formatDayShort(weekStart, locale) });

  return (
    <section className={styles.agenda} aria-labelledby="agenda-title">
      <div className={styles.titleRow}>
        <h2 id="agenda-title" className={styles.h2}>
          {ta("title")}
        </h2>
        <span className={shared.tag}>{t("sampleData")}</span>
      </div>
      <p className={styles.intro}>{ta("intro")}</p>

      {/* ---- No-show indicator ---- */}
      <div className={styles.noShow}>
        <div className={styles.noShowMain}>
          <h3 className={styles.h3}>{ta("noShowTitle")}</h3>
          <p className={styles.period}>{ta("noShowPeriod", { date: formatDayShort(AGENDA_HOY, locale) })}</p>
          {stats.rate === null ? (
            <p className={styles.noShowDetail}>{ta("noShowNone")}</p>
          ) : (
            <>
              <p className={styles.rate}>{formatPercent(stats.rate, locale)}</p>
              <p className={styles.noShowDetail}>
                {ta("noShowDetail", {
                  noShow: stats.noPresentado,
                  total: stats.asistio + stats.noPresentado,
                })}
              </p>
            </>
          )}
        </div>
        <div className={styles.noShowSide}>
          <h4 className={styles.h4}>{ta("noShowByPro")}</h4>
          <ul className={styles.byPro}>
            {byPro.map(({ p, s }) => (
              <li key={p.id}>
                <span>{p.nombre}</span>
                <span className={styles.mono}>{s.rate === null ? ta("noData") : formatPercent(s.rate, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.goal}>{ta("remindersNote")}</p>
        <p className={styles.sampleNote}>{ta("historyNote", { date: formatDayShort(AGENDA_HOY, locale) })}</p>
      </div>

      {/* ---- Toolbar ---- */}
      <div className={styles.toolbar}>
        <div className={styles.segmented} role="group" aria-label={ta("view")}>
          {(["day", "week"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={styles.segment}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "day" ? ta("viewDay") : ta("viewWeek")}
            </button>
          ))}
        </div>
        <label className={styles.filter}>
          <span className={styles.filterLabel}>{ta("filterPro")}</span>
          <select
            className={styles.select}
            value={proFilter}
            onChange={(e) => setProFilter(e.target.value)}
          >
            <option value={ALL}>{ta("allPros")}</option>
            {PROFESIONALES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => setDate(addDays(date, -stepDays))}
          >
            {mode === "day" ? ta("prevDay") : ta("prevWeek")}
          </button>
          <button
            type="button"
            className={styles.navBtn}
            disabled={date === AGENDA_HOY}
            onClick={() => setDate(AGENDA_HOY)}
          >
            {ta("today")}
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => setDate(addDays(date, stepDays))}
          >
            {mode === "day" ? ta("nextDay") : ta("nextWeek")}
          </button>
        </div>
      </div>

      <h3 className={`${styles.h3} ${styles.periodTitle}`} aria-live="polite">
        {periodLabel}
      </h3>
      {date > AGENDA_HOY && mode === "day" ? <p className={styles.hint}>{ta("futureHint")}</p> : null}

      {/* ---- Day view ---- */}
      {mode === "day" ? (
        <div className={`${styles.columns} ${pros.length === 1 ? styles.single : ""}`}>
          {pros.map((p) => {
            const tramos = p.horario[weekdayOf(date)] ?? [];
            const list = citasOf(p.id, date);
            return (
              <div key={p.id} className={styles.column}>
                <div className={styles.proHead}>
                  <Avatar name={p.nombre} />
                  <div className={styles.proText}>
                    <span className={styles.proName}>{p.nombre}</span>
                    <span className={styles.proMeta}>{t(`specialties.${p.especialidad}`)}</span>
                    <span className={`${styles.proMeta} ${styles.mono}`}>
                      {tramos.length === 0
                        ? t("dayOff")
                        : tramos.map(([a, b]) => ta("timeRange", { start: a, end: b })).join(", ")}
                    </span>
                  </div>
                </div>
                {list.length === 0 ? (
                  <p className={styles.empty}>{ta("empty")}</p>
                ) : (
                  <ol className={styles.list}>{list.map(renderCita)}</ol>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ---- Week view ---- */
        <div className={styles.tableWrap}>
          <table className={styles.week}>
            <thead>
              <tr>
                <th scope="col">{ta("filterPro")}</th>
                {weekDays.map((d) => (
                  <th key={d} scope="col" className={d === AGENDA_HOY ? styles.todayCol : undefined}>
                    <span className={styles.weekday}>{formatWeekday(d, locale)}</span>{" "}
                    <span className={styles.mono}>{formatDayShort(d, locale)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pros.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    <span className={styles.rowPro}>
                      <Avatar name={p.nombre} size="s" />
                      {p.nombre}
                    </span>
                  </th>
                  {weekDays.map((d) => {
                    const working = (p.horario[weekdayOf(d)]?.length ?? 0) > 0;
                    const list = citasOf(p.id, d).filter((c) => c.estado !== "cancelada");
                    const noShows = list.filter((c) => c.estado === "no_presentado").length;
                    return (
                      <td key={d} className={d === AGENDA_HOY ? styles.todayCol : undefined}>
                        {!working ? (
                          <span className={styles.off}>{t("dayOff")}</span>
                        ) : (
                          <button
                            type="button"
                            className={styles.cell}
                            aria-label={`${ta("openDay", { date: formatDayLong(d, locale) })}, ${p.nombre}: ${ta("citasCount", { count: list.length })}`}
                            onClick={() => {
                              setProFilter(p.id);
                              setDate(d);
                              setMode("day");
                            }}
                          >
                            <span>{ta("citasCount", { count: list.length })}</span>
                            {noShows > 0 ? (
                              <span className={styles.cellNoShow}>
                                {ta("noShowCount", { count: noShows })}
                              </span>
                            ) : null}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
