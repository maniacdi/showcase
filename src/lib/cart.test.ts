import { describe, expect, it } from "vitest";
import { cartCount, cartTotal, type CartItem } from "./cart";

const items: CartItem[] = [
  { id: "p1", name: "Taza", price: 18.9, qty: 2 },
  { id: "p2", name: "Plato", price: 22, qty: 1 },
];

describe("cart helpers", () => {
  it("cartTotal sums price * qty", () => {
    expect(cartTotal(items)).toBeCloseTo(59.8);
  });
  it("cartCount sums quantities", () => {
    expect(cartCount(items)).toBe(3);
  });
  it("empty cart totals zero", () => {
    expect(cartTotal([])).toBe(0);
    expect(cartCount([])).toBe(0);
  });
});
