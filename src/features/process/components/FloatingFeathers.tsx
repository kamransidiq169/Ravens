import type { CSSProperties } from "react";

/**
 * Loose feathers falling slowly through the air. Each one descends continuously from where it starts, leaves through
 * the bottom of the stage, and is repositioned ABOVE the stage while it is fully out of sight, so the loop never shows a
 * jump. The fall is ambient CSS (transform only), independent of the scroll timeline: it keeps going when the page is
 * still. Every feather has its own speed, wind, spin and sway, so nothing moves in step.
 *
 * Geometry: a feather's `top` is its starting height (svh). Its fall runs from `-(y + MARGIN)` to `100 - y + MARGIN`
 * (svh), so both ends of the loop lie beyond the stage by MARGIN, more than a feather is tall. A negative delay puts it
 * at its starting height on the first frame.
 */
interface Feather {
  /** Starting position in the stage (%), size (em of the layer), resting rotation (deg). */
  x: number;
  y: number;
  size: number;
  rotate: number;
  /** 0 = far (small, faint, slow), 1 = near. */
  depth: number;
  /** Seconds for one full fall (the nearer, the faster), sideways wind over the fall (em) and spin over it (deg). */
  fallS: number;
  wind: number;
  spin: number;
  /** A small, slow sway about the quill (deg) and its period (s). */
  sway: number;
  swayS: number;
}

/** How far beyond the stage the loop's two ends lie (svh): more than the tallest feather, so the reset is unseen. */
const MARGIN = 24;

// Asymmetric on purpose. Left of the bird, below it, lower right, and one far one high up.
const FEATHERS: readonly Feather[] = [
  { x: 30, y: 20, size: 4.4, rotate: -32, depth: 0.5, fallS: 54, wind: -2.6, spin: 34, sway: 4, swayS: 7.1 },
  { x: 41, y: 37, size: 3.1, rotate: 24, depth: 0.3, fallS: 72, wind: 1.8, spin: -26, sway: 5, swayS: 9.3 },
  { x: 49, y: 62, size: 5.4, rotate: -14, depth: 0.9, fallS: 41, wind: -1.2, spin: 18, sway: 3, swayS: 6.2 },
  { x: 63, y: 72, size: 3.8, rotate: 38, depth: 0.7, fallS: 47, wind: 3.2, spin: -40, sway: 4, swayS: 8.4 },
  { x: 73, y: 50, size: 2.8, rotate: -52, depth: 0.35, fallS: 66, wind: -3.4, spin: 28, sway: 6, swayS: 10.2 },
  { x: 61, y: 84, size: 4.6, rotate: 16, depth: 0.85, fallS: 44, wind: 2.2, spin: -16, sway: 3, swayS: 5.8 },
  { x: 55, y: 11, size: 2.1, rotate: 62, depth: 0.15, fallS: 84, wind: 1.4, spin: 22, sway: 5, swayS: 11.6 },
];

/** One feather: a curved vane with the quill running through it and a few barb cuts, drawn as a single silhouette. */
function FeatherShape() {
  return (
    <svg viewBox="0 0 40 200" focusable="false" aria-hidden="true">
      <path
        d="M21 2 C35 36 40 96 26 168 C24 178 22 188 20.5 198 L19.5 198 C19 186 17 176 15 166 C3 98 8 38 21 2 Z"
        fill="currentColor"
      />
      <path d="M20 8 L20.2 199" stroke="#7480b0" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      <g stroke="#7480b0" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.6">
        <path d="M20 40 L8 56" />
        <path d="M20 40 L33 54" />
        <path d="M20 78 L6 98" />
        <path d="M20 78 L36 96" />
        <path d="M20 118 L9 140" />
        <path d="M20 118 L33 138" />
      </g>
    </svg>
  );
}

export function FloatingFeathers({ className }: { className?: string }) {
  return (
    <div className={className ? `proc__feathers ${className}` : "proc__feathers"} aria-hidden="true">
      {FEATHERS.map((f, i) => {
        // Where in its fall the feather starts, so it begins on the first frame exactly where it is placed.
        const phase = (f.y + MARGIN) / (100 + 2 * MARGIN);
        return (
          <span
            key={i}
            className="feather"
            style={
              {
                "--x": `${f.x}%`,
                "--y": f.y,
                "--m": MARGIN,
                "--size": `${f.size}em`,
                "--rot": `${f.rotate}deg`,
                "--depth": f.depth,
                "--fall-s": `${f.fallS}s`,
                "--fall-delay": `${(-f.fallS * phase).toFixed(2)}s`,
                "--wind": `${f.wind}em`,
                "--spin": `${f.spin}deg`,
                "--sway": `${f.sway}deg`,
                "--sway-s": `${f.swayS}s`,
              } as CSSProperties
            }
          >
            <span className="feather__fall">
              <span className="feather__sway">
                <FeatherShape />
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
