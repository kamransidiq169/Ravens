import { Button } from "@/components/ui/Button";

import type { Project } from "@/types/domain/project";

/**
 * The featured-project chapter: an oversized title, and three quiet groups along the bottom edge. It is the second half
 * of the hero's sticky stage (features/hero), which reveals it on scroll through the `data-j` hooks below. The
 * jellyfish stays the visual; there are deliberately no cards or borders here.
 */
export function Showcase({ project }: { project: Project }) {
  return (
    <section aria-labelledby="showcase-heading" className="journey__chapter">
      <h2 id="showcase-heading" className="journey__title journey__title--line" data-j="title">
        Built from possibility.
      </h2>

      <div className="journey__meta">
        <div className="journey__meta-left" data-j="meta">
          <span className="journey__pill">Website</span>
          <p className="journey__kicker">{project.disciplines.join(" / ")}</p>
        </div>

        <div className="journey__meta-center" data-j="meta">
          <Button href={`/work/${project.slug}`} arrow className="journey__cta">
            View project
          </Button>
        </div>

        <div className="journey__meta-right" data-j="meta">
          <p className="journey__project-name">{project.title}</p>
          <p className="journey__summary">{project.summary}</p>
        </div>
      </div>
    </section>
  );
}
