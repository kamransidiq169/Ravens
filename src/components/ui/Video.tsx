"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/cn";

interface VideoProps extends Omit<ComponentPropsWithoutRef<"video">, "src" | "poster"> {
  src: string;
  poster: string;
  /** Accessible description; decorative loops should pass an empty string. */
  label: string;
}

/** Muted, inline video. Under reduced motion it shows the poster with native controls instead of autoplaying. */
export function Video({ src, poster, label, className, ...props }: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  return (
    <video
      ref={ref}
      className={cn("h-auto w-full object-cover", className)}
      src={src}
      poster={poster}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      muted
      playsInline
      loop
      preload="metadata"
      autoPlay={!reduced}
      controls={reduced}
      {...props}
    />
  );
}
