import { beforeEach, describe, expect, it } from "vitest";
import { productosSeed } from "@/data/productos";
import { rehydrateOrders, useOrdersStore } from "./useOrdersStore";
import { useProductsStore } from "./useProductsStore";

const p1 = productosSeed.find((p) => p.id === "p1")!;
const line = (qty: number) => ({ id: p1.id, name: p1.name, price: p1.price, qty });
const input = (qty: number) => ({
  items: [line(qty)],
  cliente: " Ana Díaz ",
  email: "ana@example.com",
  ciudad: "Santander",
  shippingMethod: "estandar" as const,
  payment: "tarjeta" as const,
  cardLast4: "4242 4242 4242 4242",
});
const stockOf = (id: string) =>
  useProductsStore.getState().productos.find((p) => p.id === id)!.stock;

beforeEach(() => {
  sessionStorage.clear();
  useOrdersStore.setState({ orders: [] });
  useProductsStore.setState({ productos: productosSeed.map((p) => ({ ...p })) });
});

describe("useOrdersStore", () => {
  it("places an order and decrements stock", () => {
    const res = useOrdersStore.getState().place(input(2));
    expect(res.ok).toBe(true);
    expect(stockOf("p1")).toBe(p1.stock - 2);
    expect(useOrdersStore.getState().orders).toHaveLength(1);
    if (res.ok) {
      expect(res.order.number).toBe("SC-260702-0101");
      expect(res.order.fecha).toBe("2026-07-02");
      expect(res.order.cliente).toBe("Ana Díaz");
      expect(res.order.totals.total).toBe(p1.price * 2);
    }
  });

  it("keeps only the last 4 card digits, also in storage", () => {
    const res = useOrdersStore.getState().place(input(1));
    expect(res.ok && res.order.cardLast4).toBe("4242");
    const persisted = sessionStorage.getItem("showcase-orders") ?? "";
    expect(persisted).toContain('"cardLast4":"4242"');
    expect(persisted).not.toContain("4242 4242");
    expect(persisted).not.toContain("42424242");
  });

  it("blocks orders over the remaining stock", () => {
    const res = useOrdersStore.getState().place(input(p1.stock + 1));
    expect(res).toEqual({ ok: false, outOfStock: ["p1"] });
    expect(stockOf("p1")).toBe(p1.stock);
    expect(useOrdersStore.getState().orders).toHaveLength(0);
  });

  it("blocks inactive products and empty carts", () => {
    useProductsStore.getState().toggleActive("p1");
    expect(useOrdersStore.getState().place(input(1)).ok).toBe(false);
    expect(useOrdersStore.getState().place({ ...input(1), items: [] }).ok).toBe(false);
  });

  it("sells out exactly to zero, then blocks", () => {
    expect(useOrdersStore.getState().place(input(p1.stock)).ok).toBe(true);
    expect(stockOf("p1")).toBe(0);
    expect(useOrdersStore.getState().place(input(1)).ok).toBe(false);
  });

  it("rehydrate re-applies sold units idempotently", async () => {
    useOrdersStore.getState().place(input(3));
    useProductsStore.setState({ productos: productosSeed.map((p) => ({ ...p })) });
    await rehydrateOrders();
    await rehydrateOrders();
    expect(stockOf("p1")).toBe(p1.stock - 3);
  });
});
