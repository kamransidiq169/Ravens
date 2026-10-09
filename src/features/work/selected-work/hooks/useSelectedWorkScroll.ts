import { useEffect, type RefObject } from "react";

// Same condition the stylesheet uses for the pinned layout, so JS only runs where the CSS expects it.
const CINEMATIC = { cinematic: "(prefers-reduced-motion: no-preference)" };

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
/** Smootherstep: zero slope at both ends, so the track dwells on each project before moving to the next. */
const dwell = (u: number) => u * u * u * (u * (6 * u - 15) + 10);

/**
 * Scroll-drives the horizontal gallery. The wrapper is tall and the stage is `position: sticky` (CSS), so there is no
 * pin, no scroll container and no scroll hijacking: the page scrolls natively and the stage releases itself at the end.
 *
 * One scrubbed timeline carries a 0 → 1 proxy; each tick writes transforms/opacity only (no React state). GSAP is
 * code-split, everything is reverted on unmount (Strict Mode safe), and nothing runs under reduced motion. Phones run the same driver on a proportionally reflowed composition.
 */
export function useSelectedWorkScroll(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const wrapper = root.current;
    if (!wrapper) return;

    const stage = wrapper.querySelector<HTMLElement>("[data-sw='stage']");
    const track = wrapper.querySelector<HTMLElement>("[data-sw='track']");
    const slides = Array.from(wrapper.querySelectorAll<HTMLElement>("[data-sw='slide']"));
    if (!stage || !track || slides.length < 2) return;

    const media = slides.map((slide) => slide.querySelector<HTMLElement>("[data-sw='media']"));
    const infos = slides.map((slide) => slide.querySelector<HTMLElement>("[data-sw='info']"));
    const last = slides.length - 1;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("@/lib/gsap").then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;

      const mm = gsap.matchMedia();
      mm.add(CINEMATIC, () => {
        let pitch = 0;
        let overhang = 0;
        let drop = 0;
        let active = 0;
        const proxy = { p: 0 };

        // Measured on refresh, never per frame. offset* ignore transforms, so these are the untransformed layout.
        const measure = () => {
          const first = slides[0];
          const second = slides[1];
          if (!first || !second) return;
          pitch = second.offsetLeft - first.offsetLeft;
          const mediaEl = media[0];
          const infoEl = infos[0];
          if (mediaEl && infoEl) {
            overhang = Math.max(0, infoEl.offsetLeft + infoEl.offsetWidth - mediaEl.offsetWidth);
            drop = mediaEl.offsetHeight * 0.139;
          }
        };

        // Slide i sits at i·pitch from the track origin. The active project's panel overhangs its image, so every slide
        // to its right is pushed out by that overhang, and side slides sit slightly lower than the active one.
        const apply = (p: number) => {
          const t = p * last;
          const base = Math.min(Math.floor(t), last - 1);
          const position = base + dwell(t - base);

          gsap.set(track, { x: -position * pitch, force3D: true });

          slides.forEach((slide, i) => {
            const d = Math.min(Math.abs(i - position), 1);
            gsap.set(slide, { x: overhang * clamp(i - position), y: drop * d, force3D: true });
            if (media[i]) gsap.set(media[i], { scale: 1 - 0.03 * d, opacity: 1 - 0.08 * d, force3D: false });
            if (infos[i]) gsap.set(infos[i], { opacity: clamp(1 - d * 2.4), force3D: false });
          });

          const nearest = Math.round(position);
          if (nearest !== active) {
            slides[active]?.removeAttribute("data-active");
            slides[nearest]?.setAttribute("data-active", "");
            active = nearest;
          }
        };

        measure();
        apply(0);

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measure();
              apply(proxy.p);
            },
          },
        });
        timeline.to(proxy, { p: 1, duration: 1, onUpdate: () => apply(proxy.p) }, 0);

        const goTo = (index: number, smooth: boolean) => {
          const trigger = timeline.scrollTrigger;
          if (!trigger) return;
          const top = trigger.start + (trigger.end - trigger.start) * (index / last);
          window.scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
        };
        const indexOf = (target: EventTarget | null) => {
          const slide = (target as Element | null)?.closest<HTMLElement>("[data-sw='slide']");
          return slide ? slides.indexOf(slide) : -1;
        };

        // Keyboard focus can land on a slide that is off-screen: bring the track to it so focus is visible.
        const onFocusIn = (event: FocusEvent) => {
          const i = indexOf(event.target);
          if (i !== -1 && i !== active) goTo(i, false);
        };
        // Clicking a peeking neighbour moves to it instead of navigating away.
        const onClick = (event: MouseEvent) => {
          const i = indexOf(event.target);
          if (i === -1 || i === active || !(event.target as Element).closest("a")) return;
          event.preventDefault();
          goTo(i, true);
        };
        track.addEventListener("focusin", onFocusIn);
        track.addEventListener("click", onClick);

        return () => {
          track.removeEventListener("focusin", onFocusIn);
          track.removeEventListener("click", onClick);
          slides[active]?.removeAttribute("data-active");
          slides[0]?.setAttribute("data-active", "");
        };
      });

      teardown = () => mm.revert();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [root]);
}
