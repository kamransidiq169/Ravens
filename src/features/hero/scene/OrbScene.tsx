"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

import { getQualityTier } from "@/webgl/utils/quality";

import { sequenceAt, type SequenceState } from "../lib/journey";
import { journeyStore } from "../lib/journey.store";

import { createBasketball, createSlabGeometry, createSoftShadowTexture } from "./orbGeometry";
import { TitlePlane } from "./TitlePlane";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Whole composition scale, the width (scene units) below which it shrinks to fit, and the camera distance. */
const BASE_SCALE = 0.86;
const FIT_WIDTH = 3.7;
/** The typography plane sits well behind everything else. */
/** In front of the ball: the single-line title is centred in the stage, so it must stay fully legible over the object. */
const TITLE_Z = 3.2;
const pickNext = (s: SequenceState) => s.next.title;

/**
 * Procedural studio for the metal to reflect: a few soft-boxes on a mid-tone backdrop, rendered once into the scene's
 * environment. No HDR download, so nothing for the CSP to block and nothing to dispose by hand.
 */
export function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#8c93b4"]} />
      <Lightformer form="rect" intensity={9} position={[0, 5, -3]} scale={[12, 4, 1]} />
      <Lightformer form="rect" intensity={6} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[7, 3, 1]} />
      <Lightformer form="rect" intensity={6} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[7, 3, 1]} />
      <Lightformer form="ring" color="#fff1d6" intensity={7} position={[0, 2, 6]} scale={3} />
      <Lightformer
        form="rect"
        color="#ffe3a6"
        intensity={4}
        position={[0, -4, 1]}
        rotation-x={Math.PI / 2}
        scale={[12, 8, 1]}
      />
    </Environment>
  );
}

export type FragmentShape = "octahedron" | "tetrahedron" | "icosahedron" | "box";

export function FragmentGeometry({ shape }: { shape: FragmentShape }) {
  switch (shape) {
    case "octahedron":
      return <octahedronGeometry args={[1, 0]} />;
    case "tetrahedron":
      return <tetrahedronGeometry args={[1, 0]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[1, 0]} />;
    case "box":
      return <boxGeometry args={[1.3, 1.3, 1.3]} />;
  }
}

// ---- Platform: three offset slabs, stepping up -----------------------------------------------------------------

/** [width, depth, thickness, x offset, z offset], bottom to top. They tile into a shallow stepped structure. */
const STEPS = [
  [3.6, 2.15, 0.24, 0, 0],
  [2.85, 1.7, 0.22, 0.17, -0.09],
  [2.2, 1.35, 0.2, -0.12, 0.06],
] as const;

/** y of the centre of each slab, and the y of the top of the highest one (where the sphere rests). */
const STEP_Y = (() => {
  const centres: number[] = [];
  let top = -1.5;
  for (const [, , thickness] of STEPS) {
    centres.push(top + thickness / 2);
    top += thickness;
  }
  return { centres, top };
})();
const SPHERE_RADIUS = 0.9;

/**
 * Phase 3 (INTERACTIVE) scene: a gold basketball turning slowly on a stepped white platform, and the chapter's title drawn behind it. The camera is locked: all life
 * comes from the objects. Every pose is a function of the scroll progress (entrance) plus slow, incommensurate loops
 * (so nothing visibly repeats and nothing ever resets).
 */
