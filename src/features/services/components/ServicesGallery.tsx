"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Image } from "@/components/ui/Image";

import { panels } from "@/content/service-panels";

import { animateServicesGallery } from "../animation/services.animation";
import { mountServicesMobile, type ServicesMobile } from "../animation/services.mobile";

const pad = (n: number) => String(n).padStart(2, "0");

function PagerArrow({ up }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      aria-hidden="true"
    >
      <path d={up ? "M8 14V3M4 7l4-4 4 4" : "M8 2v11M4 9l4 4 4-4"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * `before` / `after` (heading, CTA) render inside the stage wrapper; on tablet/desktop the wrappers are
 * `display: contents`, so the layout is unchanged. Phones get a separate, gesture-driven one-card-at-a-time stack
 * (animation/services.mobile.ts); the two share this markup and nothing else.
 */
export function ServicesGallery({ before, after }: { before?: ReactNode; after?: ReactNode }) {
  const root = useRef<HTMLUListElement>(null);
  const mobile = useRef<ServicesMobile | null>(null);
  // Changes once per accepted gesture, never per touchmove.
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const list = root.current;
      if (!list) return;
      const phone = mountServicesMobile(list, setActive);
      mobile.current = phone;
      const stopGallery = animateServicesGallery(list);
      return () => {
        stopGallery();
        phone.destroy();
        mobile.current = null;
      };
    },
    { scope: root },
  );

  return (
    <div className="sv-pin">
      <div className="sv-stage" data-last={active === panels.length - 1 ? "" : undefined}>
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
        <div className="sv-pager">
          <button
            type="button"
            className="sv-pager-btn"
            aria-label="Previous service"
            disabled={active === 0}
            onClick={() => mobile.current?.goPrevious()}
          >
            <PagerArrow up />
          </button>
          <div className="sv-pager-mid">
            <span className="sv-bars" aria-hidden="true">
              {panels.map((p, i) => (
                <span key={p.label} className="sv-bar" data-on={i <= active ? "" : undefined} />
              ))}
            </span>
            <p className="sv-pager-count" aria-live="polite">
              {pad(active + 1)} / {pad(panels.length)}
            </p>
          </div>
          <button
            type="button"
            className="sv-pager-btn"
            aria-label="Next service"
            disabled={active === panels.length - 1}
            onClick={() => mobile.current?.goNext()}
          >
            <PagerArrow />
          </button>
        </div>
        <div className="sv-tail">
          <p className="sv-hint" aria-hidden="true">
            Swipe up
          </p>
          {after}
        </div>
      </div>
    </div>
  );
}
