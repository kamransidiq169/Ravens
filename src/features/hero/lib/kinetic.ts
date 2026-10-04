/**
 * Timing of the Phase 5 (BESPOKE) kinetic geometry: one 9 s loop of a single nested structure that approaches, becomes
 * rings, fills the frame, collapses to a point, re-forms and approaches again.
 *
 * Every channel is a cubic Hermite spline through a few keyframes with explicit slopes, so each is C¹ everywhere
 * (no kink at any keyframe) and the loop's last key equals its first with the same (zero) slope: nothing resets.
 * Zoom is animated in log space, so equal steps are equal perceptual zooms and the collapse (about 8 octaves in under a
 * second) accelerates and settles like a real camera move instead of a linear scale.
 *
 *   0.0 – 1.0  rest: nested rounded diamonds        5.0 – 5.6  extreme close-up (only arcs of the rings remain)
 *   1.0 – 3.2  approach; corners start to round      5.6 – 6.5  collapse toward the centre
 *   3.2 – 5.0  rings: corners leave the frame       6.5 – 8.6  a point, then re-formation from the centre outward
 *                                                    8.6 – 9.0  rest again (the loop point), then the second approach
 */

export const KINETIC_PERIOD = 9;

/** [time (s), value, slope (value per second)] */
type Key = readonly [number, number, number];

function hermite(keys: readonly Key[], time: number): number {
  const t = Math.min(Math.max(time, keys[0]![0]), keys[keys.length - 1]![0]);
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1]![0]) i += 1;
  const [t0, v0, m0] = keys[i]!;
  const [t1, v1, m1] = keys[i + 1]!;
  const h = t1 - t0;
  const s = (t - t0) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + s) * h * m0 + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * h * m1;
}

/** ln(zoom): 0 is the rest state. Slopes are chosen so no segment overshoots (each is monotone). */
const LOG_ZOOM: readonly Key[] = [
  [0, 0, 0],
  [1.0, 0, 0],
  [3.2, Math.log(4.5), 0.9],
  [5.0, Math.log(20), 0.6],
  [5.6, Math.log(24), 0.1],
  [6.5, Math.log(0.02), 0],
  [6.9, Math.log(0.03), 2.8],
  [8.6, 0, 0],
  [9.0, 0, 0],
];

/** 0 = rounded diamond, 1 = circle: the corner radius as a share of the half-size. */
const MORPH: readonly Key[] = [
  [0, 0, 0],
  [1.0, 0, 0],
  [3.2, 0.45, 0.22],
  [5.0, 1, 0.12],
  [5.6, 1, 0],
  [6.5, 0.7, 0],
  [8.6, 0, 0],
  [9.0, 0, 0],
];

/**
 * Extra rotation (rad). The form has four-fold symmetry, so a quarter turn ends exactly where it began: the structure
 * slowly re-orients through the loop and arrives at the same picture, with no counter-rotation needed.
 */
const ROTATION: readonly Key[] = [
  [0, 0, 0],
  [1.0, 0, 0],
  [3.2, 0.35, 0.18],
  [5.0, 0.8, 0.22],
  [5.6, 0.9, 0.15],
  [6.5, 1.1, 0.2],
  [8.6, Math.PI / 2, 0],
  [9.0, Math.PI / 2, 0],
];

export interface KineticState {
  /** Linear zoom factor (1 at rest, ~24 at the extreme close-up, ~0.02 at the point). */
  zoom: number;
  morph: number;
  rotation: number;
  /** 0 → 1 across the loop (drives the periodic gradient and perspective phases). */
  phase: number;
}

export function kineticAt(seconds: number): KineticState {
  const t = ((seconds % KINETIC_PERIOD) + KINETIC_PERIOD) % KINETIC_PERIOD;
  return {
    zoom: Math.exp(hermite(LOG_ZOOM, t)),
    morph: hermite(MORPH, t),
    rotation: hermite(ROTATION, t),
    phase: t / KINETIC_PERIOD,
  };
}
