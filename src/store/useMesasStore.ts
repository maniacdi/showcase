import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuDelDia } from "@/data/restaurante";
import type { MesaEstado, MesaReserva } from "@/lib/mesas";

/** Sample bookings so /admin isn't empty on first visit (fictitious names). */
export const mesasSeed: MesaReserva[] = [
  { id: "m1", date: "2026-12-04", turno: "cena", time: "21:00", guests: 4, name: "Lucía M.", phone: "600 000 001", notes: "Una trona, por favor", estado: "confirmada" },
  { id: "m2", date: "2026-12-05", turno: "comida", time: "14:00", guests: 2, name: "Pablo R.", phone: "600 000 002", notes: "", estado: "pendiente" },
  { id: "m3", date: "2026-12-05", turno: "cena", time: "21:30", guests: 6, name: "Marta G.", phone: "600 000 003", notes: "Cumpleaños", estado: "pendiente" },
];

type BookInput = Omit<MesaReserva, "id" | "estado">;

interface MesasState {
  reservas: MesaReserva[];
  /** null = show the default menú del día from data (localised). */
  menuDelDia: MenuDelDia | null;
  book: (input: BookInput) => MesaReserva;
  confirm: (id: string) => void;
  cancel: (id: string) => void;
  setMenuDelDia: (menu: MenuDelDia | null) => void;
}

function setEstado(reservas: MesaReserva[], id: string, estado: MesaEstado): MesaReserva[] {
  return reservas.map((r) => (r.id === id ? { ...r, estado } : r));
}

// Persisted so a booking made in /restaurante/reservar shows up in /admin and
// the owner's menú del día edit survives a reload (demo: this browser only).
export const useMesasStore = create<MesasState>()(
  persist(
    (set, get) => ({
      reservas: mesasSeed.map((r) => ({ ...r })),
      menuDelDia: null,
      book: (input) => {
        const reserva: MesaReserva = {
          ...input,
          id: `m${Date.now().toString(36)}${get().reservas.length}`,
          estado: "pendiente",
        };
        set((s) => ({ reservas: [...s.reservas, reserva] }));
        return reserva;
      },
      confirm: (id) => set((s) => ({ reservas: setEstado(s.reservas, id, "confirmada") })),
      cancel: (id) => set((s) => ({ reservas: setEstado(s.reservas, id, "cancelada") })),
      setMenuDelDia: (menuDelDia) => set({ menuDelDia }),
    }),
    { name: "showcase-mesas", version: 1 },
  ),
);
