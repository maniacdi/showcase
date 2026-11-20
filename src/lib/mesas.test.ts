import { describe, expect, it } from "vitest";
import {
  CAPACITY_PER_SLOT,
  coversTaken,
  type MesaReserva,
  sampleOccupancy,
  SLOTS,
  slotsFor,
  turnosFor,
  validateMesa,
  weekday,
} from "./mesas";

const TUESDAY = "2026-12-01";
const SUNDAY = "2026-12-06";
const MONDAY = "2026-12-07";

const reserva = (over: Partial<MesaReserva>): MesaReserva => ({
  id: "r",
  date: TUESDAY,
  turno: "cena",
  time: "21:00",
  guests: 2,
  name: "Test",
  phone: "600000000",
  notes: "",
  estado: "pendiente",
  ...over,
});

describe("opening days", () => {
  it("computes weekdays without timezone drift", () => {
    expect(weekday(TUESDAY)).toBe(2);
    expect(weekday(SUNDAY)).toBe(0);
  });

  it("opens lunch and dinner Tuesday to Saturday, lunch only on Sunday, closed Monday", () => {
    expect(turnosFor(TUESDAY)).toEqual(["comida", "cena"]);
    expect(turnosFor(SUNDAY)).toEqual(["comida"]);
    expect(turnosFor(MONDAY)).toEqual([]);
    expect(turnosFor("not-a-date")).toEqual([]);
  });
});

describe("capacity", () => {
  it("sample occupancy is deterministic and within capacity", () => {
    const a = sampleOccupancy(TUESDAY, "21:00");
    expect(sampleOccupancy(TUESDAY, "21:00")).toBe(a);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(CAPACITY_PER_SLOT);
  });

  it("adds non-cancelled bookings in the same slot only", () => {
    const base = sampleOccupancy(TUESDAY, "21:00");
    const reservas = [
      reserva({ guests: 3 }),
      reserva({ guests: 4, estado: "cancelada" }),
      reserva({ guests: 5, time: "21:30" }),
      reserva({ guests: 6, date: "2026-12-02" }),
    ];
    expect(coversTaken(reservas, TUESDAY, "21:00")).toBe(base + 3);
  });

  it("lists the service's slots with seats left and availability for the party", () => {
    const slots = slotsFor([], TUESDAY, "cena", 2);
    expect(slots.map((s) => s.time)).toEqual(SLOTS.cena);
    for (const s of slots) {
      expect(s.left).toBe(CAPACITY_PER_SLOT - sampleOccupancy(TUESDAY, s.time));
      expect(s.available).toBe(s.left >= 2);
    }
  });

  it("a slot becomes unavailable once bookings fill it", () => {
    const time = SLOTS.comida[0];
    const free = CAPACITY_PER_SLOT - sampleOccupancy(TUESDAY, time);
    const full = [reserva({ turno: "comida", time, guests: free })];
    const slot = slotsFor(full, TUESDAY, "comida", 1).find((s) => s.time === time);
    expect(slot).toEqual({ time, left: 0, available: false });
  });

  it("a party larger than the seats left does not fit", () => {
    const time = SLOTS.comida[1];
    const free = CAPACITY_PER_SLOT - sampleOccupancy(TUESDAY, time);
    const reservas = free > 1 ? [reserva({ turno: "comida", time, guests: free - 1 })] : [];
    const slot = slotsFor(reservas, TUESDAY, "comida", 2).find((s) => s.time === time);
    expect(slot?.available).toBe(false);
  });

  it("returns no slots for a closed service", () => {
    expect(slotsFor([], SUNDAY, "cena", 2)).toEqual([]);
    expect(slotsFor([], MONDAY, "comida", 2)).toEqual([]);
  });
});

describe("validateMesa", () => {
  const ok = { date: TUESDAY, turno: "cena" as const, time: "21:00", guests: 2, name: "Ana", phone: "+34 600 000 000" };

  it("accepts a complete booking", () => {
    expect(validateMesa(ok, "2026-11-19")).toEqual({});
  });

  it("flags past dates, closed days, missing fields and bad phones", () => {
    expect(validateMesa(ok, "2026-12-02").date).toBe("invalid");
    expect(validateMesa({ ...ok, date: MONDAY }, "2026-11-19").date).toBe("closed");
    expect(validateMesa({ ...ok, time: "" }, "2026-11-19").time).toBe("required");
    expect(validateMesa({ ...ok, name: "  " }, "2026-11-19").name).toBe("required");
    expect(validateMesa({ ...ok, guests: 11 }, "2026-11-19").guests).toBe("invalid");
    expect(validateMesa({ ...ok, guests: 0 }, "2026-11-19").guests).toBe("invalid");
    expect(validateMesa({ ...ok, phone: "12ab" }, "2026-11-19").phone).toBe("invalid");
    expect(validateMesa({ ...ok, phone: "1234" }, "2026-11-19").phone).toBe("invalid");
  });
});
