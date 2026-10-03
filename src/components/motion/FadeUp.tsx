"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";

interface FadeUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Starting offset in px. */
  y?: number;
}

export function FadeUp({ children, className, delay = 0, y = 32 }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current, {
        y,
        autoAlpha: 0,
        duration: 1.1,
        delay,
        ease: "expo.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced, y, delay] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
