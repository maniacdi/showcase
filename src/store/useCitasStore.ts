import { create } from "zustand";
import { type Cita, citasSeed } from "@/data/citas";

interface BookInput {
  cliente: string;
  servicio: string;
  fecha: string; // ISO datetime "YYYY-MM-DDTHH:mm"
}

interface CitasState {
  citas: Cita[];
  confirm: (id: string) => void;
  cancel: (id: string) => void;
  book: (input: BookInput) => Cita;
}

function setEstado(citas: Cita[], id: string, estado: Cita["estado"]): Cita[] {
  return citas.map((c) => (c.id === id ? { ...c, estado } : c));
}

// In-memory, seeded each load (deterministic for the demo; no persistence).
export const useCitasStore = create<CitasState>()((set, get) => ({
  citas: citasSeed.map((c) => ({ ...c })),
  confirm: (id) => set((s) => ({ citas: setEstado(s.citas, id, "confirmada") })),
  cancel: (id) => set((s) => ({ citas: setEstado(s.citas, id, "cancelada") })),
  book: ({ cliente, servicio, fecha }) => {
    // length is monotonic in a session (confirm/cancel don't remove) → unique id.
    const cita: Cita = { id: `b${get().citas.length + 1}`, cliente, servicio, fecha, estado: "pendiente" };
    set((s) => ({ citas: [...s.citas, cita] }));
    return cita;
  },
}));
