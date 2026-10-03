"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useViewport } from "@/hooks/useViewport";

import { cn } from "@/lib/cn";
import { BREAKPOINTS } from "@/lib/constants";
import { gsap } from "@/lib/gsap";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Travel as a percentage of the element's own height, in each direction. */
  speed?: number;
}

/** Scroll-linked vertical drift. Disabled under reduced motion and on small screens. */
export function Parallax({ children, className, speed = 8 }: ParallaxProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { width } = useViewport();
  const enabled = !reduced && width >= BREAKPOINTS.md;

  useGSAP(
    () => {
      if (!enabled || !wrapper.current || !inner.current) return;
      gsap.fromTo(
        inner.current,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: { trigger: wrapper.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: wrapper, dependencies: [enabled, speed] },
  );

  return (
    <div ref={wrapper} className={cn("overflow-hidden", className)}>
      <div ref={inner} className={enabled ? "scale-[1.12]" : undefined}>
        {children}
      </div>
    </div>
  );
}
