import { describe, expect, it } from "vitest";
import { themes } from "./themes";

describe("themes", () => {
  it("defines an accent + accentInk for every vertical", () => {
    for (const name of ["servicios", "tienda", "reservas", "admin"] as const) {
      expect(themes[name].accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(themes[name].accentInk).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
