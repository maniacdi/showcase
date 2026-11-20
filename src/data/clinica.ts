import type { Cita } from "./citas";

/**
 * Clinic agenda with several professionals (mock data, fictitious people).
 * Re-skin per client: edit services, professionals and their schedules here;
 * the booking flow and the admin agenda read everything from this file.
 */

export type ServicioId = "limpieza" | "revision" | "ortodoncia" | "blanqueamiento";

export interface ServicioClinica {
  id: ServicioId;
  /** Stored on the cita (Spanish, as in the rest of the mock data). UI labels come from messages. */
  nombre: string;
}

export const SERVICIOS_CLINICA: ServicioClinica[] = [
  { id: "limpieza", nombre: "Limpieza dental" },
  { id: "revision", nombre: "Revisión" },
  { id: "ortodoncia", nombre: "Ortodoncia" },
  { id: "blanqueamiento", nombre: "Blanqueamiento" },
];

/** Working block "HH:mm"–"HH:mm" (end exclusive). */
export type Tramo = [inicio: string, fin: string];

export interface Profesional {
  id: string;
  nombre: string;
  /** Key under messages `clinica.specialties`. */
  especialidad: "general" | "ortodoncia" | "estetica" | "higiene";
  /** Weekday (0 = Sunday … 6 = Saturday) → working blocks. Missing day = not working. */
  horario: Partial<Record<number, Tramo[]>>;
  /** Services this professional does, with their duration in minutes. */
  servicios: Partial<Record<ServicioId, number>>;
}

export const PROFESIONALES: Profesional[] = [
  {
    id: "elena",
    nombre: "Elena Marín",
    especialidad: "general",
    horario: {
      1: [["09:00", "14:00"]],
      2: [["09:00", "14:00"]],
      3: [["09:00", "14:00"]],
      4: [["09:00", "14:00"]],
      5: [["09:00", "14:00"]],
    },
    servicios: { revision: 30, limpieza: 45 },
  },
  {
    id: "pablo",
    nombre: "Pablo Serrano",
    especialidad: "ortodoncia",
    horario: {
      1: [["09:00", "14:00"], ["16:00", "19:00"]],
      3: [["09:00", "14:00"], ["16:00", "19:00"]],
      4: [["09:00", "14:00"]],
      5: [["09:00", "14:00"]],
    },
    servicios: { ortodoncia: 60, revision: 30 },
  },
  {
    id: "nuria",
    nombre: "Nuria Vidal",
    especialidad: "estetica",
    horario: {
      2: [["16:00", "20:00"]],
      4: [["16:00", "20:00"]],
      5: [["16:00", "20:00"]],
      6: [["09:00", "13:00"]],
    },
    servicios: { blanqueamiento: 60, limpieza: 45 },
  },
  {
    id: "sergio",
    nombre: "Sergio Ortega",
    especialidad: "higiene",
    horario: {
      1: [["15:00", "20:00"]],
      2: [["15:00", "20:00"]],
      3: [["15:00", "20:00"]],
      4: [["15:00", "20:00"]],
      5: [["15:00", "20:00"]],
      6: [["09:00", "13:00"]],
    },
    servicios: { limpieza: 40, revision: 20 },
  },
];

/** The demo's fixed "today" (no `new Date()` → no hydration mismatch, stable screenshots). */
export const AGENDA_HOY = "2026-07-02";

/** Bookable days: the next working days from AGENDA_HOY (Sundays closed). */
export const CLINICA_DIAS = [
  "2026-07-02",
  "2026-07-03",
  "2026-07-04",
  "2026-07-06",
  "2026-07-07",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-11",
];

/** Slot grid for start times, in minutes. */
export const PASO_MINUTOS = 30;

const NOMBRES = [
  "Alba Prieto", "Hugo Navarro", "Marta Ibáñez", "Diego Fuentes", "Sara Molina",
  "Óscar Peña", "Clara Rubio", "Iván Cano", "Noelia Soler", "Adrián Vega",
  "Paula Gil", "Rubén Lozano", "Eva Campos", "Marcos León", "Julia Pastor",
];

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * Sample history ("Datos de ejemplo") for the 30 days before AGENDA_HOY, so
 * the admin agenda has a no-show rate to show. Deterministic: a fixed pattern,
 * not a statistic about real clinics.
 */
function buildHistorial(): Cita[] {
  const out: Cita[] = [];
  let k = 0;
  for (let offset = -29; offset <= -1; offset++) {
    const date = addDays(AGENDA_HOY, offset);
    const [y, m, d] = date.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    for (const p of PROFESIONALES) {
      const tramo = p.horario[weekday]?.[0];
      const [servicioId, duracion] = Object.entries(p.servicios)[0] as [ServicioId, number];
      if (!tramo) continue;
      const [h] = tramo[0].split(":").map(Number);
      for (let i = 0; i < 3; i++) {
        k++;
        const estado: Cita["estado"] =
          k % 13 === 7 ? "cancelada" : k % 8 === 3 ? "no_presentado" : "asistio";
        out.push({
          id: `h${k}`,
          cliente: NOMBRES[k % NOMBRES.length],
          servicio: SERVICIOS_CLINICA.find((s) => s.id === servicioId)!.nombre,
          fecha: `${date}T${String(h + i).padStart(2, "0")}:00`,
          estado,
          profesionalId: p.id,
          duracion,
        });
      }
    }
  }
  return out;
}

export const HISTORIAL_EJEMPLO: Cita[] = buildHistorial();
