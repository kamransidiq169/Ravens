import type { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

import { gsap } from "@/lib/gsap";
import {
  MAX_LOCK_MS,
  MIN_SWIPE_PX,
  REST_TOLERANCE,
  createWheelGate,
  inSpan,
  isEngaged,
  nextWaypoint,
  normalizeWheelDelta,
  settleTarget,
  waypointPositions,
  type Direction,
} from "@/lib/stepper";

/** The film has caught up with the scroll position once it is this close (0–1) to the waypoint's progress. */
const SETTLED_PROGRESS = 0.004;

type VirtualScrollEvent = Event & { lenisStopPropagation?: boolean };

interface StepperOptions {
  /** The scrubbed ScrollTrigger the film follows. Read lazily: the controller is built before the trigger exists. */
  trigger: () => ScrollTrigger | undefined;
  /** Where the film is now (0–1, after scrub smoothing). Used to know when a transition has really finished. */
  filmProgress: () => number;
  /** Film progress (0–1) at which each step rests; first and last bound the span the stepper owns. */
  waypoints: readonly number[];
  /** The site's Lenis instance, if it has loaded. Read lazily. */
  lenis: () => Lenis | null;
  stepSeconds: number;
  settleSeconds: number;
}

/**
 * Makes a scrubbed film a discrete stepper: within the waypoint span, one wheel/touch gesture becomes one tween of the
 * page's scroll position to the adjacent waypoint, and the rest of that gesture (momentum included) is consumed. The
 * span's two ends are never intercepted for a gesture leaving it, so the page is never trapped. Pass the returned
 * `onRefresh` / `onUpdate` to the ScrollTrigger, and call `destroy` on cleanup.
 */
export function createStepper(options: StepperOptions) {
  const { trigger, filmProgress, lenis, stepSeconds, settleSeconds } = options;
  let waypoints: number[] = [];
  let stepTween: gsap.core.Tween | null = null;
  let settlingAt: number | null = null;
  let settlingY = 0;
  let lockedAt = 0;
  const gate = createWheelGate();

  const setScroll = (y: number) => {
    const instance = lenis();
    if (instance) instance.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  };

  /** A transition is in flight: the tween is running, or the film has not yet caught up with where it landed. */
  const busy = () => {
    if (stepTween) return true;
    // The tween has ended but the page is no longer where it landed (native momentum carried it on): the transition is
    // over, and holding the lock would swallow the next gesture and block settling.
    if (settlingAt !== null && Math.abs(window.scrollY - settlingY) > REST_TOLERANCE) settlingAt = null;
    if (
      settlingAt !== null &&
      (Math.abs(filmProgress() - settlingAt) < SETTLED_PROGRESS || performance.now() - lockedAt > MAX_LOCK_MS)
    )
      settlingAt = null;
    return settlingAt !== null;
  };

  const goTo = (self: ScrollTrigger, y: number, seconds: number) => {
    stepTween?.kill();
    settlingAt = (y - self.start) / (self.end - self.start);
    settlingY = y;
    lockedAt = performance.now();
    const cursor = { y: window.scrollY };
    stepTween = gsap.to(cursor, {
      y,
      duration: seconds,
      ease: "power2.inOut",
      onUpdate: () => setScroll(cursor.y),
      onComplete: () => {
        stepTween = null;
      },
    });
  };

  /** Stops the browser and Lenis from also scrolling for an event the stepper owns. */
  const own = (event: VirtualScrollEvent) => {
    if (event.cancelable) event.preventDefault();
    event.lenisStopPropagation = true;
  };

  const step = (dir: Direction) => {
    const self = trigger();
    const target = nextWaypoint(window.scrollY, dir, waypoints);
    if (self && target !== null) goTo(self, target, stepSeconds);
  };

  const onWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.deltaY === 0) return;
    const dir: Direction = event.deltaY > 0 ? 1 : -1;
    // Every wheel event feeds the gate, in or out of the section, so momentum that carries the page in is not
    // mistaken for a fresh gesture once it arrives.
    const delta = normalizeWheelDelta(event.deltaY, event.deltaMode, window.innerHeight);
    const { start, continuing } = gate.push(delta, event.timeStamp, busy());
    const y = window.scrollY;
    const engaged = isEngaged(y, dir, waypoints);
    // The rest of a swipe that already took its step is swallowed even where a fresh swipe would pass (the span's
    // ends), so one gesture never both steps and then scrolls out of the section.
    if (!engaged && !(continuing && inSpan(y, waypoints))) return;
    own(event);
    if (engaged && start) step(dir);
  };

  let touchFrom = 0;
  let touchDir: Direction | 0 = 0;
  let touchOwned = false;
  let touchSpent = false;

  const onTouchStart = (event: TouchEvent) => {
    touchFrom = event.touches[0]?.clientY ?? 0;
    touchDir = 0;
    touchOwned = false;
    touchSpent = false;
  };

  const onTouchMove = (event: TouchEvent) => {
    const dy = touchFrom - (event.touches[0]?.clientY ?? touchFrom);
    if (touchDir === 0) {
      if (Math.abs(dy) < 2) return;
      // Ownership is decided once, on the first move: calling preventDefault later cannot stop a scroll that began.
      touchDir = dy > 0 ? 1 : -1;
      touchOwned = isEngaged(window.scrollY, touchDir, waypoints);
    }
    if (!touchOwned) return;
    own(event);
    if (touchSpent || Math.abs(dy) < MIN_SWIPE_PX) return;
    touchSpent = true;
    if (!busy()) step(touchDir);
  };

  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

  return {
    onRefresh(self: ScrollTrigger) {
      // A resize moves the waypoints; a page resting on one follows it.
      const y = window.scrollY;
      const resting = waypoints.findIndex((w) => Math.abs(w - y) <= REST_TOLERANCE);
      waypoints = waypointPositions(self.start, self.end, options.waypoints);
      const moved = waypoints[resting];
      if (resting >= 0 && moved !== undefined && !busy()) setScroll(moved);
    },
    onUpdate(self: ScrollTrigger) {
      // Momentum, a scrollbar drag or an anchor can leave the page between waypoints: settle it on the one it came
      // from rather than letting the film play through.
      if (busy()) return;
      const target = settleTarget(self.scroll(), self.direction === 1 ? 1 : -1, waypoints);
      if (target !== null) goTo(self, target, settleSeconds);
    },
    destroy() {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      stepTween?.kill();
      gate.reset();
    },
  };
}
