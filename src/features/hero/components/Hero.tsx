import type { CSSProperties, ReactNode } from "react";

import "../hero.css";

import { HeroStage } from "./HeroStage";
import { JellyVisual } from "./JellyVisual";
import { ModuleField } from "./ModuleField";

const HEADLINE = [["We", "Build"], ["What", "Brands"], ["Become"]] as const;
const LEDE = "We shape bold digital experiences that give ambitious brands a presence worth remembering.";

/**
 * The headline as words of characters. The final layout exists in the server HTML (nothing reflows); each character
 * runs a short CSS entrance (hero.css `journey-char`) with deterministic, per-character offsets and delays, so there is
 * no JavaScript, no flash and no state. The scroll timeline later transforms the parent `h1`, never the characters,
 * so the handoff from intro to scroll is seamless.
 */
function HeadlineChars({ lines }: { lines: readonly (readonly string[])[] }) {
  // Flatten to words with a running character index and a start delay (a breath at each word and line boundary keeps
  // the rhythm: WE BUILD · WHAT BRANDS · BECOME.). Pure arithmetic: identical on server and client.
  const words = lines.flatMap((line, lineIndex) => line.map((word, wordIndex) => ({ word, lineIndex, wordIndex })));
  const layout = words.reduce<{ start: number; delay: number }[]>((acc, entry, i) => {
    const previous = acc[i - 1];
    const start = previous ? previous.start + words[i - 1]!.word.length : 0;
    const pause = i === 0 ? 0 : entry.wordIndex > 0 ? 0.05 : 0.11;
    acc.push({ start, delay: (previous?.delay ?? 0) + pause });
    return acc;
  }, []);

  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="journey__line">
          {line.map((word, wordIndex) => {
            const entry = words.findIndex((w) => w.lineIndex === lineIndex && w.wordIndex === wordIndex);
            const { start, delay } = layout[entry]!;
            return (
              <span key={wordIndex}>
                {wordIndex > 0 ? " " : ""}
                {/* The last word of the headline carries the brand accent (see hero.css `journey__accent`). */}
                <span
                  className={
                    lineIndex === lines.length - 1 && wordIndex === line.length - 1
                      ? "journey__word journey__accent"
                      : "journey__word"
                  }
                >
                  {Array.from(word).map((char, c) => {
                    const i = start + c;
                    // Deterministic variety from the index alone (no Math.random).
                    const h = (i * 2654435761) % 1000;
                    const style = {
                      "--dx": `${((h % 7) - 3) * 0.12}em`,
                      "--dy": `${0.16 + ((h >> 3) % 5) * 0.045}em`,
                      "--ds": (0.94 + (h % 9) * 0.014).toFixed(3),
                      "--dr": `${((h % 5) - 2) * 1.2}deg`,
                      "--dt": `${(delay + i * 0.03).toFixed(3)}s`,
                    } as CSSProperties;
                    return (
                      <span key={c} className="journey__char" style={style}>
                        {char}
                      </span>
                    );
                  })}
                </span>
              </span>
            );
          })}
          {lineIndex < lines.length - 1 ? " " : ""}
          <br />
        </span>
      ))}
    </>
  );
}

/**
 * Home hero and the featured-project chapter as one sticky scroll stage.
 *
 * `chapter` is the project composition (see features/showcase). The timeline looks for these hooks inside it:
 *   [data-j="title"]  the oversized project heading      [data-j="lede"]  its supporting paragraph
 *
 * `next` is the third chapter, hooked the same way with `title-next` / `lede-next`; `last` is the fourth (`title-last` / `lede-last`); `bespoke` is the fifth and last: the morphing title (`title-bespoke`), its paragraph (`lede-bespoke`) and the only two actions of the sequence (`actions-bespoke`).
 */
export function Hero({
  chapter,
  next,
  last,
  bespoke,
}: {
  chapter?: ReactNode;
  next?: ReactNode;
  last?: ReactNode;
  bespoke?: ReactNode;
}) {
  return (
    <HeroStage>
      <JellyVisual />

      <div className="journey__hero" data-j="hero">
        <h1 id="hero-heading" className="journey__headline" data-j="headline">
          <HeadlineChars lines={HEADLINE} />
        </h1>

        <div className="journey__copy">
          <p className="journey__lede" data-j="lede-hero">
            {LEDE}
          </p>
        </div>

        <div className="journey__details" data-j="details" aria-hidden="true">
          <span className="journey__scroll">
            <span className="journey__scroll-line" />
            Scroll
          </span>
        </div>
      </div>

      {chapter ? (
        <div className="journey__project" data-j="chapter">
          <ModuleField />
          {chapter}
        </div>
      ) : null}

      {next ? (
        <div className="journey__next" data-j="chapter-next">
          {next}
        </div>
      ) : null}

      {last ? (
        <div className="journey__last" data-j="chapter-last">
          {last}
        </div>
      ) : null}

      {bespoke ? (
        <div className="journey__bespoke" data-j="chapter-bespoke">
          {bespoke}
        </div>
      ) : null}
    </HeroStage>
  );
}
