"use client";

import { useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { useJourney } from "../hooks/useJourney";

/**
 * Tall scroll wrapper + sticky stage. The server renders the finished first state (headline visible, project chapter
 * transparent); `useJourney` then scrubs it with the scroll position. Children arrive as server-rendered slots.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const release = useRef<((chapter: "project" | "next" | "last" | "bespoke") => void) | null>(null);
  const reduced = useReducedMotion();

  useJourney(root, reduced, release);

  return (
    <div
      ref={root}
      id="hero"
      className="journey"
      data-phase="hero"
      // Focus that moves into a chapter before it is on screen scrolls the sequence to that chapter.
      onFocusCapture={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-j='chapter']")) release.current?.("project");
        else if (target.closest("[data-j='chapter-next']")) release.current?.("next");
        else if (target.closest("[data-j='chapter-last']")) release.current?.("last");
        else if (target.closest("[data-j='chapter-bespoke']")) release.current?.("bespoke");
      }}
    >
      <div className="journey__stage" data-j="stage">
        {children}
      </div>
    </div>
  );
}
