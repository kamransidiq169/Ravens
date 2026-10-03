"use client";

/**
 * GSAP-powered behaviour for the motion components. This module (and therefore gsap + ScrollTrigger)
 * is only ever loaded through next/dynamic after the page is idle, so it never blocks first paint.
 * Each driver renders nothing (except CursorDriver) and animates the element behind `target`.
 */
import { useGSAP } from "@gsap/react";
import { useRef, type RefObject } from "react";

import { useMouse } from "@/hooks/useMouse";

import { gsap } from "@/lib/gsap";

type Target = RefObject<HTMLElement | null>;

/** Elements already on screen when the driver starts are left alone: no hide-then-reveal flash. */
const isInView = (el: Element, threshold = 0.9) => el.getBoundingClientRect().top < window.innerHeight * threshold;

export function FadeUpDriver({ target, y, delay }: { target: Target; y: number; delay: number }) {
  useGSAP(
    () => {
      const el = target.current;
      if (!el || isInView(el)) return;
      gsap.from(el, {
        y,
        autoAlpha: 0,
        duration: 1.1,
        delay,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: target, revertOnUpdate: true, dependencies: [y, delay] },
  );
  return null;
}

export function WordRevealDriver({ target, trigger }: { target: Target; trigger: "scroll" | "load" }) {
  useGSAP(
    () => {
      const el = target.current;
      if (!el || (trigger === "scroll" && isInView(el))) return;
      gsap.from(el.querySelectorAll("[data-word]"), {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.06,
        ...(trigger === "scroll" && { scrollTrigger: { trigger: el, start: "top 90%", once: true } }),
      });
    },
    { scope: target, revertOnUpdate: true, dependencies: [trigger] },
  );
  return null;
}

export function ParallaxDriver({ wrapper, inner, speed }: { wrapper: Target; inner: Target; speed: number }) {
  useGSAP(
    () => {
      if (!wrapper.current || !inner.current) return;
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
    { scope: wrapper, revertOnUpdate: true, dependencies: [speed] },
  );
  return null;
}

export function MagneticDriver({ target, strength }: { target: Target; strength: number }) {
  useGSAP(
    () => {
      const el = target.current;
      if (!el) return;
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
    { scope: target, revertOnUpdate: true, dependencies: [strength] },
  );
  return null;
}

export function PageTransitionDriver({ target, pathname }: { target: Target; pathname: string }) {
  const isFirstRun = useRef(true);
  useGSAP(
    () => {
      // The driver mounts after the initial load, so its first run is the page the user is already looking at.
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      if (!target.current) return;
      gsap.fromTo(
        target.current,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", clearProps: "transform,opacity,visibility" },
      );
    },
    { scope: target, revertOnUpdate: true, dependencies: [pathname] },
  );
  return null;
}

export function ScrollProgressDriver({ target }: { target: Target }) {
  useGSAP(
    () => {
      if (!target.current) return;
      gsap.fromTo(
        target.current,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } },
      );
    },
    { scope: target, revertOnUpdate: true },
  );
  return null;
}

/** Soft pointer follower. Mounted only for fine pointers with motion allowed. */
export function CursorDriver() {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useMouse();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

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
    { scope: ref, revertOnUpdate: true },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-(--z-cursor) size-3 rounded-full bg-ink mix-blend-multiply"
    />
  );
}
