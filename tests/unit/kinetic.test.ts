import { describe, expect, it } from "vitest";

import { KINETIC_PERIOD, kineticAt } from "@/features/hero/lib/kinetic";

const steps = (n: number) => Array.from({ length: n + 1 }, (_, i) => (i / n) * KINETIC_PERIOD);
const logZoom = (t: number) => Math.log(kineticAt(t).zoom);

describe("kinetic loop (Phase 5)", () => {
  it("is a 9 second loop that starts and ends in the same rest pose, at rest", () => {
    expect(KINETIC_PERIOD).toBe(9);
    const a = kineticAt(0);
    // Just before the wrap (at exactly 9 s time wraps to 0).
    const b = kineticAt(KINETIC_PERIOD - 1e-9);
    expect(a.zoom).toBeCloseTo(1, 9);
    expect(a.morph).toBeCloseTo(0, 9);
    expect(b.zoom).toBeCloseTo(a.zoom, 9);
    expect(b.morph).toBeCloseTo(a.morph, 9);
    // The structure has four-fold symmetry: a quarter turn is the same picture.
    expect(Math.abs(b.rotation - a.rotation) % (Math.PI / 2)).toBeLessThan(1e-9);
    // Same velocity on both sides of the seam (both zero): no kink, no snap.
    const h = 1e-4;
    expect(Math.abs(logZoom(KINETIC_PERIOD - h) - logZoom(KINETIC_PERIOD - 1e-9))).toBeLessThan(1e-6);
    expect(Math.abs(logZoom(h) - logZoom(0))).toBeLessThan(1e-6);
  });

  it("plays the whole sequence in order: approach, rings, extreme close-up, collapse, point, re-formation, approach", () => {
    expect(kineticAt(1.0).zoom).toBeCloseTo(1, 6); // nested diamonds at rest
    expect(kineticAt(3.2).zoom).toBeGreaterThan(4); // approach
    expect(kineticAt(3.2).morph).toBeGreaterThan(0.4); // corners rounding
    expect(kineticAt(5.0).morph).toBeCloseTo(1, 6); // rings: circles
    expect(kineticAt(5.4).zoom).toBeGreaterThan(18); // extreme close-up, forms beyond the frame
    expect(kineticAt(6.5).zoom).toBeCloseTo(0.02, 4); // collapsed to a point
    expect(kineticAt(7.6).zoom).toBeGreaterThan(kineticAt(6.9).zoom * 5); // growing back from the centre
    expect(kineticAt(8.6).zoom).toBeCloseTo(1, 6); // re-formed
    expect(kineticAt(8.6).morph).toBeCloseTo(0, 6); // back to rounded diamonds
  });

  it("zooms in monotonically, collapses monotonically, then re-forms monotonically (no wobble or overshoot)", () => {
    const check = (from: number, to: number, direction: 1 | -1) => {
      let previous = logZoom(from);
      for (let t = from; t <= to; t += 0.01) {
        const value = logZoom(t);
        expect((value - previous) * direction).toBeGreaterThanOrEqual(-1e-9);
        previous = value;
      }
    };
    check(1.0, 5.6, 1);
    check(5.6, 6.5, -1);
    check(6.5, 8.6, 1);
  });

  it("collapses faster than it grows (the strongest acceleration of the piece) yet stays smooth", () => {
    const speed = (a: number, b: number) => Math.abs(logZoom(b) - logZoom(a)) / (b - a);
    const collapse = Math.max(...Array.from({ length: 90 }, (_, i) => speed(5.6 + i * 0.01, 5.61 + i * 0.01)));
    const approach = Math.max(...Array.from({ length: 220 }, (_, i) => speed(1 + i * 0.01, 1.01 + i * 0.01)));
    expect(collapse).toBeGreaterThan(approach * 2);
  });

  it("has no kink anywhere: speed is continuous across every keyframe (C1), for zoom, morph and rotation", () => {
    const h = 1e-5;
    const channels = [
      (t: number) => logZoom(t),
      (t: number) => kineticAt(t).morph,
      (t: number) => kineticAt(t).rotation,
    ];
    for (const key of [1.0, 3.2, 5.0, 5.6, 6.5, 6.9, 8.6]) {
      for (const f of channels) {
        const before = (f(key) - f(key - h)) / h;
        const after = (f(key + h) - f(key)) / h;
        // A real kink would be a jump in speed of order 0.1–10; the finite-difference noise at a knot is ~5e-4.
        expect(Math.abs(after - before)).toBeLessThan(0.01);
      }
    }
  });

  it("rotates steadily forward (never counter-spinning) and by a quarter turn per loop", () => {
    let previous = kineticAt(0).rotation;
    for (const t of steps(900).slice(0, -1)) {
      const r = kineticAt(t).rotation;
      expect(r).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = r;
    }
    expect(kineticAt(KINETIC_PERIOD - 1e-9).rotation).toBeCloseTo(Math.PI / 2, 6);
  });

  it("wraps time so it can run forever", () => {
    expect(kineticAt(27.3).zoom).toBeCloseTo(kineticAt(0.3).zoom, 9);
    expect(kineticAt(-1).zoom).toBeCloseTo(kineticAt(8).zoom, 9);
  });
});
