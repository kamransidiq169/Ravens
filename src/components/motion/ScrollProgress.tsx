"use client";

import { useRef } from "react";

import { useIdle } from "@/hooks/useIdle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { ScrollProgressDriver } from "./lazy";

/** Hairline reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-(--z-progress) h-px">
      <div ref={ref} className="h-full origin-left scale-x-0 bg-ink" />
      {idle && <ScrollProgressDriver target={ref} />}
    </div>
  );
}
