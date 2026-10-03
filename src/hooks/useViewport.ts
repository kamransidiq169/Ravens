import { useSyncExternalStore } from "react";

export interface Viewport {
  width: number;
  height: number;
}

const SERVER_VIEWPORT: Viewport = { width: 1440, height: 900 };
let cached: Viewport = SERVER_VIEWPORT;

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

// useSyncExternalStore needs a referentially stable snapshot between changes.
function getSnapshot(): Viewport {
  if (cached.width !== window.innerWidth || cached.height !== window.innerHeight) {
    cached = { width: window.innerWidth, height: window.innerHeight };
  }
  return cached;
}

export function useViewport(): Viewport {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_VIEWPORT);
}
