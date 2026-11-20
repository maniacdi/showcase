import { addDays, weekdayOf } from "@/lib/agenda";
import type { CartItem } from "@/lib/cart";

/**
 * Simulated checkout: totals with the IVA breakdown, shipping, validation of
 * the shipping and payment forms, and the order model. Pure functions only
 * (unit tested in checkout.test.ts). Nothing here charges or sends anything.
 */

/** Spanish general VAT. Catalogue prices already include it. */
export const IVA_RATE = 0.21;

export type ShippingMethodId = "estandar" | "urgente" | "recogida";

export interface ShippingMethod {
  id: ShippingMethodId;
  /** Price in euros, IVA included. */
  price: number;
  /** Working days until delivery. */
  days: number;
}

/** Orders at or above this subtotal ship free with the standard method. */
export const FREE_SHIPPING_FROM = 100;

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "estandar", price: 4.95, days: 3 },
  { id: "urgente", price: 9.95, days: 1 },
  { id: "recogida", price: 0, days: 2 },
];

const toCents = (n: number) => Math.round(n * 100);
const fromCents = (c: number) => c / 100;

export function shippingCost(method: ShippingMethodId, subtotal: number): number {
  const m = SHIPPING_METHODS.find((s) => s.id === method) ?? SHIPPING_METHODS[0];
  if (m.id === "estandar" && subtotal >= FREE_SHIPPING_FROM) return 0;
  return m.price;
}

export interface Totals {
  /** Sum of the lines, IVA included. */
  subtotal: number;
  shipping: number;
  /** subtotal + shipping, IVA included: what the customer pays. */
  total: number;
  /** total without IVA. */
  base: number;
  /** IVA contained in total (total - base). */
  iva: number;
}

/** Prices include IVA, so IVA is extracted from the total, not added on top. */
export function computeTotals(items: CartItem[], method: ShippingMethodId): Totals {
  const subtotalC = items.reduce((sum, i) => sum + toCents(i.price) * i.qty, 0);
  const shippingC = toCents(shippingCost(method, fromCents(subtotalC)));
  const totalC = subtotalC + shippingC;
  const baseC = Math.round(totalC / (1 + IVA_RATE));
  return {
    subtotal: fromCents(subtotalC),
    shipping: fromCents(shippingC),
    total: fromCents(totalC),
    base: fromCents(baseC),
    iva: fromCents(totalC - baseC),
  };
}

/* ---------------- Validation ---------------- */

/** Spanish postal code: 5 digits, province prefix 01–52. */
export function isValidPostalCodeES(value: string): boolean {
  return /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/.test(value.trim());
}

/** Luhn checksum over the digits of `value` (spaces and dashes ignored). */
export function luhnCheck(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function isValidCardNumber(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  return /^\d{13,19}$/.test(digits) && luhnCheck(digits);
}

/** "MM/AA" not in the past, compared with `now` (passed in, never read at render). */
export function isValidExpiry(value: string, now: Date): boolean {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const current = now.getFullYear() * 12 + now.getMonth();
  return year * 12 + (month - 1) >= current;
}

export function isValidCvc(value: string): boolean {
  return /^\d{3,4}$/.test(value.trim());
}

/** Spanish mobile for Bizum: 9 digits starting with 6 or 7, optional +34. */
export function isValidBizumPhone(value: string): boolean {
  const digits = value.replace(/[\s.-]/g, "").replace(/^(\+34|0034)/, "");
  return /^[67]\d{8}$/.test(digits);
}

/** "4242424242424242" → "4242 4242 4242 4242" (max 19 digits). */
export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** "1228" → "12/28" while typing. */
export function formatExpiry(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export interface ShippingValues {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  method: ShippingMethodId;
}

export type ShippingErrors = Partial<Record<keyof ShippingValues, "required" | "invalid">>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateShipping(v: ShippingValues): ShippingErrors {
  const e: ShippingErrors = {};
  if (!v.name.trim()) e.name = "required";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "invalid";
  // Pick-up in store needs no address.
  if (v.method !== "recogida") {
    if (!v.address.trim()) e.address = "required";
    if (!v.city.trim()) e.city = "required";
    if (!isValidPostalCodeES(v.postalCode)) e.postalCode = "invalid";
  }
  const phoneDigits = v.phone.replace(/\D/g, "").length;
  if (!/^\+?[\d\s.-]+$/.test(v.phone.trim()) || phoneDigits < 9 || phoneDigits > 15)
    e.phone = "invalid";
  return e;
}

export type PaymentMethod = "tarjeta" | "bizum";

export interface CardValues {
  holder: string;
  number: string;
  expiry: string;
  cvc: string;
}

export type CardErrors = Partial<Record<keyof CardValues, "required" | "invalid">>;

export function validateCard(v: CardValues, now: Date): CardErrors {
  const e: CardErrors = {};
  if (!v.holder.trim()) e.holder = "required";
  if (!isValidCardNumber(v.number)) e.number = "invalid";
  if (!isValidExpiry(v.expiry, now)) e.expiry = "invalid";
  if (!isValidCvc(v.cvc)) e.cvc = "invalid";
  return e;
}

/* ---------------- Orders ---------------- */

export type OrderLine = CartItem;

export interface Order {
  id: string;
  /** Human order number, e.g. "SC-260702-0101". */
  number: string;
  /** Order date "YYYY-MM-DD" (the demo's fixed today for new orders). */
  fecha: string;
  cliente: string;
  email: string;
  /** City shown in the admin table (empty for store pick-up). */
  ciudad: string;
  lines: OrderLine[];
  shippingMethod: ShippingMethodId;
  payment: PaymentMethod;
  /** Only the last 4 digits are ever kept; the full number never leaves the form. */
  cardLast4?: string;
  totals: Totals;
  /** Estimated delivery "YYYY-MM-DD". */
  entrega: string;
  /** true for the generated "Datos de ejemplo" history. */
  sample?: boolean;
}

export function orderNumber(fecha: string, seq: number): string {
  return `SC-${fecha.replace(/-/g, "").slice(2)}-${String(seq).padStart(4, "0")}`;
}

/** `days` working days after `from` (weekends skipped). */
export function addWorkingDays(from: string, days: number): string {
  let d = from;
  let left = days;
  while (left > 0) {
    d = addDays(d, 1);
    const wd = weekdayOf(d);
    if (wd !== 0 && wd !== 6) left--;
  }
  return d;
}

export function estimatedDelivery(from: string, method: ShippingMethodId): string {
  const m = SHIPPING_METHODS.find((s) => s.id === method) ?? SHIPPING_METHODS[0];
  return addWorkingDays(from, m.days);
}

/** Units sold per product id across orders. */
export function soldByProduct(orders: Order[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const o of orders) for (const l of o.lines) out[l.id] = (out[l.id] ?? 0) + l.qty;
  return out;
}

/** Ids of lines that ask for more units than `stock` has. */
export function outOfStockLines(items: CartItem[], stock: Record<string, number>): string[] {
  return items.filter((i) => i.qty > (stock[i.id] ?? 0)).map((i) => i.id);
}
