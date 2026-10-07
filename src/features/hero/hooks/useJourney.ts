import { useEffect, type RefObject } from "react";

import {
  CHAPTERS_SHARE,
  EXT,
  FIVE_SHARE,
  FOUR_SHARE,
  INTRO_SHARE,
  sequenceAt,
  type JourneyPhase,
} from "../lib/journey";
import { closingPhase, journeyStore } from "../lib/journey.store";
import { morphChar, morphScale } from "../lib/morph";

// matchMedia only runs its callback when at least one named condition matches, so both sides are listed.
const CONDITIONS = { compact: "(max-width: 767px)", wide: "(min-width: 768px)" };

/**
 * Scroll-drives the hero → project sequence. One timeline, one ScrollTrigger, no pin: the stage is `position: sticky`
 * inside a tall wrapper (CSS), so the page keeps native scrolling and releases the stage by itself at the end.
 *
 * The timeline only carries a 0 → 1 proxy; each tick `sequenceAt` is evaluated and applied with transforms/opacity.
 * `stageHeight` is read on refresh, never per frame. GSAP is code-split, everything is reverted on unmount (Strict
 * Mode safe), and nothing runs under reduced motion — the CSS shows the stacked layout instead.
 */
/** `release` receives a function that scrolls a hidden chapter into view (used when keyboard focus enters it). */
export function useJourney(
  root: RefObject<HTMLElement | null>,
  reduced: boolean,
  release: RefObject<((chapter: "project" | "next" | "last" | "bespoke") => void) | null>,
) {
  useEffect(() => {
    const wrapper = root.current;
    if (!wrapper || reduced) return;

    const q = <T extends HTMLElement>(selector: string) => wrapper.querySelector<T>(selector);
    const all = (selector: string) => Array.from(wrapper.querySelectorAll<HTMLElement>(selector));
    const stage = q("[data-j='stage']");
    const headline = q("[data-j='headline']");
    const details = q("[data-j='details']");
    const title = q("[data-j='title']");
    const sprite = q("[data-j='sprite']");
    const orb = q("[data-j='orb']");
    const modules = q("[data-j='modules']");
    const stack = q("[data-j='stack']");
    const titleLast = q("[data-j='title-last']");
    const ledeLast = q("[data-j='lede-last']");
    const titleBespoke = q("[data-j='title-bespoke']");
    const ledeBespoke = q("[data-j='lede-bespoke']");
    const actionsBespoke = q("[data-j='actions-bespoke']");
    const morphChars = all("[data-j='morph-char']");
    const ledeHero = q("[data-j='lede-hero']");
    const ledeProject = q("[data-j='lede']");
    const titleNext = q("[data-j='title-next']");
    const ledeNext = q("[data-j='lede-next']");
    if (!stage || !headline || !title) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("@/lib/gsap").then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;

      const mm = gsap.matchMedia();
      mm.add(CONDITIONS, (context) => {
        const compact = Boolean(context.conditions?.compact);
        const layout = { compact };
        journeyStore.layout = layout;

        let stageHeight = stage.clientHeight;
        let phase: JourneyPhase | "" = "";
        // Last morph progress written to the characters: they are only touched while the morph is (or was just) running.
        let morphed = 0;
        const proxy = { p: 0 };

        // A supporting paragraph (or the closing actions) fades and rises with its own progress.
        const reveal = (el: HTMLElement | null, v: number) => {
          if (el) gsap.set(el, { opacity: v, y: (1 - v) * 24 });
        };

        const apply = (p: number) => {
          journeyStore.progress = p;
          const s = sequenceAt(p);

          gsap.set(headline, {
            scale: s.headline.scale,
            y: s.headline.y * stageHeight,
            opacity: s.headline.opacity,
            force3D: false,
          });
          if (details) gsap.set(details, { opacity: s.details });
          // The CSS-only jellyfish (first paint and no-WebGL fallback) follows the same curve as the 3D one.
          if (sprite) {
            gsap.set(sprite, {
              y: s.visual.y * stageHeight,
              scale: s.visual.scale,
              rotate: (s.visual.tilt * 180) / Math.PI,
              force3D: false,
            });
          }
          gsap.set(title, {
            scale: s.title.scale,
            y: s.title.y * stageHeight,
            opacity: s.title.opacity,
            force3D: false,
          });
          reveal(ledeHero, s.heroLede);
          reveal(ledeProject, s.lede);
          if (titleNext) {
            gsap.set(titleNext, {
              scale: s.next.title.scale,
              y: s.next.title.y * stageHeight,
              opacity: s.next.title.opacity,
              force3D: false,
            });
          }
          reveal(ledeNext, s.next.lede);
          if (modules) {
            // Phase 2 background: the scroll model decides when it is on stage and how far its modules have slid in.
            // The looping motion itself is CSS, so nothing here runs per module.
            const active = s.form.opacity > 0.002;
            if (modules.dataset.active !== String(active)) modules.dataset.active = String(active);
            gsap.set(modules, { opacity: s.form.opacity, "--form": s.form.t });
          }
          if (orb) gsap.set(orb, { opacity: s.next.scene, y: (1 - s.next.scene) * stageHeight * 0.4 });
          if (stack) gsap.set(stack, { opacity: s.last.scene, y: (1 - s.last.scene) * stageHeight * 0.4 });
          if (titleLast) {
            gsap.set(titleLast, {
              scale: s.last.title.scale,
              y: s.last.title.y * stageHeight,
              opacity: s.last.title.opacity,
              force3D: false,
            });
          }
          reveal(ledeLast, s.last.lede);
          if (titleBespoke) {
            // The title zooms about its centre; each character is deformed on top of that (lib/morph.ts).
            gsap.set(titleBespoke, {
              scale: s.bespoke.title.scale * morphScale(s.bespoke.morph, compact),
              y: s.bespoke.title.y * stageHeight,
              opacity: s.bespoke.title.opacity,
              force3D: false,
            });
          }
          reveal(ledeBespoke, s.bespoke.lede);
          reveal(actionsBespoke, s.bespoke.actions);
          if (s.bespoke.morph !== morphed) {
            morphed = s.bespoke.morph;
            morphChars.forEach((el, i) => {
              const c = morphChar(morphed, i, morphChars.length, compact);
              gsap.set(el, { scaleX: c.sx, scaleY: c.sy, xPercent: c.x, yPercent: c.y, force3D: false });
            });
          }

          if (s.phase !== phase) {
            phase = s.phase;
            wrapper.dataset.phase = phase;
            closingPhase.set(phase === "bespoke" || phase === "end");
          }
        };

        apply(0);

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.35,
            invalidateOnRefresh: true,
            onRefresh: () => {
              stageHeight = stage.clientHeight;
              apply(proxy.p);
            },
          },
        });
        timeline.to(proxy, { p: 1, duration: 1, onUpdate: () => apply(proxy.p) }, 0);

        // Keyboard focus can land on the (visually hidden) project links before the user has scrolled to them: jump to
        // the end of the sequence so what is focused is also what is shown.
        release.current = (chapter) => {
          const trigger = timeline.scrollTrigger;
          if (!trigger) return;
          // Where each chapter is fully settled, as a fraction of the whole sequence.
          const settled = {
            project: FIVE_SHARE * FOUR_SHARE * CHAPTERS_SHARE * INTRO_SHARE,
            next: FIVE_SHARE * FOUR_SHARE * CHAPTERS_SHARE * 0.985,
            last: FIVE_SHARE * FOUR_SHARE * 0.985,
            bespoke: FIVE_SHARE * (FOUR_SHARE + (1 - FOUR_SHARE) * EXT.actionsIn[1]),
          };
          const target = settled[chapter];
          if (Math.abs(proxy.p - target) < 0.04) return;
          const top = trigger.start + (trigger.end - trigger.start) * target;
          window.scrollTo({ top, behavior: "instant" });
        };

        return () => {
          release.current = null;
          journeyStore.progress = 0;
          delete wrapper.dataset.phase;
          closingPhase.set(false);
        };
      });

      teardown = () => mm.revert();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [root, reduced, release]);
}
