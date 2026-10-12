"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { isWebGLSupported } from "@/webgl/capabilities";
import { LazySharedCanvas, loadCanvas } from "@/webgl/LazyCanvas";

import { useReducedMotion } from "@/hooks/useReducedMotion";

// three / drei stay out of the initial bundle: the tunnel loads on demand, client-only, after the page has painted.
const loadScene = () => import("../scenes/WormholeScene");
const WormholeScene = dynamic(loadScene, { ssr: false });

interface NavigatorWithSaveData extends Navigator {
  connection?: { saveData?: boolean };
}

/**
 * Tall scroll track + sticky stage for the principles tunnel. The server renders the principles as a plain card grid,
 * which also covers no-WebGL, reduced motion and save-data. Once the scene and the shared canvas have loaded the track
 * switches to `data-gl="on"`: it grows to its scroll length and the scene positions the cards inside the tunnel.
 */
export function WormholeStage({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const live = loaded && !reduced;

  useEffect(() => {
    if (reduced || (navigator as NavigatorWithSaveData).connection?.saveData) return;
    let cancelled = false;
    void Promise.all([loadScene(), loadCanvas()]).then(() => {
      if (!cancelled && isWebGLSupported()) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  return (
    <div ref={track} className="wormhole" data-gl={live ? "on" : "off"} data-header-theme="dark">
      <div className="wormhole__stage">
        {live ? (
          <>
            {createPortal(<LazySharedCanvas />, document.body)}
            <WormholeScene track={track} />
          </>
        ) : null}
        <ul className="wormhole__cards">{children}</ul>
      </div>
    </div>
  );
}
