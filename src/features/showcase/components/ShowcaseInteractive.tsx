import { AccentTitle, OrbArt } from "@/features/hero";

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
        <AccentTitle text={chapter.title} />
      </h2>

      <div className="journey__copy">
        <p className="journey__lede" data-j="lede-next">
          {chapter.summary}
        </p>
      </div>
    </section>
  );
}
