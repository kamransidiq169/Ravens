import { MorphTitle } from "@/features/hero";

import { bespokeChapter as chapter } from "../showcase.config";

/**
 * Fifth and last chapter of the hero's sticky stage: the closing title and nothing else, on the plain hero atmosphere.
 * It morphs as the stage scrolls (see MorphTitle); the timeline reaches it through `title-bespoke`.
 */
export function ShowcaseBespoke() {
  return (
    <section aria-labelledby="bespoke-heading" className="journey__chapter">
      <MorphTitle
        id="bespoke-heading"
        className="journey__title journey__title--line journey__title--morph"
        data-j="title-bespoke"
        text={chapter.title}
      />
    </section>
  );
}
