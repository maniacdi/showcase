import { describe, expect, it } from "vitest";
import { estimatorConfig, siteTypeForPlan } from "@/data/estimator";
import { plans } from "@/data/servicios";
import { calculateEstimate, formatEuroRange, type EstimateInput } from "./estimate";

const base: EstimateInput = { siteType: "landing", pages: "one", extras: [], timeframe: "normal" };

describe("calculateEstimate", () => {
  it("returns the base range of a bare landing", () => {
    const e = calculateEstimate(base);
    expect(e.price).toEqual([150, 250]);
    expect(e.weeks).toEqual([1, 2]);
    expect(e.monthly).toEqual([0, 0]);
  });

  it("never quotes below the plan's 'desde' price", () => {
    for (const type of estimatorConfig.siteTypes) {
      for (const tf of estimatorConfig.timeframes) {
        const e = calculateEstimate({ ...base, siteType: type.id, timeframe: tf.id });
        expect(e.price[0]).toBeGreaterThanOrEqual(type.from);
        expect(e.price[1]).toBeGreaterThanOrEqual(e.price[0]);
        expect(e.weeks[0]).toBeGreaterThanOrEqual(1);
        expect(e.weeks[1]).toBeGreaterThanOrEqual(e.weeks[0]);
      }
    }
  });

  it("matches the 'desde' prices on the pricing cards", () => {
    for (const plan of plans) {
      const type = estimatorConfig.siteTypes.find((s) => s.planName === plan.name);
      expect(type, plan.name).toBeDefined();
      expect(plan.price).toBe(`${type!.from} €`);
    }
  });

  it("charges pages above the included ones", () => {
    const e = calculateEstimate({ ...base, pages: "upTo5" });
    // 4 extra pages at 30–50 €, +0.5 weeks per started block of 5
    expect(e.price).toEqual([270, 450]);
    expect(e.weeks).toEqual([2, 3]);
  });

  it("does not charge pages already included in the type", () => {
    const e = calculateEstimate({ ...base, siteType: "negocio", pages: "upTo5" });
    expect(e.price).toEqual([350, 550]);
  });

  it("adds one-off extras to price and weeks", () => {
    const e = calculateEstimate({ ...base, extras: ["seoLocal", "idiomas"] });
    expect(e.price).toEqual([350, 650]);
    expect(e.weeks).toEqual([2, 4]);
  });

  it("keeps maintenance as a separate monthly fee", () => {
    const e = calculateEstimate({ ...base, extras: ["mantenimiento"] });
    expect(e.price).toEqual([150, 250]);
    expect(e.monthly).toEqual([20, 40]);
  });

  it("includes the type's bundled extras for free", () => {
    const e = calculateEstimate({ ...base, siteType: "negocio", extras: ["blog"] });
    expect(e.price).toEqual([350, 550]);
    expect(e.includedExtras).toEqual(["blog"]);
  });

  it("includes only one of shop/bookings in the shop type", () => {
    const one = calculateEstimate({ ...base, siteType: "tienda", extras: ["reservas"] });
    expect(one.price).toEqual([650, 1000]);
    const both = calculateEstimate({ ...base, siteType: "tienda", extras: ["tienda", "reservas"] });
    // "tienda" comes first in includedOneOf, so "reservas" is charged
    expect(both.price).toEqual([800, 1300]);
    expect(both.includedExtras).toEqual(["tienda"]);
  });

  it("makes urgent delivery pricier and faster", () => {
    const normal = calculateEstimate({ ...base, siteType: "tienda" });
    const urgent = calculateEstimate({ ...base, siteType: "tienda", timeframe: "urgente" });
    expect(urgent.price[0]).toBeGreaterThan(normal.price[0]);
    expect(urgent.price[1]).toBeGreaterThan(normal.price[1]);
    expect(urgent.weeks[1]).toBeLessThan(normal.weeks[1]);
  });

  it("gives more time without a discount on a flexible timeframe", () => {
    const normal = calculateEstimate({ ...base, siteType: "negocio" });
    const flex = calculateEstimate({ ...base, siteType: "negocio", timeframe: "flexible" });
    expect(flex.price).toEqual(normal.price);
    expect(flex.weeks).toEqual([normal.weeks[0] + 1, normal.weeks[1] + 1]);
  });

  it("rounds the range outward to the configured step", () => {
    const e = calculateEstimate({ ...base, siteType: "landing", timeframe: "urgente", pages: "upTo10" });
    expect(e.price[0] % estimatorConfig.roundTo).toBe(0);
    expect(e.price[1] % estimatorConfig.roundTo).toBe(0);
  });

  it("throws on unknown ids", () => {
    expect(() =>
      calculateEstimate({ ...base, siteType: "nope" as EstimateInput["siteType"] }),
    ).toThrow();
  });
});

describe("siteTypeForPlan", () => {
  it("maps card names to site types", () => {
    expect(siteTypeForPlan("Web negocio")).toBe("negocio");
    expect(siteTypeForPlan(null)).toBeNull();
    expect(siteTypeForPlan("Otro")).toBeNull();
  });
});

describe("formatEuroRange", () => {
  it("formats a range with both bounds", () => {
    const s = formatEuroRange([350, 600], "es");
    expect(s).toContain("350");
    expect(s).toContain("600");
    expect(s).toContain("€");
  });
  it("collapses equal bounds", () => {
    expect(formatEuroRange([20, 20], "en")).toBe("€20");
  });
});
