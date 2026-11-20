// Single source of truth for the interactive estimator on /servicios.
// Every number here is ORIENTATIVE: the UI always shows the result as a range
// with an "orientativo" note. Edit this object to re-price a client's demo.
//
// Money is in euros, time in weeks. Each range is [min, max].

export type Range = readonly [number, number];

export type SiteTypeId = "landing" | "negocio" | "tienda";
export type PagesId = "one" | "upTo5" | "upTo10" | "moreThan10";
export type ExtraId = "blog" | "reservas" | "tienda" | "idiomas" | "panel" | "seoLocal" | "mantenimiento";
export type TimeframeId = "flexible" | "normal" | "urgente";

export interface SiteTypeConfig {
  id: SiteTypeId;
  /** Name of the matching pricing card in data/servicios.ts (entry point). */
  planName: string;
  /** "Desde" price shown on the card; the estimate never goes below it. */
  from: number;
  price: Range;
  weeks: Range;
  /** Pages covered by the base price. */
  pagesIncluded: number;
  /** Extras that come with the type at no extra cost. */
  included: readonly ExtraId[];
  /** The first selected extra from this list is included (e.g. "catálogo o reservas"). */
  includedOneOf?: readonly ExtraId[];
}

export interface ExtraConfig {
  id: ExtraId;
  price: Range;
  weeks: Range;
  /** Recurring monthly fee instead of a one-off cost. */
  monthly?: boolean;
}

export const estimatorConfig = {
  siteTypes: [
    {
      id: "landing",
      planName: "Landing",
      from: 150,
      price: [150, 250],
      weeks: [1, 2],
      pagesIncluded: 1,
      included: [],
    },
    {
      id: "negocio",
      planName: "Web negocio",
      from: 350,
      price: [350, 550],
      weeks: [2, 4],
      pagesIncluded: 5,
      included: ["blog"],
    },
    {
      id: "tienda",
      planName: "Tienda / Reservas",
      from: 650,
      price: [650, 1000],
      weeks: [4, 6],
      pagesIncluded: 5,
      included: ["panel"],
      includedOneOf: ["tienda", "reservas"],
    },
  ] satisfies SiteTypeConfig[],

  /** Page-count buckets; `pages` is the upper bound used for pricing. */
  pages: [
    { id: "one", pages: 1 },
    { id: "upTo5", pages: 5 },
    { id: "upTo10", pages: 10 },
    { id: "moreThan10", pages: 15 },
  ] satisfies { id: PagesId; pages: number }[],

  /** Cost of each page above the type's `pagesIncluded`. */
  extraPage: { price: [30, 50], weeksPer5: 0.5 },

  extras: [
    { id: "blog", price: [80, 150], weeks: [0.5, 1] },
    { id: "reservas", price: [150, 300], weeks: [1, 1.5] },
    { id: "tienda", price: [250, 500], weeks: [1, 2] },
    { id: "idiomas", price: [100, 200], weeks: [0.5, 1] },
    { id: "panel", price: [150, 300], weeks: [1, 1.5] },
    { id: "seoLocal", price: [100, 200], weeks: [0.5, 1] },
    { id: "mantenimiento", price: [20, 40], weeks: [0, 0], monthly: true },
  ] satisfies ExtraConfig[],

  /** Price multiplier and week adjustments per timeframe. */
  timeframes: [
    { id: "flexible", priceFactor: 1, weeksFactor: 1, weeksAdd: 1 },
    { id: "normal", priceFactor: 1, weeksFactor: 1, weeksAdd: 0 },
    { id: "urgente", priceFactor: 1.3, weeksFactor: 0.7, weeksAdd: 0 },
  ] satisfies { id: TimeframeId; priceFactor: number; weeksFactor: number; weeksAdd: number }[],

  /** Rounding step for the displayed price range. */
  roundTo: 10,
} as const;

export type EstimatorConfig = typeof estimatorConfig;

/** Map a pricing card name (BudgetButton `plan`) to its site type. */
export function siteTypeForPlan(planName: string | null | undefined): SiteTypeId | null {
  if (!planName) return null;
  return estimatorConfig.siteTypes.find((s) => s.planName === planName)?.id ?? null;
}
