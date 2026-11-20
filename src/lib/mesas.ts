import { OPENING } from "@/data/restaurante";

export type Turno = "comida" | "cena";
export type MesaEstado = "pendiente" | "confirmada" | "cancelada";

export interface MesaReserva {
  id: string;
  /** "YYYY-MM-DD" */
  date: string;
  turno: Turno;
  /** "HH:mm" */
  time: string;
  guests: number;
  name: string;
  phone: string;
  notes: string;
  estado: MesaEstado;
}

/** Bookable arrival times per service. */
export const SLOTS: Record<Turno, string[]> = {
  comida: ["13:30", "14:00", "14:30", "15:00"],
  cena: ["20:30", "21:00", "21:30", "22:00"],
};

/** Covers (diners) the dining room takes per arrival time. */
export const CAPACITY_PER_SLOT = 20;
export const MIN_GUESTS = 1;
export const MAX_GUESTS = 10;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Weekday (0 = Sunday) of a "YYYY-MM-DD" date, timezone-safe. */
export function weekday(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Services open on a date, from the opening hours. */
export function turnosFor(date: string): Turno[] {
  if (!DATE_RE.test(date)) return [];
  const day = OPENING[weekday(date)];
  const out: Turno[] = [];
  if (day.lunch) out.push("comida");
  if (day.dinner) out.push("cena");
  return out;
}

/**
 * Sample occupancy (covers already booked by phone, walk-ins…) so the demo
 * shows busy and full slots. Deterministic per date+time; not real data.
 */
export function sampleOccupancy(date: string, time: string): number {
  let h = 0;
  for (const ch of `${date}T${time}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const levels = [0, 4, 8, 12, 14, 16, 18, CAPACITY_PER_SLOT];
  return levels[h % levels.length];
}

/** Covers taken in a slot: sample occupancy plus every non-cancelled booking. */
export function coversTaken(reservas: MesaReserva[], date: string, time: string): number {
  const booked = reservas
    .filter((r) => r.estado !== "cancelada" && r.date === date && r.time === time)
    .reduce((n, r) => n + r.guests, 0);
  return sampleOccupancy(date, time) + booked;
}

export interface SlotInfo {
  time: string;
  /** Covers still free (never negative). */
  left: number;
  /** Fits the requested party size. */
  available: boolean;
}

export function slotsFor(
  reservas: MesaReserva[],
  date: string,
  turno: Turno,
  guests: number,
): SlotInfo[] {
  if (!turnosFor(date).includes(turno)) return [];
  return SLOTS[turno].map((time) => {
    const left = Math.max(0, CAPACITY_PER_SLOT - coversTaken(reservas, date, time));
    return { time, left, available: left >= guests };
  });
}

/* ---- Validation (same shape as lib/validation.ts: field → error code) ---- */

export interface MesaValues {
  date: string;
  turno: Turno;
  time: string;
  guests: number;
  name: string;
  phone: string;
}

export type MesaErrors = Partial<Record<keyof MesaValues, string>>;

// Digits, spaces, dashes, dots, parentheses and a leading +; 9 to 15 digits.
const PHONE_RE = /^\+?[\d\s().-]+$/;

export function validateMesa(values: MesaValues, today: string): MesaErrors {
  const errors: MesaErrors = {};
  if (!DATE_RE.test(values.date) || values.date < today) errors.date = "invalid";
  else if (turnosFor(values.date).length === 0) errors.date = "closed";
  if (!values.time) errors.time = "required";
  if (!Number.isInteger(values.guests) || values.guests < MIN_GUESTS || values.guests > MAX_GUESTS) {
    errors.guests = "invalid";
  }
  if (!values.name.trim()) errors.name = "required";
  const digits = values.phone.replace(/\D/g, "").length;
  if (!PHONE_RE.test(values.phone.trim()) || digits < 9 || digits > 15) errors.phone = "invalid";
  return errors;
}

/** Local "YYYY-MM-DD" for a Date (the browser's day, not UTC). */
export function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
