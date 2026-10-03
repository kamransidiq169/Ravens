"use client";

import { useRef, type ReactNode } from "react";

import { useIdle } from "@/hooks/useIdle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/cn";
import { MEDIA } from "@/lib/constants";

import { MagneticDriver } from "./lazy";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** 0–1: how far the child follows the pointer. */
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery(MEDIA.finePointer);
  const idle = useIdle();

  return (
    <div ref={ref} className={cn("inline-block", className)}>
      {children}
      {idle && finePointer && !reduced && <MagneticDriver target={ref} strength={strength} />}
    </div>
  );
}
