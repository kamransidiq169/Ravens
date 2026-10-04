import { useId } from "react";

/**
 * Still version of the Phase 5 geometry (the rest pose of the loop): nested rounded diamonds in deep navy, with
 * royal-blue to lavender outlines and a small sphere at the centre. It is the no-WebGL stand-in inside the stage and
 * the composed static state under reduced motion / without scripts (see `.journey__static-art`). Static: no animation.
 * Proportions follow the shader: forms grow by 1.5x, outline width is 20% of the half-size, corners are rounded.
 */
const G = 1.5;
/** Half-size of the smallest drawn form, in the 1000-unit viewBox (the shader's 0.052 stage heights). */
const B0 = 52;
const FORMS = [-3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => B0 * G ** i);

export function KineticArt() {
  // Unique per instance: the art can appear twice on a page, and gradients inside a display:none copy do not render.
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const outer = FORMS[FORMS.length - 1]!;
  return (
    <svg className="kinetic-art" viewBox="-500 -500 1000 1000" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`kinetic-stroke-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a45e0" />
          <stop offset="0.55" stopColor="#b9b0ff" />
          <stop offset="1" stopColor="#e6e0ff" />
        </linearGradient>
        <radialGradient id={`kinetic-navy-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#04071f" />
          <stop offset="1" stopColor="#0a1244" />
        </radialGradient>
        <radialGradient id={`kinetic-core-${id}`} cx="36%" cy="32%" r="70%">
          <stop offset="0" stopColor="#e6e0ff" />
          <stop offset="0.5" stopColor="#b9b0ff" />
          <stop offset="1" stopColor="#2a45e0" />
        </radialGradient>
      </defs>
      <g transform="rotate(45)">
        <rect
          x={-outer}
          y={-outer}
          width={outer * 2}
          height={outer * 2}
          rx={outer * 0.16}
          fill={`url(#kinetic-navy-${id})`}
          opacity="0.9"
        />
        {FORMS.map((b, i) => (
          <rect
            key={i}
            x={-b}
            y={-b}
            width={b * 2}
            height={b * 2}
            rx={b * 0.16}
            fill="none"
            stroke={`url(#kinetic-stroke-${id})`}
            strokeWidth={b * 0.2}
          />
        ))}
      </g>
      <circle r="20" fill={`url(#kinetic-core-${id})`} />
    </svg>
  );
}
