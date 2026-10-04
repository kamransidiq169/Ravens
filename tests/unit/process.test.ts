import { describe, expect, it } from "vitest";

import { STAGE_IDS, toStages } from "@/features/process/lib/process.data";
import { STAGES, processAt } from "@/features/process/lib/process.motion";

const wide = { compact: false };
const compact = { compact: true };
const steps = Array.from({ length: 401 }, (_, i) => i / 400);

describe("processAt", () => {
  it("opens on the intro statement alone", () => {
    const s = processAt(0, wide);
    expect(s.active).toBe(-1);
    expect(s.intro).toMatchObject({ y: 0, scale: 1, opacity: 1, copy: 1 });
    expect(s.words.every((w) => w.opacity === 0)).toBe(true);
    expect(s.rig.opacity).toBe(0);
    expect(s.tint).toBe(0);
  });

  it("pushes the camera into the heading, then hands over to DISCOVER", () => {
    const mid = processAt(0.2, wide);
    expect(mid.intro.scale).toBeGreaterThan(4);
    expect(mid.intro.split.bottom).toBeGreaterThan(0.3);
    expect(mid.intro.copy).toBe(0);
    const after = processAt(0.25, wide);
    expect(after.intro.opacity).toBe(0);
    expect(after.words[0]!.open).toBe(1);
    expect(processAt(0.15, wide).words[0]!.open).toBe(0);
  });

  it("owns one chapter at a time, in order", () => {
    const peaks = Array.from({ length: STAGES }, (_, i) => {
      const at = steps.filter((p) => processAt(p, wide).words[i]!.opacity > 0.99);
      return at.length ? ([at[0]!, at[at.length - 1]!] as [number, number]) : null;
    });
    peaks.forEach((range, i) => {
      expect(range).not.toBeNull();
      if (i > 0) expect(range![0]).toBeGreaterThan(peaks[i - 1]![1]);
    });
    const actives = steps.map((p) => processAt(p, wide).active);
    expect([...actives].sort((a, b) => a - b)).toEqual(actives);
    expect(actives.at(-1)).toBe(STAGES - 1);
  });

  it("ends with the bird gone and the canvas washed pale", () => {
    const s = processAt(1, wide);
    expect(s.tint).toBe(1);
    expect(s.rig.y).toBeLessThan(-0.9);
    expect(s.words.every((w) => w.opacity < 0.01)).toBe(true);
  });

  it("is finite and continuous, so scrubbing backwards retraces the same path", () => {
    for (const layout of [wide, compact]) {
      let prev = processAt(0, layout);
      for (const p of steps.slice(1)) {
        const s = processAt(p, layout);
        // Fractions of the raven's size, then degrees: no step of 1/400 of the scroll may jump.
        for (const [a, b, max] of [
          [prev.rig.scale, s.rig.scale, 0.2],
          [prev.rig.x, s.rig.x, 0.2],
          [prev.rig.y, s.rig.y, 0.2],
          [prev.rig.yaw, s.rig.yaw, 4],
          [prev.rig.rotate, s.rig.rotate, 4],
        ] as const) {
          expect(Number.isFinite(b)).toBe(true);
          expect(Math.abs(b - a)).toBeLessThan(max);
        }
        prev = s;
      }
    }
  });

  it("clamps out-of-range progress", () => {
    expect(processAt(-3, wide)).toEqual(processAt(0, wide));
    expect(processAt(7, wide)).toEqual(processAt(1, wide));
  });

  it("keeps the front wing piece off phones", () => {
    expect(steps.every((p) => processAt(p, compact).front === 0)).toBe(true);
    expect(steps.some((p) => processAt(p, wide).front > 0.9)).toBe(true);
  });
});

describe("toStages", () => {
  const step = (id: string) => ({ id, title: id, description: `${id} copy` });

  it("maps repository steps onto the four chapters in journey order", () => {
    const stages = toStages([step("deliver"), step("discover"), step("design"), step("define")]);
    expect(stages.map((s) => s.id)).toEqual([...STAGE_IDS]);
    expect(stages.map((s) => s.index)).toEqual(["01", "02", "03", "04"]);
  });

  it("drops unknown steps", () => {
    expect(toStages([step("discover"), step("other")]).map((s) => s.id)).toEqual(["discover"]);
  });
});
