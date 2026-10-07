import { MorphTitle } from "@/features/hero";

import { Button } from "@/components/ui/Button";

import { bespokeChapter as chapter } from "../showcase.config";

/**
 * Fifth and last chapter of the hero's sticky stage: the closing title, its paragraph and, only once those have
 * arrived, the two calls to action. The title morphs as the stage scrolls (see MorphTitle); the timeline reaches it
 * through `title-bespoke`, `lede-bespoke` and `actions-bespoke`.
 */
export function ShowcaseBespoke() {
  return (
    <section aria-labelledby="bespoke-heading" className="journey__chapter journey__chapter--closing">
      <MorphTitle
        id="bespoke-heading"
        className="journey__title journey__title--line journey__title--morph"
        data-j="title-bespoke"
        text={chapter.title}
      />

      <div className="journey__copy">
        <p className="journey__lede" data-j="lede-bespoke">
          {chapter.summary}
        </p>

        <div className="journey__actions" data-j="actions-bespoke">
          {chapter.actions.map((action) => (
            <Button key={action.href} href={action.href} variant={action.variant} arrow>
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
