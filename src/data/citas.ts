export type CitaEstado = "pendiente" | "confirmada" | "cancelada";

export interface Cita {
  id: string;
  cliente: string;
  servicio: string;
  fecha: string; // ISO datetime
  estado: CitaEstado;
}

// Mock seed. Reused by the public booking flow in F2.
export const citasSeed: Cita[] = [
  { id: "c1", cliente: "María López", servicio: "Limpieza dental", fecha: "2026-07-02T10:00", estado: "pendiente" },
  { id: "c2", cliente: "Juan Pérez", servicio: "Revisión", fecha: "2026-07-02T11:30", estado: "confirmada" },
  { id: "c3", cliente: "Lucía Gómez", servicio: "Ortodoncia", fecha: "2026-07-03T09:00", estado: "pendiente" },
  { id: "c4", cliente: "Carlos Ruiz", servicio: "Blanqueamiento", fecha: "2026-07-03T16:00", estado: "pendiente" },
  { id: "c5", cliente: "Ana Díaz", servicio: "Revisión", fecha: "2026-07-04T12:00", estado: "cancelada" },
];
