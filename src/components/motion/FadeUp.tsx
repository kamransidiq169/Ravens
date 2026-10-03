"use client";

import { useRef, type ReactNode } from "react";

import { useIdle } from "@/hooks/useIdle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/cn";

import { FadeUpDriver } from "./lazy";

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Starting offset in px. */
  y?: number;
}

/** Content is server-rendered visible; the reveal is layered on after idle for elements below the fold. */
export function FadeUp({ children, className, delay = 0, y = 32 }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  return (
    <div ref={ref} className={cn(className)}>
      {children}
      {idle && !reduced && <FadeUpDriver target={ref} y={y} delay={delay} />}
    </div>
  );
}
