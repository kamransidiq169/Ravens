"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { LazySharedCanvas, loadCanvas } from "@/webgl/canvas/LazySharedCanvas";
import { isWebGLSupported } from "@/webgl/utils/isWebGLSupported";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { JellySprite, OrbSprite, StackSprite } from "./JellySprite";

// three / drei stay out of the initial bundle: the scene loads on demand, client-only, after the hero has painted.
const loadScene = () => import("../scene/JellyScene");
const JellyScene = dynamic(loadScene, { ssr: false });

interface NavigatorWithSaveData extends Navigator {
  connection?: { saveData?: boolean };
}

/**
 * The hero's central visual. The server renders a finished CSS/SVG jellyfish, so the first paint is complete and the
 * no-WebGL, reduced-motion and save-data cases are covered by it. When motion is allowed, the real-time jellyfish's
 * chunks are fetched as soon as the component has hydrated (in parallel with the headline's CSS entrance, which runs on
 * the compositor) and the context is created the moment they are in. After its first frame is on screen the sprite
 * crossfades away.
 */
export function JellyVisual() {
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced || (navigator as NavigatorWithSaveData).connection?.saveData) return;
    let cancelled = false;
    // Both code-split chunks (the scene and the shared canvas) are requested together, right away, so the 3D starts as
    // soon as they have arrived instead of after each one has been discovered by the one before it. Nothing here waits
    // on a timer or on the browser being idle.
    void Promise.all([loadScene(), loadCanvas()]).then(() => {
      if (!cancelled && isWebGLSupported()) setLive(true);
    });
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  return (
    <div className="journey__visual" data-gl={live && ready ? "ready" : "off"} aria-hidden="true">
      <JellySprite />
      <OrbSprite />
      <StackSprite />
      {live ? (
        <>
          {createPortal(<LazySharedCanvas />, document.body)}
          <JellyScene onReady={() => setReady(true)} />
        </>
      ) : null}
    </div>
  );
}
