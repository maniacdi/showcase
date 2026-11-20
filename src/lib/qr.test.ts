import { describe, expect, it } from "vitest";
import { encodeQr, qrPath, qrVersionFor } from "./qr";

/** Finder pattern: 7x7 dark ring, light ring, 3x3 dark centre. */
function hasFinderAt(m: boolean[][], x0: number, y0: number): boolean {
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3));
      if (m[y0 + y][x0 + x] !== (ring !== 2)) return false;
    }
  }
  return true;
}

describe("QR encoder", () => {
  it("picks the smallest version that fits (level M, byte mode)", () => {
    expect(qrVersionFor(14)).toBe(1);
    expect(qrVersionFor(15)).toBe(2);
    expect(qrVersionFor(62)).toBe(4);
    expect(qrVersionFor(213)).toBe(10);
    expect(qrVersionFor(214)).toBeNull();
  });

  it("builds a square matrix of 4v+17 modules", () => {
    const url = "https://magaldi.is-a.dev/restaurante/carta?mesa=7";
    const m = encodeQr(url);
    const v = qrVersionFor(new TextEncoder().encode(url).length) as number;
    expect(m).toHaveLength(4 * v + 17);
    m.forEach((row) => expect(row).toHaveLength(m.length));
  });

  it("draws the three finder patterns, timing lines and the dark module", () => {
    const m = encodeQr("https://example.com/restaurante/carta?mesa=12");
    const n = m.length;
    expect(hasFinderAt(m, 0, 0)).toBe(true);
    expect(hasFinderAt(m, n - 7, 0)).toBe(true);
    expect(hasFinderAt(m, 0, n - 7)).toBe(true);
    for (let i = 8; i < n - 8; i++) {
      expect(m[6][i]).toBe(i % 2 === 0);
      expect(m[i][6]).toBe(i % 2 === 0);
    }
    expect(m[n - 8][8]).toBe(true);
  });

  it("writes valid BCH format information for level M, identical in both copies", () => {
    const m = encodeQr("A");
    const n = m.length;
    // Copy 1 around the top-left finder, bit i at the positions ISO 18004 uses.
    const copy1 = [
      ...[0, 1, 2, 3, 4, 5, 7, 8].map((y) => m[y][8]),
      ...[7, 5, 4, 3, 2, 1, 0].map((x) => m[8][x]),
    ];
    // Copy 2 split between the top-right and bottom-left finders.
    const copy2 = [
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => m[8][n - 1 - i]),
      ...[8, 9, 10, 11, 12, 13, 14].map((i) => m[n - 15 + i][8]),
    ];
    expect(copy2).toEqual(copy1);

    const bits = copy1.reduce((acc, b, i) => acc | (Number(b) << i), 0);
    const data = (bits ^ 0x5412) >>> 10;
    expect(data >>> 3).toBe(0); // error correction level M
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    expect(((data << 10) | rem) ^ 0x5412).toBe(bits);
  });

  it("is deterministic and throws on oversized input", () => {
    expect(encodeQr("mesa 3")).toEqual(encodeQr("mesa 3"));
    expect(() => encodeQr("x".repeat(300))).toThrow(RangeError);
  });

  it("renders one 1x1 square per dark module", () => {
    const m = encodeQr("A");
    const dark = m.flat().filter(Boolean).length;
    expect(qrPath(m).match(/M/g)).toHaveLength(dark);
  });
});
