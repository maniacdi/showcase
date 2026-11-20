import { AGENDA_HOY } from "@/data/clinica";
import { productosSeed } from "@/data/productos";
import { addDays } from "@/lib/agenda";
import {
  type Order,
  type ShippingMethodId,
  computeTotals,
  estimatedDelivery,
  orderNumber,
} from "@/lib/checkout";

/**
 * Sample shop history ("Datos de ejemplo") for the admin overview: orders for
 * the 8 weeks before the demo's fixed today (AGENDA_HOY) and product views.
 * Deterministic patterns, not statistics; they never touch real stock.
 */

const CLIENTES = [
  "Marta Vidal",
  "Óscar Peña",
  "Laura Gil",
  "Hugo Sanz",
  "Elena Ríos",
  "Diego Mora",
  "Sara León",
];
const CIUDADES = ["Santander", "Madrid", "Bilbao", "Valencia", "Sevilla", "Zaragoza", "Oviedo"];
const METODOS: ShippingMethodId[] = ["estandar", "estandar", "urgente", "recogida"];

function buildPedidos(): Order[] {
  const out: Order[] = [];
  let k = 0;
  for (let offset = -56; offset <= -1; offset++) {
    const fecha = addDays(AGENDA_HOY, offset);
    // 0 to 3 orders a day, slowly growing towards today.
    const perDay = (Math.abs(offset * 7) % 4) + (offset > -21 ? 1 : 0) - 1;
    for (let i = 0; i < perDay; i++) {
      k++;
      const p = productosSeed[(k * 3) % productosSeed.length];
      const qty = k % 5 === 0 ? 2 : 1;
      const method = METODOS[k % METODOS.length];
      const lines = [{ id: p.id, name: p.name, price: p.price, qty }];
      out.push({
        id: `s${k}`,
        number: orderNumber(fecha, k),
        fecha,
        cliente: CLIENTES[k % CLIENTES.length],
        email: "cliente@example.com",
        ciudad: method === "recogida" ? "" : CIUDADES[k % CIUDADES.length],
        lines,
        shippingMethod: method,
        payment: k % 3 === 0 ? "bizum" : "tarjeta",
        totals: computeTotals(lines, method),
        entrega: estimatedDelivery(fecha, method),
        sample: true,
      });
    }
  }
  return out;
}

export const PEDIDOS_EJEMPLO: Order[] = buildPedidos();

/** Product page views in the last 30 days (sample). */
export const VISTAS_EJEMPLO: Record<string, number> = Object.fromEntries(
  productosSeed.map((p, i) => [p.id, 120 + ((i * 397) % 860)]),
);
