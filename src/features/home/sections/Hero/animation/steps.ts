import { SETTLED } from "./journey";

/** ScrollTrigger ids: the hero timeline, and the Selected Work gallery that follows it (see useSelectedWorkScroll). */
export const JOURNEY_TRIGGER = "hero-journey";
export const SELECTED_WORK_TRIGGER = "selected-work";

/** The hero's resting states as sequence progress (0 = headline). The last stop after these is Selected Work's first project. */
export const HERO_STOPS = [0, SETTLED.project, SETTLED.next, SETTLED.last, SETTLED.bespoke] as const;

export type StepDirection = 1 | -1;

/**
 * The stop one intent away: the nearest stop strictly beyond `position` in `direction`, or null at the ends. Derived from
 * where the page actually is (not from a counter), so a scrollbar drag, a focus jump or a resize can never desync it.
 * `tolerance` (px) is how close counts as "at" a stop.
 */
export function stepFrom(stops: readonly number[], position: number, direction: StepDirection, tolerance = 2) {
  if (direction === 1) return stops.find((stop) => stop > position + tolerance) ?? null;
  return [...stops].reverse().find((stop) => stop < position - tolerance) ?? null;
}

/** Seconds for a transition covering `distance` px at viewport height `viewport`: brisk, but long enough to read the choreography. */
export const stepDuration = (distance: number, viewport: number) =>
  Math.min(2.4, Math.max(1, (Math.abs(distance) / Math.max(viewport, 1)) * 0.42));

/**
 * Wheel/trackpad gestures arrive as a stream: a burst, then inertial events that decay for up to a second or more. After
 * a transition the tail of that stream must not start another one. A wheel event is the start of a NEW gesture when the
 * stream went quiet, or when it clearly re-accelerates (inertia only ever decays; the margin tolerates the browser coalescing events).
 */
export const GESTURE_GAP_MS = 140;
export function startsNewGesture(gapMs: number, magnitude: number, previousMagnitude: number) {
  return gapMs > GESTURE_GAP_MS || magnitude > previousMagnitude * 2.5 + 10;
}
