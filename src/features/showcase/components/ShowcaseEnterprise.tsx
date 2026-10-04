import { StackArt } from "@/features/hero";

import { Button } from "@/components/ui/Button";

import { enterpriseChapter as chapter } from "../showcase.config";

/**
 * Fourth chapter of the hero's sticky stage: thin oversized title over the glossy tile stack (rendered by the hero's
 * WebGL scene). Same anatomy as ShowcaseInteractive; revealed through the `title-last` / `meta-last` hooks.
 */
export function ShowcaseEnterprise() {
  return (
    <section aria-labelledby="enterprise-heading" className="journey__chapter">
      {/* Still composition for reduced motion / no scripts; hidden while the stage animates (see hero.css). */}
      <div className="journey__static-art journey__static-art--back">
        <StackArt />
      </div>

      <h2 id="enterprise-heading" className="journey__title journey__title--line" data-j="title-last">
        {chapter.title}
      </h2>

      <div className="journey__meta">
        <div className="journey__meta-left" data-j="meta-last">
          <span className="journey__pill">{chapter.category}</span>
          <p className="journey__kicker">{chapter.disciplines}</p>
        </div>

        <div className="journey__meta-center" data-j="meta-last">
          <Button href={chapter.href} arrow className="journey__cta">
            View project
          </Button>
        </div>

        <div className="journey__meta-right" data-j="meta-last">
          <p className="journey__project-name">{chapter.name}</p>
          <p className="journey__summary">{chapter.summary}</p>
        </div>
      </div>
    </section>
  );
}
