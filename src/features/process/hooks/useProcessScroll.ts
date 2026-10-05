import { useEffect, type RefObject } from "react";

import { STAGES, processAt } from "../lib/process.motion";

// matchMedia only runs its callback when at least one named condition matches, so both sides are listed.
const CONDITIONS = { compact: "(max-width: 767px)", wide: "(min-width: 768px)" };

/**
 * How much of a viewport the film keeps playing after the sticky stage has been released. The raven leaves on the
 * film's last frames; if the film ended exactly at the release, the stage would scroll away empty (a blank screen)
 * before the next section arrived. Ending the film this far past the release lets the exit play while the stage
 * rises and the following section is already coming in beneath it.
 */
const RELEASE_OVERLAP = 0.7;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Scroll-drives the process film. One timeline, one ScrollTrigger on the shared GSAP instance, no pin (the stage is
 * `position: sticky` inside a tall wrapper) and no second Lenis: the site's provider already feeds ScrollTrigger.
 *
 * The timeline only carries a 0 → 1 proxy; each tick `processAt` is evaluated and applied with transforms, opacity and
 * clip-path. Measurements are read on refresh, never per frame. GSAP is code-split, everything is reverted on unmount
 * (Strict Mode safe), and nothing runs under reduced motion — the CSS shows the stacked layout instead.
 */
