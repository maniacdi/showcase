import { describe, expect, it } from "vitest";
import { type Dish, dishes } from "@/data/restaurante";
import { filterDishes, formatEuros, matchesDiet, normalize } from "./carta";

const dish = (over: Partial<Dish>): Dish => ({
  id: "x",
  section: "entrantes",
  name: { es: "Plato", en: "Dish" },
  description: { es: "", en: "" },
  price: 10,
  allergens: [],
  ...over,
});

describe("matchesDiet", () => {
  it("sin gluten excludes dishes that declare gluten", () => {
    expect(matchesDiet(dish({ allergens: ["gluten", "eggs"] }), "glutenFree")).toBe(false);
    expect(matchesDiet(dish({ allergens: ["eggs"] }), "glutenFree")).toBe(true);
  });

  it("sin lactosa excludes dishes that declare milk", () => {
    expect(matchesDiet(dish({ allergens: ["milk"] }), "lactoseFree")).toBe(false);
    expect(matchesDiet(dish({ allergens: ["fish"] }), "lactoseFree")).toBe(true);
  });

  it("vegetarian accepts vegan dishes even without the vegetarian flag", () => {
    expect(matchesDiet(dish({ vegan: true }), "vegetarian")).toBe(true);
    expect(matchesDiet(dish({ vegetarian: true }), "vegetarian")).toBe(true);
    expect(matchesDiet(dish({}), "vegetarian")).toBe(false);
  });

  it("vegan requires the vegan flag", () => {
    expect(matchesDiet(dish({ vegetarian: true }), "vegan")).toBe(false);
    expect(matchesDiet(dish({ vegan: true }), "vegan")).toBe(true);
  });
});

describe("filterDishes", () => {
  it("returns every dish with no filters and no query", () => {
    expect(filterDishes(dishes, [], "", "es")).toHaveLength(dishes.length);
  });

  it("combines filters with AND", () => {
    const out = filterDishes(dishes, ["glutenFree", "lactoseFree"], "", "es");
    expect(out.length).toBeGreaterThan(0);
    for (const d of out) {
      expect(d.allergens).not.toContain("gluten");
      expect(d.allergens).not.toContain("milk");
    }
  });

  it("vegan results are a subset of vegetarian results", () => {
    const vegan = filterDishes(dishes, ["vegan"], "", "es").map((d) => d.id);
    const veg = filterDishes(dishes, ["vegetarian"], "", "es").map((d) => d.id);
    expect(vegan.every((id) => veg.includes(id))).toBe(true);
    expect(veg.length).toBeGreaterThan(vegan.length);
  });

  it("searches name and description, ignoring case and accents, in the given locale", () => {
    expect(filterDishes(dishes, [], "LIMON", "es").map((d) => d.id)).toEqual(
      expect.arrayContaining(["rabas", "sorbete"]),
    );
    expect(filterDishes(dishes, [], "hake", "en").map((d) => d.id)).toEqual(["merluza"]);
    expect(filterDishes(dishes, [], "hake", "es")).toHaveLength(0);
  });

  it("returns nothing when no dish matches", () => {
    expect(filterDishes(dishes, ["vegan"], "merluza", "es")).toEqual([]);
  });
});

describe("helpers", () => {
  it("normalize strips accents and case", () => {
    expect(normalize("  Crustáceos ")).toBe("crustaceos");
  });

  it("formatEuros prints es-ES currency", () => {
    expect(formatEuros(14.5).replace(/\s/g, " ")).toBe("14,50 €");
  });
});
