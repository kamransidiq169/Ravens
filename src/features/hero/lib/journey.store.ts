import type { JourneyLayout } from "./journey";

/**
 * Mutable bridge between the DOM timeline (writer) and the WebGL scene (reader). It is deliberately not React state:
 * the scene samples it inside its own render loop, so scrolling never causes a React render.
 */
export const journeyStore: { progress: number; layout: JourneyLayout } = {
  progress: 0,
  layout: { compact: false },
};