export function useProcessScroll(root: RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const wrapper = root.current;
    if (!wrapper || reduced) return;

    const q = <T extends HTMLElement>(selector: string) => wrapper.querySelector<T>(selector);
    const all = (selector: string, within: ParentNode = wrapper) =>
      Array.from(within.querySelectorAll<HTMLElement>(selector));

    const stage = q("[data-p='stage']");
    const back = q("[data-p='rig-back']");
    const front = q("[data-p='rig-front']");
    const guides = q("[data-p='guides']");
    const guideH = q("[data-p='guide-h']");
    const guideV = q("[data-p='guide-v']");
    const glow = q("[data-p='glow']");
    const feathers = q("[data-p='feathers']");
    const tint = q("[data-p='tint']");
    const bar = q("[data-p='bar']");
    const meta = q("[data-p='meta']");
    const whisper = q("[data-p='whisper']");
    const intro = q("[data-p='intro-title']");
    const introCopy = all("[data-p='intro-copy']");
    const introLines = all("[data-p='intro-line']");
    const words = all("[data-p='word']");
    const twins = all("[data-p='word-front']");
    const descs = all("[data-p='desc']");
    const nums = all("[data-p='num']");
    const names = all("[data-p='name']");
    const letters = words.map((word) => all("[data-p='letter']", word));
    const twinLetters = twins.map((twin) => all("[data-p='letter-front']", twin));
    if (
      !stage ||
      !back ||
      !front ||
      !guides ||
      !guideH ||
      !guideV ||
      !glow ||
      !tint ||
      !bar ||
      !meta ||
      !whisper ||
      !feathers
    )
      return;
    if (!intro || introLines.length !== 3 || words.length !== STAGES || twins.length !== STAGES) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("@/lib/gsap").then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;

      const mm = gsap.matchMedia();
      mm.add(CONDITIONS, (context) => {
        const layout = { compact: Boolean(context.conditions?.compact) };

        let stageW = stage.clientWidth;
        let stageH = stage.clientHeight;
        let rigW = back.offsetWidth;
        let rigH = back.offsetHeight;
        let fontPx = parseFloat(getComputedStyle(words[0] ?? stage).fontSize);
        let active = -2;
        const letterKey = words.map(() => "");
        const proxy = { p: 0 };

        gsap.set([back, front], { xPercent: -50, yPercent: -50, transformPerspective: 1600 });
        gsap.set([guideH, guideV], { force3D: false });

        const applyLetters = (
          i: number,
          spread: number,
          exit: number,
          f: { amount: number; line: number; dir: 1 | -1 },
        ) => {
          const key = `${Math.round(spread * 2000)}|${Math.round(exit * 400)}|${Math.round(f.amount * 200)}|${Math.round(f.line * 200)}|${f.dir}`;
          if (letterKey[i] === key) return;
          letterKey[i] = key;

          const base = letters[i] ?? [];
          const twin = twinLetters[i] ?? [];
          const n = base.length;
          const mid = (n - 1) / 2;
          base.forEach((letter, j) => {
            // Each letter breaks away on its own beat and its own side, so the word comes apart rather than fading.
            const weight = 0.5 + ((j * 5 + 3) % n) / Math.max(1, n - 1);
            const side = j % 2 ? -1 : 1;
            const fade = clamp01(1 - exit * 1.4 * weight);
            const pose = {
              x: (j - mid) * spread * fontPx,
              y: exit * stageH * 0.3 * weight * side,
              rotation: exit * 9 * weight * side,
            };
            // One copy per letter at a time: both are difference-blended, so overlapping twins would invert each other.
            let inFront = 0;
            const twinLetter = twin[j];
            if (twinLetter) {
              const pos = (j + 0.5) / n;
              const across = f.dir === 1 ? (f.line - pos) / 0.12 + 0.5 : (pos - f.line) / 0.12 + 0.5;
              inFront = f.amount * smooth(clamp01(across));
              gsap.set(twinLetter, { ...pose, opacity: inFront * fade });
            }
            gsap.set(letter, { ...pose, opacity: (1 - inFront) * fade });
          });
        };

        const apply = (p: number) => {
          const s = processAt(p, layout);

          // Intro: the statement drifts up and swells; the camera pushes into it, the lines split apart.
          gsap.set(intro, { y: s.intro.y * stageH, scale: s.intro.scale, opacity: s.intro.opacity, force3D: false });
          gsap.set(introCopy, { opacity: s.intro.copy, y: (1 - s.intro.copy) * -24 });
          // The loose feathers leave with the headline. Their fall is ambient CSS, independent of this timeline.
          gsap.set(feathers, { opacity: s.feathers.opacity });
          const [top, mid, bottom] = introLines;
          if (top && mid && bottom) {
            // Lines live inside the scaled title, so convert stage-height fractions back into its coordinate space.
            const unit = stageH / s.intro.scale;
            gsap.set(top, { y: s.intro.split.top * unit });
            gsap.set(bottom, { y: s.intro.split.bottom * unit });
            gsap.set(mid, { opacity: s.intro.split.middle });
          }

          // Raven: both copies take the same numbers, so the wing piece in front always lines up with the bird behind.
          const body = {
            x: s.rig.x * rigW,
            y: s.rig.y * rigH,
            scale: s.rig.scale,
            scaleX: s.rig.scaleX,
            rotation: s.rig.rotate,
            rotationX: s.rig.tiltX,
            rotationY: s.rig.yaw,
          };
          gsap.set(back, { ...body, opacity: s.rig.opacity });
          gsap.set(front, { ...body, opacity: s.rig.opacity * s.front });

          // Type: the real word and its twin share every transform.
          words.forEach((word, i) => {
            const w = s.words[i];
            const twin = twins[i];
            if (!w || !twin) return;
            const pose = {
              x: w.x * stageW,
              y: w.y * stageH,
              scale: w.scale,
              scaleX: w.scaleX,
              opacity: w.opacity,
              force3D: false,
              clipPath: `inset(${(1 - w.open) * 50}% 0% ${(1 - w.open) * 50}% 0%)`,
            };
            gsap.set([word, twin], pose);
            if (w.opacity > 0.001 || letterKey[i] !== "") applyLetters(i, w.spread, w.exit, w.front);

            const desc = descs[i];
            if (desc) gsap.set(desc, { opacity: w.caption, y: (1 - w.caption) * 14 });
          });

          gsap.set(guides, { opacity: s.guides });
          gsap.set(guideH, { scaleX: s.guides });
          gsap.set(guideV, { scaleY: s.guides });
          gsap.set(whisper, { opacity: s.whisper, y: (1 - s.whisper) * 10 });
          gsap.set(glow, { x: (s.glow.x - 0.5) * stageW * 0.5, opacity: s.glow.opacity });
          gsap.set(tint, { opacity: s.tint });
          gsap.set(meta, { opacity: s.meta });
          gsap.set(bar, { scaleX: s.progress });

          if (s.active !== active) {
            active = s.active;
            wrapper.dataset.active = String(active);
            nums.forEach((num, i) => gsap.set(num, { yPercent: (i - active) * 100, opacity: i === active ? 1 : 0 }));
            names.forEach((name, i) => gsap.set(name, { yPercent: (i - active) * 100, opacity: i === active ? 1 : 0 }));
          }
        };

        const measure = () => {
          stageW = stage.clientWidth;
          stageH = stage.clientHeight;
          rigW = back.offsetWidth;
          rigH = back.offsetHeight;
          fontPx = parseFloat(getComputedStyle(words[0] ?? stage).fontSize);
          letterKey.fill("");
        };

        apply(0);

        const tween = gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: () => apply(proxy.p),
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            end: () => `bottom bottom-=${Math.round(window.innerHeight * RELEASE_OVERLAP)}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onToggle: (self) => wrapper.classList.toggle("is-live", self.isActive),
            onRefresh: () => {
              measure();
              apply(proxy.p);
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          wrapper.classList.remove("is-live");
          delete wrapper.dataset.active;
        };
      });

      teardown = () => mm.revert();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [root, reduced]);
}
