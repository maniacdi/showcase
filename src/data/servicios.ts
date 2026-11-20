import type { Photo } from "./productos";

export interface ServiceItem {
  title: string;
  text: string;
}
export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export const services: ServiceItem[] = [
  { title: "Diseño web", text: "Sitios rápidos, claros y orientados a conversión." },
  { title: "Identidad", text: "Logo y sistema visual coherente para tu marca." },
  { title: "SEO local", text: "Apareces cuando tus clientes buscan cerca." },
];

export interface Ventaja {
  num: string;
  title: string;
  text: string;
}

// "Por qué elegirnos" — diferenciadores concretos (sin imágenes; placeholder de
// pulido posterior para iconos/identidad reales).
export const ventajas: Ventaja[] = [
  {
    num: "01",
    title: "A medida, no plantilla",
    text: "Cada web se construye para tu negocio: más rápida, más limpia y sin lo que no usas.",
  },
  {
    num: "02",
    title: "Identidad propia",
    text: "Logo y sistema visual que te distinguen, no otra web genérica más.",
  },
  {
    num: "03",
    title: "SEO técnico de serie",
    text: "HTML semántico, metadatos y rendimiento cuidados para posicionar en Google.",
  },
  {
    num: "04",
    title: "Tú al mando",
    text: "Panel para gestionar contenido, citas o productos sin depender de nadie.",
  },
];

// Prices are ORIENTATIVE starting points ("desde"); the final quote comes after
// assessing each project. The UI always renders them with a "from" label + note.
export const plans: PricingPlan[] = [
  {
    name: "Landing",
    price: "150 €",
    features: ["1 página", "Formulario de contacto", "SEO básico", "Responsive"],
  },
  {
    name: "Web negocio",
    price: "350 €",
    features: ["Hasta 5 páginas", "Blog", "SEO avanzado", "Analítica"],
    popular: true,
  },
  {
    name: "Tienda / Reservas",
    price: "650 €",
    features: ["Catálogo o reservas", "Panel de gestión", "Pasarela o calendario", "Soporte"],
  },
];

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

// Mock social proof: the page labels it "Datos de ejemplo" next to the quotes.
export const testimonios: Testimonial[] = [
  {
    quote: "Pasamos de no aparecer en Google a recibir reservas cada semana. La web vuela.",
    author: "Marta R.",
    role: "Clínica dental",
  },
  {
    quote: "Por fin una web que es nuestra, no una plantilla más. Fácil de gestionar.",
    author: "Diego A.",
    role: "Restaurante",
  },
  {
    quote: "Rápida, clara y la tienda online funciona sola. Vendemos más.",
    author: "Lucía M.",
    role: "Tienda artesana",
  },
];

export interface Review {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Days before "today"; rendered as a relative date ("hace 2 semanas"). */
  daysAgo: number;
  text: string;
}

// Mock review summary in the style of a business profile. Labelled
// "Datos de ejemplo" on the page: never present these as real reviews.
// `distribution[i]` = number of reviews with (5 - i) stars.
export const reviewSummary = {
  distribution: [118, 5, 1, 0, 1] as const,
  reviews: [
    {
      author: "Marta Ruiz",
      rating: 5,
      daysAgo: 12,
      text: "Pasamos de no aparecer en Google a recibir reservas cada semana. La web carga al momento y los pacientes la entienden a la primera.",
    },
    {
      author: "Diego Alonso",
      rating: 5,
      daysAgo: 34,
      text: "Por fin una web que es nuestra y no una plantilla más. Cambio la carta yo solo desde el panel.",
    },
    {
      author: "Lucía Martín",
      rating: 5,
      daysAgo: 70,
      text: "Clara, rápida y la tienda online funciona sin que tenga que estar pendiente. Muy buen trato durante todo el proyecto.",
    },
    {
      author: "Javier Gómez",
      rating: 4,
      daysAgo: 160,
      text: "Buen resultado y cumplieron plazos. Tardamos un poco en cerrar los textos, pero nos ayudaron con ellos.",
    },
  ] satisfies Review[],
};

/** Average rating (one decimal) and total count from a 5..1 star distribution. */
export function summarizeRatings(distribution: readonly number[]) {
  const count = distribution.reduce((a, b) => a + b, 0);
  const sum = distribution.reduce((acc, n, i) => acc + n * (5 - i), 0);
  const average = count ? Math.round((sum / count) * 10) / 10 : 0;
  return { count, average };
}

// Fictitious address; the map/links point at central Santander (lat, lon).
export const business = {
  name: "Estudio Norte",
  city: "Santander",
  street: "Calle Mayor 12",
  postal: "39001 Santander",
  phone: "+34 600 000 000",
  email: "hola@estudionorte.example",
  lat: 43.4623,
  lon: -3.81,
};

/** "Sobre nosotros" photo — swap for the client's own (drop `credit`). */
export const aboutPhoto: Photo = {
  src: "/images/estudio.jpg",
  alt: "Estudio diáfano y luminoso con techos de madera, puestos de trabajo con monitores y una zona de sofás",
  width: 1200,
  height: 900,
  credit: {
    author: "Austin Distel",
    license: "Unsplash License",
    href: "https://unsplash.com/photos/wawEfYdpkag",
  },
};
