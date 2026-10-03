"use client";

import { useRef, type ReactNode } from "react";

import { useIdle } from "@/hooks/useIdle";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useViewport } from "@/hooks/useViewport";

import { cn } from "@/lib/cn";
import { BREAKPOINTS } from "@/lib/constants";

import { ParallaxDriver } from "./lazy";

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
  const idle = useIdle();
  const { width } = useViewport();
  const enabled = !reduced && width >= BREAKPOINTS.md;

  return (
    <div ref={wrapper} className={cn("overflow-hidden", className)}>
      <div ref={inner} className={enabled ? "scale-[1.12]" : undefined}>
        {children}
      </div>
      {idle && enabled && <ParallaxDriver wrapper={wrapper} inner={inner} speed={speed} />}
    </div>
  );
}
