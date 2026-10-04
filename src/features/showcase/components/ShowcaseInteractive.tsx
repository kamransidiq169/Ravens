import { OrbArt } from "@/features/hero";

import { Button } from "@/components/ui/Button";

import { interactiveChapter as chapter } from "../showcase.config";

/**
 * The third chapter of the hero's sticky stage: a thin, oversized title with the gold sphere, platform and fragments
 * behind it (rendered by the hero's WebGL scene). Revealed on scroll through the `data-j` hooks below.
 */
export function ShowcaseInteractive() {
  return (
    <section aria-labelledby="interactive-heading" className="journey__chapter">
      {/* Still composition for reduced motion / no scripts; hidden while the stage animates (see hero.css). */}
      <div className="journey__static-art">
        <OrbArt />
      </div>

      <h2 id="interactive-heading" className="journey__title journey__title--line" data-j="title-next">
        {chapter.title}
      </h2>

      <div className="journey__meta">
        <div className="journey__meta-left" data-j="meta-next">
          <span className="journey__pill">{chapter.category}</span>
          <p className="journey__kicker">{chapter.disciplines}</p>
        </div>

        <div className="journey__meta-center" data-j="meta-next">
          <Button href={chapter.href} arrow className="journey__cta">
            View project
          </Button>
        </div>

        <div className="journey__meta-right" data-j="meta-next">
          <p className="journey__project-name">{chapter.name}</p>
          <p className="journey__summary">{chapter.summary}</p>
        </div>
      </div>
    </section>
  );
}
