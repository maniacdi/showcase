import {
  estimatorConfig,
  type EstimatorConfig,
  type ExtraId,
  type PagesId,
  type SiteTypeId,
  type TimeframeId,
} from "@/data/estimator";

export interface EstimateInput {
  siteType: SiteTypeId;
  pages: PagesId;
  extras: readonly ExtraId[];
  timeframe: TimeframeId;
}

export interface Estimate {
  /** One-off cost, rounded outward to `roundTo`. */
  price: [number, number];
  /** Recurring monthly cost (maintenance), [0, 0] when none. */
  monthly: [number, number];
  /** Delivery in whole weeks. */
  weeks: [number, number];
  /** Extras that ended up included in the type's base price. */
  includedExtras: ExtraId[];
}

/** Pure, config-driven price/time estimate. Throws on unknown ids. */
export function calculateEstimate(
  input: EstimateInput,
  config: EstimatorConfig = estimatorConfig,
): Estimate {
  const type = config.siteTypes.find((s) => s.id === input.siteType);
  const pages = config.pages.find((p) => p.id === input.pages);
  const timeframe = config.timeframes.find((t) => t.id === input.timeframe);
  if (!type || !pages || !timeframe) throw new Error("Unknown estimator option");

  let [pMin, pMax] = type.price;
  let [wMin, wMax] = type.weeks;
  let [mMin, mMax] = [0, 0];

  const extraPages = Math.max(0, pages.pages - type.pagesIncluded);
  pMin += extraPages * config.extraPage.price[0];
  pMax += extraPages * config.extraPage.price[1];
  const pageWeeks = Math.ceil(extraPages / 5) * config.extraPage.weeksPer5;
  wMin += pageWeeks;
  wMax += pageWeeks;

  const selected = new Set(input.extras);
  const included = new Set<ExtraId>(type.included.filter((id) => selected.has(id)));
  const oneOf = "includedOneOf" in type ? type.includedOneOf : undefined;
  const freeChoice = oneOf?.find((id) => selected.has(id));
  if (freeChoice) included.add(freeChoice);

  for (const extra of config.extras) {
    if (!selected.has(extra.id) || included.has(extra.id)) continue;
    if ("monthly" in extra && extra.monthly) {
      mMin += extra.price[0];
      mMax += extra.price[1];
    } else {
      pMin += extra.price[0];
      pMax += extra.price[1];
      wMin += extra.weeks[0];
      wMax += extra.weeks[1];
    }
  }

  pMin *= timeframe.priceFactor;
  pMax *= timeframe.priceFactor;
  wMin = wMin * timeframe.weeksFactor + timeframe.weeksAdd;
  wMax = wMax * timeframe.weeksFactor + timeframe.weeksAdd;

  const step = config.roundTo;
  const priceMin = Math.max(type.from, Math.floor(pMin / step) * step);
  const priceMax = Math.max(priceMin, Math.ceil(pMax / step) * step);
  const weeksMin = Math.max(1, Math.round(wMin));
  const weeksMax = Math.max(weeksMin, Math.ceil(wMax));

  return {
    price: [priceMin, priceMax],
    monthly: [mMin, mMax],
    weeks: [weeksMin, weeksMax],
    includedExtras: config.extras.map((e) => e.id).filter((id) => included.has(id)),
  };
}

/** "350–600 €" style range in the given locale (en dash between numbers). */
export function formatEuroRange([min, max]: readonly [number, number], locale: string): string {
  const en = locale === "en";
  const n = new Intl.NumberFormat(en ? "en-IE" : "es-ES", { maximumFractionDigits: 0 }).format;
  const nums = min === max ? n(min) : `${n(min)}–${n(max)}`;
  return en ? `€${nums}` : `${nums} €`;
}
