"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, SRGBColorSpace, type Mesh, type PerspectiveCamera } from "three";

import { sequenceAt, type SequenceState, type TitleState } from "../lib/journey";
import { journeyStore } from "../lib/journey.store";

interface TitleBox {
  /** Layout box of the DOM title inside the stage, in CSS px (untransformed), and the stage size. */
  cx: number;
  cy: number;
  width: number;
  stageW: number;
  stageH: number;
  height: number;
}

/**
 * The DOM title cannot sit behind a canvas object, so the scene draws the same word with the same computed font,
 * colour and layout box, at depth `z` (so objects can stand in front of it and behind it). The DOM heading stays in the page (screen readers, selection,
 * and the fallback without WebGL) and is made transparent only once the scene is up. It follows the very same
 * title values as the DOM did (`pick` selects them: scale, drop, opacity), so the chapter's timing is untouched.
 */
export function TitlePlane({
  selector,
  z,
  pick,
}: {
  selector: string;
  z: number;
  pick: (s: SequenceState) => TitleState;
}) {
  const mesh = useRef<Mesh>(null);
  const box = useRef<TitleBox | null>(null);
  const texture = useMemo(() => {
    const t = new CanvasTexture(document.createElement("canvas"));
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    const stage = el?.offsetParent as HTMLElement | null;
    if (!el || !stage) return;
    const canvas = texture.image as HTMLCanvasElement;
    let frame = 0;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (!width || !height) return;
      const cs = getComputedStyle(el);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const size = parseFloat(cs.fontSize) * dpr;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      ctx.letterSpacing = `${(parseFloat(cs.letterSpacing) || 0) * dpr}px`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ravens-ink").trim() || "#1b1030";
      const text = (el.textContent ?? "").trim().toUpperCase();
      const m = ctx.measureText(text);
      // Centre on the font's own ascent/descent, like a CSS line box does.
      const baseline = canvas.height / 2 + (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
      ctx.fillText(text, canvas.width / 2, baseline);
      texture.needsUpdate = true;
      box.current = {
        cx: el.offsetLeft + width / 2,
        // The heading is centred in the stage by auto block margins, so its box centre is its top plus half its height.
        cy: el.offsetTop + height / 2,
        width,
        height,
        stageW: stage.clientWidth,
        stageH: stage.clientHeight,
      };
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    void document.fonts.ready.then(schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      box.current = null;
    };
  }, [texture, selector]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    const m = mesh.current;
    const b = box.current;
    if (!m) return;
    const title = pick(sequenceAt(journeyStore.progress));
    m.visible = Boolean(b) && title.opacity > 0.001;
    if (!m.visible || !b) return;

    // Size of the stage at the plane's depth, so the word lands exactly where the DOM word would.
    // Measured from the View's own camera (state.viewport describes the canvas's default camera, not this one).
    const camera = state.camera as PerspectiveCamera;
    const h = 2 * Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z);
    const w = (h * state.size.width) / state.size.height;
    // The DOM title zooms about a point 62% down its box (the shared phase-exit origin), which moves its centre up a
    // little as it grows; the plane is scaled about its centre, so it is lifted by the same amount.
    const originShift = (0.12 * b.height * (title.scale - 1)) / b.stageH;
    m.position.set((b.cx / b.stageW - 0.5) * w, (0.5 - b.cy / b.stageH + originShift) * h - title.y * h, z);
    const width = (b.width / b.stageW) * w;
    m.scale.set(
      width * title.scale,
      (width * title.scale * (texture.image as HTMLCanvasElement).height) / (texture.image as HTMLCanvasElement).width,
      1,
    );
    (m.material as { opacity: number }).opacity = title.opacity;
  });

  return (
    <mesh ref={mesh} visible={false} renderOrder={20}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
