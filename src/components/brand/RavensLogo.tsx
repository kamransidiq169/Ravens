import type { SVGProps } from "react";

/**
 * RAVENS wordmark as hairline strokes. The "A" is drawn as a crossbar-less Λ.
 * Colour follows `currentColor`.
 */
export function RavensLogo({ title = "Ravens", ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 284 60"
      role="img"
      aria-label={title}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinejoin="miter"
      strokeLinecap="butt"
      {...props}
    >
      {/* R */}
      <path d="M5 57V4h18a14 14 0 0 1 0 28H5M22 32l13 25" />
      {/* Λ — no crossbar */}
      <path d="M52 57L72 4l20 53" />
      {/* V */}
      <path d="M104 4l20 53 20-53" />
      {/* E */}
      <path d="M190 4h-30v53h30M160 30h26" />
      {/* N */}
      <path d="M204 57V4l31 53V4" />
      {/* S */}
      <path d="M277 13C272 5 249 3 249 18c0 14 28 11 28 25 0 15-24 14-29 5" />
    </svg>
  );
}
