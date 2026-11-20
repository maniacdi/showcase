import { create } from "zustand";
import { type Producto, productosSeed } from "@/data/productos";

interface ProductsState {
  productos: Producto[];
  toggleActive: (id: string) => void;
  /**
   * Set each product's stock to its seed stock minus the units sold.
   * Idempotent (always computed from the seed), so it can run on every
   * orders rehydrate and after every new order.
   */
  applySold: (sold: Record<string, number>) => void;
}

const SEED_STOCK: Record<string, number> = Object.fromEntries(
  productosSeed.map((p) => [p.id, p.stock]),
);

// In-memory, seeded each load (deterministic; admin↔storefront linkage in-session).
export const useProductsStore = create<ProductsState>()((set) => ({
  productos: productosSeed.map((p) => ({ ...p })),
  toggleActive: (id) =>
    set((s) => ({
      productos: s.productos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    })),
  applySold: (sold) =>
    set((s) => ({
      productos: s.productos.map((p) => ({
        ...p,
        stock: Math.max(0, (SEED_STOCK[p.id] ?? p.stock) - (sold[p.id] ?? 0)),
      })),
    })),
}));
