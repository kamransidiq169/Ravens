import { useEffect, type RefObject } from "react";

// Same conditions the stylesheet uses, so JS only drives the layout CSS has actually switched on.
const MODES = {
  cinematic: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  stacked: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
};

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
/** Smootherstep: zero slope at both ends, so each testimonial dwells before the next arrives. */
const dwell = (u: number) => u * u * u * (u * (6 * u - 15) + 10);
const pad = (n: number) => String(n).padStart(2, "0");

type LineState = "hidden" | "settled" | "moving";

/**
 * Scroll-drives the testimonial sequence. The wrapper is tall and the stage is `position: sticky` (CSS): no pin, no
 * scroll container, native scrolling, and the browser releases the stage at the end. One scrubbed timeline carries a
 * 0 → 1 proxy; each tick writes transforms/opacity only and touches text/attributes only when the active index changes.
 *
 * Each layer (a testimonial, then "trusted by") recedes (scale .94, y −3%) as the next rises into place (scale .96,
 * y +3%), and the arriving quote's lines settle one after another. Reuses the app's single GSAP/ScrollTrigger (and
 * Lenis) instance; everything reverts on unmount.
 */
export function useTestimonialsScroll(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const wrapper = root.current;
    if (!wrapper) return;

    const layers = Array.from(wrapper.querySelectorAll<HTMLElement>("[data-tm='layer']"));
    const intro = wrapper.querySelector<HTMLElement>("[data-tm='intro']");
    const progress = wrapper.querySelector<HTMLElement>("[data-tm='progress']");
    const count = wrapper.querySelector<HTMLElement>("[data-tm='count']");
    const bar = wrapper.querySelector<HTMLElement>("[data-tm='bar']");
    // Layers are the testimonials plus one final "trusted by" layer.
    const last = layers.length - 1;
    if (last < 1) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("@/lib/gsap").then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;

      const mm = gsap.matchMedia();

      mm.add(MODES, (context) => {
        const cinematic = Boolean(context.conditions?.cinematic);
        const inView = (el: Element, at: number) => el.getBoundingClientRect().top < window.innerHeight * at;

        if (!cinematic) {
          // Phones: stacked editorial list with a single quiet reveal per item.
          layers.forEach((layer) => {
            if (inView(layer, 0.9)) return;
            gsap.from(layer, {
              y: 28,
              autoAlpha: 0,
              duration: 1,
              ease: "expo.out",
              scrollTrigger: { trigger: layer, start: "top 88%", once: true },
            });
          });
          return;
        }

        // Words grouped into the lines the browser actually wrapped them onto. Measured on refresh, never per frame.
        let lines: HTMLElement[][][] = layers.map(() => []);
        const states: LineState[] = layers.map(() => "settled");
        const measureLines = () => {
          lines = layers.map((layer) => {
            const rows = new Map<number, HTMLElement[]>();
            layer.querySelectorAll<HTMLElement>("[data-w]").forEach((word) => {
              const key = Math.round(word.offsetTop / 4);
              rows.set(key, [...(rows.get(key) ?? []), word]);
            });
            return [...rows.entries()].sort(([a], [b]) => a - b).map(([, words]) => words);
          });
          states.fill("moving");
        };

        const setLines = (i: number, r: number) => {
          const rows = lines[i] ?? [];
          const stagger = Math.min(0.12, 0.5 / Math.max(rows.length, 1));
          const span = 1 - (rows.length - 1) * stagger;
          rows.forEach((words, k) => {
            const lp = clamp((r - k * stagger) / span);
            gsap.set(words, { opacity: lp, yPercent: (1 - lp) * 40, force3D: true });
          });
        };

        let active = 0;
        const proxy = { p: 0 };

        const apply = (p: number) => {
          const t = p * last;
          const base = Math.min(Math.floor(t), last - 1);
          const position = base + dwell(t - base);

          layers.forEach((layer, i) => {
            const s = i - position;
            const a = clamp(Math.abs(s));
            // Outgoing recedes up and back; incoming rises from below and settles.
            gsap.set(layer, {
              opacity: clamp(1 - a * 2.4),
              scale: s < 0 ? 1 - 0.06 * a : 1 - 0.04 * a,
              yPercent: s < 0 ? -3 * a : 3 * a,
              force3D: true,
            });

            if (s > 0 && s < 1) {
              setLines(i, 1 - s);
              states[i] = "moving";
            } else if (s >= 1) {
              if (states[i] !== "hidden") setLines(i, 0);
              states[i] = "hidden";
            } else if (states[i] !== "settled") {
              setLines(i, 1);
              states[i] = "settled";
            }
          });

          if (bar) gsap.set(bar, { scaleX: clamp(position / (last - 1)), force3D: false });
          if (progress) gsap.set(progress, { opacity: clamp(1 - (position - (last - 1))), force3D: false });

          const nearest = Math.round(position);
          if (nearest !== active) {
            layers[active]?.removeAttribute("data-active");
            layers[nearest]?.setAttribute("data-active", "");
            active = nearest;
            if (count) count.textContent = pad(Math.min(nearest, last - 1) + 1);
          }
        };

        measureLines();
        apply(0);

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onRefresh: () => {
              measureLines();
              apply(proxy.p);
            },
          },
        });
        timeline.to(proxy, { p: 1, duration: 1, onUpdate: () => apply(proxy.p) }, 0);

        // Entry: the intro and first quote establish themselves as the section arrives (skipped if already on screen).
        // These tween the quote container, not the words/layer the scroll driver owns.
        if (!inView(wrapper, 0.7)) {
          const first = layers[0];
          const parts = [intro, first?.querySelector("[data-tm='quote']"), first?.querySelector("[data-tm='who']")];
          gsap.from(
            parts.filter((el): el is Element => Boolean(el)),
            {
              y: 36,
              autoAlpha: 0,
              duration: 1.3,
              ease: "expo.out",
              stagger: 0.14,
              scrollTrigger: { trigger: wrapper, start: "top 70%", once: true },
            },
          );
        }

        // Webfont swaps change line breaks; re-measure once fonts are in.
        void document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());

        return () => {
          layers.forEach((layer, i) =>
            i === 0 ? layer.setAttribute("data-active", "") : layer.removeAttribute("data-active"),
          );
          if (count) count.textContent = "01";
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
