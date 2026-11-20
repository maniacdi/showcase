import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AGENDA_HOY } from "@/data/clinica";
import type { CartItem } from "@/lib/cart";
import {
  type Order,
  type PaymentMethod,
  type ShippingMethodId,
  computeTotals,
  estimatedDelivery,
  orderNumber,
  outOfStockLines,
  soldByProduct,
} from "@/lib/checkout";
import { useProductsStore } from "./useProductsStore";

export interface PlaceOrderInput {
  items: CartItem[];
  cliente: string;
  email: string;
  ciudad: string;
  shippingMethod: ShippingMethodId;
  payment: PaymentMethod;
  /** Last 4 digits only. Never pass the full card number. */
  cardLast4?: string;
}

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; outOfStock: string[] };

interface OrdersState {
  orders: Order[];
  place: (input: PlaceOrderInput) => PlaceOrderResult;
}

function syncStock(orders: Order[]) {
  useProductsStore.getState().applySold(soldByProduct(orders));
}

/**
 * Simulated shop orders. Kept in sessionStorage like the citas: they survive
 * a reload within the visit, and each new visitor starts from the seed stock.
 * New orders are dated on the demo's fixed today (AGENDA_HOY) so they land in
 * the admin charts next to the sample history.
 * `skipHydration`: call `rehydrateOrders()` after mount.
 */
export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (input) => {
        const productos = useProductsStore.getState().productos;
        const stock = Object.fromEntries(
          productos.filter((p) => p.active).map((p) => [p.id, p.stock]),
        );
        const items = input.items.filter((i) => i.qty > 0);
        const out = items.length ? outOfStockLines(items, stock) : [];
        if (!items.length || out.length) return { ok: false, outOfStock: out };

        const seq = 101 + get().orders.length;
        const order: Order = {
          id: `o${seq}`,
          number: orderNumber(AGENDA_HOY, seq),
          fecha: AGENDA_HOY,
          cliente: input.cliente.trim(),
          email: input.email.trim(),
          ciudad: input.shippingMethod === "recogida" ? "" : input.ciudad.trim(),
          lines: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
          shippingMethod: input.shippingMethod,
          payment: input.payment,
          ...(input.payment === "tarjeta" && input.cardLast4
            ? { cardLast4: input.cardLast4.replace(/\D/g, "").slice(-4) }
            : {}),
          totals: computeTotals(items, input.shippingMethod),
          entrega: estimatedDelivery(AGENDA_HOY, input.shippingMethod),
        };
        const orders = [...get().orders, order];
        set({ orders });
        syncStock(orders);
        return { ok: true, order };
      },
    }),
    {
      name: "showcase-orders",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ orders: s.orders }),
      skipHydration: true,
    },
  ),
);

/** Load the session's orders after mount and apply them to the product stock. */
export async function rehydrateOrders(): Promise<void> {
  await useOrdersStore.persist.rehydrate();
  syncStock(useOrdersStore.getState().orders);
}
