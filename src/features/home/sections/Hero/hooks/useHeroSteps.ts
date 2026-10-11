import type Lenis from "lenis";
import { useEffect, type RefObject } from "react";

import {
  COMPACT_QUERY,
  HERO_STOPS,
  JOURNEY_TRIGGER,
  SELECTED_WORK_TRIGGER,
  startsNewGesture,
  stepDuration,
  stepFrom,
  type StepDirection,
} from "../animation/steps";

/** Finger travel that counts as a swipe, and the longest a scroll may keep counting as the user's own after their last input (it ends sooner, when Lenis comes to rest). */
const SWIPE_PX = 24;
const INPUT_WINDOW_MS = 5000;
const WHEEL_NOISE = 2;
const EDGE = 2;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const KEYS: Record<string, StepDirection> = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };

/**
 * One user intent = one hero state. The hero stays what it was (one ScrollTrigger scrubbing `sequenceAt` from the page
 * scroll position); this only decides HOW the scroll position moves while the hero owns the page:
 *
 *   wheel / swipe / key  →  one intent  →  one Lenis.scrollTo to the next resting state  →  unlock on its onComplete
 *
 * The scrub therefore plays the same choreography at any input speed, a flick cannot cross several states, and the last
 * state hands off to Selected Work's first project in the same single move. The hero owns the page range
 * [first state … Selected Work start]; outside it nothing is intercepted and Lenis scrolls as before. Listeners live on
 * `window` (capture, attached once) and keep their state in closures: no React state, no RAF of its own.
 */
