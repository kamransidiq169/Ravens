"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { useProcessScroll } from "../hooks/useProcessScroll";
import { WHISPER, type ProcessStage as Stage } from "../lib/process.data";

import { ProcessStage } from "./ProcessStage";

const RAVEN = "/hero/images/raven11.png";
const SIZES = "(min-width: 768px) 92vw, 100vw";

/** The raven. Drawn twice from one photo: the whole bird between the type layers, and a feathered wing piece above all. */
function Raven({ layer }: { layer: "back" | "front" }) {
  return (
    <div className={`proc__rig proc__rig--${layer}`} data-p={`rig-${layer}`} aria-hidden="true">
      <Image src={RAVEN} alt="" fill sizes={SIZES} draggable={false} />
    </div>
  );
}

/**
 * Tall scroll wrapper + sticky stage (same technique as the home hero). The server renders the opening state (the
 * intro, passed in as a slot); `useProcessScroll` then scrubs everything from the scroll position, writing transforms,
 * opacity and clip-path only.
 *
 * Layers, back to front: atmosphere → intro → type → raven → type (selected letters) → wing piece → guides → labels.
 */
export function ProcessExperience({ stages, intro }: { stages: Stage[]; intro: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useProcessScroll(root, reduced);

  return (
    <div ref={root} className="proc">
      <div className="proc__stage" data-p="stage">
        <div className="proc__glow" data-p="glow" aria-hidden="true" />

        {intro}

        <ol className="proc__steps">
          {stages.map((stage) => (
            <ProcessStage key={stage.id} stage={stage} />
          ))}
        </ol>

        <Raven layer="back" />
        <Raven layer="front" />

        <div className="proc__guides" data-p="guides" aria-hidden="true">
          <span className="proc__guide proc__guide--h" data-p="guide-h" />
          <span className="proc__guide proc__guide--v" data-p="guide-v" />
        </div>

        <p className="proc__whisper" data-p="whisper" aria-hidden="true">
          {WHISPER}
        </p>

        <figure className="proc__still" aria-hidden="true">
          <Image src={RAVEN} alt="" width={1537} height={1023} sizes="(min-width: 768px) 80vw, 100vw" />
        </figure>

        <div className="proc__index" data-p="meta" aria-hidden="true">
          <span className="proc__index-stack">
            {stages.map((stage) => (
              <span key={stage.id} data-p="num">
                {stage.index}
              </span>
            ))}
          </span>
          <span className="proc__bar" data-p="bar" />
          <span className="proc__index-stack proc__index-names">
            {stages.map((stage) => (
              <span key={stage.id} data-p="name">
                {stage.title}
              </span>
            ))}
          </span>
        </div>

        <div className="proc__tint" data-p="tint" aria-hidden="true" />
      </div>
    </div>
  );
}
