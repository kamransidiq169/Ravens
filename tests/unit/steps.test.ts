import { describe, expect, it } from "vitest";

import { SETTLED } from "@/features/home/sections/Hero/animation/journey";
import {
  GESTURE_GAP_MS,
  HERO_STOPS,
  startsNewGesture,
  stepDuration,
  stepFrom,
} from "@/features/home/sections/Hero/animation/steps";

const stops = [100, 300, 500, 900];

describe("stepFrom", () => {
  it("moves exactly one stop in either direction, however far away the next-but-one is", () => {
    expect(stepFrom(stops, 100, 1)).toBe(300);
    expect(stepFrom(stops, 300, 1)).toBe(500);
    expect(stepFrom(stops, 900, -1)).toBe(500);
  });

  it("resolves from between stops without skipping the nearest one", () => {
    expect(stepFrom(stops, 350, 1)).toBe(500);
    expect(stepFrom(stops, 350, -1)).toBe(300);
  });

  it("treats a position within tolerance as being at the stop", () => {
    expect(stepFrom(stops, 299, 1, 2)).toBe(500);
    expect(stepFrom(stops, 301, -1, 2)).toBe(100);
  });

  it("returns null at the ends", () => {
    expect(stepFrom(stops, 900, 1)).toBeNull();
    expect(stepFrom(stops, 100, -1)).toBeNull();
  });
});

describe("hero stops", () => {
  it("are the five resting states in increasing order inside the sequence", () => {
    expect(HERO_STOPS).toEqual([0, SETTLED.project, SETTLED.next, SETTLED.last, SETTLED.bespoke]);
    HERO_STOPS.forEach((stop, i) => {
      expect(stop).toBeGreaterThanOrEqual(0);
      expect(stop).toBeLessThan(1);
      if (i > 0) expect(stop).toBeGreaterThan(HERO_STOPS[i - 1]!);
    });
  });
});

describe("startsNewGesture", () => {
  it("treats decaying inertia and coalesced bursts as the same gesture", () => {
    expect(startsNewGesture(16, 80, 100)).toBe(false);
    expect(startsNewGesture(8, 240, 120)).toBe(false);
  });

  it("starts a new gesture after a quiet gap or a clear re-acceleration", () => {
    expect(startsNewGesture(GESTURE_GAP_MS + 1, 10, 100)).toBe(true);
    expect(startsNewGesture(16, 400, 20)).toBe(true);
  });
});

describe("stepDuration", () => {
  it("stays within a brisk but readable range", () => {
    expect(stepDuration(10, 900)).toBe(1);
    expect(stepDuration(4000, 900)).toBeGreaterThan(1);
    expect(stepDuration(100000, 900)).toBe(2.4);
  });
});

describe("compact pacing", () => {
  it("is slower on phones, with the same shape", () => {
    expect(stepDuration(10, 900, true)).toBeCloseTo(1.4);
    expect(stepDuration(4000, 900, true)).toBeGreaterThan(stepDuration(4000, 900));
    expect(stepDuration(100000, 900, true)).toBeCloseTo(3.36);
  });
});
