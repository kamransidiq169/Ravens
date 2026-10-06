"use client";

import { useFrame, useThree } from "@react-three/fiber";
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
  type Texture,
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
/** The plinth sits a little lower than before, to give the staged tiles room to float clear of it. */
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
const TILE = { size: 2.0, thickness: 0.34, corner: 0.27, bevel: 0.05 };

type Vec3 = readonly [number, number, number];

interface TileSpec {
  label: string;
  /** Face colour (lit by the shared studio, so it is kept deeper than the colour it should read as). */
  color: string;
  /** Side wall and bevel: a darker tone of the same material, so the edge reads without any outline. */
  side: string;
  /** Printed label colour, chosen per material for contrast. */
  ink: string;
  /** Where the label starts on the face (texture pixels from the left): clear of whatever covers that tile. */
  labelX: number;
  /** Baseline of the label's last line (texture pixels from the top). */
  labelY: number;
  /** Phones draw the headline across the stack: this label moves this far toward the back of its face (scene units). */
  labelBack?: number;
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
    color: "#13aabc",
    side: "#0a6f7e",
    ink: "#0d1238",
    labelX: 150,
    labelY: 850,
    labelBack: 0.3,
    roughness: 0.58,
    shade: "#05505c",
    scale: 1.1,
    base: { pos: [-0.14, -0.84, -1.15], rot: [0.58, -0.62, 0.03] },
    from: { pos: [-0.8, -2.9, -1.9], rot: [0.46, -0.4, -0.2] },
    delay: 0,
    depth: 0.4,
    scroll: { x: -0.05, turn: 0.03, y: -0.1 },
  },
  {
    // Smaller, deeper than the hero, turned differently, and partly tucked under the blue tile.
    label: "Integration & Automation",
    color: "#e85d3e",
    side: "#a23a24",
    ink: "#1a0f2e",
    labelX: 265,
    labelY: 540,
    roughness: 0.6,
    shade: "#7a2410",
    scale: 0.92,
    base: { pos: [0.5, -0.22, -0.12], rot: [0.54, -0.36, -0.07] },
    from: { pos: [1.3, -2.3, -1.8], rot: [0.4, 0.55, 0.2] },
    delay: 0.12,
    depth: 0.7,
    scroll: { x: 0.09, turn: -0.05, y: 0 },
  },
  {
    // The hero: largest, nearest the viewer, slightly offset and tilted, floating clear above the orange tile.
    label: "Ecosystem",
    color: "#2441d8",
    side: "#0f1f8c",
    ink: "#f3f5ff",
    labelX: 150,
    labelY: 850,
    roughness: 0.56,
    shade: "#070e45",
    scale: 1.08,
    base: { pos: [-0.3, 0.55, 0.95], rot: [0.47, -0.8, 0.11] },
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

/** The label is set in two lines where it has an ampersand (INTEGRATION / & AUTOMATION), otherwise on one. */
const labelLines = (text: string) => {
  const upper = text.toUpperCase();
  const at = upper.indexOf(" & ");
  return at < 0 ? [upper] : [upper.slice(0, at), `& ${upper.slice(at + 3)}`];
};

/**
 * A label printed into a texture (no font files or text workers, so nothing for the CSP to block): small tracked
 * capitals in a solid ink chosen for each material, with a hairline of the opposite tone just below it so it reads as
 * pressed into the surface rather than floating on it.
 */
function labelTexture(text: string, ink: string, left: number, last: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const lines = labelLines(text);
    const font = (px: number) => `600 ${px}px Montserrat, Inter, system-ui, sans-serif`;
    // One size for every tile: the widest line spans at most ~53% of the face.
    let size = 64;
    ctx.font = font(size);
    ctx.letterSpacing = `${Math.round(size * 0.09)}px`;
    while (Math.max(...lines.map((line) => ctx.measureText(line).width)) > 580 && size > 32) {
      size -= 2;
      ctx.font = font(size);
      ctx.letterSpacing = `${Math.round(size * 0.09)}px`;
    }
    const light = ink.startsWith("#f");
    const leading = size * 1.28;
    const first = last - (lines.length - 1) * leading;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(left, first - size - 34, 72, 6);
    ctx.globalAlpha = 1;
    lines.forEach((line, i) => {
      const y = first + i * leading;
      ctx.fillStyle = light ? "rgba(0,0,20,0.28)" : "rgba(255,255,255,0.32)";
      ctx.fillText(line, left, y + 2.5);
      ctx.fillStyle = ink;
      ctx.fillText(line, left, y);
    });
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * A rounded polygon in plan: each corner is softened with a quadratic curve that starts `soft` of the way along its
 * two edges, so the plinth reads as a faceted architectural form with no hard, cheap vertices.
 */
function roundedPolygon(points: readonly (readonly [number, number])[], soft: number) {
  const shape = new Shape();
  const n = points.length;
  points.forEach((point, i) => {
    const prev = points[(i + n - 1) % n]!;
    const next = points[(i + 1) % n]!;
    const a = [point[0] + (prev[0] - point[0]) * soft, point[1] + (prev[1] - point[1]) * soft] as const;
    const b = [point[0] + (next[0] - point[0]) * soft, point[1] + (next[1] - point[1]) * soft] as const;
    if (i === 0) shape.moveTo(a[0], a[1]);
    else shape.lineTo(a[0], a[1]);
    shape.quadraticCurveTo(point[0], point[1], b[0], b[1]);
  });
  shape.closePath();
  return shape;
}

/**
 * One tier of the plinth: a broad, slightly irregular octagon (wider than deep, a touch heavier at the front-left so
 * it is not mechanically symmetric), extruded flat with a soft bevel. `rx` / `rz` are the half extents.
 */
function plinthTier(rx: number, rz: number, height: number, bevel: number, detail: number) {
  // Angle, radius factor: eight facets, with two of the corners pulled in a little for a controlled asymmetry.
  const corners = [
    [0, 1],
    [45, 0.9],
    [90, 0.96],
    [135, 0.93],
    [180, 1],
    [225, 0.9],
    [270, 0.97],
    [315, 0.92],
  ] as const;
  const points = corners.map(([deg, k]) => {
    const a = (deg * Math.PI) / 180;
    // Push the diagonals out so the octagon is broad and squarish, not a circle.
    const bulge = 1 + 0.12 * Math.abs(Math.sin(2 * a));
    return [Math.cos(a) * (rx - bevel) * k * bulge, Math.sin(a) * (rz - bevel) * k * bulge] as const;
  });
  const geometry = new ExtrudeGeometry(roundedPolygon(points, 0.22), {
    depth: height - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: detail,
    curveSegments: detail * 2,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -(height - 2 * bevel) / 2, 0);
  return geometry;
}

/** Three stacked tiers, bottom to top: a wide foundation, a stepped shoulder, a narrower top plate. */
const PLINTH = [
  { rx: 2.18, rz: 1.62, height: 0.3, y: -1.49, color: "#cfcad1", rough: 0.7 },
  { rx: 1.8, rz: 1.34, height: 0.12, y: -1.28, color: "#e6e1db", rough: 0.62 },
  { rx: 1.42, rz: 1.04, height: 0.12, y: -1.16, color: "#f1ede6", rough: 0.55 },
] as const;

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
  const labelPlanes = useRef<(Mesh | null)[]>([]);
  const sides = useRef<(Group | null)[]>([]);
  const fragments = useRef<(Mesh | null)[]>([]);
  const [motion] = useState(() => new StackMotion());

  // `material.envMapIntensity` only applies to a material's own envMap, not to `scene.environment`: hand the studio
  // reflection to the materials explicitly (once it exists) so each can be given its own, gentler share of it.
  const scene = useThree((state) => state.scene);
  const [env, setEnv] = useState<Texture | null>(null);

  const assets = useMemo(() => {
    const tier = getQualityTier();
    return {
      labels: TILES.map((tile) => labelTexture(tile.label, tile.ink, tile.labelX, tile.labelY)),
      plinth: PLINTH.map((tier) => plinthTier(tier.rx, tier.rz, tier.height, 0.035, tier === PLINTH[0] ? 4 : 3)),
      geometry: tileGeometry(tier === "low" ? { bevelSegments: 4, curveSegments: 16 } : undefined),
      shadow: createSoftShadowTexture(),
      grain: createRoughnessTexture(),
    };
  }, []);

  useEffect(
    () => () => {
      assets.labels.forEach((texture) => texture.dispose());
      assets.geometry.dispose();
      assets.plinth.forEach((geometry) => geometry.dispose());
      assets.shadow.dispose();
      assets.grain.dispose();
    },
    [assets],
  );

  useFrame((state, delta) => {
    if (!env && scene.environment) setEnv(scene.environment);
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
      const plane = labelPlanes.current[i];
      if (plane) plane.position.z = compact ? -(tile.labelBack ?? 0) : 0;

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
          {PLINTH.map((tier, i) => (
            <mesh key={i} geometry={assets.plinth[i]} position={[0, tier.y, 0]} rotation={[0, Math.PI / 24, 0]}>
              <meshStandardMaterial
                color={tier.color}
                emissive="#e8e4ff"
                emissiveIntensity={0.05}
                roughness={tier.rough}
                roughnessMap={assets.grain}
                metalness={0}
                envMap={env}
                envMapIntensity={0.5}
              />
            </mesh>
          ))}
        </group>

        <mesh ref={contact} position={[0, -1.095 + PEDESTAL_DROP, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={4}>
          <planeGeometry args={[3.1, 3.1]} />
          <meshBasicMaterial map={assets.shadow} color="#1d2a6b" transparent opacity={0.1} depthWrite={false} />
        </mesh>

        {/* One coherent studio on top of the environment: a large soft key from upper left, a cool fill from the right and a
          warm rim from behind that separates the edges. */}
        <ambientLight intensity={0.2} color="#cdd3ff" />
        <directionalLight position={[-3, 4.5, 3]} intensity={0.95} color="#fff8ee" />
        <directionalLight position={[4, 1.5, 3]} intensity={0.2} color="#c9d4ff" />
        <directionalLight position={[0.5, 3, -5]} intensity={0.5} color="#fff4e6" />

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
                  {/* Group 0 is the two faces, group 1 the side wall and bevel (a deeper tone of the same material). */}
                  <meshPhysicalMaterial
                    attach="material-0"
                    color={tile.color}
                    emissive={tile.color}
                    emissiveIntensity={0.05}
                    roughness={tile.roughness}
                    roughnessMap={assets.grain}
                    metalness={0}
                    clearcoat={0.08}
                    clearcoatRoughness={0.5}
                    envMap={env}
                    envMapIntensity={0.09}
                  />
                  <meshPhysicalMaterial
                    attach="material-1"
                    color={tile.side}
                    roughness={tile.roughness * 0.85}
                    metalness={0}
                    clearcoat={0.3}
                    clearcoatRoughness={0.25}
                    envMap={env}
                    envMapIntensity={0.45}
                  />
                </mesh>
                <mesh
                  ref={(m) => {
                    labelPlanes.current[i] = m;
                  }}
                  position={[0, TILE.thickness / 2 + 0.004, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
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
                      color="#e6e3e2"
                      emissive="#e8e4ff"
                      emissiveIntensity={0.06}
                      roughness={0.55}
                      metalness={0}
                      envMap={env}
                      envMapIntensity={0.55}
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
