"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { Image } from "@/components/ui/Image";

import { gsap } from "@/lib/gsap";

import { panels } from "../lib/gallery";

/**
 * Entrance choreography per panel (index order 0..4). Panels enter from the right, the outermost-right first, so
 * the strip unfolds into its concave resting pose (which lives in services.css on the <li>; GSAP only touches the
 * inner `.sv-enter` wrapper, so the two transforms never fight). Travel is a fraction of the viewport width.
 */
const ENTER = [
  { travel: 0.62, z: -140, ry: 16, delay: 0.32 },
  { travel: 0.56, z: -90, ry: 12, delay: 0.24 },
  { travel: 0.5, z: -60, ry: 0, delay: 0.16 },
  { travel: 0.44, z: -90, ry: -12, delay: 0.08 },
  { travel: 0.38, z: -140, ry: -16, delay: 0 },
] as const;

/**
 * `before` / `after` (heading, CTA) render inside the stage wrapper; on tablet/desktop the wrappers are
 * `display: contents`, so the layout is unchanged. Phones get a vertically scrubbed, one-card-at-a-time sequence.
 */
export function ServicesGallery({ before, after }: { before?: ReactNode; after?: ReactNode }) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const list = root.current;
      if (!list) return;
      const items = gsap.utils.toArray<HTMLElement>(".sv-enter", list);
      const mm = gsap.matchMedia();

      // Tablet / desktop: the entrance only; the strip sits in its concave pose (services.css) and never scrolls.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const vw = window.innerWidth;
        const depth = Math.min(1, vw / 1440);
        // Already on screen at load (the /services route): play it in time with a long expo settle. Otherwise scrub
        // it with the scroll (gentler curve, so the travel stays visible across the scroll distance).
        const inView = list.getBoundingClientRect().top < window.innerHeight * 0.85;
        const tl = gsap.timeline({ defaults: { ease: inView ? "expo.out" : "power3.out" }, paused: true });
        items.forEach((el, i) => {
          const e = ENTER[i]!;
          tl.fromTo(
            el,
            {
              x: vw * e.travel,
              y: 36,
              z: e.z * depth,
              rotationY: e.ry,
              scale: 0.95,
              autoAlpha: 0,
              transformPerspective: 1200 * Math.max(depth, 0.5),
            },
            { x: 0, y: 0, z: 0, rotationY: 0, scale: 1, autoAlpha: 1, duration: 1.7 },
            e.delay,
          );
        });
        list.dataset.motion = "ready";

        if (inView) {
          gsap.delayedCall(0.25, () => tl.play());
          return () => tl.kill();
        }
        tl.pause(0);
        const st = gsap.to(tl, {
          progress: 1,
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 100%", end: "top 30%", scrub: 0.8 },
        });
        return () => {
          st.scrollTrigger?.kill();
          st.kill();
          tl.kill();
        };
      });

      // Phones: vertical scroll drives one coordinated timeline. The stage is CSS-sticky inside a tall wrapper (no
      // ScrollTrigger pin, no touch handling, no nested scroller); each card is stacked in the same grid cell and
      // slides in from the right (xPercent of its own box, so nothing is measured) while the previous one eases out.
      //
      // The ScrollTrigger uses fixed pixel-range end so iOS Safari's dynamic address bar cannot move the end point
      // during scroll (which would cause continuous recalculation and the section to shake). Measurements happen
      // only on refresh, never per frame.
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const wrap = list.closest<HTMLElement>(".sv-pin");
        const cards = gsap.utils.toArray<HTMLElement>(".sv-item", list);
        if (!wrap || cards.length < 2) return;

        gsap.set(cards.slice(1), { xPercent: 100, autoAlpha: 0 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrap,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        });
        // Per step: 1.0 of travel, then a 0.7 hold so every service rests as the sole visible card.
        cards.slice(1).forEach((card, i) => {
          const at = i * 1.7;
          tl.to(cards[i]!, { xPercent: -28, duration: 1, ease: "power2.inOut" }, at)
            .to(cards[i]!, { autoAlpha: 0, duration: 0.45, ease: "power1.in" }, at + 0.1)
            .fromTo(
              card,
              { xPercent: 100, autoAlpha: 0 },
              { xPercent: 0, duration: 1, ease: "power3.inOut", immediateRender: false },
              at + 0.1,
            )
            .fromTo(
              card,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.4, ease: "power1.out", immediateRender: false },
              at + 0.45,
            )
            .to({}, { duration: 0.7 }, at + 1);
        });

        list.dataset.motion = "ready";
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(cards, { clearProps: "all" });
        };
      });

      // Reduced motion: final composition, nothing hidden.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        list.dataset.motion = "ready";
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div className="sv-pin">
      <div className="sv-stage">
        {before}
        <ul ref={root} id="services-gallery" className="sv-gallery" aria-label="Our services" data-motion="pending">
          {panels.map((p, i) => (
            <li key={p.label} className="sv-item" style={{ "--i": i } as CSSProperties}>
              <div className="sv-enter">
                <div className="sv-photo">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 768px) 20vw, 86vw"
                    className="h-full"
                    loading="eager"
                    preload={i === 0}
                  />
                </div>
                <p className="sv-caption">
                  <span className="sv-num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{p.label}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        {after}
      </div>
    </div>
  );
}
