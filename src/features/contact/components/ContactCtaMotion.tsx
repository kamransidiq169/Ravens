"use client";

import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";

import { BREAKPOINTS } from "@/lib/constants";
import { gsap } from "@/lib/gsap";

/**
 * Scroll reveal and depth for the closing section. Everything animates transform / opacity / clip only.
 * Sequence: atmosphere → eyebrow → headline lines → statement → CTA → signature, then a feather settles in.
 * Elements already on screen at mount are left alone, so there is no hide-then-reveal flash.
 */
export function ContactCtaMotion({ target }: { target: RefObject<HTMLElement | null> }) {
  useGSAP(
    () => {
      const root = target.current;
      if (!root) return;
      const q = (selector: string) => gsap.utils.toArray<HTMLElement>(root.querySelectorAll(selector));
      const one = (selector: string) => root.querySelector<HTMLElement>(selector);

      const atmosphere = one('[data-cta="atmosphere"]');
      const feather = one(".cta__feather");
      const lines = q("[data-cta-line]");
      const meta = q('[data-cta="meta"] [data-cta-item]');
      const statement = one(".cta__statement");
      const link = one(".cta__link");
      const disc = one(".cta__disc");
      const rule = one(".cta__rule");
      const foot = q('[data-cta="foot"] [data-cta-item]');

      if (root.getBoundingClientRect().top < window.innerHeight * 0.5) return;

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: root, start: "top 62%", once: true },
      });

      tl.from(atmosphere, { autoAlpha: 0, duration: 1.8, ease: "power2.out" }, 0)
        .from(meta, { autoAlpha: 0, y: 10, duration: 1, stagger: 0.08 }, 0.2)
        .from(
          lines,
          { yPercent: 112, skewY: 3, autoAlpha: 0, duration: 1.5, stagger: 0.14, transformOrigin: "0 100%" },
          0.35,
        )
        .from(statement, { autoAlpha: 0, y: 22, duration: 1.2 }, 1.0)
        .from(link, { autoAlpha: 0, y: 18, duration: 1.2 }, 1.15)
        .from(disc, { scale: 0.86, duration: 1.4 }, 1.15)
        .from(rule, { scaleX: 0, transformOrigin: "0 50%", duration: 1.4 }, 1.4)
        .from(foot, { autoAlpha: 0, y: 8, duration: 1, stagger: 0.1 }, 1.7)
        .from(feather, { autoAlpha: 0, y: 48, rotate: -6, duration: 2.4, ease: "power3.out" }, 1.2);

      // The feather drifts a few degrees while it is on screen; paused otherwise.
      let sway: gsap.core.Tween | undefined;
      if (feather) {
        sway = gsap.to(feather, {
          rotate: "+=2.5",
          duration: 6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          paused: true,
        });
        gsap.set(feather, { transformOrigin: "50% 100%" });
        tl.eventCallback("onComplete", () => sway?.play());
      }

      // Depth: each layer travels at its own, barely-noticeable rate. Desktop only.
      const mm = gsap.matchMedia();
      mm.add(`(min-width: ${BREAKPOINTS.md}px)`, () => {
        const scrub = (el: Element | null, vars: gsap.TweenVars) => {
          if (!el) return;
          gsap.fromTo(
            el,
            { yPercent: vars.from },
            {
              yPercent: vars.to,
              ease: "none",
              scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        };
        scrub(atmosphere, { from: -5, to: 5 });
        scrub(one('[data-cta="meta"]'), { from: 22, to: -22 });
        scrub(one('[data-cta="headline"]'), { from: 4, to: -4 });
        scrub(one('[data-cta="row"]'), { from: 12, to: -12 });
        scrub(feather, { from: 10, to: -16 });
      });
    },
    { scope: target, revertOnUpdate: true },
  );
  return null;
}
