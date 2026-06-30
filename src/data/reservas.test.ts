import { describe, expect, it } from "vitest";
import type { Cita } from "./citas";
import { availableSlots, TIME_SLOTS } from "./reservas";

const citas: Cita[] = [
  { id: "x1", cliente: "A", servicio: "Revisión", fecha: "2026-07-02T10:00", estado: "pendiente" },
  { id: "x2", cliente: "B", servicio: "Revisión", fecha: "2026-07-02T11:00", estado: "cancelada" },
];

describe("availableSlots", () => {
  it("excludes booked (non-cancelled) times for that date", () => {
    const free = availableSlots(citas, "2026-07-02");
    expect(free).not.toContain("10:00");
  });

  it("keeps times freed by cancellations", () => {
    const free = availableSlots(citas, "2026-07-02");
    expect(free).toContain("11:00");
  });

  it("returns all slots for a day with no citas", () => {
    expect(availableSlots(citas, "2026-07-05")).toEqual(TIME_SLOTS);
  });
});
