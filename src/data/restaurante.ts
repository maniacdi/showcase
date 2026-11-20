import type { Photo } from "./productos";

/*
 * Restaurant demo ("Casa Ejemplo", Santander). Everything here is sample data:
 * the restaurant, address, phone, dishes and prices are fictitious. Swap this
 * file for the client's real menu; UI copy lives in messages (namespace
 * "restaurante").
 */

export type Locale = "es" | "en";
export type Localized = Record<Locale, string>;

/** The 14 allergens the EU requires restaurants to declare (Reg. 1169/2011, annex II). */
export const ALLERGENS = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export type CartaSection = "entrantes" | "principales" | "postres" | "bebidas";
export const CARTA_SECTIONS: CartaSection[] = ["entrantes", "principales", "postres", "bebidas"];

export interface Dish {
  id: string;
  section: CartaSection;
  name: Localized;
  description: Localized;
  /** Euros. */
  price: number;
  allergens: Allergen[];
  vegetarian?: boolean;
  vegan?: boolean;
}

export const restaurant = {
  name: "Casa Ejemplo",
  street: "Calle de Ejemplo, 12",
  postal: "39004",
  city: "Santander",
  region: "Cantabria",
  country: "ES",
  phone: "+34 942 000 000",
  email: "reservas@casaejemplo.example",
  lat: 43.4627,
  lon: -3.8055,
  priceRange: "€€",
  cuisine: { es: ["Cántabra", "Marinera", "Mediterránea"], en: ["Cantabrian", "Seafood", "Mediterranean"] },
};

/** Opening hours by weekday (0 = Sunday … 6 = Saturday). Empty = closed. */
export const OPENING: Record<number, { lunch?: [string, string]; dinner?: [string, string] }> = {
  0: { lunch: ["13:00", "16:00"] },
  1: {},
  2: { lunch: ["13:00", "16:00"], dinner: ["20:00", "23:30"] },
  3: { lunch: ["13:00", "16:00"], dinner: ["20:00", "23:30"] },
  4: { lunch: ["13:00", "16:00"], dinner: ["20:00", "23:30"] },
  5: { lunch: ["13:00", "16:00"], dinner: ["20:00", "23:30"] },
  6: { lunch: ["13:00", "16:00"], dinner: ["20:00", "23:30"] },
};

/** schema.org openingHours, matching OPENING. */
export const OPENING_SCHEMA = ["Tu-Su 13:00-16:00", "Tu-Sa 20:00-23:30"];

export const dishes: Dish[] = [
  // Entrantes
  {
    id: "rabas",
    section: "entrantes",
    name: { es: "Rabas de calamar", en: "Fried squid strips (rabas)" },
    description: {
      es: "Tiras de calamar rebozadas y fritas al momento, con limón.",
      en: "Battered squid strips fried to order, served with lemon.",
    },
    price: 14.5,
    allergens: ["gluten", "eggs", "molluscs"],
  },
  {
    id: "anchoas",
    section: "entrantes",
    name: { es: "Anchoas del Cantábrico", en: "Cantabrian anchovies" },
    description: {
      es: "Seis lomos en aceite de oliva sobre pan tostado con tomate.",
      en: "Six fillets in olive oil on toasted bread with tomato.",
    },
    price: 16,
    allergens: ["gluten", "fish"],
  },
  {
    id: "ensalada",
    section: "entrantes",
    name: { es: "Ensalada de tomate de temporada", en: "Seasonal tomato salad" },
    description: {
      es: "Tomate, cebolleta, aceite de oliva virgen extra y sal en escamas.",
      en: "Tomato, spring onion, extra virgin olive oil and flaky salt.",
    },
    price: 9.5,
    allergens: [],
    vegetarian: true,
    vegan: true,
  },
  {
    id: "croquetas",
    section: "entrantes",
    name: { es: "Croquetas de queso picón", en: "Picón blue cheese croquettes" },
    description: {
      es: "Ocho unidades, cremosas por dentro, con nueces tostadas.",
      en: "Eight pieces, creamy inside, with toasted walnuts.",
    },
    price: 11,
    allergens: ["gluten", "eggs", "milk", "nuts"],
    vegetarian: true,
  },
  {
    id: "hummus",
    section: "entrantes",
    name: { es: "Hummus de garbanzo con verduras", en: "Chickpea hummus with crudités" },
    description: {
      es: "Con tahini, pimentón y bastones de zanahoria y apio.",
      en: "With tahini, paprika and carrot and celery sticks.",
    },
    price: 8.5,
    allergens: ["sesame", "celery"],
    vegetarian: true,
    vegan: true,
  },
  // Principales
  {
    id: "paella",
    section: "principales",
    name: { es: "Arroz de marisco (mín. 2 personas)", en: "Seafood rice (min. 2 people)" },
    description: {
      es: "Cigalas, gambas y mejillones. Precio por persona.",
      en: "Langoustines, prawns and mussels. Price per person.",
    },
    price: 19.5,
    allergens: ["crustaceans", "molluscs", "fish", "celery"],
  },
  {
    id: "merluza",
    section: "principales",
    name: { es: "Merluza a la plancha", en: "Grilled hake" },
    description: {
      es: "Con refrito de ajo y patatas panaderas.",
      en: "With garlic oil and sliced roast potatoes.",
    },
    price: 21,
    allergens: ["fish"],
  },
  {
    id: "cocido",
    section: "principales",
    name: { es: "Cocido montañés", en: "Mountain stew (cocido montañés)" },
    description: {
      es: "Alubias blancas, berza y su compango. Plato de cuchara de la casa.",
      en: "White beans, collard greens, chorizo and black pudding.",
    },
    price: 15,
    allergens: ["sulphites"],
  },
  {
    id: "risotto",
    section: "principales",
    name: { es: "Arroz cremoso de setas", en: "Creamy mushroom rice" },
    description: {
      es: "Setas de temporada, mantequilla y queso curado.",
      en: "Seasonal mushrooms, butter and aged cheese.",
    },
    price: 16.5,
    allergens: ["milk", "celery", "sulphites"],
    vegetarian: true,
  },
  {
    id: "verduras",
    section: "principales",
    name: { es: "Parrillada de verduras", en: "Grilled vegetables" },
    description: {
      es: "Verduras de la huerta a la brasa con salsa de mostaza y soja.",
      en: "Char-grilled garden vegetables with a mustard and soy dressing.",
    },
    price: 13.5,
    allergens: ["mustard", "soy"],
    vegetarian: true,
    vegan: true,
  },
  // Postres
  {
    id: "quesada",
    section: "postres",
    name: { es: "Quesada pasiega", en: "Pasiega cheesecake (quesada)" },
    description: {
      es: "Receta tradicional del valle del Pas, con canela y limón.",
      en: "Traditional recipe from the Pas valley, with cinnamon and lemon.",
    },
    price: 6.5,
    allergens: ["gluten", "eggs", "milk"],
    vegetarian: true,
  },
  {
    id: "tarta-queso",
    section: "postres",
    name: { es: "Tarta de queso al horno", en: "Baked cheesecake" },
    description: {
      es: "Con coulis de frutos rojos.",
      en: "With a red berry coulis.",
    },
    price: 7,
    allergens: ["gluten", "eggs", "milk"],
    vegetarian: true,
  },
  {
    id: "sorbete",
    section: "postres",
    name: { es: "Sorbete de limón", en: "Lemon sorbet" },
    description: {
      es: "Elaborado en casa, sin lácteos.",
      en: "Made in house, dairy free.",
    },
    price: 5,
    allergens: [],
    vegetarian: true,
    vegan: true,
  },
  // Bebidas
  {
    id: "agua",
    section: "bebidas",
    name: { es: "Agua mineral", en: "Mineral water" },
    description: { es: "Botella de 50 cl.", en: "50 cl bottle." },
    price: 2.5,
    allergens: [],
    vegetarian: true,
    vegan: true,
  },
  {
    id: "vino",
    section: "bebidas",
    name: { es: "Copa de vino blanco", en: "Glass of white wine" },
    description: { es: "Albariño. Pregunta por la carta de vinos.", en: "Albariño. Ask for the wine list." },
    price: 4.5,
    allergens: ["sulphites"],
    vegetarian: true,
    vegan: true,
  },
  {
    id: "sidra",
    section: "bebidas",
    name: { es: "Sidra natural", en: "Natural cider" },
    description: { es: "Botella de 70 cl.", en: "70 cl bottle." },
    price: 6,
    allergens: ["sulphites"],
    vegetarian: true,
    vegan: true,
  },
  {
    id: "cerveza",
    section: "bebidas",
    name: { es: "Caña de cerveza", en: "Small draught beer" },
    description: { es: "Cerveza de barril, 20 cl.", en: "Draught beer, 20 cl." },
    price: 2.8,
    allergens: ["gluten"],
    vegetarian: true,
    vegan: true,
  },
];

