// Plain font catalog metadata — NO next/font import, so this is safe to use
// from stores, client logic and tests. The actual next/font instances live in
// fonts.ts and must keep the same CSS variable names as `cssVar` below.

export const DEFAULT_FONT_KEY = "archivo";

/** User-selectable body fonts (admin font switcher, F1). */
export const FONT_OPTIONS = [
  { key: "archivo", label: "Archivo", cssVar: "--font-archivo" },
  { key: "hanken", label: "Hanken Grotesk", cssVar: "--font-hanken" },
  { key: "fraunces", label: "Fraunces", cssVar: "--font-fraunces" },
] as const;

export type FontKey = (typeof FONT_OPTIONS)[number]["key"];
