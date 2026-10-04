"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";

import { getQualityTier } from "@/webgl/utils/quality";

import { sequenceAt } from "../lib/journey";
import { journeyStore } from "../lib/journey.store";

import { Bespoke } from "./BespokeScene";
import { createJellyfish } from "./jellyfish";
import { Orb, Studio } from "./OrbScene";
import { Stack } from "./StackScene";

const COUNTS = { low: [24, 4], medium: [40, 5], high: [64, 6] } as const;
/** The whole animal is about 4.6 units tall; this keeps it at roughly three quarters of the stage height. */
const BASE_SCALE = 0.82;
const FIT_WIDTH = 3.5;

function Jelly({ onReady }: { onReady: () => void }) {
  const group = useRef<Group>(null);
  const frames = useRef(0);
  const jelly = useMemo(() => {
    const [tentacles, arms] = COUNTS[getQualityTier()];
    return createJellyfish(tentacles, arms);
  }, []);

  useEffect(() => () => jelly.dispose(), [jelly]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const time = jelly.tick(delta);
    if (frames.current < 2) {
      frames.current += 1;
      if (frames.current === 2) onReady();
    } else {
      jelly.fadeIn(delta);
    }

    const { viewport, pointer } = state;
    const s = sequenceAt(journeyStore.progress);
    // One studio environment serves both the gold metal and the glossy tiles; the tiles need it far softer.
    state.scene.environmentIntensity = 1 - 0.72 * s.last.scene - 0.12 * s.bespoke.scene;
    // Fully below the stage: skip the work (the View scissors it out anyway).
    g.visible = s.visual.y < 1.05;
    if (!g.visible) return;

    const fit = Math.min(1, viewport.width / FIT_WIDTH);
    g.scale.setScalar(BASE_SCALE * fit * s.visual.scale);
    g.position.y = -s.visual.y * viewport.height + Math.sin(time * 0.8) * 0.07;
    g.rotation.z += (s.visual.tilt - pointer.x * 0.08 - g.rotation.z) * Math.min(1, delta * 4);
    g.rotation.x += (pointer.y * 0.06 - g.rotation.x) * Math.min(1, delta * 4);
    g.rotation.y = Math.sin(time * 0.3) * 0.45;
    jelly.core.scale.setScalar(1 - 0.05 * Math.sin(time * 1.5));
  });

  return (
    <group ref={group}>
      {/* The geometry's origin is the bell centre; lift it so the whole animal is centred on the group. */}
      <group position={[0, 0.75, 0]}>
        {jelly.meshes.map((mesh) => (
          <primitive key={mesh.uuid} object={mesh} />
        ))}
      </group>
    </group>
  );
}

/** Mounts the jellyfish as a drei <View> over the whole stage; it renders into the site's single shared canvas. */
export default function JellyScene({ onReady }: { onReady: () => void }) {
  return (
    <View className="journey__view">
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
      <Jelly onReady={onReady} />
      <Studio />
      <Orb />
      <Stack />
      <Bespoke />
    </View>
  );
}
