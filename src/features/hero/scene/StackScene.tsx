"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  ExtrudeGeometry,
  Quaternion,
  SRGBColorSpace,
  Shape,
  Vector3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from "three";

import { getQualityTier } from "@/webgl/utils/quality";

import { enterpriseProgress, sequenceAt, type SequenceState } from "../lib/journey";
import { journeyStore } from "../lib/journey.store";

import { createRoughnessTexture, createSoftShadowTexture } from "./orbGeometry";
import { FragmentGeometry } from "./OrbScene";
import { CH, StackMotion } from "./stackMotion";
import { TitlePlane } from "./TitlePlane";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CAMERA_Z = 8;
const TAU = Math.PI * 2;
/** The pedestal sits a little lower than before, to give the staged tiles room to float clear of it. */
const PEDESTAL_DROP = -0.45;
/** The single-line title is centred in the stage, so it is drawn in front of the tiles to stay fully legible. */
const TITLE_DEPTH = 3.2;
const pickLast = (s: SequenceState) => s.last.title;

// Scratch objects for the per-frame shadow maths (nothing is allocated in the render loop).
const offset = new Vector3();
const inverse = new Quaternion();
const BASE_SCALE = 0.85;
const FIT_WIDTH = 3.7;
/**
 * A rounded square in plan with a restrained, manufactured corner radius and a real physical body: a thicker slab with
 * a soft bevel all round, so it reads as a made object with visible side faces and edge highlights, not a card.
 */
const TILE = { size: 2.0, thickness: 0.3, corner: 0.36, bevel: 0.075 };

type Vec3 = readonly [number, number, number];

interface TileSpec {
  label: string;
  color: string;
  roughness: number;
  shade: string;
  /** Size relative to the shared tile (the hero is larger, the anchor wider than the one above it). */
  scale: number;
  /** Resting pose: position in the stack's space and Euler rotation [pitch, turn, roll]. Every tile differs. */
  base: { pos: Vec3; rot: Vec3 };
  /** Where it enters from (a different direction and depth for each tile) and when (share of the entrance). */
  from: { pos: Vec3; rot: Vec3 };
  delay: number;
  /** How near the viewer it feels (0 → 1): scales how much it responds to scrolling and the pointer. */
  depth: number;
  /** Per-tile scroll response: lateral drift, turn and vertical separation across the chapter. */
  scroll: { x: number; turn: number; y: number };
}

/**
 * A staged composition rather than a stack: Ecosystem nearest, higher and offset to the left; Integration &
 * Automation behind it and to the right; Applications lowest and deepest. Each has its own turn, so no two faces are
 * parallel, and the gaps between them are real negative space. Bottom to top.
 */
const TILES: readonly TileSpec[] = [
  {
    // The anchor: deepest, a little wider, flatter and calmer; partly covered by the orange tile.
    label: "Applications",
    color: "#12c2d3",
    roughness: 0.34,
    shade: "#05707d",
    scale: 1.1,
    base: { pos: [-0.14, -0.78, -1.15], rot: [0.58, -0.62, 0.03] },
    from: { pos: [-0.8, -2.9, -1.9], rot: [0.46, -0.4, -0.2] },
    delay: 0,
    depth: 0.4,
    scroll: { x: -0.05, turn: 0.03, y: -0.1 },
  },
  {
    // Smaller, deeper than the hero, turned differently, and partly tucked under the blue tile.
    label: "Integration & Automation",
    color: "#ff5a2c",
    roughness: 0.4,
    shade: "#b03410",
    scale: 0.92,
    base: { pos: [0.46, -0.16, -0.12], rot: [0.54, -0.36, -0.07] },
    from: { pos: [1.3, -2.3, -1.8], rot: [0.4, 0.55, 0.2] },
    delay: 0.12,
    depth: 0.7,
    scroll: { x: 0.09, turn: -0.05, y: 0 },
  },
  {
    // The hero: largest, nearest the viewer, slightly offset and tilted, floating clear above the orange tile.
    label: "Ecosystem",
    color: "#1f46f0",
    roughness: 0.36,
    shade: "#0a1450",
    scale: 1.08,
    base: { pos: [-0.3, 0.36, 0.95], rot: [0.47, -0.8, 0.11] },
    from: { pos: [-0.6, 2.0, -2.2], rot: [0.28, 0.85, -0.16] },
    delay: 0.26,
    depth: 1,
    scroll: { x: -0.2, turn: 0.07, y: 0.1 },
  },
];

