import { create } from "zustand";
import { type Producto, productosSeed } from "@/data/productos";

interface ProductsState {
  productos: Producto[];
  toggleActive: (id: string) => void;
}

// In-memory, seeded each load (deterministic; admin↔storefront linkage in-session).
export const useProductsStore = create<ProductsState>()((set) => ({
  productos: productosSeed.map((p) => ({ ...p })),
  toggleActive: (id) =>
    set((s) => ({
      productos: s.productos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    })),
}));
