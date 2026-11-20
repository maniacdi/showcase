import { describe, expect, it } from "vitest";
import type { Cita } from "@/data/citas";
import { productosSeed } from "@/data/productos";
import { PEDIDOS_EJEMPLO, VISTAS_EJEMPLO } from "@/data/ventas";
import { computeTotals, type Order } from "./checkout";
import { citasPorDia, computeKpis, niceMax, topProductos, ventasPorSemana } from "./stats";

const cita = (fecha: string, estado: Cita["estado"] = "confirmada"): Cita => ({
  id: fecha + estado,
  cliente: "x",
  servicio: "y",
  fecha,
  estado,
});

const order = (fecha: string, price: number): Order => {
  const lines = [{ id: "p1", name: "p", price, qty: 1 }];
  return {
    id: fecha,
    number: fecha,
    fecha,
    cliente: "c",
    email: "e",
    ciudad: "",
    lines,
    shippingMethod: "recogida",
    payment: "tarjeta",
    totals: computeTotals(lines, "recogida"),
    entrega: fecha,
  };
};

describe("citasPorDia", () => {
  it("one point per day ending today, ignoring cancelled and out-of-range", () => {
    const pts = citasPorDia(
      [
        cita("2026-07-02T10:00"),
        cita("2026-07-02T11:00"),
        cita("2026-07-02T12:00", "cancelada"),
        cita("2026-06-19T09:00"),
        cita("2026-06-18T09:00"),
        cita("2026-07-03T09:00"),
      ],
      "2026-07-02",
      14,
    );
    expect(pts).toHaveLength(14);
    expect(pts[0]).toEqual({ key: "2026-06-19", value: 1 });
    expect(pts[13]).toEqual({ key: "2026-07-02", value: 2 });
    expect(pts.reduce((s, p) => s + p.value, 0)).toBe(3);
  });
});

describe("ventasPorSemana", () => {
  it("groups totals by Monday-starting week for the last N weeks", () => {
    const pts = ventasPorSemana(
      [
        order("2026-06-29", 10),
        order("2026-07-02", 5.5),
        order("2026-06-28", 100),
        order("2026-07-06", 999),
        order("2026-01-01", 7),
      ],
      "2026-07-02",
      2,
    );
    expect(pts).toEqual([
      { key: "2026-06-22", value: 100 },
      { key: "2026-06-29", value: 15.5 },
    ]);
  });

  it("sample history covers all 8 weeks up to today", () => {
    const pts = ventasPorSemana(PEDIDOS_EJEMPLO, "2026-07-02", 8);
    expect(pts).toHaveLength(8);
    expect(pts.every((p) => p.value > 0)).toBe(true);
  });
});

describe("topProductos", () => {
  it("ranks by views, ties by catalogue order, and cuts at n", () => {
    const top = topProductos({ p1: 5, p2: 9, p3: 9 }, productosSeed, 3);
    expect(top.map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
    expect(topProductos(VISTAS_EJEMPLO, productosSeed, 5)).toHaveLength(
      Math.min(5, productosSeed.length),
    );
  });
});

describe("computeKpis", () => {
  it("counts this week's citas, this month's sales and the average ticket", () => {
    const k = computeKpis(
      [
        cita("2026-06-29T10:00"),
        cita("2026-07-05T10:00"),
        cita("2026-07-06T10:00"),
        cita("2026-07-01T10:00", "cancelada"),
      ],
      [
        order("2026-07-01", 30),
        order("2026-07-02", 20),
        order("2026-06-30", 1000),
        order("2026-07-20", 5),
      ],
      productosSeed,
      "2026-07-02",
    );
    expect(k.citasSemana).toBe(2);
    expect(k.ventasMes).toBe(50);
    expect(k.pedidosMes).toBe(2);
    expect(k.ticketMedio).toBe(25);
    expect(k.productosActivos).toBe(productosSeed.filter((p) => p.active).length);
  });

  it("ticket medio is 0 without orders", () => {
    expect(computeKpis([], [], [], "2026-07-02").ticketMedio).toBe(0);
  });
});

describe("niceMax", () => {
  it("rounds up to a readable axis ceiling", () => {
    expect(niceMax([0])).toBe(1);
    expect(niceMax([7])).toBe(8);
    expect(niceMax([11])).toBe(12);
    expect(niceMax([13])).toBe(16);
    expect(niceMax([2300])).toBe(2500);
    expect(niceMax([4100])).toBe(5000);
  });
});
