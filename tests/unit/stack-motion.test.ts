import { describe, expect, it } from "vitest";

import { CH, StackMotion, ownMotion } from "@/features/hero/scene/stackMotion";

const DEG = Math.PI / 180;

/** Runs the motion model like the render loop does (60 fps) and records each tile's pose. */
function simulate(seconds: number, fps = 60) {
  const motion = new StackMotion();
  const dt = 1 / fps;
  const frames: number[][][] = [];
  for (let i = 0; i <= seconds * fps; i += 1) {
    motion.update(dt, i * dt, 0, 0);
    frames.push(motion.tiles.map((tile) => [...tile.v]));
  }
  return frames;
}

describe("stack motion", () => {
  it("keeps every tile within a few degrees and a few hundredths of a unit (subtle, almost subconscious)", () => {
    for (const frame of simulate(120)) {
      for (const pose of frame) {
        for (const channel of [CH.yaw, CH.pitch, CH.roll]) expect(Math.abs(pose[channel]!)).toBeLessThan(3.5 * DEG);
        for (const channel of [CH.x, CH.y, CH.z]) expect(Math.abs(pose[channel]!)).toBeLessThan(0.06);
      }
    }
  });

  it("moves the three tiles independently: they are never in step", () => {
    const frames = simulate(60);
    let apart = 0;
    for (const frame of frames) {
      const [bottom, middle, top] = frame;
      if (Math.abs(top![CH.yaw]! - middle![CH.yaw]!) > 0.002 && Math.abs(middle![CH.yaw]! - bottom![CH.yaw]!) > 0.001)
        apart += 1;
    }
    expect(apart / frames.length).toBeGreaterThan(0.8);
  });

  it("answers the upper tile late and smaller: lag and damping, not a copy", () => {
    // Correlate the top tile's yaw with the tile below at different delays: the best match is a positive delay.
    const frames = simulate(180);
    const top = frames.map((f) => f[2]![CH.yaw]!);
    const middle = frames.map((f) => f[1]![CH.yaw]!);
    const corr = (lag: number) => {
      let sum = 0;
      for (let i = lag; i < top.length; i += 1) sum += top[i - lag]! * middle[i]!;
      return sum;
    };
    const best = [0, 15, 30, 45, 60, 90].map((lag) => [lag, corr(lag)] as const).sort((a, b) => b[1] - a[1])[0]!;
    expect(best[0]).toBeGreaterThan(0);
  });

  it("never overshoots its target (critically damped: no bounce, no rubber)", () => {
    const motion = new StackMotion();
    // Pointer step input: a damped follower must approach monotonically and never exceed the target.
    let previous = 0;
    for (let i = 0; i < 600; i += 1) {
      motion.update(1 / 60, i / 60, 1, 0);
      expect(motion.pointer.x).toBeGreaterThanOrEqual(previous - 1e-9);
      expect(motion.pointer.x).toBeLessThanOrEqual(1 + 1e-9);
      previous = motion.pointer.x;
    }
  });

  it("is continuous with no reset anywhere: pose steps stay tiny frame to frame, including through minutes of running", () => {
    const frames = simulate(400);
    let worst = 0;
    for (let i = 1; i < frames.length; i += 1) {
      frames[i]!.forEach((pose, tile) =>
        pose.forEach((value, channel) => {
          worst = Math.max(worst, Math.abs(value - frames[i - 1]![tile]![channel]!));
        }),
      );
    }
    // 60 fps: the fastest legitimate channel moves ~0.045 units/s (0.0008 per frame); a reset or snap would be 10-100x that.
    expect(worst).toBeLessThan(0.001);
  });

  it("is identical for the same time regardless of when it is sampled (sine based: a true loop, not a timer)", () => {
    for (const index of [0, 1, 2]) {
      expect(ownMotion(index, 12.34)).toEqual(ownMotion(index, 12.34));
      expect(ownMotion(index, 0).every((v) => Number.isFinite(v))).toBe(true);
    }
  });
});
