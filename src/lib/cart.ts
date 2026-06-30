export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatPrice(n: number): string {
  return fmt.format(n);
}
