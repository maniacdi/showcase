import type { Cita } from "./citas";

export const BOOKABLE_SERVICES = [
  "Limpieza dental",
  "Revisión",
  "Ortodoncia",
  "Blanqueamiento",
];

// Fixed dates (no `new Date()` to avoid hydration mismatches in the demo).
export const BOOKING_DATES = ["2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];

export const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "16:00",
  "17:00",
];

/** Slots free on `date` = all slots minus times already booked (non-cancelled). */
export function availableSlots(citas: Cita[], date: string): string[] {
  const taken = new Set(
    citas
      .filter((c) => c.estado !== "cancelada" && c.fecha.startsWith(date))
      .map((c) => c.fecha.slice(11, 16)),
  );
  return TIME_SLOTS.filter((slot) => !taken.has(slot));
}
