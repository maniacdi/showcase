import { describe, expect, it } from "vitest";
import type { Cita } from "@/data/citas";
import { HISTORIAL_EJEMPLO, PROFESIONALES, type Profesional } from "@/data/clinica";
import {
  addDays,
  initials,
  noShowRate,
  slotsAnyProfesional,
  slotsFor,
  slotsForProfesional,
  startOfWeek,
  weekdayOf,
} from "./agenda";

// 2026-07-06 is a Monday.
const MON = "2026-07-06";
const TUE = "2026-07-07";

const ana: Profesional = {
  id: "ana",
  nombre: "Ana Test",
  especialidad: "general",
  horario: { 1: [["09:00", "11:00"], ["16:00", "17:00"]] },
  servicios: { revision: 30, limpieza: 45, ortodoncia: 90 },
};
const bea: Profesional = {
  id: "bea",
  nombre: "Bea Test",
  especialidad: "higiene",
  horario: { 1: [["09:00", "10:00"]], 2: [["09:00", "10:00"]] },
  servicios: { revision: 30 },
};

function cita(partial: Partial<Cita> & Pick<Cita, "fecha">): Cita {
  return { id: partial.fecha, cliente: "X", servicio: "Revisión", estado: "confirmada", ...partial };
}

describe("date helpers", () => {
  it("weekdayOf / addDays / startOfWeek are timezone-independent", () => {
    expect(weekdayOf(MON)).toBe(1);
    expect(weekdayOf("2026-07-05")).toBe(0);
    expect(addDays("2026-06-30", 2)).toBe("2026-07-02");
    expect(startOfWeek("2026-07-05")).toBe("2026-06-29"); // Sunday → previous Monday
    expect(startOfWeek("2026-07-08")).toBe(MON);
  });

  it("initials takes the first two words", () => {
    expect(initials("Elena Marín")).toBe("EM");
    expect(initials("  sergio  ortega  ruiz ")).toBe("SO");
  });
});

describe("slotsForProfesional", () => {
  it("only offers starts where the whole service fits inside a working block", () => {
    // 30 min in 09:00–11:00 and 16:00–17:00 on a 30-min grid.
    expect(slotsForProfesional(ana, "revision", MON, [])).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "16:00",
      "16:30",
    ]);
    // 45 min: 10:30 would end 11:15 and 16:30 would end 17:15 → excluded.
    expect(slotsForProfesional(ana, "limpieza", MON, [])).toEqual(["09:00", "09:30", "10:00", "16:00"]);
    // 90 min only fits in the morning block.
    expect(slotsForProfesional(ana, "ortodoncia", MON, [])).toEqual(["09:00", "09:30"]);
  });

  it("returns nothing on days off or for services the professional does not do", () => {
    expect(slotsForProfesional(ana, "revision", TUE, [])).toEqual([]);
    expect(slotsForProfesional(bea, "limpieza", MON, [])).toEqual([]);
  });

  it("blocks every start that would overlap an existing cita, using its duration", () => {
    const busy = [cita({ fecha: `${MON}T09:30`, profesionalId: "ana", duracion: 45 })]; // 09:30–10:15
    // 30-min service: 09:00 ends 09:30 (touches, allowed); 09:30, 10:00 overlap; 10:30 free.
    expect(slotsForProfesional(ana, "revision", MON, busy)).toEqual(["09:00", "10:30", "16:00", "16:30"]);
    // 45-min service: 09:00 would run to 09:45 → overlap.
    expect(slotsForProfesional(ana, "limpieza", MON, busy)).toEqual(["16:00"]);
  });

  it("ignores cancelled citas, other professionals and other days", () => {
    const citas = [
      cita({ fecha: `${MON}T09:00`, profesionalId: "ana", duracion: 120, estado: "cancelada" }),
      cita({ fecha: `${MON}T09:00`, profesionalId: "bea", duracion: 60 }),
      cita({ fecha: `${TUE}T09:00`, profesionalId: "ana", duracion: 120 }),
    ];
    expect(slotsForProfesional(ana, "revision", MON, citas)).toHaveLength(6);
  });

  it("treats attended / no-show citas as occupied (they held the slot)", () => {
    const citas = [cita({ fecha: `${MON}T16:00`, profesionalId: "ana", duracion: 60, estado: "no_presentado" })];
    expect(slotsForProfesional(ana, "revision", MON, citas)).not.toContain("16:00");
    expect(slotsForProfesional(ana, "revision", MON, citas)).not.toContain("16:30");
  });

  it("assumes the default duration for legacy citas without one", () => {
    const citas = [cita({ fecha: `${MON}T10:00`, profesionalId: "ana" })]; // 10:00–10:30
    expect(slotsForProfesional(ana, "revision", MON, citas)).toEqual(["09:00", "09:30", "10:30", "16:00", "16:30"]);
  });
});

