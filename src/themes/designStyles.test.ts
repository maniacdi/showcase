import { describe, expect, it } from "vitest";
import { DEFAULT_STYLE, DESIGN_STYLES, isDesignStyle } from "./designStyles";

describe("designStyles", () => {
  it("has unique keys and includes the default", () => {
    const keys = DESIGN_STYLES.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain(DEFAULT_STYLE);
  });

  it("isDesignStyle guards unknown values", () => {
    expect(isDesignStyle("bento")).toBe(true);
    expect(isDesignStyle("comic-sans")).toBe(false);
    expect(isDesignStyle(null)).toBe(false);
  });
});
