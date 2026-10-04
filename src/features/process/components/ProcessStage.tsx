import type { ProcessStage as Stage } from "../lib/process.data";

/**
 * One chapter: the word twice and its caption. The first copy is the real heading and sits behind the raven; the second
 * is a decorative twin above the raven in which only some letters are visible, so the bird can pass behind a letter and
 * in front of the next. Both copies take identical transforms from the scroll film.
 */
export function ProcessStage({ stage }: { stage: Stage }) {
  const letters = Array.from(stage.title);

  return (
    <li className="proc__step" data-p="step">
      <h3 className="proc__word" data-p="word" aria-label={stage.title}>
        <span className="proc__word-text" aria-hidden="true">
          {letters.map((letter, i) => (
            <span key={i} className="proc__letter" data-p="letter">
              {letter}
            </span>
          ))}
        </span>
      </h3>

      <div className="proc__word proc__word--front" data-p="word-front" aria-hidden="true">
        <span className="proc__word-text">
          {letters.map((letter, i) => (
            <span key={i} className="proc__letter" data-p="letter-front">
              {letter}
            </span>
          ))}
        </span>
      </div>

      <p className="proc__desc" data-p="desc">
        {stage.description}
      </p>
    </li>
  );
}
