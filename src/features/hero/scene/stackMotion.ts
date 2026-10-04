/**
 * Idle motion for the ENTERPRISE stack, kept out of the component so it can be tested and so the scene does nothing
 * but read numbers each frame.
 *
 * Each tile is its own floating object: a sum of slow sine waves per channel (rotation about its own axes, lateral
 * drift, vertical float), with periods that are all different and not multiples of each other, so the three never move
 * in step and the whole thing never visibly repeats. Sine waves loop by construction, so there is no loop boundary.
 *
 * The tiles are also coupled by inertia: the top tile drives the middle one and the middle one drives the bottom one.
 * Each tile follows its target with a critically damped spring (it settles without overshoot, so no bounce, no
 * rubber), and part of the tile above's already-delayed motion is added to its target, so a move above is answered
 * a moment later, and a little smaller, below.
 */

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

/** Channel order of a tile's state: rotation about its own y (turn), x (pitch) and z (roll), then x, y, z offsets. */
export const CH = { yaw: 0, pitch: 1, roll: 2, x: 3, y: 4, z: 5 } as const;
const CHANNELS = 6;

type Wave = readonly [amplitude: number, period: number, phase: number];

interface TileSpec {
  /** Per channel: a primary and a secondary wave. Angles in degrees, offsets in scene units, periods in seconds. */
  waves: readonly [Wave[], Wave[], Wave[], Wave[], Wave[], Wave[]];
  /** Spring smoothing time (s): how long this tile takes to catch up with its target. Slower tiles feel heavier. */
  smoothTime: number;
  /** Share of the tile above's (already delayed) motion added to this tile's target. */
  coupling: number;
}

/** Index 0 is the bottom tile, 2 the top tile (the same order as the scene's tiles). */
const SPECS: readonly TileSpec[] = [
  {
    // Bottom: the slowest and heaviest.
    waves: [
      [
        [1.2, 16, 2.1],
        [0.4, 8.3, 0.6],
      ],
      [
        [0.5, 11.6, 4.0],
        [0.2, 7.1, 1.3],
      ],
      [
        [0.6, 17.3, 5.2],
        [0.2, 9.7, 2.4],
      ],
      [
        [0.018, 13.7, 1.1],
        [0.006, 7.9, 3.5],
      ],
      [
        [0.02, 10.1, 3.3],
        [0.007, 6.1, 0.4],
      ],
      [[0.012, 14.3, 2.7]],
    ],
    smoothTime: 1.3,
    coupling: 0.28,
  },
  {
    waves: [
      [
        [1.7, 13.3, 0.9],
        [0.5, 7.1, 4.4],
      ],
      [
        [0.7, 9.4, 2.2],
        [0.25, 6.3, 5.0],
      ],
      [
        [0.9, 14.7, 3.8],
        [0.3, 8.9, 0.2],
      ],
      [
        [0.025, 11.3, 5.6],
        [0.008, 6.7, 1.9],
      ],
      [
        [0.028, 8.6, 1.5],
        [0.01, 5.3, 4.8],
      ],
      [[0.015, 12.7, 0.3]],
    ],
    smoothTime: 0.9,
    coupling: 0.32,
  },
  {
    // Top: the liveliest, and the one that leads.
    waves: [
      [
        [2.2, 10.7, 0],
        [0.7, 6.1, 2.6],
      ],
      [
        [0.9, 8.1, 3.1],
        [0.3, 5.3, 0.8],
      ],
      [
        [1.1, 12.9, 1.7],
        [0.4, 7.7, 4.1],
      ],
      [
        [0.03, 9.7, 4.2],
        [0.01, 5.9, 2.2],
      ],
      [
        [0.035, 7.3, 0.7],
        [0.012, 4.7, 3.9],
      ],
      [[0.02, 11.1, 5.5]],
    ],
    smoothTime: 0.55,
    coupling: 0,
  },
];

const ANGLE_CHANNELS = [CH.yaw, CH.pitch, CH.roll] as const;

/** Critically damped spring step (no overshoot). Returns [value, velocity]. */
function smoothDamp(
  current: number,
  target: number,
  velocity: number,
  smoothTime: number,
  dt: number,
): [number, number] {
  const omega = 2 / Math.max(smoothTime, 1e-4);
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current - target;
  const temp = (velocity + omega * change) * dt;
  return [target + (change + temp) * decay, (velocity - omega * temp) * decay];
}

/** What a tile would do on its own at time `t` (radians for angles, units for offsets), before inertia. */
export function ownMotion(index: number, t: number): number[] {
  const spec = SPECS[index];
  const out = new Array<number>(CHANNELS).fill(0);
  if (!spec) return out;
  spec.waves.forEach((waves, channel) => {
    let sum = 0;
    for (const [amplitude, period, phase] of waves) sum += amplitude * Math.sin((TAU * t) / period + phase);
    out[channel] = ANGLE_CHANNELS.includes(channel as 0 | 1 | 2) ? sum * DEG : sum;
  });
  return out;
}

export interface TileState {
  /** Current pose: [yaw, pitch, roll] in radians, [x, y, z] in scene units. */
  v: number[];
  vel: number[];
}

export class StackMotion {
  readonly tiles: TileState[] = SPECS.map(() => ({
    v: new Array<number>(CHANNELS).fill(0),
    vel: new Array<number>(CHANNELS).fill(0),
  }));

  /** Pointer parallax, smoothed (−1 … 1). */
  readonly pointer = { x: 0, y: 0, vx: 0, vy: 0 };

  private started = false;

  /**
   * Advances everything by `dt` seconds at clock time `t`. Order matters: the top tile first, then down. The first
   * call starts every tile already at its target pose, so mounting the scene never begins with a settling twitch.
   */
  update(dt: number, t: number, pointerX: number, pointerY: number) {
    const step = this.started ? Math.min(dt, 0.1) : 0;
    for (let index = SPECS.length - 1; index >= 0; index -= 1) {
      const spec = SPECS[index];
      const tile = this.tiles[index];
      if (!spec || !tile) continue;
      const own = ownMotion(index, t);
      const above = this.tiles[index + 1];
      for (let c = 0; c < CHANNELS; c += 1) {
        const target = (own[c] ?? 0) + (above ? spec.coupling * (above.v[c] ?? 0) : 0);
        if (!this.started) {
          tile.v[c] = target;
          tile.vel[c] = 0;
          continue;
        }
        const [value, velocity] = smoothDamp(tile.v[c] ?? 0, target, tile.vel[c] ?? 0, spec.smoothTime, step);
        tile.v[c] = value;
        tile.vel[c] = velocity;
      }
    }
    const p = this.pointer;
    [p.x, p.vx] = smoothDamp(p.x, pointerX, p.vx, 0.7, step);
    [p.y, p.vy] = smoothDamp(p.y, pointerY, p.vy, 0.7, step);
    this.started = true;
  }
}
