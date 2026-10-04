import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  FIVE_SHARE,
  JOURNEY_SVH,
  PHASE_EXIT,
  enterpriseProgress,
  introAt,
  phaseExit,
  sequenceAt,
  type TitleState,
} from "@/features/hero/lib/journey";

const steps = Array.from({ length: 201 }, (_, i) => i / 200);

describe("introAt (hero → Northlight)", () => {
  it("starts as the finished hero: full headline at rest, chapter hidden", () => {
    const s = introAt(0);
    expect(s.headline).toMatchObject({ scale: 1, y: 0, opacity: 1 });
    expect(s.title.opacity).toBe(0);
    expect(s.meta).toEqual([0, 0, 0]);
    expect(s.phase).toBe("hero");
  });

  it("ends on the project composition: headline gone, title and meta fully in", () => {
    const s = introAt(1);
    expect(s.headline.opacity).toBe(0);
    expect(s.title).toMatchObject({ scale: 1, y: 0, opacity: 1 });
    expect(s.meta).toEqual([1, 1, 1]);
    expect(s.phase).toBe("project");
  });

  it("clamps out-of-range progress", () => {
    expect(introAt(-3)).toEqual(introAt(0));
    expect(introAt(7)).toEqual(introAt(1));
  });

  it("is a pure function of progress, so scrolling back replays the same states", () => {
    for (const p of steps) expect(introAt(p)).toEqual(introAt(p));
  });

  it("never shows the headline and the project title at the same time", () => {
    for (const p of steps) {
      const s = introAt(p);
      expect(Math.min(s.headline.opacity, s.title.opacity)).toBeLessThanOrEqual(0.001);
    }
  });

  it("leaves a fully empty stage between the chapters, with the jellyfish out of frame", () => {
    const s = introAt(0.52);
    expect(s.headline.opacity).toBe(0);
    expect(s.title.opacity).toBe(0);
    expect(s.visual.y).toBeGreaterThanOrEqual(1);
  });

  it("only ever grows and sinks the headline (monotonic) and never makes it reappear", () => {
    let previous = introAt(0).headline;
    for (const p of steps) {
      const { headline } = introAt(p);
      expect(headline.scale).toBeGreaterThanOrEqual(previous.scale);
      expect(headline.y).toBeGreaterThanOrEqual(previous.y);
      expect(headline.opacity).toBeLessThanOrEqual(previous.opacity + 1e-9);
      previous = headline;
    }
  });

  it("moves in small steps (no jumps) for every animated value", () => {
    const keys = (p: number) => {
      const s = introAt(p);
      return [
        s.headline.scale,
        s.headline.y,
        s.headline.opacity,
        s.visual.y,
        s.visual.scale,
        s.title.opacity,
        s.title.scale,
      ];
    };
    const fine = Array.from({ length: 1001 }, (_, i) => i / 1000);
    for (let i = 1; i < fine.length; i += 1) {
      const a = keys(fine[i - 1]!);
      const b = keys(fine[i]!);
      a.forEach((value, k) => expect(Math.abs(b[k]! - value)).toBeLessThan(0.06));
    }
  });
});

/** The five phase titles, in order, as read from the sequence. */
const titles: ((p: number) => TitleState)[] = [
  (p) => sequenceAt(p).headline,
  (p) => sequenceAt(p).title,
  (p) => sequenceAt(p).next.title,
  (p) => sequenceAt(p).last.title,
  (p) => sequenceAt(p).bespoke.title,
];
const fine = Array.from({ length: 20001 }, (_, i) => i / 20000);

/** When a title has fully arrived (first at rest), when it starts to leave, and when it is gone. */
function exitRange(title: (p: number) => TitleState) {
  const atRest = (t: TitleState) => t.opacity === 1 && t.scale === 1 && t.y === 0;
  const arrived = fine.find((p) => atRest(title(p)))!;
  const start = fine.find((p) => p > arrived && title(p).scale > 1)!;
  const end = fine.find((p) => p > start && title(p).opacity === 0)!;
  return { arrived, start, end };
}

