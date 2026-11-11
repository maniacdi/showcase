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
  { num: "01", title: "A medida, no plantilla", text: "Cada web se construye para tu negocio: más rápida, más limpia y sin lo que no usas." },
  { num: "02", title: "Identidad propia", text: "Logo y sistema visual que te distinguen, no otra web genérica más." },
  { num: "03", title: "SEO técnico de serie", text: "HTML semántico, metadatos y rendimiento cuidados para posicionar en Google." },
  { num: "04", title: "Tú al mando", text: "Panel para gestionar contenido, citas o productos sin depender de nadie." },
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

// Mock social proof (clearly part of the demo).
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

export const business = {
  name: "Estudio Norte",
  city: "Santander",
  address: "Calle Mayor 12 · 39001 Santander",
  phone: "+34 600 000 000",
  email: "hola@estudionorte.example",
};
