"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMouse } from "@/hooks/useMouse";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { MEDIA } from "@/lib/constants";
import { gsap } from "@/lib/gsap";

/** Soft pointer follower. Only mounts for fine pointers and when motion is allowed. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useMouse();
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery(MEDIA.finePointer);
  const enabled = finePointer && !reduced;

  useGSAP(
    () => {
      const el = ref.current;
      if (!enabled || !el) return;

      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
      const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
      const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
      let visible = false;

      const tick = () => {
        const { x: mx, y: my } = mouse.current;
        if (!visible && (mx !== 0 || my !== 0)) {
          visible = true;
          gsap.set(el, { x: mx, y: my });
          gsap.to(el, { autoAlpha: 1, duration: 0.4 });
        }
        x(mx);
        y(my);
      };
      gsap.ticker.add(tick);

      const grow = (event: PointerEvent) => {
        const interactive = (event.target as Element | null)?.closest(
          "a, button, [role='button'], input, textarea, select",
        );
        gsap.to(el, { scale: interactive ? 3.2 : 1, duration: 0.5, ease: "expo.out" });
      };
      window.addEventListener("pointerover", grow, { passive: true });

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pointerover", grow);
      };
    },
    { dependencies: [enabled] },
  );

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-(--z-cursor) size-3 rounded-full bg-ink mix-blend-multiply"
    />
  );
}
