"use client";

import dynamic from "next/dynamic";

import { LazySharedCanvas } from "@/webgl/canvas/LazySharedCanvas";

// The scene imports drei/three, so it must be code-split just like the canvas itself.
const CanvasSmokeScene = dynamic(() => import("./CanvasSmokeScene"), { ssr: false });

/** Dev-only: proves the shared canvas + View tunnel work end to end (rendered by /hero-lab). */
export function CanvasSmoke() {
  return (
    <>
      <LazySharedCanvas />
      <CanvasSmokeScene />
    </>
  );
}
