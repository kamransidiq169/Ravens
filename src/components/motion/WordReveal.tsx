"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";

interface WordRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
  /** "scroll" waits until the element enters the viewport; "load" plays immediately. */
  trigger?: "scroll" | "load";
}

/** Masked word-by-word reveal. The full text stays available to assistive tech via sr-only. */
export function WordReveal({ text, as: Tag = "h2", id, className, trigger = "scroll" }: WordRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const words = text.split(" ");

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current.querySelectorAll("[data-word]"), {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.06,
        ...(trigger === "scroll" && { scrollTrigger: { trigger: ref.current, start: "top 90%", once: true } }),
      });
    },
    { scope: ref, dependencies: [reduced, trigger] },
  );

  return (
    <Tag id={id} className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.12em] align-top">
            <span data-word className="inline-block">
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
