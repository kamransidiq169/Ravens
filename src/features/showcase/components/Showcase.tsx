import { AccentTitle } from "@/features/hero";

import type { Project } from "@/types/domain/project";

/**
 * The featured-project chapter: an oversized title with its supporting paragraph beneath. It is the second half of the
 * hero's sticky stage (features/hero), which reveals it on scroll through the `data-j` hooks below. The jellyfish stays
 * the visual; there are deliberately no cards, borders or buttons here.
 */
export function Showcase({ project }: { project: Project }) {
  return (
    <section aria-labelledby="showcase-heading" className="journey__chapter">
      <h2 id="showcase-heading" className="journey__title journey__title--line" data-j="title">
        <AccentTitle text="Built from possibility." />
      </h2>

      <div className="journey__copy">
        <p className="journey__lede" data-j="lede">
          {project.summary}
        </p>
      </div>
    </section>
  );
}
