"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { LazySharedCanvas } from "@/webgl/canvas/LazySharedCanvas";
import { isWebGLSupported } from "@/webgl/utils/isWebGLSupported";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { onIdle } from "@/lib/idle";

import { JellySprite, OrbSprite, StackSprite, KineticSprite } from "./JellySprite";

// three / drei stay out of the initial bundle: the scene loads on demand, client-only, after the hero has painted.
const JellyScene = dynamic(() => import("../scene/JellyScene"), { ssr: false });

interface NavigatorWithSaveData extends Navigator {
  connection?: { saveData?: boolean };
}

/**
 * Resolves once the headline's character entrance has finished (or straight away if there is none, e.g. reduced
 * motion). Event-driven: it waits on the animations' own `finished` promises, not on a timer.
 */
function introFinished(): Promise<void> {
  const running = document
    .getAnimations()
    .filter((a) => a instanceof CSSAnimation && a.animationName === "journey-char");
  return Promise.all(running.map((a) => a.finished.catch(() => undefined))).then(() => undefined);
}

/**
 * The hero's central visual. The server renders a finished CSS/SVG jellyfish, so the first paint is complete and the
 * no-WebGL, reduced-motion and save-data cases are covered by it. When motion is allowed, the real-time jellyfish is
 * loaded once the headline intro has finished: probing for WebGL creates a context, which blocks the main thread while
 * the GPU process is busy, so it must never happen during hydration or while the characters are animating. After its
 * first frame is on screen the sprite crossfades away.
 */
export function JellyVisual() {
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced || (navigator as NavigatorWithSaveData).connection?.saveData) return;
    let cancelled = false;
    let cancelIdle: (() => void) | undefined;
    void introFinished().then(() => {
      if (cancelled) return;
      cancelIdle = onIdle(() => {
        if (!cancelled && isWebGLSupported()) setLive(true);
      }, 1200);
    });
    return () => {
      cancelled = true;
      cancelIdle?.();
    };
  }, [reduced]);

  return (
    <div className="journey__visual" data-gl={live && ready ? "ready" : "off"} aria-hidden="true">
      <JellySprite />
      <OrbSprite />
      <StackSprite />
      <KineticSprite />
      {live ? (
        <>
          {createPortal(<LazySharedCanvas />, document.body)}
          <JellyScene onReady={() => setReady(true)} />
        </>
      ) : null}
    </div>
  );
}