describe("slotsAnyProfesional", () => {
  it("merges free times across professionals who do the service, sorted", () => {
    const slots = slotsAnyProfesional([ana, bea], "revision", TUE, []);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "09:30"]);
    expect(slots.every((s) => s.profesionalId === "bea")).toBe(true);
  });

  it("assigns each time to the least-loaded free professional", () => {
    const citas = [cita({ fecha: `${MON}T16:00`, profesionalId: "ana", duracion: 30 })];
    const slots = slotsAnyProfesional([ana, bea], "revision", MON, citas);
    // Bea has no citas → she gets the shared morning times.
    expect(slots.find((s) => s.time === "09:00")?.profesionalId).toBe("bea");
    // Only Ana works at 10:30.
    expect(slots.find((s) => s.time === "10:30")?.profesionalId).toBe("ana");
    expect(slots.some((s) => s.time === "16:00")).toBe(false);
  });

  it("slotsFor dispatches to one professional or to anyone", () => {
    expect(slotsFor([ana, bea], "bea", "revision", MON, []).map((s) => s.time)).toEqual(["09:00", "09:30"]);
    expect(slotsFor([ana, bea], null, "revision", MON, [])).toHaveLength(6);
    expect(slotsFor([ana, bea], "nobody", "revision", MON, [])).toEqual([]);
  });
});

describe("noShowRate", () => {
  const ref = "2026-07-02";
  const marked = [
    cita({ fecha: "2026-07-02T09:00", estado: "no_presentado", profesionalId: "ana" }),
    cita({ fecha: "2026-06-20T09:00", estado: "asistio", profesionalId: "ana" }),
    cita({ fecha: "2026-06-03T09:00", estado: "asistio", profesionalId: "bea" }), // first day of the window
    cita({ fecha: "2026-06-02T09:00", estado: "no_presentado" }), // 31 days back → outside
    cita({ fecha: "2026-07-03T09:00", estado: "no_presentado" }), // future → outside
    cita({ fecha: "2026-06-21T09:00", estado: "cancelada" }),
    cita({ fecha: "2026-06-22T09:00", estado: "confirmada" }),
  ];

  it("counts only marked citas inside the last 30 days (inclusive of today)", () => {
    expect(noShowRate(marked, ref)).toEqual({ asistio: 2, noPresentado: 1, rate: 1 / 3 });
  });

  it("can be filtered per professional", () => {
    expect(noShowRate(marked, ref, 30, "ana")).toEqual({ asistio: 1, noPresentado: 1, rate: 0.5 });
  });

  it("returns a null rate when nothing was marked", () => {
    expect(noShowRate([], ref).rate).toBeNull();
  });

  it("the sample history yields a rate between 0 and 1 for the demo", () => {
    const { rate } = noShowRate(HISTORIAL_EJEMPLO, ref);
    expect(rate).not.toBeNull();
    expect(rate!).toBeGreaterThan(0);
    expect(rate!).toBeLessThan(1);
  });
});

describe("demo data consistency", () => {
  it("every professional's working blocks are well-formed and services have durations", () => {
    for (const p of PROFESIONALES) {
      for (const tramos of Object.values(p.horario)) {
        for (const [a, b] of tramos ?? []) expect(a < b).toBe(true);
      }
      for (const d of Object.values(p.servicios)) expect(d).toBeGreaterThan(0);
    }
  });

  it("sample history never double-books a professional", () => {
    const seen = new Set<string>();
    for (const c of HISTORIAL_EJEMPLO) {
      const key = `${c.profesionalId}-${c.fecha}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});
