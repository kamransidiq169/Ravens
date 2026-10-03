"use client";

import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

import { useIdle } from "@/hooks/useIdle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { PageTransitionDriver } from "./lazy";

/** Fades the page in on client-side navigations. The first load is left alone so SSR content paints untouched. */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const idle = useIdle();

  return (
    <div ref={ref}>
      {children}
      {idle && !reduced && <PageTransitionDriver target={ref} pathname={pathname} />}
    </div>
  );
}
