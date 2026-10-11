/**
 * Turns raw scroll input into discrete steps. Pure (no DOM, no GSAP), so the rules are unit-tested.
 *
 * A scrubbed film (Process, the phone Services sequence) stays a pure function of scroll position. The stepper only
 * decides *where the page may rest*: a list of waypoints, and a wheel/touch gesture may move the page from one waypoint
 * to the neighbouring one, never further. Outside the waypoint span the page scrolls normally.
 * `createStepper` (stepper-controller) wires these rules to the DOM.
 */

/** Pixels within which the page counts as being exactly on a waypoint. */
export const REST_TOLERANCE = 2;

/** Wheel events smaller than this never start a step (trackpad noise, momentum tail). */
export const MIN_WHEEL_DELTA = 8;
/** A pause this long in the wheel stream ends a gesture; the next event begins a new one. */
export const GESTURE_GAP_MS = 140;
/** Within a stream, an event this many times stronger than the one before it is a fresh swipe, not momentum. */
export const FRESH_SWIPE_RATIO = 1.6;
/** ...but only once the stream has decayed below this fraction of its peak, so a swipe's own ramp-up never counts. */
export const DECAYED_FRACTION = 0.7;
/** Finger travel that counts as an intentional swipe. */
export const MIN_SWIPE_PX = 28;
/** Safety net: a lock older than this is released even if the film never reported settling. */
export const MAX_LOCK_MS = 3500;

export type Direction = 1 | -1;

/** Scroll positions (px) of every waypoint for the current layout. */
export function waypointPositions(start: number, end: number, progress: readonly number[]): number[] {
  return progress.map((p) => Math.round(start + p * (end - start)));
}

/** Whether a gesture in `dir` is owned by the stepper at scroll position `y`, i.e. must not scroll the page itself. */
export function isEngaged(y: number, dir: Direction, waypoints: readonly number[]): boolean {
  const first = waypoints[0] ?? 0;
  const last = waypoints[waypoints.length - 1] ?? 0;
  // Going down: from the first waypoint up to (not including) the last. Going up: from the last down to (not
  // including) the first. Below the last and above the first the page scrolls freely, which is how the user enters and leaves the section.
  return dir === 1
    ? y >= first - REST_TOLERANCE && y < last - REST_TOLERANCE
    : y > first + REST_TOLERANCE && y <= last + REST_TOLERANCE;
}

/** Whether the page rests anywhere from the first to the last waypoint inclusive (the span the stepper owns, ends included). */
export function inSpan(y: number, waypoints: readonly number[]): boolean {
  const first = waypoints[0] ?? 0;
  const last = waypoints[waypoints.length - 1] ?? 0;
  return y >= first - REST_TOLERANCE && y <= last + REST_TOLERANCE;
}

/** The waypoint one step from `y` in `dir`, or null when there is none. Always the *adjacent* one. */
export function nextWaypoint(y: number, dir: Direction, waypoints: readonly number[]): number | null {
  if (dir === 1) return waypoints.find((w) => w > y + REST_TOLERANCE) ?? null;
  for (let i = waypoints.length - 1; i >= 0; i -= 1) {
    const w = waypoints[i]!;
    if (w < y - REST_TOLERANCE) return w;
  }
  return null;
}

/**
 * Where a page that has drifted between waypoints (momentum carrying it in from outside, a scrollbar drag, an anchor)
 * must settle: the waypoint it was travelling towards the section's inside from. Null when it is already at rest or
 * outside the engaged span.
 */
export function settleTarget(y: number, travel: Direction, waypoints: readonly number[]): number | null {
  const first = waypoints[0] ?? 0;
  const last = waypoints[waypoints.length - 1] ?? 0;
  if (y <= first + REST_TOLERANCE || y >= last - REST_TOLERANCE) return null;
  if (waypoints.some((w) => Math.abs(w - y) <= REST_TOLERANCE)) return null;
  if (travel === 1) {
    for (let i = waypoints.length - 1; i >= 0; i -= 1) if (waypoints[i]! < y) return waypoints[i]!;
    return null;
  }
  return waypoints.find((w) => w > y) ?? null;
}

export function normalizeWheelDelta(deltaY: number, deltaMode: number, pageHeight: number): number {
  if (deltaMode === 1) return deltaY * 16;
  if (deltaMode === 2) return deltaY * pageHeight;
  return deltaY;
}

/**
 * Wheel/trackpad gesture gate. Feed every wheel event; `start` is true at most once per gesture.
 * `continuing` marks events of a gesture that has already been spent (it started a step, or was ignored as busy): at the
 * edge of the span they must be swallowed too, or the tail of the swipe that just landed on DELIVER would scroll on into
 * the next section.
 *
 * One physical swipe produces a burst of events (and on Mac trackpads a long, decaying momentum tail). The burst is one
 * gesture: only its first sufficiently strong event may start a step, however large its delta is. A new gesture begins
 * after a pause in the stream, on a reversal of direction, or when an event is clearly stronger than the one before it
 * (a fresh swipe landing on top of dying momentum). Events that arrive while a transition runs are consumed by the
 * gesture, not queued, so the animation finishing never releases a step the user did not ask for.
 */
export function createWheelGate() {
  let lastTime = Number.NEGATIVE_INFINITY;
  let lastAbs = 0;
  let lastSign = 0;
  let peak = 0;
  let consumed = false;

  return {
    /** `delta` in px (see `normalizeWheelDelta`); `busy` = a transition is in flight. */
    push(delta: number, time: number, busy: boolean): { start: boolean; continuing: boolean } {
      const abs = Math.abs(delta);
      const sign = Math.sign(delta);
      const fresh =
        time - lastTime > GESTURE_GAP_MS ||
        (sign !== lastSign && abs >= MIN_WHEEL_DELTA) ||
        (abs >= MIN_WHEEL_DELTA && lastAbs < peak * DECAYED_FRACTION && abs > lastAbs * FRESH_SWIPE_RATIO);
      if (fresh) {
        consumed = false;
        peak = 0;
      }
      peak = Math.max(peak, abs);
      lastTime = time;
      lastAbs = abs;
      if (sign !== 0) lastSign = sign;

      if (consumed) return { start: false, continuing: true };
      if (abs < MIN_WHEEL_DELTA) return { start: false, continuing: false };
      consumed = true;
      return { start: !busy, continuing: false };
    },
    reset() {
      lastTime = Number.NEGATIVE_INFINITY;
      lastAbs = 0;
      lastSign = 0;
      peak = 0;
      consumed = false;
    },
  };
}
