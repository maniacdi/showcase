/**
 * Token block for generated images (OG cards, apple-icon) and other places
 * that cannot read CSS custom properties. Mirrors the Swiss tokens in
 * styles/_design-styles.scss and the vertical accents in themes/themes.ts —
 * keep them in sync when re-skinning.
 */
export const OG_TOKENS = {
  paper: "#fafaf9",
  paperDark: "#14161a",
  ink: "#16181d",
  inkSoft: "#5b5f66",
  /** --footer-soft: muted text on the dark ink panel */
  inkSoftOnDark: "#a4a8b0",
  accent: "#1f4fff",
  accentInk: "#ffffff",
  accentTienda: "#0e7c5a",
  accentReservas: "#c2410c",
  /** --weight-bold: the heaviest weight in the UI */
  weightBold: 700,
} as const;