const FRAGMENTS = [
  { shape: "octahedron", at: [-2.7, 1.1, 0.4], size: 0.2, from: [-4.6, 2.8, 1.8], delay: 0.0 },
  { shape: "tetrahedron", at: [2.8, 0.9, -0.3], size: 0.24, from: [4.8, 2.2, -0.4], delay: 0.07 },
  { shape: "box", at: [2.3, -0.7, 1.0], size: 0.15, from: [3.8, -2.8, 2.6], delay: 0.14 },
  { shape: "icosahedron", at: [-2.2, -0.6, 0.9], size: 0.16, from: [-3.8, -2.4, 2.4], delay: 0.05 },
  { shape: "tetrahedron", at: [-3.1, 0.1, -0.8], size: 0.17, from: [-5.4, 0.2, -1.4], delay: 0.18 },
  { shape: "octahedron", at: [1.7, 1.9, 0.6], size: 0.13, from: [3.2, 3.6, 2.4], delay: 0.1 },
] as const;

function tileGeometry(
  detail: { bevelSegments: number; curveSegments: number } = { bevelSegments: 7, curveSegments: 28 },
) {
  const half = TILE.size / 2 - TILE.bevel;
  const r = TILE.corner;
  const shape = new Shape();
  shape.moveTo(-half + r, -half);
  shape.lineTo(half - r, -half);
  shape.absarc(half - r, -half + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(half, half - r);
  shape.absarc(half - r, half - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-half + r, half);
  shape.absarc(-half + r, half - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-half, -half + r);
  shape.absarc(-half + r, -half + r, r, Math.PI, Math.PI * 1.5, false);
  const depth = TILE.thickness - 2 * TILE.bevel;
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: TILE.bevel,
    bevelSize: TILE.bevel,
    bevelSegments: detail.bevelSegments,
    curveSegments: detail.curveSegments,
  });
  // Extruded along z; stand it flat (extrusion becomes thickness along y) and centre it.
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -depth / 2, 0);
  return geometry;
}

