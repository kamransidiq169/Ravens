import { AccentTitle, StackArt } from "@/features/hero";

import { enterpriseChapter as chapter } from "../showcase.config";

/**
 * Fourth chapter of the hero's sticky stage: thin oversized title over the glossy tile stack (rendered by the hero's
 * WebGL scene). Same anatomy as ShowcaseInteractive; revealed through the `title-last` / `lede-last` hooks.
 */
export function ShowcaseEnterprise() {
  return (
    <section aria-labelledby="enterprise-heading" className="journey__chapter">
      {/* Still composition for reduced motion / no scripts; hidden while the stage animates (see hero.css). */}
      <div className="journey__static-art journey__static-art--back">
        <StackArt />
      </div>

      <h2 id="enterprise-heading" className="journey__title journey__title--line" data-j="title-last">
        <AccentTitle text={chapter.title} />
      </h2>

      <div className="journey__copy">
        <p className="journey__lede" data-j="lede-last">
          {chapter.summary}
        </p>
      </div>
    </section>
  );
}
