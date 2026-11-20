import { afterEach, describe, expect, it } from "vitest";
import {
  BRAND_FONTS,
  applyBrandToRoot,
  brandVarsFor,
  contrastRatio,
  decodeBrand,
  encodeBrand,
  normalizeHex,
  pickInk,
  shareUrl,
  type BrandConfig,
} from "./brand";
import { PREFS_SCRIPT } from "./PrefsScript";

const cfg: BrandConfig = { name: "Clínica Señor Ñu", color: "#be185d", font: "clasica", type: "clinica" };

describe("brand URL encoding", () => {
  it("round-trips name (UTF-8), colour, font and type", () => {
    expect(decodeBrand(encodeBrand(cfg))).toEqual(cfg);
  });

  it("is URL-safe base64 without padding", () => {
    const raw = encodeBrand({ ...cfg, name: "???>>>~~~" });
    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(encodeURIComponent(raw)).toBe(raw);
  });

  it("rejects malformed values", () => {
    expect(decodeBrand(null)).toBeNull();
    expect(decodeBrand("")).toBeNull();
    expect(decodeBrand("%%%")).toBeNull();
    expect(decodeBrand(btoa("not json"))).toBeNull();
    expect(decodeBrand(btoa(JSON.stringify({ n: "x", c: "zzzzzz" })))).toBeNull();
    expect(decodeBrand("a".repeat(500))).toBeNull();
  });

  it("falls back on unknown font/type and trims long names", () => {
    const raw = btoa(JSON.stringify({ n: "x".repeat(80), c: "ABCDEF", f: "comic", t: "spa" }));
    expect(decodeBrand(raw)).toEqual({
      name: "x".repeat(40),
      color: "#abcdef",
      font: "estilo",
      type: "clinica",
    });
  });

  it("builds a share URL that keeps the path and other params", () => {
    const url = new URL(shareUrl("https://x.dev/en/tienda?foo=1#top", cfg, "brutalism"));
    expect(url.pathname).toBe("/en/tienda");
    expect(url.searchParams.get("foo")).toBe("1");
    expect(url.searchParams.get("style")).toBe("brutalism");
    expect(url.hash).toBe("");
    expect(decodeBrand(url.searchParams.get("brand"))).toEqual(cfg);
  });
});

describe("contrast ink picker", () => {
  it("matches WCAG reference ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  it("picks white on dark and black on light accents", () => {
    expect(pickInk("#1f4fff")).toBe("#ffffff");
    expect(pickInk("#16181d")).toBe("#ffffff");
    expect(pickInk("#eab308")).toBe("#000000");
    expect(pickInk("#00f0ff")).toBe("#000000");
  });

  it("always reaches >= 4.5:1 text on the accent", () => {
    for (let i = 0; i < 4096; i++) {
      const hex = `#${(i * 4093).toString(16).padStart(6, "0").slice(-6)}`;
      expect(contrastRatio(hex, pickInk(hex))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("brandVarsFor (inlined pre-paint) agrees with pickInk and derives readable shades", () => {
    for (const hex of ["#1f4fff", "#eab308", "#ffffff", "#000000", "#0e7c5a", "#ff4f00"]) {
      const { vars } = brandVarsFor(hex, null);
      expect(vars["--brand-ink"]).toBe(pickInk(hex));
      expect(contrastRatio(vars["--brand-text"], "#e4e9f0")).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(vars["--brand-text-dark"], "#262b33")).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("uses the accent as focus ring only when it shows on light and dark paper", () => {
    expect(brandVarsFor("#1f4fff", null).focus).toBe("accent");
    expect(brandVarsFor("#eab308", null).focus).toBe("ink");
    expect(brandVarsFor("#16181d", null).focus).toBe("ink");
  });

  it("normalizes hex input", () => {
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex("1F4FFF")).toBe("#1f4fff");
    expect(normalizeHex("red")).toBeNull();
  });
});

describe("applying the brand", () => {
  const root = document.documentElement;
  afterEach(() => {
    applyBrandToRoot(root, null);
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("sets and clears vars + data attributes", () => {
    applyBrandToRoot(root, cfg);
    expect(root.style.getPropertyValue("--brand-accent")).toBe("#be185d");
    expect(root.style.getPropertyValue("--brand-display")).toBe(BRAND_FONTS.clasica.display);
    expect(root.hasAttribute("data-brand-font")).toBe(true);
    applyBrandToRoot(root, null);
    expect(root.style.getPropertyValue("--brand-accent")).toBe("");
    expect(root.hasAttribute("data-brand")).toBe(false);
  });

  it("pre-paint script applies a ?brand= link exactly like the client", () => {
    window.history.replaceState(null, "", `/?brand=${encodeBrand(cfg)}`);
    new Function(PREFS_SCRIPT)();
    const viaScript = root.getAttribute("style");
    const focus = root.getAttribute("data-brand");
    applyBrandToRoot(root, null);
    applyBrandToRoot(root, cfg);
    expect(root.getAttribute("style")).toBe(viaScript);
    expect(root.getAttribute("data-brand")).toBe(focus);
  });

  it("pre-paint script reads the persisted store", () => {
    localStorage.setItem(
      "showcase-brand",
      JSON.stringify({ state: { brand: { ...cfg, font: "estilo" }, logo: null }, version: 0 }),
    );
    new Function(PREFS_SCRIPT)();
    expect(root.style.getPropertyValue("--brand-accent")).toBe("#be185d");
    expect(root.hasAttribute("data-brand-font")).toBe(false);
  });
});
