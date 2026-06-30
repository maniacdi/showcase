import { beforeEach, describe, expect, it } from "vitest";
import { cartTotal } from "@/lib/cart";
import { useCartStore } from "./useCartStore";

const taza = { id: "p1", name: "Taza", price: 18.9 };
const plato = { id: "p2", name: "Plato", price: 22 };

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe("useCartStore", () => {
  it("adds an item", () => {
    useCartStore.getState().add(taza);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].qty).toBe(1);
  });

  it("merges quantity when adding the same product", () => {
    useCartStore.getState().add(taza);
    useCartStore.getState().add(taza, 2);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].qty).toBe(3);
  });

  it("setQty updates and clamps to >= 1", () => {
    useCartStore.getState().add(taza);
    useCartStore.getState().setQty("p1", 5);
    expect(useCartStore.getState().items[0].qty).toBe(5);
    useCartStore.getState().setQty("p1", 0);
    expect(useCartStore.getState().items[0].qty).toBe(1);
  });

  it("remove deletes an item and total reflects it", () => {
    useCartStore.getState().add(taza, 2);
    useCartStore.getState().add(plato);
    useCartStore.getState().remove("p1");
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(cartTotal(useCartStore.getState().items)).toBe(22);
  });

  it("clear empties the cart", () => {
    useCartStore.getState().add(taza);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