/** Default "menú del día" (shown until the owner edits it in /admin). */
export interface MenuDelDia {
  title: string;
  starter: string;
  main: string;
  dessert: string;
  /** Euros. */
  price: number;
}

export const menuDelDiaDefault: Record<Locale, MenuDelDia> = {
  es: {
    title: "Menú del día",
    starter: "Crema de calabaza",
    main: "Merluza a la plancha con patatas panaderas",
    dessert: "Quesada pasiega",
    price: 16.5,
  },
  en: {
    title: "Set lunch menu",
    starter: "Pumpkin soup",
    main: "Grilled hake with sliced roast potatoes",
    dessert: "Pasiega cheesecake",
    price: 16.5,
  },
};

/* ---- Photos (Wikimedia Commons, credited on the page) ---- */

export const heroPhoto: Photo = {
  src: "/images/restaurante/paella-marisco.jpg",
  alt: "Paellera de arroz de marisco con cigalas, gambas, mejillones y gajos de limón",
  width: 1200,
  height: 872,
  credit: {
    author: "Manuel M. Vicente",
    license: "CC BY 2.0",
    href: "https://commons.wikimedia.org/wiki/File:Paella_de_marisco_01.jpg",
  },
};

export const galleryPhotos: Photo[] = [
  {
    src: "/images/restaurante/rabas.jpg",
    alt: "Ración de rabas de calamar rebozadas en un plato blanco",
    width: 1200,
    height: 866,
    credit: {
      author: "Javier Mediavilla Ezquibela",
      license: "CC BY 3.0",
      href: "https://commons.wikimedia.org/wiki/File:Rabas_calamares_a_la_romana.jpg",
    },
  },
  {
    src: "/images/restaurante/comedor.jpg",
    alt: "Comedor con vigas de madera, mesas con mantel blanco y jamones colgados junto a la barra",
    width: 1200,
    height: 900,
    credit: {
      author: "Jordiferrer",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Interior_Restaurant_Los_Caracoles_-_Barcelona_07.JPG",
    },
  },
  {
    src: "/images/restaurante/tarta-de-queso.jpg",
    alt: "Porción de tarta de queso al horno con coulis de frutos rojos y nata",
    width: 1200,
    height: 900,
    credit: {
      author: "Juan Emilio Prades Bel",
      license: "CC BY 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Plato_de_postre,_tarta_de_queso_(Espa%C3%B1a).jpg",
    },
  },
];

/** Tables with a QR code in /admin. */
export const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);
