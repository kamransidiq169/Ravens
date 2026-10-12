"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  CatmullRomCurve3,
  MeshBasicMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from "three";

import { clamp } from "@/lib/math";

/**
 * A scroll-driven flight through a gridded tube, ported from the Framer "Wormhole" component. The camera rides the
 * curve with the track's scroll progress; each principle card is pinned to a point on the tube wall and projected onto
 * the stage, so the cards stay real DOM (readable, selectable, server-rendered) while the tunnel is WebGL.
 */
const CURVE = new CatmullRomCurve3([
  new Vector3(0, 0, 0),
  new Vector3(1.5, 2, -10),
  new Vector3(-2, -1, -20),
  new Vector3(1, -2.5, -30),
  new Vector3(2, 1, -42),
  new Vector3(-1.5, 2, -54),
  new Vector3(-2, -1.5, -66),
  new Vector3(1, -2, -78),
  new Vector3(0, 0, -90),
]);
/** The cards are spread evenly along this stretch of the curve, however many there are. */
const FIRST_CARD = 0.08;
const LAST_CARD = 0.9;
/** Each card turns this far (radians) around the tube from the previous one, so consecutive cards land on different walls. */
const CARD_TURN = 2.1;

function anchor(index: number, count: number) {
  const at = count > 1 ? FIRST_CARD + (index * (LAST_CARD - FIRST_CARD)) / (count - 1) : LAST_CARD;
  return { at, angle: 0.5 + index * CARD_TURN };
}

const RADIUS = 2.8;
const WALL_OFFSET = 1.2;
/** Cards are visible between these camera distances and scale down to nothing at the far one. */
const NEAR = 0.4;
const FAR = 14;
/** Texture scroll around the tube, per second. */
const SPIN = 0.048;
/** Exponential follow rate of the camera towards the scroll target (about 8% per frame at 60 fps, as in the original). */
const FOLLOW = 5;
const GUTTER = 16;
/** How far along the curve the camera gets at the end of the scroll (the last card is just ahead). */
const CAMERA_END = 0.84;

/** Black void (mirrored in wormhole.css). */
const BACKGROUND = "#030305";
/** How much white is mixed into the brand purple so its lines read on black at the same soft violet as the home page. */
const GRID_LIFT = 0.25;

/** The home page's accent, `--ravens-purple`, mixed towards white in sRGB (as CSS color-mix would). */
function gridColor() {
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--ravens-purple").trim() || "#5b3fa3";
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${channels.map((c) => Math.round(c + (255 - c) * GRID_LIFT)).join(" ")})`;
}

function createTunnel() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = gridColor();
    ctx.lineWidth = 2;
    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
  }
  const texture = new CanvasTexture(canvas);
  // The canvas is drawn in sRGB; without this the colours are treated as linear and come out pale and washed out.
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  // Twice the original tube length, so twice the repeats along it keeps the cells the same size.
  texture.repeat.set(24, 4);

  const geometry = new TubeGeometry(CURVE, 200, RADIUS, 16, false);
  const material = new MeshBasicMaterial({
    map: texture,
    side: BackSide,
    transparent: true,
    blending: AdditiveBlending,
  });

  return {
    geometry,
    material,
    /** Spins the grid around the tube and slides it along with the flight. */
    scroll(progress: number, delta: number) {
      texture.offset.x += SPIN * delta;
      texture.offset.y = progress * 2;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}

function Tunnel({ track }: { track: RefObject<HTMLDivElement | null> }) {
  const tunnel = useMemo(() => createTunnel(), []);
  const progress = useRef(0);
  const cards = useRef<HTMLElement[]>([]);
  const scratch = useMemo(() => ({ eye: new Vector3(), look: new Vector3(), card: new Vector3() }), []);

  useEffect(() => () => tunnel.dispose(), [tunnel]);

  useFrame(({ camera }, delta) => {
    const root = track.current;
    if (!root) return;
    if (cards.current.length === 0) cards.current = [...root.querySelectorAll<HTMLElement>("[data-wh-card]")];

    const rect = root.getBoundingClientRect();
    const run = rect.height - window.innerHeight;
    const target = run > 0 ? clamp(-rect.top / run, 0, 1) : 0;
    progress.current += (target - progress.current) * (1 - Math.exp(-delta * FOLLOW));
    const p = progress.current;

    const { eye, look, card } = scratch;
    // The camera stops short of the tube's open end, so the tunnel stays full right up to the footer instead of
    // flying out into the empty void.
    const travel = p * CAMERA_END;
    CURVE.getPointAt(travel, eye);
    CURVE.getPointAt(travel + 0.04, look);
    camera.position.copy(eye);
    camera.lookAt(look);
    camera.updateMatrixWorld();

    tunnel.scroll(p, delta);

    // The stage is the sticky, viewport-sized box the View covers.
    const width = window.innerWidth;
    const height = window.innerHeight;
    cards.current.forEach((el, i) => {
      const { at, angle } = anchor(i, cards.current.length);
      CURVE.getPointAt(at, card);
      card.x += Math.cos(angle) * WALL_OFFSET;
      card.y += Math.sin(angle) * WALL_OFFSET;
      const distance = camera.position.distanceTo(card);
      card.project(camera);

      if (card.z >= 1 || distance >= FAR || distance <= NEAR) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }
      const scale = Math.max(0, 1 - distance / FAR);
      // Keep the card's box on screen, so narrow viewports never crop a principle.
      const halfW = (el.offsetWidth * scale) / 2 + GUTTER;
      const halfH = (el.offsetHeight * scale) / 2 + GUTTER;
      const x = clamp((card.x * 0.5 + 0.5) * width, Math.min(halfW, width / 2), Math.max(width - halfW, width / 2));
      const y = clamp(
        (-card.y * 0.5 + 0.5) * height,
        Math.min(halfH, height / 2),
        Math.max(height - halfH, height / 2),
      );
      el.style.visibility = "visible";
      el.style.opacity = String(Math.min(1, scale * 1.4));
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      el.style.zIndex = String(Math.round((1 - card.z) * 100));
    });
  });

  return <mesh geometry={tunnel.geometry} material={tunnel.material} />;
}

/** Mounts the tunnel as a drei <View> over the sticky stage; it renders into the site's single shared canvas. */
export default function WormholeScene({ track }: { track: RefObject<HTMLDivElement | null> }) {
  return (
    <View className="wormhole__view">
      <PerspectiveCamera makeDefault fov={60} near={0.1} far={100} />
      <color attach="background" args={[BACKGROUND]} />
      {/* The far end of the tube sinks into the black. */}
      <fog attach="fog" args={[BACKGROUND, 4, 20]} />
      <Tunnel track={track} />
    </View>
  );
}
