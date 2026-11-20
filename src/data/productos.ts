export interface PhotoCredit {
  author: string;
  license: string;
  /** Source page of the photo (shown as the credit link). */
  href: string;
}

/**
 * A photo with optional attribution. For a client's own image, set `src`
 * (plus `alt`, `width`, `height`) and drop `srcSet`/`credit`; `credit` is only
 * needed for third-party photos that require attribution.
 */
export interface Photo {
  src: string;
  srcSet?: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position, keeps the subject in frame when cropped. */
  position?: string;
  credit?: PhotoCredit;
}

export interface Producto {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  active: boolean;
  image: Photo;
}

// Category → brand colour (used by the generated OG image).
export const CATEGORY_COLORS: Record<string, string> = {
  Móviles: "#1f4fff",
  Audio: "#c2410c",
  Wearables: "#0e7c5a",
  Portátiles: "#6d28d9",
  Fotografía: "#b91c1c",
};

const UNSPLASH = "Unsplash License";
const W = 1200;
const H = 900;

/**
 * Demo catalogue: Unsplash photos, cropped to 4:3 and served from
 * public/images/productos/<slug>.jpg (no hotlinking, no remotePatterns).
 */
export const productosSeed: Producto[] = [
  {
    id: "p1", slug: "smartphone-pro", name: "Smartphone Pro 6,3\"", price: 999, category: "Móviles",
    description: "Pantalla OLED de 6,3\", triple cámara de 48 MP y 256 GB de almacenamiento.", stock: 18, active: true,
    image: {
      src: "/images/productos/smartphone-pro.jpg", width: W, height: H,
      alt: "Smartphone de acabado titanio visto por detrás y por delante sobre fondo gris claro",
      credit: { author: "Igor Omilaev", license: UNSPLASH, href: "https://unsplash.com/photos/lDWTfYhZ85w" },
    },
  },
  {
    id: "p2", slug: "auriculares-inalambricos", name: "Auriculares inalámbricos", price: 279, category: "Audio",
    description: "Over-ear con cancelación activa de ruido y hasta 30 h de batería.", stock: 32, active: true,
    image: {
      src: "/images/productos/auriculares-inalambricos.jpg", width: W, height: H,
      alt: "Auriculares inalámbricos negros de diadema sobre una mesa blanca",
      credit: { author: "Sam Grozyan", license: UNSPLASH, href: "https://unsplash.com/photos/P7KF3cTRKcE" },
    },
  },
  {
    id: "p3", slug: "smartwatch", name: "Smartwatch", price: 349, category: "Wearables",
    description: "Caja de aluminio de 41 mm, GPS, pulsómetro y correa de malla de acero.", stock: 14, active: true,
    image: {
      src: "/images/productos/smartwatch.jpg", width: W, height: H,
      alt: "Smartwatch dorado con correa de malla metálica sobre fondo blanco",
      credit: { author: "Lucien Watterlot", license: UNSPLASH, href: "https://unsplash.com/photos/nO-L9IgVipQ" },
    },
  },
  {
    id: "p4", slug: "altavoz-bluetooth", name: "Altavoz Bluetooth", price: 129, category: "Audio",
    description: "Altavoz portátil resistente al agua (IP67), 12 h de autonomía.", stock: 0, active: true,
    image: {
      src: "/images/productos/altavoz-bluetooth.jpg", width: W, height: H,
      alt: "Altavoz Bluetooth portátil negro y cilíndrico sobre una mesa de madera",
      credit: { author: "Nejc Soklič", license: UNSPLASH, href: "https://unsplash.com/photos/g5Y5kjOwGwQ" },
    },
  },
  {
    id: "p5", slug: "portatil-ultraligero", name: "Portátil ultraligero 14\"", price: 1199, category: "Portátiles",
    description: "Portátil de aluminio de 1,2 kg, 16 GB de RAM y SSD de 512 GB.", stock: 9, active: true,
    image: {
      src: "/images/productos/portatil-ultraligero.jpg", width: W, height: H,
      alt: "Portátil plateado abierto sobre un escritorio blanco junto a un móvil, unos auriculares y objetivos de cámara",
      credit: { author: "Christopher Gower", license: UNSPLASH, href: "https://unsplash.com/photos/vjMgqUkS8q8" },
    },
  },
  {
    id: "p6", slug: "camara-mirrorless", name: "Cámara mirrorless", price: 1899, category: "Fotografía",
    description: "Sensor full frame de 33 MP y vídeo 4K. Solo cuerpo.", stock: 5, active: false,
    image: {
      src: "/images/productos/camara-mirrorless.jpg", width: W, height: H,
      alt: "Cámara mirrorless negra con tapa de bayoneta sobre fondo blanco",
      credit: { author: "Raju Kumar", license: UNSPLASH, href: "https://unsplash.com/photos/fS9DcygPTwc" },
    },
  },
];

/** Look up a product's photo by id (cart items only persist id/name/price). */
export function productImage(id: string): Photo | undefined {
  return productosSeed.find((p) => p.id === id)?.image;
}
