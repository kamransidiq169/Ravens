import type { SVGProps } from "react";

/** Small decorative mark: a stylised raven wing built from three feather strokes. */
export function RavenAccent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 36C14 34 22 26 26 10c4 8 10 12 18 12-6 2-10 6-12 12" />
      <path d="M12 38c8-1 14-6 18-14" />
      <path d="M22 40c5-1 9-4 12-9" />
    </svg>
  );
}
