"use client";

import dynamic from "next/dynamic";
import { useRef, type ReactNode } from "react";

import { useIdle } from "@/hooks/useIdle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// GSAP loads in its own chunk after idle, like the shared motion drivers, so it never touches first paint.
const ContactCtaMotion = dynamic(() => import("./ContactCtaMotion").then((m) => m.ContactCtaMotion), { ssr: false });

/** Client shell: owns the section ref and mounts the motion layer only when motion is allowed. */
export function ContactCtaStage({ headingId, children }: { headingId: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const idle = useIdle();

  return (
    <section ref={ref} aria-labelledby={headingId} className="cta">
      {children}
      {idle && !reduced && <ContactCtaMotion target={ref} />}
    </section>
  );
}
