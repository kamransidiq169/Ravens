import { KineticArt } from "@/features/hero";

import { Button } from "@/components/ui/Button";

import { bespokeChapter as chapter } from "../showcase.config";

/**
 * Fifth chapter of the hero's sticky stage: thin oversized title over the product visual (rendered by the hero's
 * WebGL scene). Same anatomy as the earlier chapters; revealed through the `title-bespoke` / `meta-bespoke` hooks.
 */
export function ShowcaseBespoke() {
  return (
    <section aria-labelledby="bespoke-heading" className="journey__chapter">
      {/* Still composition for reduced motion / no scripts; hidden while the stage animates (see hero.css). */}
      <div className="journey__static-art journey__static-art--behind">
        <KineticArt />
      </div>

      <h2 id="bespoke-heading" className="journey__title journey__title--line" data-j="title-bespoke">
        {chapter.title}
      </h2>

      <div className="journey__meta">
        <div className="journey__meta-left" data-j="meta-bespoke">
          <span className="journey__pill">{chapter.category}</span>
          <p className="journey__kicker">{chapter.disciplines}</p>
        </div>

        <div className="journey__meta-center" data-j="meta-bespoke">
          <Button href={chapter.href} arrow className="journey__cta">
            View project
          </Button>
        </div>

        <div className="journey__meta-right" data-j="meta-bespoke">
          <p className="journey__project-name">{chapter.name}</p>
          <p className="journey__summary">{chapter.summary}</p>
        </div>
      </div>
    </section>
  );
}
