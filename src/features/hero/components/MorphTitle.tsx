import type { ComponentProps } from "react";

/**
 * The Phase 5 title as one line of individual characters, ready to be deformed by the scroll timeline
 * (hooks/useJourney.ts writes each `[data-j="morph-char"]`'s transform from lib/morph.ts; nothing here is stateful).
 *
 * The finished, undeformed line is the server HTML, so it is also what reduced motion / no-script users get. The
 * characters are hidden from assistive technology and the text is announced once, from the visually hidden copy.
 * Spaces are characters too (inline-block, `white-space: pre`), so the line stays a single object about its centre.
 */
export function MorphTitle({ text, ...rest }: { text: string } & ComponentProps<"h2">) {
  return (
    <h2 {...rest}>
      <span className="sr-only">{text}</span>
      <span className="journey__morph" aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span key={i} className="journey__morph-char" data-j="morph-char">
            {char}
          </span>
        ))}
      </span>
    </h2>
  );
}
