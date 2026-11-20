import type { Cita } from "@/data/citas";
import type { Producto } from "@/data/productos";
import { addDays, startOfWeek } from "@/lib/agenda";
import type { Order } from "@/lib/checkout";

/**
 * Aggregations behind the admin overview charts. Pure and anchored to a
 * `today` passed in (the demo's fixed AGENDA_HOY), never Date.now(), so the
 * server and the browser render the same numbers.
 */

export interface Point {
  /** "YYYY-MM-DD": the day, or the Monday of the week. */
  key: string;
  value: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Non-cancelled citas per day for the `days` days ending on `today`. */
export function citasPorDia(citas: Cita[], today: string, days = 14): Point[] {
  const start = addDays(today, -(days - 1));
  const counts = new Map<string, number>();
  for (const c of citas) {
    if (c.estado === "cancelada") continue;
    const d = c.fecha.slice(0, 10);
    if (d >= start && d <= today) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const key = addDays(start, i);
    return { key, value: counts.get(key) ?? 0 };
  });
}

/** Sales total per week (Monday keys) for the `weeks` weeks ending with today's week. */
export function ventasPorSemana(orders: Order[], today: string, weeks = 8): Point[] {
  const last = startOfWeek(today);
  const first = addDays(last, -7 * (weeks - 1));
  const sums = new Map<string, number>();
  for (const o of orders) {
    if (o.fecha > today) continue;
    const w = startOfWeek(o.fecha);
    if (w >= first) sums.set(w, (sums.get(w) ?? 0) + o.totals.total);
  }
  return Array.from({ length: weeks }, (_, i) => {
    const key = addDays(first, 7 * i);
    return { key, value: round2(sums.get(key) ?? 0) };
  });
}

export interface RankedProduct {
  id: string;
  name: string;
  value: number;
}

/** Top `n` products by views, highest first (ties by catalogue order). */
export function topProductos(
  views: Record<string, number>,
  productos: Producto[],
  n = 5,
): RankedProduct[] {
  return productos
    .map((p, i) => ({ id: p.id, name: p.name, value: views[p.id] ?? 0, i }))
    .sort((a, b) => b.value - a.value || a.i - b.i)
    .slice(0, n)
    .map(({ id, name, value }) => ({ id, name, value }));
}

export interface Kpis {
  citasSemana: number;
  ventasMes: number;
  pedidosMes: number;
  ticketMedio: number;
  productosActivos: number;
}

export function computeKpis(
  citas: Cita[],
  orders: Order[],
  productos: Producto[],
  today: string,
): Kpis {
  const monday = startOfWeek(today);
  const sunday = addDays(monday, 6);
  const citasSemana = citas.filter((c) => {
    const d = c.fecha.slice(0, 10);
    return c.estado !== "cancelada" && d >= monday && d <= sunday;
  }).length;
  const month = today.slice(0, 7);
  const delMes = orders.filter((o) => o.fecha.slice(0, 7) === month && o.fecha <= today);
  const ventasMes = round2(delMes.reduce((s, o) => s + o.totals.total, 0));
  return {
    citasSemana,
    ventasMes,
    pedidosMes: delMes.length,
    ticketMedio: delMes.length ? round2(ventasMes / delMes.length) : 0,
    productosActivos: productos.filter((p) => p.active).length,
  };
}

/** Scale ceiling for a chart axis: max value rounded up to a "nice" number. */
export function niceMax(values: number[]): number {
  const max = Math.max(0, ...values);
  if (max === 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 1.2, 1.6, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * pow >= max)!;
  return Number((step * pow).toPrecision(12));
}
