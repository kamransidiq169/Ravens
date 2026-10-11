"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

import { Image } from "@/components/ui/Image";

import { panels } from "@/content/service-panels";

import { animateServicesGallery } from "../animation/services.animation";

/**
 * `before` / `after` (heading, CTA) render inside the stage wrapper; on tablet/desktop the wrappers are
 * `display: contents`, so the layout is unchanged. Phones get a vertically scrubbed, one-card-at-a-time sequence.
 */
export function ServicesGallery({ before, after }: { before?: ReactNode; after?: ReactNode }) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const list = root.current;
      if (!list) return;
      return animateServicesGallery(list);
    },
    { scope: root },
  );

  return (
    <div className="sv-pin">
      <div className="sv-stage">
        {before}
        <ul ref={root} id="services-gallery" className="sv-gallery" aria-label="Our services" data-motion="pending">
          {panels.map((p, i) => (
            <li key={p.label} className="sv-item" style={{ "--i": i } as CSSProperties}>
              <div className="sv-enter">
                <div className="sv-photo">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 768px) 20vw, 86vw"
                    className="h-full"
                    loading="eager"
                    preload={i === 0}
                  />
                </div>
                <p className="sv-caption">
                  <span className="sv-num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{p.label}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        {after}
      </div>
    </div>
  );
}
