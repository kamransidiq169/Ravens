"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

import { getQualityTier } from "@/webgl/utils/quality";

import { sequenceAt } from "../lib/journey";
import { journeyStore } from "../lib/journey.store";
import { kineticAt } from "../lib/kinetic";

import { createKineticMaterial } from "./kineticMaterial";
import { FragmentGeometry } from "./OrbScene";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

const BASE_SCALE = 1;
const FIT_WIDTH = 3.4;

/** Small white cubes ("pixels") around the visual: final position, size, where they come from. */
const PIXELS = [
  { shape: "box", at: [-2.6, 1.0, 0.5], size: 0.16, from: [-4.8, 2.6, 1.6], delay: 0.0 },
  { shape: "box", at: [2.4, 1.5, -0.3], size: 0.2, from: [4.6, 3.0, -0.4], delay: 0.08 },
  { shape: "box", at: [2.9, -0.4, 0.8], size: 0.12, from: [5.0, -2.2, 2.2], delay: 0.14 },
  { shape: "box", at: [-2.2, -1.1, 1.0], size: 0.1, from: [-4.0, -3.0, 2.4], delay: 0.05 },
  { shape: "box", at: [-3.1, 0.0, -0.6], size: 0.2, from: [-5.4, 0.4, -1.2], delay: 0.18 },
  { shape: "box", at: [1.15, -1.25, 1.0], size: 0.14, from: [3.2, -3.4, 2.8], delay: 0.1 },
  { shape: "box", at: [0.6, 2.1, 0.2], size: 0.09, from: [1.4, 3.8, 1.2], delay: 0.2 },
] as const;

/**
 * Phase 5 (BESPOKE) scene: the kinetic geometry as one full-view fragment shader (no DOM, no geometry to speak of),
 * plus the chapter's small white cubes. The geometry's state comes from `kineticAt` (lib/kinetic.ts), a 9 s loop that
 * restarts from its rest pose each time the chapter appears; the scroll timeline still decides when it is on stage.
 */
export function Bespoke() {
  const root = useRef<Group>(null);
  const field = useRef<Mesh>(null);
  const pixels = useRef<(Mesh | null)[]>([]);
  const clockStart = useRef<number | null>(null);

  const kinetic = useMemo(() => {
    const tier = getQualityTier();
    // Phones keep the whole sequence but with fewer nested forms.
    return createKineticMaterial(tier === "low" ? -3 : tier === "medium" ? -5 : -7);
  }, []);

  useEffect(() => () => kinetic.dispose(), [kinetic]);

  useFrame((state) => {
    const g = root.current;
    const f = field.current;
    if (!g || !f) return;
    const { bespoke } = sequenceAt(journeyStore.progress);
    const enter = bespoke.scene;
    const visible = enter > 0.001;
    g.visible = visible;
    f.visible = visible;
    if (!visible) {
      clockStart.current = null;
      return;
    }

    const { viewport, pointer, clock, size } = state;
    const t = clock.elapsedTime;
    clockStart.current ??= t;

    // Kinetic geometry: loop time restarts from the rest pose whenever the chapter (re)appears.
    kinetic.set(
      kineticAt(t - clockStart.current),
      size.width,
      size.height,
      smooth(clamp01(enter / 0.7)),
      journeyStore.layout.compact,
    );

    // The cubes (unchanged): they travel in with the chapter and drift.
    const compact = journeyStore.layout.compact;
    const fit = Math.min(1, viewport.width / FIT_WIDTH);
    g.scale.setScalar(BASE_SCALE * fit * (compact ? 0.9 : 1));
    g.position.y = compact ? 0.6 : 0.1;
    g.rotation.y += (pointer.x * 0.2 - g.rotation.y) * 0.05;
    g.rotation.x += (-pointer.y * 0.08 - g.rotation.x) * 0.05;

    PIXELS.forEach((p, i) => {
      const m = pixels.current[i];
      if (!m) return;
      const e = easeOut(clamp01((enter - p.delay) / (1 - p.delay)));
      m.position.set(
        lerp(p.from[0], p.at[0], e),
        lerp(p.from[1], p.at[1], e) + Math.sin(t * 0.7 + i * 1.6) * 0.08,
        lerp(p.from[2], p.at[2], e),
      );
      m.rotation.set(t * (0.2 + i * 0.07) + i, t * (0.17 + i * 0.05), 0);
      m.scale.setScalar(p.size * e);
    });
  });

  return (
    <>
      <mesh ref={field} material={kinetic.material} visible={false} frustumCulled={false} renderOrder={-6}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <group ref={root} visible={false}>
        {PIXELS.map((p, i) => (
          <mesh
            key={i}
            ref={(m) => {
              pixels.current[i] = m;
            }}
          >
            <FragmentGeometry shape={p.shape} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.3}
              roughness={0.35}
              flatShading
            />
          </mesh>
        ))}
      </group>
    </>
  );
}
