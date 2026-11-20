import type { Cita } from "@/data/citas";
import type { Producto } from "@/data/productos";
import type { Order } from "@/lib/checkout";
import { type CsvCell, toCSV } from "@/lib/csv";

/**
 * Admin CSV exports. Spanish Excel expects ";" and a decimal comma; English
 * Excel expects "," and a decimal point, so both follow the UI locale.
 */
export interface CsvFormat {
  sep: ";" | ",";
  decimal: (n: number) => string;
}

export function csvFormat(locale: string): CsvFormat {
  return locale === "es"
    ? { sep: ";", decimal: (n) => n.toFixed(2).replace(".", ",") }
    : { sep: ",", decimal: (n) => n.toFixed(2) };
}

export function citasCSV(
  citas: Cita[],
  header: string[],
  estado: (c: Cita) => string,
  profesional: (id?: string) => string,
  fmt: CsvFormat,
): string {
  const rows: CsvCell[][] = [header];
  for (const c of citas) {
    rows.push([
      c.id,
      c.cliente,
      c.servicio,
      c.fecha.slice(0, 10),
      c.fecha.slice(11, 16),
      estado(c),
      profesional(c.profesionalId),
      c.telefono ?? "",
    ]);
  }
  return toCSV(rows, fmt.sep);
}

export function productosCSV(
  productos: Producto[],
  header: string[],
  yesNo: (b: boolean) => string,
  views: Record<string, number>,
  fmt: CsvFormat,
): string {
  const rows: CsvCell[][] = [header];
  for (const p of productos) {
    rows.push([
      p.id,
      p.slug,
      p.name,
      p.category,
      fmt.decimal(p.price),
      p.stock,
      yesNo(p.active),
      views[p.id] ?? 0,
    ]);
  }
  return toCSV(rows, fmt.sep);
}

export function ordersCSV(
  orders: Order[],
  header: string[],
  shipping: (o: Order) => string,
  payment: (o: Order) => string,
  fmt: CsvFormat,
): string {
  const rows: CsvCell[][] = [header];
  for (const o of orders) {
    rows.push([
      o.number,
      o.fecha,
      o.cliente,
      o.ciudad,
      o.lines.map((l) => `${l.qty} x ${l.name}`).join(" | "),
      shipping(o),
      payment(o),
      fmt.decimal(o.totals.base),
      fmt.decimal(o.totals.iva),
      fmt.decimal(o.totals.total),
      o.entrega,
    ]);
  }
  return toCSV(rows, fmt.sep);
}
