"use client";

import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { gsap } from "@/lib/gsap";

/** Fades the page in on client-side navigations. The first load is left alone so SSR content paints untouched. */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      if (reduced || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", clearProps: "transform,opacity,visibility" },
      );
    },
    { scope: ref, dependencies: [pathname, reduced] },
  );

  return <div ref={ref}>{children}</div>;
}
