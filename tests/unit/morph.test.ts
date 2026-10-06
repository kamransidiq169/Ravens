import { describe, expect, it } from "vitest";

import { irregularity, morphChar, morphScale } from "@/features/hero/lib/morph";

const COUNT = 18; // "THE NEXT IS YOURS."

describe("title morph", () => {
  it("is exactly the finished title at rest", () => {
    expect(morphScale(0, false)).toBe(1);
    for (let i = 0; i < COUNT; i += 1) expect(morphChar(0, i, COUNT, false)).toEqual({ sx: 1, sy: 1, x: 0, y: 0 });
  });

  it("zooms the whole line monotonically to the peak, further on phones", () => {
    let previous = 1;
    for (let m = 0; m <= 1; m += 0.01) {
      const s = morphScale(m, false);
      expect(s).toBeGreaterThanOrEqual(previous);
      previous = s;
    }
    expect(morphScale(1, false)).toBeCloseTo(4.2, 6);
    expect(morphScale(1, true)).toBeGreaterThan(morphScale(1, false));
    // Subtle at first: a third of the way in it has barely moved.
    expect(morphScale(0.33, false)).toBeLessThan(1.4);
  });

  it("deforms each character on its own: taller than wider, the centre most, the tracking opening from the middle", () => {
    const mid = morphChar(1, 8, COUNT, false);
    const edge = morphChar(1, 0, COUNT, false);
    expect(mid.sy).toBeGreaterThan(mid.sx);
    expect(mid.sy).toBeGreaterThan(edge.sy);
    expect(morphChar(1, 0, COUNT, false).x).toBeLessThan(0);
    expect(morphChar(1, COUNT - 1, COUNT, false).x).toBeGreaterThan(0);
    // Not one rigid block: neighbours differ.
    const poses = Array.from({ length: COUNT }, (_, i) => morphChar(0.7, i, COUNT, false).sy);
    expect(new Set(poses.map((v) => v.toFixed(4))).size).toBeGreaterThan(COUNT - 3);
  });

  it("grows progressively (nothing jumps) and is deterministic", () => {
    for (let i = 0; i < COUNT; i += 1) {
      let previous = morphChar(0, i, COUNT, false);
      for (let m = 0.01; m <= 1; m += 0.01) {
        const c = morphChar(m, i, COUNT, false);
        expect(c.sy).toBeGreaterThanOrEqual(previous.sy);
        expect(Math.abs(c.sy - previous.sy)).toBeLessThan(0.1);
        expect(c).toEqual(morphChar(m, i, COUNT, false));
        previous = c;
      }
    }
    for (let i = 0; i < 40; i += 1) expect(Math.abs(irregularity(i))).toBeLessThanOrEqual(1);
  });
});
