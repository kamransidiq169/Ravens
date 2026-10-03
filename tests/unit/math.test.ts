import { describe, expect, it } from "vitest";

import { clamp, lerp, mapRange } from "@/lib/math";

describe("clamp", () => {
  it("bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("lerp", () => {
  it("interpolates between endpoints", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it("extrapolates outside 0–1", () => {
    expect(lerp(0, 10, 2)).toBe(20);
  });
});

describe("mapRange", () => {
  it("remaps between ranges", () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(mapRange(0, -1, 1, 0, 1)).toBe(0.5);
  });

  it("supports inverted output ranges", () => {
    expect(mapRange(2, 0, 10, 1, 0)).toBeCloseTo(0.8);
  });

  it("returns outMin for a degenerate input range instead of NaN", () => {
    expect(mapRange(3, 2, 2, 7, 9)).toBe(7);
  });
});