export function Orb() {
  const root = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const platform = useRef<Group>(null);
  const sphereBody = useRef<Group>(null);
  const sphereSpin = useRef<Mesh>(null);
  const shadow = useRef<Mesh>(null);
  const ground = useRef<Mesh>(null);

  const assets = useMemo(() => {
    const tier = getQualityTier();
    // The basketball's channels need a few segments across each, so the tessellation is higher than a plain sphere's.
    const detail =
      tier === "high" ? ([256, 176] as const) : tier === "medium" ? ([160, 112] as const) : ([128, 88] as const);
    return {
      sphere: createBasketball(detail[0], detail[1]),
      slabs: STEPS.map(([w, d, t]) => createSlabGeometry(w, d, t)),
      shadow: createSoftShadowTexture(),
    };
  }, []);

  useEffect(
    () => () => {
      assets.sphere.dispose();
      assets.slabs.forEach((g) => g.dispose());
      assets.shadow.dispose();
    },
    [assets],
  );

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const { next } = sequenceAt(journeyStore.progress);
    const enter = next.scene;
    g.visible = enter > 0.001;
    if (!g.visible) return;

    const { viewport, clock } = state;
    const t = clock.elapsedTime;
    const compact = journeyStore.layout.compact;
    const fit = Math.min(1, viewport.width / FIT_WIDTH);
    g.scale.setScalar(BASE_SCALE * fit * (compact ? 0.92 : 1));
    g.position.y = compact ? 0.7 : 0.5;

    // Entrance (unchanged in spirit): the platform rises, then the sphere settles onto it.
    const rise = easeOut(clamp01(enter / 0.8));
    const drop = easeOut(clamp01((enter - 0.15) / 0.85));

    // The platform: almost subconscious. A slow yaw, a hair of drift and a breath of vertical float.
    const bob = Math.sin(t * 0.21) * 0.035;
    if (platform.current) {
      platform.current.position.set(
        Math.sin(t * 0.031 + 1) * 0.05,
        lerp(-4.2, 0, rise) + bob * rise,
        Math.sin(t * 0.023) * 0.06,
      );
      platform.current.rotation.y = Math.sin(t * 0.047) * 0.09;
    }
    // The tilt is the fixed three-quarter view of the whole assembly (the camera never moves).
    if (tilt.current) tilt.current.rotation.set(0.36, -0.5, 0);

    // The sphere: one slow, continuous turn about a tilted axis (about 55 s a revolution): seams and highlights travel.
    if (sphereBody.current) {
      sphereBody.current.position.y = lerp(3.6, STEP_Y.top + SPHERE_RADIUS, drop) + bob * drop;
      sphereBody.current.rotation.z = 0.38;
    }
    if (sphereSpin.current) sphereSpin.current.rotation.y = t * 0.115;

    // Soft contact shadow under the sphere (it appears as the sphere lands) and a faint ground shadow below it all.
    if (shadow.current) shadow.current.scale.setScalar(Math.max(0.0001, drop * 1.35));
    if (ground.current) ground.current.scale.setScalar(Math.max(0.0001, rise * 1.9));
  });

  return (
    <>
      <group ref={root} visible={false}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />

        <group ref={tilt}>
          {/* Faint ground shadow, so the assembly floats in the pale space rather than hanging in it. */}
          <mesh ref={ground} position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
            <planeGeometry args={[4, 2.6]} />
            <meshBasicMaterial map={assets.shadow} color="#3a4474" transparent opacity={0.16} depthWrite={false} />
          </mesh>

          <group ref={platform}>
            {STEPS.map(([, , , x, z], i) => (
              <mesh key={i} geometry={assets.slabs[i]} position={[x, STEP_Y.centres[i] ?? 0, z]}>
                {/* Group 0: top and bottom faces (soft white). Group 1: sides and bevels (a faint golden metal). */}
                <meshStandardMaterial
                  attach="material-0"
                  color="#f5f3ef"
                  emissive="#ffffff"
                  emissiveIntensity={0.2}
                  roughness={0.5}
                  metalness={0.02}
                />
                <meshStandardMaterial
                  attach="material-1"
                  color="#e2bd6a"
                  emissive="#f6dca0"
                  emissiveIntensity={0.06}
                  roughness={0.28}
                  metalness={0.75}
                />
              </mesh>
            ))}

            <mesh
              ref={shadow}
              position={[STEPS[2][3], STEP_Y.top + 0.006, STEPS[2][4]]}
              rotation={[-Math.PI / 2, 0, 0]}
              renderOrder={2}
            >
              <planeGeometry args={[1.8, 1.8]} />
              <meshBasicMaterial map={assets.shadow} color="#4a3412" transparent opacity={0.34} depthWrite={false} />
            </mesh>

            <group ref={sphereBody} position={[STEPS[2][3], 0, STEPS[2][4]]}>
              <mesh ref={sphereSpin} geometry={assets.sphere} scale={SPHERE_RADIUS}>
                <meshPhysicalMaterial
                  vertexColors
                  color="#ffd166"
                  metalness={1}
                  roughness={0.17}
                  clearcoat={0.55}
                  clearcoatRoughness={0.14}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      <TitlePlane selector="[data-j='title-next']" z={TITLE_Z} pick={pickNext} />
    </>
  );
}
