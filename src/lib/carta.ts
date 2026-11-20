import type { Allergen, Dish, Locale } from "@/data/restaurante";

export type DietFilter = "glutenFree" | "vegetarian" | "vegan" | "lactoseFree";
export const DIET_FILTERS: DietFilter[] = ["glutenFree", "vegetarian", "vegan", "lactoseFree"];

/** Allergen a "sin X" filter excludes. */
const EXCLUDES: Partial<Record<DietFilter, Allergen>> = {
  glutenFree: "gluten",
  lactoseFree: "milk",
};

export function matchesDiet(dish: Dish, filter: DietFilter): boolean {
  const excluded = EXCLUDES[filter];
  if (excluded) return !dish.allergens.includes(excluded);
  if (filter === "vegan") return dish.vegan === true;
  // Vegan dishes are vegetarian too, even if the flag was left out.
  return dish.vegetarian === true || dish.vegan === true;
}

/** Lowercase and strip accents so "croqueta" finds "Croquetas" and "limon" finds "limón". */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Dishes that pass every active filter (AND) and contain the query in name or description. */
export function filterDishes(
  dishes: Dish[],
  filters: DietFilter[],
  query: string,
  locale: Locale,
): Dish[] {
  const q = normalize(query);
  return dishes.filter(
    (d) =>
      filters.every((f) => matchesDiet(d, f)) &&
      (!q || normalize(`${d.name[locale]} ${d.description[locale]}`).includes(q)),
  );
}

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/** Prices as printed on a Spanish menu ("14,50 €") in both languages. */
export function formatEuros(value: number): string {
  return EUR.format(value);
}
