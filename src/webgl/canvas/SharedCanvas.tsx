"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState, useSyncExternalStore } from "react";

import { MAX_DPR } from "@/lib/constants";

import { isWebGLSupported } from "../utils/isWebGLSupported";
import { dprRangeForTier, getQualityTier } from "../utils/quality";

const noopSubscribe = () => () => {};

/**
 * The one WebGL context for the whole site. Features render into it by mounting
 * drei <View> elements in the DOM; `View.Port` tunnels their scenes in here.
 * Do not create additional <Canvas> elements.
 */
export default function SharedCanvas() {
  const supported = useSyncExternalStore(noopSubscribe, isWebGLSupported, () => false);
  const [[minDpr, maxDpr]] = useState(() => dprRangeForTier(getQualityTier()));
  const [dpr, setDpr] = useState(maxDpr);

  if (!supported) return null;

  return (
    // `isolate` creates a stacking context so the fixed canvas never disappears behind page backgrounds.
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 isolate z-(--z-canvas)">
      <Canvas
        dpr={Math.min(dpr, MAX_DPR)}
        eventSource={document.documentElement}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(minDpr)}
          onIncline={() => setDpr(maxDpr)}
          flipflops={3}
          onFallback={() => setDpr(minDpr)}
        />
        <View.Port />
      </Canvas>
    </div>
  );
}
