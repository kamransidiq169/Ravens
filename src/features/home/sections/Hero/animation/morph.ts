/**
 * The Phase 5 title morph (THE NEXT IS YOURS.) as pure functions of the morph progress `m` (0 → 1, scrubbed by scroll).
 *
 * The line is not scaled as one rigid block. The title as a whole zooms about its centre (in log space, so equal steps
 * feel like equal zooms), while every character is also deformed on its own: taller far more than wider, centre
 * characters most (the line inflates from its middle), each pushed outward from the centre so the tracking opens up, and
 * each carrying a small, fixed, art-directed irregularity so no two letters are quite alike. All of it grows with a power
 * curve: almost nothing at first, then increasingly pronounced. Everything is a transform (scaleX / scaleY / xPercent /
 * yPercent), so nothing here touches layout, and the same input always gives the same pose, which is what makes
 * scrolling back play the morph in reverse.
 */

export interface MorphChar {
  sx: number;
  sy: number;
  /** Horizontal offset as a percentage of the character's own width (gsap `xPercent`). */
  x: number;
  /** Vertical offset as a percentage of the character's own height (gsap `yPercent`). */
  y: number;
}

/** Peak zoom of the whole line. Phones have a much smaller line, so it travels further to fill the viewport. */
const PEAK_ZOOM = { wide: 4.2, compact: 6 } as const;
/** Peak extra vertical stretch of the centre characters (the edges get ~45% of it). */
const PEAK_STRETCH = { wide: 2.7, compact: 4.2 } as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** A fixed pseudo-random value in [-1, 1) per character index (no Math.random: identical on every run). */
export function irregularity(index: number): number {
  return (((Math.imul(index + 1, 2654435761) >>> 0) % 2000) - 1000) / 1000;
}

/** Zoom of the whole title about its centre. 1 at rest. */
export function morphScale(m: number, compact: boolean): number {
  const peak = compact ? PEAK_ZOOM.compact : PEAK_ZOOM.wide;
  return Math.exp(Math.log(peak) * clamp01(m) ** 1.55);
}

/** Pose of character `index` of `count` (spaces included, so the line stays one object about its own centre). */
export function morphChar(m: number, index: number, count: number, compact: boolean): MorphChar {
  const a = clamp01(m) ** 1.7;
  if (a === 0) return { sx: 1, sy: 1, x: 0, y: 0 };
  const half = (count - 1) / 2;
  const u = half === 0 ? 0 : (index - half) / half;
  const r = irregularity(index);
  // 1 at the centre of the line, ~0.45 at its ends.
  const centre = 1 - 0.55 * Math.abs(u) ** 1.4;
  const stretch = compact ? PEAK_STRETCH.compact : PEAK_STRETCH.wide;
  const sx = 1 + 0.5 * a * (0.55 + 0.45 * centre + 0.12 * r);
  return {
    sy: 1 + stretch * a * (centre + 0.16 * r),
    sx,
    // Each character widens about its own centre, so it is pushed out by how much it widened, once for every place it
    // is from the middle of the line: the tracking opens up and neighbours do not collide.
    x: (index - half) * (sx - 1) * 88 + r * 4 * a,
    y: r * 5 * a,
  };
}
