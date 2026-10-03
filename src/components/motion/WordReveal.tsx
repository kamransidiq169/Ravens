"use client";

import { useRef } from "react";

import { useIdle } from "@/hooks/useIdle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/cn";

import { WordRevealDriver } from "./lazy";

interface WordRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
  /** "scroll" reveals when scrolled into view (skipped if already visible); "load" always plays. */
  trigger?: "scroll" | "load";
}

/** Masked word-by-word reveal. The heading text stays in the DOM once, as plain words. */
export function WordReveal({ text, as: Tag = "h2", id, className, trigger = "scroll" }: WordRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();
  const words = text.split(" ");

  return (
    <Tag id={id} className={cn(className)}>
      <span ref={ref}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.12em] align-top">
            <span data-word className="inline-block">
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </span>
      {idle && !reduced && <WordRevealDriver target={ref} trigger={trigger} />}
    </Tag>
  );
}
