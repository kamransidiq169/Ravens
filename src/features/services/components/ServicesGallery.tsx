"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type CSSProperties } from "react";

import { Image } from "@/components/ui/Image";

import { gsap, ScrollTrigger } from "@/lib/gsap";

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

export function ServicesGallery() {
  const root = useRef<HTMLUListElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const list = root.current;
      if (!list) return;
      const items = gsap.utils.toArray<HTMLElement>(".sv-enter", list);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const vw = window.innerWidth;
        // Phones keep the same choreography; only the depth/tilt are eased back (depth also scales with the
        // viewport, like the geometry in services.css).
        const compact = vw < 768;
        const depth = Math.min(1, vw / 1440);
        const tilt = compact ? 0.6 : 1;
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
              y: compact ? 24 : 36,
              z: e.z * depth,
              rotationY: e.ry * tilt,
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
          scrollTrigger: { trigger: list, start: "top 100%", end: compact ? "top 40%" : "top 30%", scrub: 0.8 },
        });
        return () => {
          st.scrollTrigger?.kill();
          st.kill();
          tl.kill();
        };
      });

      // Phones: vertical scroll drives the horizontal track, one focused panel at a time. The wrapper (.sv-pin) is
      // as tall as the timeline needs (see services.css), so the sticky stage releases right after the last hold.
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const wrapper = pin.current;
        if (!wrapper || items.length < 2) return;
        const panels = gsap.utils.toArray<HTMLElement>(".sv-item", list);
        const captions = gsap.utils.toArray<HTMLElement>(".sv-caption", list);
        const step = () => (panels[1]?.offsetLeft ?? 0) - (panels[0]?.offsetLeft ?? 0);
        const LEAD = 0.4; // hold on image 1 before the first move (timeline units)
        const MOVE = 0.6; // of each unit is travel, the rest is a hold
        const REST = { scale: 0.96 };
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

        gsap.set(panels.slice(1), REST);
        gsap.set(captions, { opacity: 0.45 });
        gsap.set(captions[0] ?? [], { opacity: 0.95 });
        panels.forEach((panel, i) => {
          if (i < panels.length - 1) {
            const at = LEAD + i;
            tl.to(list, { x: () => -step() * (i + 1), duration: MOVE }, at);
            tl.to(panel, { scale: 0.96, duration: MOVE }, at);
            tl.to(captions[i] ?? [], { opacity: 0.45, duration: MOVE }, at);
            tl.to(panels[i + 1] ?? [], { scale: 1, duration: MOVE }, at);
            tl.to(captions[i + 1] ?? [], { opacity: 0.95, duration: MOVE }, at);
          }
        });
        tl.to({}, { duration: 0 }, LEAD + panels.length - 1 + 0.5); // closing hold on the last image

        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: "bottom bottom",
          animation: tl,
          scrub: 0.6,
          invalidateOnRefresh: true,
        });
        list.dataset.track = "ready";
        return () => {
          st.kill();
          tl.kill();
          gsap.set([list, ...panels, ...captions], { clearProps: "transform,opacity" });
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
    <div className="sv-pin" ref={pin}>
      <div className="sv-stage">
        <ul ref={root} id="services-gallery" className="sv-gallery" aria-label="Our services" data-motion="pending">
          {panels.map((p, i) => (
            <li key={p.label} className="sv-item" style={{ "--i": i } as CSSProperties}>
              <div className="sv-enter">
                <div className="sv-photo">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 768px) 20vw, 72vw"
                    className="h-full"
                    priority
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
      </div>
    </div>
  );
}
