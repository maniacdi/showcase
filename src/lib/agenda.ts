import type { Cita } from "@/data/citas";
import { PASO_MINUTOS, type Profesional, type ServicioId } from "@/data/clinica";

/** Duration assumed for citas saved without one (legacy bookings). */
export const DEFAULT_DURACION = 30;

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Day of week (0 = Sunday) for "YYYY-MM-DD", timezone-independent. */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Monday of the week that contains `date`. */
export function startOfWeek(date: string): string {
  const wd = weekdayOf(date);
  return addDays(date, wd === 0 ? -6 : 1 - wd);
}

/** Citas that still hold a slot (everything except cancelled ones). */
function holdsSlot(c: Cita): boolean {
  return c.estado !== "cancelada";
}

export function worksOn(prof: Profesional, date: string): boolean {
  return (prof.horario[weekdayOf(date)]?.length ?? 0) > 0;
}

/**
 * Free start times for one professional, one service and one day.
 * A start time is free when the whole service fits inside a working block and
 * does not overlap any non-cancelled cita of that professional.
 */
export function slotsForProfesional(
  prof: Profesional,
  servicio: ServicioId,
  date: string,
  citas: Cita[],
  step: number = PASO_MINUTOS,
): string[] {
  const duracion = prof.servicios[servicio];
  if (!duracion) return [];
  const tramos = prof.horario[weekdayOf(date)] ?? [];

  const busy = citas
    .filter((c) => c.profesionalId === prof.id && holdsSlot(c) && c.fecha.startsWith(date))
    .map((c) => {
      const start = toMinutes(c.fecha.slice(11, 16));
      return [start, start + (c.duracion ?? DEFAULT_DURACION)] as const;
    });

  const free: string[] = [];
  for (const [ini, fin] of tramos) {
    const end = toMinutes(fin);
    for (let t = toMinutes(ini); t + duracion <= end; t += step) {
      const overlaps = busy.some(([s, e]) => t < e && s < t + duracion);
      if (!overlaps) free.push(fromMinutes(t));
    }
  }
  return free;
}

export interface SlotAsignado {
  time: string;
  profesionalId: string;
}

/**
 * "Cualquiera disponible": union of free times across the professionals who do
 * the service. Each time goes to whoever has fewest citas that day (ties keep
 * list order), so the load spreads instead of piling on the first name.
 */
export function slotsAnyProfesional(
  profs: Profesional[],
  servicio: ServicioId,
  date: string,
  citas: Cita[],
  step: number = PASO_MINUTOS,
): SlotAsignado[] {
  const load = (p: Profesional) =>
    citas.filter((c) => c.profesionalId === p.id && holdsSlot(c) && c.fecha.startsWith(date)).length;
  const ranked = profs
    .filter((p) => p.servicios[servicio])
    .map((p, i) => ({ p, i, load: load(p) }))
    .sort((a, b) => a.load - b.load || a.i - b.i);

  const byTime = new Map<string, string>();
  for (const { p } of ranked) {
    for (const time of slotsForProfesional(p, servicio, date, citas, step)) {
      if (!byTime.has(time)) byTime.set(time, p.id);
    }
  }
  return [...byTime.entries()]
    .sort(([a], [b]) => toMinutes(a) - toMinutes(b))
    .map(([time, profesionalId]) => ({ time, profesionalId }));
}

/** Free slots for a professional, or for "any" when `profesionalId` is null. */
export function slotsFor(
  profs: Profesional[],
  profesionalId: string | null,
  servicio: ServicioId,
  date: string,
  citas: Cita[],
): SlotAsignado[] {
  if (profesionalId === null) return slotsAnyProfesional(profs, servicio, date, citas);
  const prof = profs.find((p) => p.id === profesionalId);
  if (!prof) return [];
  return slotsForProfesional(prof, servicio, date, citas).map((time) => ({
    time,
    profesionalId: prof.id,
  }));
}

export interface NoShowStats {
  asistio: number;
  noPresentado: number;
  /** noPresentado / (asistio + noPresentado), or null when nothing was marked yet. */
  rate: number | null;
}

/**
 * No-show rate over the `days` days ending on `refDate` (inclusive). Only
 * citas whose attendance was marked count: pending/confirmed ones are not yet
 * known and cancelled ones freed their slot in advance.
 */
export function noShowRate(
  citas: Cita[],
  refDate: string,
  days = 30,
  profesionalId?: string,
): NoShowStats {
  const from = addDays(refDate, -(days - 1));
  let asistio = 0;
  let noPresentado = 0;
  for (const c of citas) {
    if (profesionalId && c.profesionalId !== profesionalId) continue;
    const day = c.fecha.slice(0, 10);
    if (day < from || day > refDate) continue;
    if (c.estado === "asistio") asistio++;
    else if (c.estado === "no_presentado") noPresentado++;
  }
  const total = asistio + noPresentado;
  return { asistio, noPresentado, rate: total === 0 ? null : noPresentado / total };
}

/** Two-letter initials for the photo-less avatar. */
export function initials(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
