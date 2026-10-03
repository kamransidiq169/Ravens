"use client";

import type Lenis from "lenis";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { onIdle } from "@/lib/idle";

/** Tiny external store so any client component can reach the active Lenis instance without context re-renders. */
let current: Lenis | null = null;
const listeners = new Set<() => void>();

function setCurrent(next: Lenis | null) {
  current = next;
  listeners.forEach((listener) => listener());
}

/** The active Lenis instance, or null (SSR, before idle, reduced motion). */
export function useSmoothScroll(): Lenis | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => null,
  );
}

/**
 * Lenis driven by the GSAP ticker so ScrollTrigger and smooth scrolling share one clock.
 * Lenis and GSAP are imported after the page is idle, so they stay out of the critical path.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;

    const start = async () => {
      const [{ default: LenisClass }, { gsap, ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("@/lib/gsap"),
      ]);
      if (cancelled) return;

      const lenis = new LenisClass({ autoRaf: false, anchors: true, lerp: 0.1 });
      lenis.on("scroll", ScrollTrigger.update);

      const onTick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);
      setCurrent(lenis);

      teardown = () => {
        gsap.ticker.remove(onTick);
        gsap.ticker.lagSmoothing(500, 33);
        setCurrent(null);
        lenis.destroy();
      };
    };

    const cancelIdle = onIdle(() => void start(), 1500);

    return () => {
      cancelled = true;
      cancelIdle();
      teardown?.();
    };
  }, [reduced]);

  return <>{children}</>;
}
