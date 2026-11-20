import type { Profesional } from "@/data/clinica";
import { addDays, startOfWeek, weekdayOf } from "@/lib/agenda";

/** UTC-anchored Date for "YYYY-MM-DD", so server and browser format the same day. */
function utc(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** "jueves, 2 de julio" / "Thursday, July 2" */
export function formatDayLong(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(utc(date));
}

/** "2 jul" / "Jul 2" */
export function formatDayShort(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(
    utc(date),
  );
}

/** "jue" / "Thu" */
export function formatWeekday(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(utc(date));
}

/** Working weekdays of a professional, Monday first: "lun, mié, jue". */
export function workingDaysLabel(prof: Profesional, locale: string): string {
  const monday = startOfWeek("2026-07-06");
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
    .filter((d) => (prof.horario[weekdayOf(d)]?.length ?? 0) > 0)
    .map((d) => formatWeekday(d, locale))
    .join(", ");
}

export function formatPercent(rate: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(rate);
}
