import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/cart";
import type { Producto } from "@/data/productos";

interface CartState {
  items: CartItem[];
  add: (producto: Pick<Producto, "id" | "name" | "price">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (producto, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === producto.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === producto.id ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return {
            items: [...s.items, { id: producto.id, name: producto.name, price: producto.price, qty }],
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "showcase-cart" },
  ),
);
