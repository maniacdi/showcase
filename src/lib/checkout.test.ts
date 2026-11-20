import { describe, expect, it } from "vitest";
import {
  addWorkingDays,
  computeTotals,
  estimatedDelivery,
  formatCardNumber,
  formatExpiry,
  isValidBizumPhone,
  isValidCardNumber,
  isValidExpiry,
  isValidPostalCodeES,
  luhnCheck,
  orderNumber,
  outOfStockLines,
  shippingCost,
  soldByProduct,
  validateCard,
  validateShipping,
  type Order,
  type ShippingValues,
} from "./checkout";

const item = (id: string, price: number, qty: number) => ({ id, name: id, price, qty });

describe("totals, IVA and shipping", () => {
  it("adds standard shipping under the free threshold", () => {
    const t = computeTotals([item("a", 30, 2)], "estandar");
    expect(t.subtotal).toBe(60);
    expect(t.shipping).toBe(4.95);
    expect(t.total).toBe(64.95);
  });

  it("standard shipping is free from 100 €, express never is", () => {
    expect(shippingCost("estandar", 100)).toBe(0);
    expect(shippingCost("estandar", 99.99)).toBe(4.95);
    expect(shippingCost("urgente", 500)).toBe(9.95);
    expect(shippingCost("recogida", 10)).toBe(0);
  });

  it("extracts the 21% IVA from IVA-inclusive prices", () => {
    const t = computeTotals([item("a", 121, 1)], "recogida");
    expect(t.total).toBe(121);
    expect(t.base).toBe(100);
    expect(t.iva).toBe(21);
  });

  it("base + iva always equals total (no float drift)", () => {
    const t = computeTotals([item("a", 19.99, 3), item("b", 0.1, 7)], "urgente");
    expect(t.total).toBe(70.62);
    expect(Math.round((t.base + t.iva) * 100)).toBe(Math.round(t.total * 100));
    expect(t.base).toBe(58.36);
  });

  it("empty cart with pick-up totals zero", () => {
    expect(computeTotals([], "recogida").total).toBe(0);
  });
});

describe("card validation", () => {
  it("Luhn accepts valid numbers and rejects a changed digit", () => {
    expect(luhnCheck("4242424242424242")).toBe(true);
    expect(luhnCheck("4242 4242 4242 4241")).toBe(false);
    expect(luhnCheck("79927398713")).toBe(true);
    expect(luhnCheck("abc")).toBe(false);
  });

  it("card number needs 13 to 19 digits and a valid checksum", () => {
    expect(isValidCardNumber("4242 4242 4242 4242")).toBe(true);
    expect(isValidCardNumber("5555-5555-5555-4444")).toBe(true);
    expect(isValidCardNumber("0")).toBe(false);
    expect(isValidCardNumber("4242 4242 4242")).toBe(false);
  });

  it("expiry must be MM/YY and not in the past", () => {
    const now = new Date(2026, 6, 2); // July 2026
    expect(isValidExpiry("07/26", now)).toBe(true);
    expect(isValidExpiry("06/26", now)).toBe(false);
    expect(isValidExpiry("13/30", now)).toBe(false);
    expect(isValidExpiry("1/30", now)).toBe(false);
  });

  it("validateCard reports each bad field", () => {
    const e = validateCard(
      { holder: "", number: "1234", expiry: "00/00", cvc: "1" },
      new Date(2026, 0, 1),
    );
    expect(Object.keys(e).sort()).toEqual(["cvc", "expiry", "holder", "number"]);
    expect(
      validateCard(
        { holder: "Ana", number: "4242424242424242", expiry: "12/30", cvc: "123" },
        new Date(2026, 0, 1),
      ),
    ).toEqual({});
  });

  it("formats card number and expiry while typing", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("42a42")).toBe("4242");
    expect(formatExpiry("1228")).toBe("12/28");
    expect(formatExpiry("1")).toBe("1");
  });

  it("Bizum needs a Spanish mobile", () => {
    expect(isValidBizumPhone("612 345 678")).toBe(true);
    expect(isValidBizumPhone("+34 712345678")).toBe(true);
    expect(isValidBizumPhone("912345678")).toBe(false);
    expect(isValidBizumPhone("61234567")).toBe(false);
  });
});

describe("postal code and shipping form", () => {
  it("accepts Spanish postal codes 01000 to 52999 only", () => {
    expect(isValidPostalCodeES("39001")).toBe(true);
    expect(isValidPostalCodeES("01001")).toBe(true);
    expect(isValidPostalCodeES("52006")).toBe(true);
    expect(isValidPostalCodeES("00123")).toBe(false);
    expect(isValidPostalCodeES("53001")).toBe(false);
    expect(isValidPostalCodeES("3900")).toBe(false);
    expect(isValidPostalCodeES("39a01")).toBe(false);
  });

  const valid: ShippingValues = {
    name: "Ana Díaz",
    email: "ana@example.com",
    address: "Calle Mayor 1",
    city: "Santander",
    postalCode: "39001",
    phone: "612 345 678",
    method: "estandar",
  };

  it("passes a complete form and flags bad fields", () => {
    expect(validateShipping(valid)).toEqual({});
    expect(validateShipping({ ...valid, postalCode: "99999", email: "x" })).toEqual({
      postalCode: "invalid",
      email: "invalid",
    });
  });

  it("pick-up in store does not need an address", () => {
    expect(
      validateShipping({ ...valid, method: "recogida", address: "", city: "", postalCode: "" }),
    ).toEqual({});
  });
});

describe("orders helpers", () => {
  it("skips weekends for delivery estimates", () => {
    // 2026-07-02 is a Thursday
    expect(addWorkingDays("2026-07-02", 1)).toBe("2026-07-03");
    expect(addWorkingDays("2026-07-02", 2)).toBe("2026-07-06");
    expect(estimatedDelivery("2026-07-02", "estandar")).toBe("2026-07-07");
  });

  it("builds order numbers from date and sequence", () => {
    expect(orderNumber("2026-07-02", 101)).toBe("SC-260702-0101");
  });

  it("sums units sold and finds lines over stock", () => {
    const o = (lines: { id: string; qty: number }[]) =>
      ({ lines: lines.map((l) => ({ ...l, name: l.id, price: 1 })) }) as unknown as Order;
    expect(
      soldByProduct([
        o([{ id: "p1", qty: 2 }]),
        o([
          { id: "p1", qty: 1 },
          { id: "p2", qty: 4 },
        ]),
      ]),
    ).toEqual({ p1: 3, p2: 4 });
    expect(outOfStockLines([item("p1", 1, 3), item("p2", 1, 1)], { p1: 2, p2: 1 })).toEqual(["p1"]);
    expect(outOfStockLines([item("p3", 1, 1)], {})).toEqual(["p3"]);
  });
});