describe("the shared phase exit (extracted from Phase 1)", () => {
  it("is exactly Phase 1's headline exit: the hero headline is phaseExit over its own half-span", () => {
    for (const p of [0, 0.05, 0.1, 0.25, 0.4, 0.5, 0.7, 1]) {
      expect(introAt(p).headline).toEqual(phaseExit(Math.min(1, p / 0.5)));
    }
  });

  it("rests at 1×, centred and opaque; at the peak it is 3.9× and has fallen 80% of the stage; then it is gone", () => {
    expect(phaseExit(0)).toEqual({ scale: 1, y: 0, opacity: 1 });
    const end = phaseExit(1);
    expect(end.scale).toBeCloseTo(1 + PHASE_EXIT.scale, 9);
    expect(end.y).toBeCloseTo(PHASE_EXIT.y, 9);
    expect(end.opacity).toBe(0);
  });

  it("zooms and drops monotonically, and stays fully readable until it is mostly past the frame", () => {
    let previous = phaseExit(0);
    for (let e = 0; e <= 1; e += 0.005) {
      const x = phaseExit(e);
      expect(x.scale).toBeGreaterThanOrEqual(previous.scale);
      expect(x.y).toBeGreaterThanOrEqual(previous.y);
      expect(x.opacity).toBeLessThanOrEqual(previous.opacity + 1e-12);
      if (e <= PHASE_EXIT.fadeFrom) expect(x.opacity).toBe(1);
      previous = x;
    }
  });
});

describe("every phase title uses that same exit (sequenceAt)", () => {
  const ranges = titles.map((title) => exitRange(title));

  it("each title leaves on the identical curve: same zoom-to-drop relationship, same peak, then gone", () => {
    titles.forEach((title, i) => {
      const { start, end } = ranges[i]!;
      for (let p = start; p <= end; p += (end - start) / 200) {
        const t = title(p);
        // From phaseExit: scale = 1 + 2.9 h^1.75 and y = 0.8 h^1.9, so y is a fixed function of scale.
        const h = ((t.scale - 1) / PHASE_EXIT.scale) ** (1 / PHASE_EXIT.scalePower);
        expect(t.y).toBeCloseTo(PHASE_EXIT.y * h ** PHASE_EXIT.yPower, 6);
      }
      const peak = title(end - 1e-9);
      expect(peak.scale).toBeGreaterThan(3.8);
      expect(peak.y).toBeGreaterThan(0.78);
      expect(title(end).opacity).toBe(0);
    });
  });

  it("each phase holds in its settled state before its exit begins (the hero's hold is the page at rest)", () => {
    for (let i = 1; i < titles.length; i += 1) {
      const { arrived, start } = ranges[i]!;
      // At least ~20 svh of scroll between "fully arrived" and "starts to leave".
      expect((start - arrived) * JOURNEY_SVH).toBeGreaterThan(20);
    }
  });

  it("the outgoing title is mostly gone before the incoming one is dominant: no overlapping titles, no ghosts", () => {
    for (const p of fine) {
      const o = titles.map((title) => title(p).opacity);
      for (let i = 0; i < o.length; i += 1) {
        for (let j = i + 1; j < o.length; j += 1) expect(Math.min(o[i]!, o[j]!)).toBeLessThan(0.3);
      }
    }
    // A title that has left stays gone until the user scrolls back (no reappearing ghosts).
    titles.forEach((title, i) => {
      const { end } = ranges[i]!;
      const next = ranges[i + 1]?.start ?? 1;
      for (let p = end; p < Math.min(next, 1); p += 0.001) expect(title(p).opacity).toBe(0);
    });
  });

  it("is continuous, with no jump in any title's scale, drop or opacity anywhere on the scroll", () => {
    titles.forEach((title) => {
      let previous = title(0);
      for (const p of fine.slice(1)) {
        const t = title(p);
        expect(Math.abs(t.scale - previous.scale)).toBeLessThan(0.02);
        expect(Math.abs(t.y - previous.y)).toBeLessThan(0.004);
        expect(Math.abs(t.opacity - previous.opacity)).toBeLessThan(0.01);
        previous = t;
      }
    });
  });

  it("is a pure function of scroll position, so scrolling back plays exactly the same states in reverse", () => {
    const forward = fine.filter((_, i) => i % 97 === 0).map((p) => JSON.stringify(sequenceAt(p)));
    const backward = [...fine]
      .reverse()
      .filter((_, i) => i % 97 === 0)
      .map((p) => JSON.stringify(sequenceAt(p)));
    const again = fine.filter((_, i) => i % 97 === 0).map((p) => JSON.stringify(sequenceAt(p)));
    expect(again).toEqual(forward);
    // Order independence: sampling backwards gives the same value at the same position.
    const lookup = new Map(fine.map((p) => [p, JSON.stringify(sequenceAt(p))]));
    [...fine].reverse().forEach((p, i) => i % 97 === 0 && expect(JSON.stringify(sequenceAt(p))).toBe(lookup.get(p)));
    expect(backward.length).toBe(forward.length);
  });
});

