import { beforeEach, describe, expect, it } from "vitest";
import { productosSeed } from "@/data/productos";
import { useProductsStore } from "./useProductsStore";

beforeEach(() => {
  useProductsStore.setState({ productos: productosSeed.map((p) => ({ ...p })) });
});

describe("useProductsStore", () => {
  it("toggleActive flips a product's active flag", () => {
    const before = useProductsStore.getState().productos.find((p) => p.id === "p1")!.active;
    useProductsStore.getState().toggleActive("p1");
    const after = useProductsStore.getState().productos.find((p) => p.id === "p1")!.active;
    expect(after).toBe(!before);
  });
});
