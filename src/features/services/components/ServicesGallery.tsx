"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

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

/**
 * `before` / `after` (heading, CTA) render inside the sticky stage so that on phones the whole composition pins as
 * one frame; on tablet/desktop the wrappers are `display: contents`, so the layout is unchanged.
 */
export function ServicesGallery({ before, after }: { before?: ReactNode; after?: ReactNode }) {
  const root = useRef<HTMLUListElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

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

      // Phones: ONE timeline on ONE ScrollTrigger drives everything (entrance, then the horizontal track, one focused
      // panel at a time). Each element has exactly one animated owner, all composed inside this timeline:
      //   .sv-enter -> entrance (x, y, scale, opacity)   .sv-item -> focus scale   list -> track x   caption -> opacity
      // Every position is derived from CSS boxes (svh-sized, so Safari's collapsing toolbar cannot move them) and is
      // measured only when ScrollTrigger refreshes, never per frame. The trigger is the static .sv-pin wrapper, not
      // anything inside the sticky stage.
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const wrapper = pin.current;
        const stage = stageRef.current;
        if (!wrapper || !stage || items.length < 2) return;
        const panels = gsap.utils.toArray<HTMLElement>(".sv-item", list);
        const captions = gsap.utils.toArray<HTMLElement>(".sv-caption", list);

        const ENTRANCE = 1; // timeline units of scroll before the pin (0 when it is played in time instead)
        const LEAD = 0.4; // hold on image 1 before the first move
        const MOVE = 0.6; // of each unit is travel, the rest is a hold
        const TAIL = 0.5; // closing hold on the last image
        const TRACK = LEAD + (panels.length - 1) + TAIL;
        const REST = { scale: 0.96 };

        // Distance from panel 0's centre to panel i's centre, from computed (sub-pixel, transform-free) layout widths.
        // Not a fixed pitch: a panel whose nowrap caption is wider than the card grows, so pitches can differ.
        const travel = (i: number) => {
          const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
          const width = (el: HTMLElement) => parseFloat(getComputedStyle(el).width);
          let d = (width(panels[0]!) + width(panels[i]!)) / 2 + gap * i;
          for (let j = 1; j < i; j++) d += width(panels[j]!);
          return d;
        };
        const trackScroll = () => wrapper.offsetHeight - stage.offsetHeight;
        const unit = () => trackScroll() / TRACK; // scroll px per timeline unit
        const inView = wrapper.getBoundingClientRect().top < window.innerHeight * 0.85;
        const lead = inView ? 0 : ENTRANCE;

        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, paused: true });

        gsap.set(panels.slice(1), REST);
        gsap.set(captions, { opacity: 0.45 });
        gsap.set(captions[0] ?? [], { opacity: 0.95 });
        if (!inView) {
          items.forEach((el, i) => {
            const e = ENTER[i]!;
            tl.fromTo(
              el,
              { x: () => stage.clientWidth * e.travel * 0.5, y: 24, scale: 0.95, opacity: 0 },
              { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power3.out", force3D: true },
              e.delay * 0.4,
            );
          });
        }

        panels.forEach((panel, i) => {
          if (i >= panels.length - 1) return;
          const at = lead + LEAD + i;
          tl.to(list, { x: () => -travel(i + 1), duration: MOVE, force3D: true }, at);
          tl.to(panel, { scale: 0.96, duration: MOVE, force3D: true }, at);
          tl.to(captions[i] ?? [], { opacity: 0.45, duration: MOVE }, at);
          tl.to(panels[i + 1] ?? [], { scale: 1, duration: MOVE, force3D: true }, at);
          tl.to(captions[i + 1] ?? [], { opacity: 0.95, duration: MOVE }, at);
        });
        tl.to({}, { duration: 0 }, lead + TRACK);

        list.dataset.motion = "ready";
        if (inView) {
          // Already on screen at load (the /services route): the entrance plays in time, on .sv-enter only.
          const played = gsap.timeline({ paused: true });
          items.forEach((el, i) => {
            const e = ENTER[i]!;
            played.fromTo(
              el,
              { x: () => stage.clientWidth * e.travel * 0.5, y: 24, scale: 0.95, opacity: 0 },
              { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.7, ease: "expo.out", force3D: true },
              e.delay,
            );
          });
          gsap.delayedCall(0.25, () => played.play());
        }

        // Start earlier by the entrance distance so the pinned part always begins exactly at "top top".
        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: () => `top top+=${Math.round(lead * unit())}`,
          end: () => `+=${Math.round(trackScroll() + lead * unit())}`,
          animation: tl,
          scrub: true,
          invalidateOnRefresh: true,
        });

        // Decode every photo once it has loaded, so Safari never decodes a 3x bitmap mid-scroll.
        const decode = (img: HTMLImageElement) => void img.decode().catch(() => undefined);
        const pending = new Map<HTMLImageElement, () => void>();
        gsap.utils.toArray<HTMLImageElement>("img", list).forEach((img) => {
          if (img.complete && img.naturalWidth) return decode(img);
          const onLoad = () => decode(img);
          pending.set(img, onLoad);
          img.addEventListener("load", onLoad, { once: true });
        });

        list.dataset.track = "ready";
        return () => {
          pending.forEach((onLoad, img) => img.removeEventListener("load", onLoad));
          st.kill();
          tl.kill();
          gsap.set([list, ...items, ...panels, ...captions], { clearProps: "transform,opacity" });
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
      <div className="sv-stage" ref={stageRef}>
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
                    sizes="(min-width: 768px) 20vw, 64vw"
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
