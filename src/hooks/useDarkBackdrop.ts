import { useEffect, useState } from "react";

/** Sections that paint a dark background mark themselves with this attribute so fixed chrome can switch to light ink. */
const DARK_BACKDROP_ATTR = "data-header-theme";

/**
 * True while an element marked `data-header-theme="dark"` sits under the top band of the viewport (where the fixed
 * header is). Re-scans on `deps` changes, e.g. the pathname, since each route brings its own sections.
 */
export function useDarkBackdrop(deps: unknown): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const targets = document.querySelectorAll(`[${DARK_BACKDROP_ATTR}="dark"]`);
    const covering = new Set<Element>();
    // The root is a thin band at the top of the viewport: the header's own strip.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) covering.add(entry.target);
          else covering.delete(entry.target);
        }
        setDark(covering.size > 0);
      },
      { rootMargin: "0px 0px -94% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      // Leaving the route: its dark sections are gone, so start the next one light-backed.
      setDark(false);
    };
  }, [deps]);

  return dark;
}
