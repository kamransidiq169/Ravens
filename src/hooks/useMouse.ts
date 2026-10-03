import { useEffect, useRef, type RefObject } from "react";

export interface MouseState {
  /** Pixels from the viewport's top-left. */
  x: number;
  y: number;
  /** Normalised to -1…1 from the viewport centre. */
  nx: number;
  ny: number;
}

/**
 * Tracks the pointer without re-rendering: read `ref.current` inside rAF / GSAP tickers.
 */
export function useMouse(): RefObject<MouseState> {
  const state = useRef<MouseState>({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      state.current = {
        x: event.clientX,
        y: event.clientY,
        nx: (event.clientX / window.innerWidth) * 2 - 1,
        ny: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return state;
}