export function useHeroSteps(root: RefObject<HTMLElement | null>, reduced: boolean, lenis: Lenis | null) {
  useEffect(() => {
    const wrapper = root.current;
    if (!wrapper || reduced || !lenis) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void import("@/lib/gsap").then(({ ScrollTrigger }) => {
      if (cancelled) return;

      let locked = false;
      // After a transition (or an entry stop) the rest of the same gesture is swallowed until a new gesture begins.
      let stale = false;
      let lastWheelAt = 0;
      let lastWheelMagnitude = 0;
      // Whether the current wheel gesture began inside the hero: one that began outside is only ever stopped at the edge.
      let gestureInside = false;
      let lastInputAt = -Infinity;
      let lastScroll = lenis.scroll;
      let touchY = 0;
      let touchSpent = false;

      /** Resting states in page pixels, from the live triggers (no DOM reads); the last is Selected Work's first project. */
      const stopsNow = () => {
        const journey = ScrollTrigger.getById(JOURNEY_TRIGGER);
        if (!journey) return null;
        const length = journey.end - journey.start;
        const stops: number[] = HERO_STOPS.map((p) => journey.start + length * p);
        stops.push(ScrollTrigger.getById(SELECTED_WORK_TRIGGER)?.start ?? journey.end);
        return stops;
      };

      /** Whether the hero owns a gesture in `direction` from here; at either end the page scrolls normally again. */
      const owns = (direction: StepDirection, stops: number[]) => {
        const first = stops[0] ?? 0;
        const last = stops[stops.length - 1] ?? 0;
        const y = lenis.scroll;
        return direction === 1 ? y >= first - EDGE && y < last - EDGE : y > first + EDGE && y <= last + EDGE;
      };

      const go = (direction: StepDirection, stops: number[]) => {
        const target = stepFrom(stops, lenis.scroll, direction, EDGE);
        if (target === null) return;
        locked = true;
        lenis.scrollTo(target, {
          duration: stepDuration(target - lenis.scroll, window.innerHeight, window.matchMedia(COMPACT_QUERY).matches),
          easing: easeInOut,
          force: true,
          lock: true,
          onComplete: () => {
            locked = false;
            stale = true;
          },
        });
      };

      const onWheel = (event: WheelEvent) => {
        lastInputAt = event.timeStamp;
        const magnitude = Math.abs(event.deltaY);
        const fresh = startsNewGesture(event.timeStamp - lastWheelAt, magnitude, lastWheelMagnitude);
        lastWheelAt = event.timeStamp;
        lastWheelMagnitude = magnitude;

        const stops = stopsNow();
        if (event.ctrlKey || !stops) return;
        const direction: StepDirection = event.deltaY > 0 ? 1 : -1;

        // Momentum of a gesture that is being (or just was) handled: consumed, so neither Lenis nor the browser sees it.
        if (locked || (stale && !fresh)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        stale = false;
        if (fresh) gestureInside = owns(direction, stops);
        if (magnitude < WHEEL_NOISE || !gestureInside || !owns(direction, stops)) return;

        event.preventDefault();
        event.stopPropagation();
        go(direction, stops);
      };

      const onTouchStart = (event: TouchEvent) => {
        lastInputAt = event.timeStamp;
        touchY = event.touches[0]?.clientY ?? 0;
        touchSpent = false;
      };

      const onTouchMove = (event: TouchEvent) => {
        lastInputAt = event.timeStamp;
        const stops = stopsNow();
        const delta = touchY - (event.touches[0]?.clientY ?? touchY); // finger up = page down
        if (!stops) return;
        const direction: StepDirection = delta > 0 ? 1 : -1;
        if (!touchSpent && !locked && (delta === 0 || !owns(direction, stops))) return;

        // Native scrolling and its momentum are replaced by the stepper for the whole gesture, even once it has been spent.
        if (event.cancelable) event.preventDefault();
        if (locked || touchSpent || Math.abs(delta) < SWIPE_PX) return;
        touchSpent = true;
        go(direction, stops);
      };

      const onTouchEnd = (event: TouchEvent) => {
        lastInputAt = event.timeStamp;
      };

      const onKeyDown = (event: KeyboardEvent) => {
        const direction = KEYS[event.key];
        const target = event.target as HTMLElement | null;
        if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
        if (target?.closest("input, textarea, select, [contenteditable]")) return;
        const stops = stopsNow();
        if (!stops || !owns(direction, stops)) return;
        lastInputAt = event.timeStamp;
        event.preventDefault();
        if (!locked && !event.repeat) go(direction, stops);
      };

      // Entry: a scroll that reaches the hero's first state (from above) or Selected Work's first project (from below)
      // with momentum is stopped exactly there, so incoming velocity never decides which state the user lands in.
      const onScroll = () => {
        const y = lenis.scroll;
        const previous = lastScroll;
        lastScroll = y;
        if (!lenis.isScrolling) lastInputAt = -Infinity;
        if (locked || performance.now() - lastInputAt > INPUT_WINDOW_MS) return;
        const stops = stopsNow();
        if (!stops) return;
        const first = stops[0] ?? 0;
        const last = stops[stops.length - 1] ?? 0;
        const intoHero = previous <= first + EDGE && y > first + EDGE && y < last - EDGE;
        const intoWork = previous >= last - EDGE && y < last - EDGE;
        if (!intoHero && !intoWork) return;
        stale = true;
        lastScroll = intoHero ? first : last;
        lenis.scrollTo(lastScroll, { immediate: true, force: true });
      };

      const active = { capture: true, passive: false } as const;
      const passive = { capture: true, passive: true } as const;
      window.addEventListener("wheel", onWheel, active);
      window.addEventListener("touchstart", onTouchStart, passive);
      window.addEventListener("touchmove", onTouchMove, active);
      window.addEventListener("touchend", onTouchEnd, passive);
      window.addEventListener("keydown", onKeyDown, active);
      const stopScroll = lenis.on("scroll", onScroll);

      teardown = () => {
        window.removeEventListener("wheel", onWheel, active);
        window.removeEventListener("touchstart", onTouchStart, passive);
        window.removeEventListener("touchmove", onTouchMove, active);
        window.removeEventListener("touchend", onTouchEnd, passive);
        window.removeEventListener("keydown", onKeyDown, active);
        stopScroll();
      };
    });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [root, reduced, lenis]);
}
