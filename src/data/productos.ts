export interface Producto {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  active: boolean;
}

// Category → placeholder color (no real images yet; polish later).
export const CATEGORY_COLORS: Record<string, string> = {
  Cerámica: "#c2410c",
  Textil: "#1f4fff",
  Papelería: "#0e7c5a",
};

export const productosSeed: Producto[] = [
  { id: "p1", slug: "taza-artesana", name: "Taza artesana", price: 18.9, category: "Cerámica", description: "Taza de gres esmaltada a mano, 300 ml. Cada pieza es única.", stock: 24, active: true },
  { id: "p2", slug: "plato-hondo", name: "Plato hondo", price: 22.0, category: "Cerámica", description: "Plato de cerámica para uso diario, apto para lavavajillas.", stock: 12, active: true },
  { id: "p3", slug: "bolsa-lino", name: "Bolsa de lino", price: 14.5, category: "Textil", description: "Bolsa de lino natural con asas reforzadas.", stock: 40, active: true },
  { id: "p4", slug: "panuelo-algodon", name: "Pañuelo de algodón", price: 12.0, category: "Textil", description: "Pañuelo de algodón estampado, 50×50 cm.", stock: 0, active: true },
  { id: "p5", slug: "cuaderno-cosido", name: "Cuaderno cosido", price: 9.9, category: "Papelería", description: "Cuaderno A5 de papel reciclado, cosido a mano.", stock: 60, active: true },
  { id: "p6", slug: "set-postales", name: "Set de postales", price: 7.5, category: "Papelería", description: "Pack de 6 postales ilustradas.", stock: 30, active: false },
];
