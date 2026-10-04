import { Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { createBasketball } from "@/features/hero/scene/orbGeometry";

const geometry = createBasketball(160, 112);
const position = geometry.getAttribute("position");
const color = geometry.getAttribute("color");
const normal = geometry.getAttribute("normal");

const SIDE = Math.SQRT1_2;
const planes = [new Vector3(0, 1, 0), new Vector3(1, 0, 0), new Vector3(SIDE, 0, -SIDE), new Vector3(SIDE, 0, SIDE)];

/** Distance to the nearest seam (|n · plane| over the four great circles). */
function seamDistance(i: number) {
  const n = new Vector3().fromBufferAttribute(position, i);
  const unit = n.clone().normalize();
  return { d: Math.min(...planes.map((p) => Math.abs(unit.dot(p)))), r: n.length() };
}

describe("basketball geometry", () => {
  it("is a sphere with shallow channels: every vertex stays within a few percent of the unit radius", () => {
    for (let i = 0; i < position.count; i += 1) {
      const { r } = seamDistance(i);
      expect(r).toBeGreaterThan(0.96);
      expect(r).toBeLessThan(1.01);
    }
  });

  it("has recessed channels along all four seams, and none away from them", () => {
    let inChannel = 0;
    let deepest = 1;
    for (let i = 0; i < position.count; i += 1) {
      const { d, r } = seamDistance(i);
      if (d < 0.01) {
        inChannel += 1;
        deepest = Math.min(deepest, r);
        expect(r).toBeLessThan(0.99); // recessed
      }
      if (d > 0.14) expect(r).toBeCloseTo(1, 6); // smooth, untouched surface
    }
    expect(inChannel).toBeGreaterThan(300);
    expect(deepest).toBeGreaterThan(0.97); // shallow: it must still read as one continuous ball
  });

  it("follows the sphere: the channels are great circles, so seam points lie on the same planes in 3D", () => {
    // Equator channel: vertices at y ≈ 0 are recessed all the way round, at every longitude.
    const longitudes = new Set<number>();
    for (let i = 0; i < position.count; i += 1) {
      const n = new Vector3().fromBufferAttribute(position, i);
      if (Math.abs(n.y) < 0.004 && n.length() < 0.99)
        longitudes.add(Math.round((Math.atan2(n.z, n.x) * 180) / Math.PI / 10));
    }
    expect(longitudes.size).toBeGreaterThanOrEqual(30);
  });

  it("tints the channels a deeper gold and lightly lifts the bevel lip, and has smooth, finite normals", () => {
    let darkest = 1;
    let brightest = 1;
    for (let i = 0; i < position.count; i += 1) {
      const tone = color.getX(i);
      darkest = Math.min(darkest, tone);
      brightest = Math.max(brightest, tone);
      expect(Number.isFinite(normal.getX(i) + normal.getY(i) + normal.getZ(i))).toBe(true);
      const length = Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i));
      expect(length).toBeGreaterThan(0.99);
      expect(length).toBeLessThan(1.01);
    }
    expect(darkest).toBeLessThan(0.65); // channels clearly deeper
    expect(darkest).toBeGreaterThan(0.4); // but not black marker lines
    expect(brightest).toBeGreaterThan(1.0); // the lip catches a little more light
  });

  it("is symmetric: the pattern repeats under a half turn about the vertical axis and a flip of the equator", () => {
    const probe = (x: number, y: number, z: number) => {
      const n = new Vector3(x, y, z).normalize();
      return Math.min(...planes.map((p) => Math.abs(n.dot(p))));
    };
    for (const [x, y, z] of [
      [0.3, 0.5, 0.8],
      [0.9, 0.1, 0.2],
      [-0.4, 0.7, 0.3],
    ] as const) {
      expect(probe(-x, y, -z)).toBeCloseTo(probe(x, y, z), 9); // half turn about y
      expect(probe(x, -y, z)).toBeCloseTo(probe(x, y, z), 9); // mirror in the equator
    }
  });
});
