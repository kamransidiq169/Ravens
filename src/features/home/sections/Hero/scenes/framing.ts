import type { RootState } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

import { journeyStore } from "../animation/journey.store";

/**
 * Portrait-phone composition for the stage's 3D scenes. On a phone the copy owns the lower part of the stage
 * (hero.css `--j-shift`) and the scene the upper part, so every scene is lifted by a fraction of the stage height. Fractions, not
 * world units or device sizes: the same numbers hold at 320 or 430 px wide and at any phone height. Desktop (and phones
 * held in landscape, where the copy stays centred) get `null` and keep their original framing untouched.
 */
const LIFT = { jelly: 0.17, orb: 0.1, stack: 0.06 } as const;
/** The fraction of the stage height the scene may fill, and the jellyfish's own proportions at its base scale. */
const SCENE_HEIGHT = 0.46;
const JELLY_HEIGHT = 0.75;
const JELLY_WIDTH_PER_HEIGHT = 0.59;
const MAX_WIDTH = 0.82;
/** The phone proportion (390 x 844) the orb and tile compositions were tuned on. */
const REFERENCE_ASPECT = 0.44;

export interface PhoneFrame {
  /** World units to raise each scene by. */
  lift: { [K in keyof typeof LIFT]: number };
  /** Multiplier for the orb and tile scenes' scale: they were composed against a tall phone, so a squarer one shrinks them. */
  sceneFit: number;
  /** Multiplier for the jellyfish's scale: as large as the upper region and the width allow. */
  jellyFit: number;
}

export function phoneFrame(state: Pick<RootState, "camera" | "size">): PhoneFrame | null {
  const aspect = state.size.width / state.size.height;
  if (!journeyStore.layout.compact || aspect >= 1) return null;
  const camera = state.camera as PerspectiveCamera;
  const stageHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
  return {
    lift: { jelly: LIFT.jelly * stageHeight, orb: LIFT.orb * stageHeight, stack: LIFT.stack * stageHeight },
    sceneFit: Math.min(1, REFERENCE_ASPECT / aspect),
    jellyFit: Math.min(SCENE_HEIGHT / JELLY_HEIGHT, (MAX_WIDTH * aspect) / (JELLY_HEIGHT * JELLY_WIDTH_PER_HEIGHT)),
  };
}