/** A label drawn into a texture (no font files or text workers, so nothing for the CSP to block). */
function labelTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Fit the label to the tile: start large and shrink until it spans at most ~70% of the face.
    let size = 96;
    ctx.font = `700 ${size}px Montserrat, Inter, system-ui, sans-serif`;
    while (ctx.measureText(text).width > 720 && size > 32) {
      size -= 4;
      ctx.font = `700 ${size}px Montserrat, Inter, system-ui, sans-serif`;
    }
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 14;
    ctx.fillRect(150, 640, 90, 8);
    ctx.fillText(text, 150, 640 + 24 + size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Depth separation that leaves the picture untouched: scaling a layer about the camera moves it nearer or farther along
 * each line of sight, so every object lands on exactly the same screen position and size, but at a truer depth. */
const NEAR = 0.94;
const FAR = 1.24;

/**
 * ENTERPRISE: three glossy rounded tiles over a white pedestal, with white fragments in the upper and lower corners.
 *
 * Entrance (scroll) values are unchanged. On top of that every tile floats as its own object (see stackMotion.ts), the
 * pedestal barely moves, and the fragments drift in two independent groups, one per side. The camera never moves; depth
 * comes from three layers (stack nearest, pedestal, fragments farthest) that shift very slightly against each other.
 */
export function Stack() {
  const root = useRef<Group>(null);
  const near = useRef<Group>(null);
  const far = useRef<Group>(null);
  const platform = useRef<Group>(null);
  const groundShadow = useRef<Mesh>(null);
  const contact = useRef<Mesh>(null);
  const tiles = useRef<(Group | null)[]>([]);
  const tileShadows = useRef<(Mesh | null)[]>([]);
  const sides = useRef<(Group | null)[]>([]);
  const fragments = useRef<(Mesh | null)[]>([]);
  const [motion] = useState(() => new StackMotion());

  const assets = useMemo(() => {
    const tier = getQualityTier();
    return {
      labels: TILES.map((tile) => labelTexture(tile.label)),
      geometry: tileGeometry(tier === "low" ? { bevelSegments: 4, curveSegments: 16 } : undefined),
      shadow: createSoftShadowTexture(),
      grain: createRoughnessTexture(),
    };
  }, []);

  useEffect(
    () => () => {
      assets.labels.forEach((texture) => texture.dispose());
      assets.geometry.dispose();
      assets.shadow.dispose();
      assets.grain.dispose();
    },
    [assets],
  );

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;
    const enter = sequenceAt(journeyStore.progress).last.scene;
    g.visible = enter > 0.001;
    if (!g.visible) return;

    const { viewport, pointer, clock } = state;
    const t = clock.elapsedTime;
    const compact = journeyStore.layout.compact;
    const fit = Math.min(1, viewport.width / FIT_WIDTH);
    const scale = BASE_SCALE * fit * (compact ? 0.92 : 1);
    g.scale.setScalar(scale);
    g.position.y = compact ? 0.75 : 0.35;
    motion.update(delta, t, pointer.x, pointer.y);
    const px = motion.pointer.x;

    // Depth layers: scale about the camera (in this group's own units) so the picture is identical, the depth is not.
    const camY = -g.position.y / scale;
    const camZ = CAMERA_Z / scale;
    if (near.current) {
      near.current.scale.setScalar(NEAR);
      near.current.position.set(px * 0.05, camY * (1 - NEAR), camZ * (1 - NEAR));
    }
    if (far.current) {
      far.current.scale.setScalar(FAR);
      far.current.position.set(px * -0.035, camY * (1 - FAR), camZ * (1 - FAR));
    }

    // Pedestal: the stable anchor. A breath of float, a sliver of yaw, almost no parallax.
    // The base establishes the scene first: it rises ahead of the tiles.
    const rise = easeOut(clamp01(enter / 0.45));
    if (platform.current) {
      platform.current.position.set(px * 0.012, lerp(-4.2, PEDESTAL_DROP, rise) + Math.sin(t * 0.19) * 0.008 * rise, 0);
      platform.current.rotation.y = Math.sin(t * 0.045) * 0.006;
    }
    if (groundShadow.current) groundShadow.current.scale.setScalar(Math.max(0.0001, rise * 1.5));

    // Scroll-linked evolution while the chapter is on stage: slow parallax, a little turn and a little separation.
    const span = enterpriseProgress(journeyStore.progress) - 0.5;
    // Tablet and phone: the same arrangement, calmer (less depth and lateral offset, smaller turns).
    const spread = compact ? 0.55 : fit < 0.95 ? 0.82 : 1;
    const calm = compact ? 0.7 : fit < 0.95 ? 0.85 : 1;
    // Smaller tiles on small screens, so all three stay inside the viewport.
    const size = compact ? 0.74 : fit < 0.95 ? 0.9 : 1;

    TILES.forEach((tile, i) => {
      const m = tiles.current[i];
      const s = motion.tiles[i];
      if (!m || !s) return;
      // The tiles arrive one after another (Applications, then Integration & Automation, then Ecosystem), each from
      // its own direction and depth, and settle into the staged composition.
      const k = easeOut(clamp01((enter - tile.delay) / (1 - tile.delay)));
      const rest = tile.base;
      const start = tile.from;
      m.position.set(
        lerp(start.pos[0], rest.pos[0] * spread, k) + (s.v[CH.x]! + span * tile.scroll.x) * k,
        lerp(start.pos[1], rest.pos[1], k) + (s.v[CH.y]! + span * tile.scroll.y) * k,
        lerp(start.pos[2], rest.pos[2] * spread, k) + s.v[CH.z]! * k,
      );
      m.rotation.set(
        lerp(start.rot[0], rest.rot[0], k) + (s.v[CH.pitch]! + span * 0.05 * tile.depth) * k,
        lerp(start.rot[1], rest.rot[1] * calm, k) + (s.v[CH.yaw]! + span * tile.scroll.turn) * k,
        lerp(start.rot[2], rest.rot[2] * calm, k) + s.v[CH.roll]! * k,
      );
      m.scale.setScalar(lerp(0.82, 1, k) * tile.scale * size);

      // Soft contact shadow of the tile above, cast onto this one from the real 3D offset between them (in this
      // tile's own frame), fading as they separate.
      const upperGroup = tiles.current[i + 1];
      const shadow = tileShadows.current[i];
      if (shadow && upperGroup) {
        offset.copy(upperGroup.position).sub(m.position).applyQuaternion(inverse.copy(m.quaternion).invert());
        shadow.position.set(offset.x * 0.5 + 0.16, TILE.thickness / 2 + 0.006, offset.z * 0.5 + 0.12);
        shadow.scale.setScalar(Math.max(0.0001, k));
        (shadow.material as MeshBasicMaterial).opacity = 0.2 * clamp01(1.25 - Math.abs(offset.y) * 0.45);
      }
    });

    // Contact shadow on the pedestal follows the lowest tile (a long way down, so softer).
    const lowest = tiles.current[0];
    if (contact.current && lowest) {
      contact.current.position.set(
        lowest.position.x * 0.7 + 0.1,
        -1.095 + PEDESTAL_DROP,
        lowest.position.z * 0.5 + 0.05,
      );
      contact.current.scale.setScalar(Math.max(0.0001, rise));
    }

    // Fragments: slow, individual turning, in two groups that drift on different clocks.
    sides.current.forEach((group, side) => {
      if (!group) return;
      const dir = side === 0 ? 1 : -1;
      const clock = side === 0 ? [0.027, 0.019, 0.8] : [0.021, 0.031, 2.3];
      group.position.set(Math.sin(t * clock[0]! * TAU + clock[2]!) * 0.05, Math.sin(t * clock[1]! * TAU) * 0.04, 0);
      group.rotation.z = Math.sin(t * 0.017 * TAU + clock[2]!) * 0.01 * dir;
    });
    FRAGMENTS.forEach((f, i) => {
      const m = fragments.current[i];
      if (!m) return;
      const k = easeOut(clamp01((enter - f.delay) / (1 - f.delay)));
      m.position.set(
        lerp(f.from[0], f.at[0], k),
        lerp(f.from[1], f.at[1], k) + Math.sin(t * (0.37 + i * 0.043) + i * 1.9) * 0.06,
        lerp(f.from[2], f.at[2], k),
      );
      m.rotation.set(t * (0.034 + i * 0.011) + i, t * (0.027 + i * 0.008), Math.sin(t * 0.05 + i) * 0.2);
      m.scale.setScalar(f.size * k);
    });
  });

  return (
    <>
      <group ref={root} visible={false}>
        {/* Faint ground shadow beneath the pedestal. */}
        <mesh
          ref={groundShadow}
          position={[0, -1.78 + PEDESTAL_DROP, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={-1}
        >
          <planeGeometry args={[4.6, 3]} />
          <meshBasicMaterial map={assets.shadow} color="#3a4474" transparent opacity={0.12} depthWrite={false} />
        </mesh>

        <group ref={platform}>
          <mesh position={[0, -1.45, 0]} rotation={[0, Math.PI / 8, 0]}>
            <cylinderGeometry args={[1.9, 2.1, 0.34, 8]} />
            <meshStandardMaterial
              color="#f3f0ea"
              emissive="#ffffff"
              emissiveIntensity={0.3}
              roughness={0.55}
              metalness={0.02}
              flatShading
            />
          </mesh>
          <mesh position={[0, -1.19, 0]} rotation={[0, Math.PI / 8, 0]}>
            <cylinderGeometry args={[1.3, 1.44, 0.18, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.3}
              roughness={0.4}
              metalness={0.02}
              flatShading
            />
          </mesh>
        </group>

        <mesh ref={contact} position={[0, -1.095 + PEDESTAL_DROP, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
          <planeGeometry args={[3.1, 3.1]} />
          <meshBasicMaterial map={assets.shadow} color="#1d2a6b" transparent opacity={0.1} depthWrite={false} />
        </mesh>

        {/* One coherent studio on top of the environment: a large soft key from upper left, a cool fill from the right and a
          warm rim from behind that separates the edges. */}
        <ambientLight intensity={0.16} />
        <directionalLight position={[-3, 4.5, 3]} intensity={0.75} />
        <directionalLight position={[4, 1.5, 3]} intensity={0.22} color="#dfe6ff" />
        <directionalLight position={[0.5, 3, -5]} intensity={0.55} color="#fff4e6" />

        {/* Nearest layer: the staged tiles, each with its own pose, floating on its own (see stackMotion.ts). */}
        <group ref={near}>
          <group>
            {TILES.map((tile, i) => (
              <group
                key={tile.label}
                ref={(m) => {
                  tiles.current[i] = m;
                }}
              >
                <mesh geometry={assets.geometry}>
                  <meshPhysicalMaterial
                    color={tile.color}
                    emissive={tile.color}
                    emissiveIntensity={0.12}
                    roughness={tile.roughness}
                    roughnessMap={assets.grain}
                    metalness={0}
                    clearcoat={0.55}
                    clearcoatRoughness={0.14}
                  />
                </mesh>
                <mesh position={[0, TILE.thickness / 2 + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[TILE.size * 0.96, TILE.size * 0.96]} />
                  <meshBasicMaterial map={assets.labels[i]} transparent depthWrite={false} toneMapped={false} />
                </mesh>
                {i < TILES.length - 1 ? (
                  <mesh
                    ref={(m) => {
                      tileShadows.current[i] = m;
                    }}
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0.16, TILE.thickness / 2 + 0.006, 0.12]}
                    renderOrder={3}
                  >
                    <planeGeometry args={[TILE.size * 0.95, TILE.size * 0.95]} />
                    <meshBasicMaterial
                      map={assets.shadow}
                      color={tile.shade}
                      transparent
                      opacity={0.24}
                      depthWrite={false}
                    />
                  </mesh>
                ) : null}
              </group>
            ))}
          </group>
        </group>

        {/* Farthest layer: the fragments, in a left group and a right group that never move together. */}
        <group ref={far}>
          {[0, 1].map((side) => (
            <group
              key={side}
              ref={(group) => {
                sides.current[side] = group;
              }}
            >
              {FRAGMENTS.map((f, i) =>
                (side === 0) === f.at[0] < 0 ? (
                  <mesh
                    key={i}
                    ref={(m) => {
                      fragments.current[i] = m;
                    }}
                  >
                    <FragmentGeometry shape={f.shape} />
                    <meshStandardMaterial
                      color="#ffffff"
                      emissive="#ffffff"
                      emissiveIntensity={0.3}
                      roughness={0.35}
                      metalness={0.05}
                      flatShading
                    />
                  </mesh>
                ) : null,
              )}
            </group>
          ))}
        </group>
      </group>
      <TitlePlane selector="[data-j='title-last']" z={TITLE_DEPTH} pick={pickLast} />
    </>
  );
}
