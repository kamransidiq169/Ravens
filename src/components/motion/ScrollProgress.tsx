"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { gsap } from "@/lib/gsap";

/** Hairline reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } },
      );
    },
    { dependencies: [reduced] },
  );

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-(--z-progress) h-px">
      <div ref={ref} className="h-full origin-left scale-x-0 bg-ink" />
    </div>
  );
}