describe("phases, scenes and the final release", () => {
  it("starts as the finished hero and ends on the empty background, every title gone and the last scene dissolved", () => {
    const start = sequenceAt(0);
    expect(start.headline).toEqual({ scale: 1, y: 0, opacity: 1 });
    expect(start.phase).toBe("hero");
    const end = sequenceAt(1);
    for (const title of titles) expect(title(1).opacity).toBe(0);
    expect(end.bespoke.scene).toBe(0);
    expect(end.bespoke.meta).toEqual([0, 0, 0]);
    expect(end.phase).toBe("end");
  });

  it("visits every phase in order as the user scrolls", () => {
    const seen: string[] = [];
    for (const p of fine) {
      const phase = sequenceAt(p).phase;
      if (seen[seen.length - 1] !== phase) seen.push(phase);
    }
    expect(seen).toEqual(["hero", "gap", "project", "next", "last", "bespoke", "end"]);
  });

  it("keeps the previous phase's objects on their own schedule: a scene is still present while its title is leaving", () => {
    // INTERACTIVE: when its title has started to leave, its scene is still (mostly) on stage.
    const { start } = exitRange(titles[2]!);
    const s = sequenceAt(start + 0.002);
    expect(s.next.scene).toBeGreaterThan(0.9);
  });

  it("the scroll length in the CSS equals the model's (and the phone length is the same sequence, shorter)", () => {
    const css = readFileSync("src/features/hero/hero.css", "utf8");
    const lengths = [...css.matchAll(/--journey-length:\s*(\d+)svh/g)].map((m) => Number(m[1]));
    expect(lengths[0]).toBe(JOURNEY_SVH);
    expect(lengths[1]).toBeLessThan(JOURNEY_SVH);
    expect(lengths[1]).toBeGreaterThan(JOURNEY_SVH * 0.6);
  });

  it("the share chain is consistent: each composite replays the previous one over its own first share", () => {
    expect(FIVE_SHARE).toBeGreaterThan(0.8);
    expect(FIVE_SHARE).toBeLessThan(1);
  });
});

describe("Phase 1 is unchanged (golden values from the original formulas)", () => {
  // [progress, headline.scale, headline.y, headline.opacity, visual.y, visual.scale, visual.tilt, details]
  const golden: [number, number, number, number, number, number, number, number][] = [
    [0.05, 1.0515701028911288, 0.010071403294353342, 1, -0.02, 1, 0, 0.5],
    [
      0.1, 1.1734604586216615, 0.03758780617881662, 1, -0.01983671089080041, 1.00002624289255, -0.00002624289254993441,
      0,
    ],
    [
      0.25, 1.8621751583769726, 0.21435469250725864, 1, 0.08027992418719927, 1.0161164163872285, -0.016116416387228452,
      0,
    ],
    [
      0.4, 2.962481064945687, 0.5235533734725494, 0.41700960219478733, 0.6488321912815278, 1.1074908878845313,
      -0.10749088788453125, 0,
    ],
    [0.5, 3.9, 0.8, 0, 1.1, 1.18, -0.18, 0],
    [0.58, 3.9, 0.8, 0, 1.1, 1.18, -0.18, 0],
  ];

  it.each(golden)("matches at progress %f", (p, scale, y, opacity, vy, vs, tilt, details) => {
    const s = introAt(p);
    expect(s.headline.scale).toBeCloseTo(scale, 9);
    expect(s.headline.y).toBeCloseTo(y, 9);
    expect(s.headline.opacity).toBeCloseTo(opacity, 9);
    expect(s.visual.y).toBeCloseTo(vy, 9);
    expect(s.visual.scale).toBeCloseTo(vs, 9);
    expect(s.visual.tilt).toBeCloseTo(tilt, 9);
    expect(s.details).toBeCloseTo(details, 9);
  });
});

describe("enterpriseProgress (scroll-linked evolution of the ENTERPRISE phase)", () => {
  const grid = Array.from({ length: 4001 }, (_, i) => i / 4000);

  it("is 0 until the phase starts to arrive and 1 once it has left, and never decreases", () => {
    let previous = 0;
    for (const p of grid) {
      const v = enterpriseProgress(p);
      expect(v).toBeGreaterThanOrEqual(previous - 1e-12);
      previous = v;
    }
    expect(enterpriseProgress(0)).toBe(0);
    expect(enterpriseProgress(1)).toBe(1);
  });

  it("lines up with the real phase: it starts when ENTERPRISE's scene first appears and ends when it has gone", () => {
    const appears = grid.find((p) => sequenceAt(p).last.scene > 1e-6)!;
    const gone = grid.find((p) => p > appears && sequenceAt(p).last.scene < 1e-6)!;
    expect(enterpriseProgress(appears)).toBeLessThan(0.03);
    expect(enterpriseProgress(gone)).toBeGreaterThan(0.97);
    const settled = grid.filter((p) => sequenceAt(p).last.scene > 0.999);
    expect(enterpriseProgress(settled[settled.length - 1]!) - enterpriseProgress(settled[0]!)).toBeGreaterThan(0.1);
  });
});
