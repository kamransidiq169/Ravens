import type { JourneyLayout } from "./journey";

/**
 * Mutable bridge between the DOM timeline (writer) and the WebGL scene (reader). It is deliberately not React state:
 * the scene samples it inside its own render loop, so scrolling never causes a React render.
 */
export const journeyStore: { progress: number; layout: JourneyLayout } = {
  progress: 0,
  layout: { compact: false },
};

/**
 * Whether the stage has reached its closing phase (BESPOKE and the release after it), where the only thing on screen is
 * the title. Unlike `journeyStore` this IS subscribable, because it drives which scenes exist at all: the 3D scenes of
 * the earlier phases are unmounted (not just hidden) once it is true. It changes only when a phase boundary is
 * crossed, never per frame.
 */
const closingListeners = new Set<() => void>();
let closing = false;

export const closingPhase = {
  get: () => closing,
  set(next: boolean) {
    if (next === closing) return;
    closing = next;
    closingListeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    closingListeners.add(listener);
    return () => closingListeners.delete(listener);
  },
};
