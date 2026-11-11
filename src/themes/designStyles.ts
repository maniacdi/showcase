// Catalog of switchable visual styles. Plain metadata (no next/font, no React)
// so it's safe from stores, the pre-paint script and tests.
// Each key maps to a `[data-style="<key>"]` token block in styles/_design-styles.scss.

export const DESIGN_STYLES = [
  { key: "swiss", label: "Swiss", swatch: ["#fafaf9", "#16181d", "#1f4fff"] },
  { key: "brutalism", label: "Brutalism", swatch: ["#f4efe1", "#000000", "#ff4f00"] },
  { key: "neofuturism", label: "Neofuturism", swatch: ["#07080d", "#00f0ff", "#ff2bd6"] },
  { key: "glassmorphism", label: "Glassmorphism", swatch: ["#c4b5fd", "#f9a8d4", "#7dd3fc"] },
  { key: "neumorphism", label: "Neumorphism", swatch: ["#e4e9f0", "#c2c9d3", "#5b6cff"] },
  { key: "bento", label: "Bento Grid", swatch: ["#f1f1ee", "#ffffff", "#16181d"] },
] as const;

export type DesignStyleKey = (typeof DESIGN_STYLES)[number]["key"];

export const DEFAULT_STYLE: DesignStyleKey = "swiss";

export const STYLE_KEYS = DESIGN_STYLES.map((s) => s.key) as readonly DesignStyleKey[];

export function isDesignStyle(value: unknown): value is DesignStyleKey {
  return typeof value === "string" && (STYLE_KEYS as readonly string[]).includes(value);
}
