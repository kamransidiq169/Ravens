"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/cn";
import { MEDIA } from "@/lib/constants";
import { gsap } from "@/lib/gsap";

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
  const enabled = finePointer && !reduced;

  useGSAP(
    () => {
      const el = ref.current;
      if (!enabled || !el) return;
      const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
      const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        x((event.clientX - (rect.left + rect.width / 2)) * strength);
        y((event.clientY - (rect.top + rect.height / 2)) * strength);
      };
      const onLeave = () => {
        x(0);
        y(0);
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref, dependencies: [enabled, strength] },
  );

  return (
    <div ref={ref} className={cn("inline-block", className)}>
      {children}
    </div>
  );
}
