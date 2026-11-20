// "Tu negocio aquí" brand configurator: plain logic, no React and no next/font,
// so it is safe from stores, the pre-paint script (PrefsScript) and tests.
//
// Two functions here are SELF-CONTAINED on purpose (no references to anything
// outside their own body): `brandVarsFor` and `decodeBrandRaw`. PrefsScript
// inlines them with Function#toString so the brand is applied before first
// paint with exactly the same maths as the client. Keep them ES5-ish (no
// spread, no optional chaining, no imports) when editing.

export const BUSINESS_TYPES = ["clinica", "restaurante", "comercio", "estudio"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

/**
 * Font pairings (display + body). Values reference the next/font CSS variables
 * declared in fonts.ts (see fontOptions.ts for the body-only catalogue).
 * `estilo` keeps whatever the active design style uses.
 */
export const BRAND_FONTS = {
  estilo: null,
  clasica: {
    display: "var(--font-fraunces), Georgia, serif",
    body: "var(--font-hanken), system-ui, sans-serif",
  },
  moderna: {
    display: "var(--font-jakarta), system-ui, sans-serif",
    body: "var(--font-archivo), system-ui, sans-serif",
  },
  amable: {
    display: "var(--font-nunito), system-ui, sans-serif",
    body: "var(--font-nunito), system-ui, sans-serif",
  },
  tecnica: {
    display: "var(--font-space), system-ui, sans-serif",
    body: "var(--font-archivo), system-ui, sans-serif",
  },
} as const;
export type BrandFontKey = keyof typeof BRAND_FONTS;
export const BRAND_FONT_KEYS = Object.keys(BRAND_FONTS) as BrandFontKey[];

/** Swatch presets offered next to the colour input (data, not UI colours). */
export const BRAND_PRESETS = [
  "#1f4fff",
  "#0e7c5a",
  "#c2410c",
  "#be185d",
  "#6d28d9",
  "#0f766e",
  "#eab308",
  "#16181d",
] as const;

export interface BrandConfig {
  name: string;
  /** #rrggbb, lowercase */
  color: string;
  font: BrandFontKey;
  type: BusinessType;
}

export const DEFAULT_BRAND: BrandConfig = {
  name: "",
  color: "#0e7c5a",
  font: "estilo",
  type: "clinica",
};

export const BRAND_NAME_MAX = 40;
export const BRAND_PARAM = "brand";
/** localStorage key of useBrandStore; PrefsScript reads it pre-paint. */
export const BRAND_STORAGE_KEY = "showcase-brand";

/* ---------------------------------------------------------------------
   Colour maths (WCAG 2.x relative luminance / contrast ratio)
   --------------------------------------------------------------------- */

export function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(v)) return `#${v}`;
  if (/^[0-9a-f]{3}$/.test(v)) return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`;
  return null;
}

export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

export function contrastRatio(a: string, b: string): number {
  const x = relativeLuminance(a);
  const y = relativeLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Black or white text on `hex`, whichever contrasts more (always >= 4.58:1). */
export function pickInk(hex: string): "#000000" | "#ffffff" {
  return contrastRatio(hex, "#ffffff") >= contrastRatio(hex, "#000000") ? "#ffffff" : "#000000";
}

/** Light paper of the default style: used to warn about accents that read badly as text. */
export const LIGHT_PAPER = "#fafaf9";

export interface BrandVars {
  vars: Record<string, string>;
  /** "accent": the accent itself is a >=3:1 focus ring on light AND dark paper; else use ink. */
  focus: "accent" | "ink";
  font: boolean;
}

/**
 * CSS custom properties for a brand colour + font pairing. SELF-CONTAINED
 * (inlined into the pre-paint script): keep every helper inside.
 *  --brand-accent      the colour itself
 *  --brand-ink         black/white text on the accent (>=4.5:1)
 *  --brand-text        accent darkened until >=4.5:1 on light paper
 *  --brand-text-dark   accent lightened until >=4.5:1 on dark paper
 *  --brand-display / --brand-body   font stacks (only when a pairing is picked)
 */
export function brandVarsFor(
  hex: string,
  pair: { display: string; body: string } | null,
): BrandVars {
  function lum(h: string) {
    var n = parseInt(h.slice(1), 16);
    var out = 0;
    var w = [0.2126, 0.7152, 0.0722];
    for (var i = 0; i < 3; i++) {
      var v = ((n >> (16 - 8 * i)) & 255) / 255;
      out += w[i] * (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    }
    return out;
  }
  function ratio(a: string, b: string) {
    var x = lum(a);
    var y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  function mix(a: string, b: string, t: number) {
    var p = parseInt(a.slice(1), 16);
    var q = parseInt(b.slice(1), 16);
    var o = "#";
    for (var s = 16; s >= 0; s -= 8) {
      var c = Math.round(((p >> s) & 255) * (1 - t) + ((q >> s) & 255) * t);
      o += (c < 16 ? "0" : "") + c.toString(16);
    }
    return o;
  }
  function shade(bg: string, toward: string) {
    for (var i = 0; i <= 20; i++) {
      var c = mix(hex, toward, i / 20);
      if (ratio(c, bg) >= 4.5) return c;
    }
    return toward;
  }
  var vars: Record<string, string> = {
    "--brand-accent": hex,
    "--brand-ink": ratio(hex, "#ffffff") >= ratio(hex, "#000000") ? "#ffffff" : "#000000",
    "--brand-text": shade("#e4e9f0", "#000000"),
    "--brand-text-dark": shade("#262b33", "#ffffff"),
  };
  if (pair) {
    vars["--brand-display"] = pair.display;
    vars["--brand-body"] = pair.body;
  }
  return {
    vars: vars,
    focus: ratio(hex, "#fafaf9") >= 3 && ratio(hex, "#14161a") >= 3 ? "accent" : "ink",
    font: !!pair,
  };
}

/* ---------------------------------------------------------------------
   Shareable URL param: ?brand=<base64url(JSON {n,c,f,t})>  (no logo)
   --------------------------------------------------------------------- */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function encodeBrand(cfg: BrandConfig): string {
  return toBase64Url(
    JSON.stringify({
      n: cfg.name.trim().slice(0, BRAND_NAME_MAX),
      c: cfg.color.replace(/^#/, ""),
      f: cfg.font,
      t: cfg.type,
    }),
  );
}

/**
 * Decode a ?brand= value. SELF-CONTAINED (inlined into the pre-paint script).
 * Returns null on anything malformed; unknown font/type fall back to the first
 * allowed value so an old link never breaks.
 */
export function decodeBrandRaw(
  raw: string | null,
  fonts: readonly string[],
  types: readonly string[],
  maxName: number,
): BrandConfig | null {
  if (!raw || raw.length > 400) return null;
  try {
    var b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var o = JSON.parse(new TextDecoder().decode(bytes));
    if (!o || typeof o !== "object") return null;
    var c = typeof o.c === "string" ? o.c.toLowerCase() : "";
    if (!/^[0-9a-f]{6}$/.test(c)) return null;
    var name = typeof o.n === "string" ? o.n.trim().slice(0, maxName) : "";
    return {
      name: name,
      color: "#" + c,
      font: (fonts.indexOf(o.f) > -1 ? o.f : fonts[0]) as BrandFontKey,
      type: (types.indexOf(o.t) > -1 ? o.t : types[0]) as BusinessType,
    };
  } catch (_err) {
    return null;
  }
}

export function decodeBrand(raw: string | null): BrandConfig | null {
  return decodeBrandRaw(raw, BRAND_FONT_KEYS, BUSINESS_TYPES, BRAND_NAME_MAX);
}

/** Current page URL with ?brand= (and the active ?style=) set. */
export function shareUrl(href: string, cfg: BrandConfig, style?: string): string {
  const url = new URL(href);
  url.searchParams.set(BRAND_PARAM, encodeBrand(cfg));
  if (style) url.searchParams.set("style", style);
  url.hash = "";
  return url.toString();
}

/* ---------------------------------------------------------------------
   DOM application (client). PrefsScript does the same pre-paint.
   --------------------------------------------------------------------- */

const BRAND_VAR_NAMES = [
  "--brand-accent",
  "--brand-ink",
  "--brand-text",
  "--brand-text-dark",
  "--brand-display",
  "--brand-body",
];

export function applyBrandToRoot(root: HTMLElement, cfg: BrandConfig | null): void {
  for (const name of BRAND_VAR_NAMES) root.style.removeProperty(name);
  root.removeAttribute("data-brand");
  root.removeAttribute("data-brand-font");
  if (!cfg) return;
  const hex = normalizeHex(cfg.color);
  if (!hex) return;
  const { vars, focus, font } = brandVarsFor(hex, BRAND_FONTS[cfg.font] ?? null);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.setAttribute("data-brand", focus);
  if (font) root.setAttribute("data-brand-font", "");
}
