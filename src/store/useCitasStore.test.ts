import { beforeEach, describe, expect, it } from "vitest";
import { citasSeed } from "@/data/citas";
import { useCitasStore } from "./useCitasStore";

beforeEach(() => {
  useCitasStore.setState({ citas: citasSeed.map((c) => ({ ...c })) });
});

describe("useCitasStore", () => {
  it("confirm sets a cita to confirmada", () => {
    useCitasStore.getState().confirm("c1");
    expect(useCitasStore.getState().citas.find((c) => c.id === "c1")?.estado).toBe("confirmada");
  });

  it("cancel sets a cita to cancelada", () => {
    useCitasStore.getState().cancel("c3");
    expect(useCitasStore.getState().citas.find((c) => c.id === "c3")?.estado).toBe("cancelada");
  });

  it("leaves other citas untouched", () => {
    useCitasStore.getState().confirm("c1");
    expect(useCitasStore.getState().citas.find((c) => c.id === "c2")?.estado).toBe("confirmada");
    expect(useCitasStore.getState().citas.find((c) => c.id === "c4")?.estado).toBe("pendiente");
  });

  it("book appends a pending cita and returns it", () => {
    const before = useCitasStore.getState().citas.length;
    const created = useCitasStore
      .getState()
      .book({ cliente: "Nuevo", servicio: "Revisión", fecha: "2026-07-05T09:00" });
    expect(created.estado).toBe("pendiente");
    expect(useCitasStore.getState().citas.length).toBe(before + 1);
    expect(useCitasStore.getState().citas.find((c) => c.id === created.id)?.cliente).toBe("Nuevo");
  });

  it("book keeps professional, duration and phone when given", () => {
    const created = useCitasStore.getState().book({
      cliente: "Con agenda",
      servicio: "Limpieza dental",
      fecha: "2026-07-06T09:00",
      profesionalId: "elena",
      duracion: 45,
      telefono: "600123456",
    });
    expect(created).toMatchObject({ profesionalId: "elena", duracion: 45, telefono: "600123456" });
  });

  it("markAttendance sets asistio / no_presentado and null undoes it", () => {
    const { markAttendance } = useCitasStore.getState();
    markAttendance("c2", "no_presentado");
    expect(useCitasStore.getState().citas.find((c) => c.id === "c2")?.estado).toBe("no_presentado");
    markAttendance("c2", "asistio");
    expect(useCitasStore.getState().citas.find((c) => c.id === "c2")?.estado).toBe("asistio");
    markAttendance("c2", null);
    expect(useCitasStore.getState().citas.find((c) => c.id === "c2")?.estado).toBe("confirmada");
  });

  it("persists citas to sessionStorage for the visit", () => {
    useCitasStore.getState().cancel("c1");
    const saved = JSON.parse(sessionStorage.getItem("showcase-citas") ?? "{}");
    expect(saved.state.citas.find((c: { id: string }) => c.id === "c1").estado).toBe("cancelada");
  });
});
