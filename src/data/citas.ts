/**
 * Appointment lifecycle. "asistio" / "no_presentado" close a cita once its
 * time has come (marked from the admin agenda) and feed the no-show rate.
 */
export type CitaEstado = "pendiente" | "confirmada" | "cancelada" | "asistio" | "no_presentado";

export interface Cita {
  id: string;
  cliente: string;
  servicio: string;
  fecha: string; // ISO datetime "YYYY-MM-DDTHH:mm" (clinic local time)
  estado: CitaEstado;
  /** Professional who attends it (src/data/clinica.ts). Legacy citas may omit it. */
  profesionalId?: string;
  /** Length in minutes. Missing → DEFAULT_DURACION in src/lib/agenda.ts. */
  duracion?: number;
  /** Phone the reminder would go to (demo only, nothing is ever sent). */
  telefono?: string;
}

// Mock seed shared by /reservas and /admin. The demo's "today" is AGENDA_HOY
// (2026-07-02, src/data/clinica.ts); fixed dates avoid hydration mismatches.
export const citasSeed: Cita[] = [
  { id: "c1", cliente: "María López", servicio: "Limpieza dental", fecha: "2026-07-02T10:00", estado: "pendiente", profesionalId: "elena", duracion: 45 },
  { id: "c2", cliente: "Juan Pérez", servicio: "Revisión", fecha: "2026-07-02T11:30", estado: "confirmada", profesionalId: "elena", duracion: 30 },
  { id: "c3", cliente: "Lucía Gómez", servicio: "Ortodoncia", fecha: "2026-07-03T09:00", estado: "pendiente", profesionalId: "pablo", duracion: 60 },
  { id: "c4", cliente: "Carlos Ruiz", servicio: "Blanqueamiento", fecha: "2026-07-03T16:00", estado: "pendiente", profesionalId: "nuria", duracion: 60 },
  { id: "c5", cliente: "Ana Díaz", servicio: "Revisión", fecha: "2026-07-04T12:00", estado: "cancelada", profesionalId: "sergio", duracion: 20 },
  { id: "c6", cliente: "Raúl Moreno", servicio: "Ortodoncia", fecha: "2026-07-02T10:00", estado: "confirmada", profesionalId: "pablo", duracion: 60 },
  { id: "c7", cliente: "Irene Castro", servicio: "Limpieza dental", fecha: "2026-07-02T16:00", estado: "confirmada", profesionalId: "sergio", duracion: 40 },
  { id: "c8", cliente: "Tomás Herrero", servicio: "Blanqueamiento", fecha: "2026-07-02T17:00", estado: "pendiente", profesionalId: "nuria", duracion: 60 },
];
