import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type Cita, citasSeed } from "@/data/citas";

interface BookInput {
  cliente: string;
  servicio: string;
  fecha: string; // ISO datetime "YYYY-MM-DDTHH:mm"
  profesionalId?: string;
  duracion?: number;
  telefono?: string;
}

export type Asistencia = "asistio" | "no_presentado";

interface CitasState {
  citas: Cita[];
  confirm: (id: string) => void;
  cancel: (id: string) => void;
  book: (input: BookInput) => Cita;
  /** Mark attendance; `null` undoes it (back to "confirmada"). */
  markAttendance: (id: string, asistencia: Asistencia | null) => void;
}

function setEstado(citas: Cita[], id: string, estado: Cita["estado"]): Cita[] {
  return citas.map((c) => (c.id === id ? { ...c, estado } : c));
}

/**
 * Seeded on every fresh tab and kept in sessionStorage, so a booking survives
 * a reload and the "Cancelar o cambiar cita" link works within the visit, but
 * each new visitor starts from the same deterministic demo data.
 * `skipHydration`: the first client render matches the server (seed); callers
 * call `rehydrateCitas()` in an effect after mount.
 */
export const useCitasStore = create<CitasState>()(
  persist(
    (set, get) => ({
      citas: citasSeed.map((c) => ({ ...c })),
      confirm: (id) => set((s) => ({ citas: setEstado(s.citas, id, "confirmada") })),
      cancel: (id) => set((s) => ({ citas: setEstado(s.citas, id, "cancelada") })),
      book: ({ cliente, servicio, fecha, profesionalId, duracion, telefono }) => {
        // length is monotonic in a session (no action removes citas) → unique id.
        const cita: Cita = {
          id: `b${get().citas.length + 1}`,
          cliente,
          servicio,
          fecha,
          estado: "pendiente",
          ...(profesionalId ? { profesionalId } : {}),
          ...(duracion ? { duracion } : {}),
          ...(telefono ? { telefono } : {}),
        };
        set((s) => ({ citas: [...s.citas, cita] }));
        return cita;
      },
      markAttendance: (id, asistencia) =>
        set((s) => ({ citas: setEstado(s.citas, id, asistencia ?? "confirmada") })),
    }),
    {
      name: "showcase-citas",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ citas: s.citas }),
      skipHydration: true,
    },
  ),
);

/** Load the session's citas after mount (keeps SSR and first paint identical). */
export function rehydrateCitas(): Promise<void> {
  return Promise.resolve(useCitasStore.persist.rehydrate());
}
