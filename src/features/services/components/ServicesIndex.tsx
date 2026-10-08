import type { CSSProperties } from "react";

import { Link } from "@/components/ui/Link";

import { ServicesGallery } from "./ServicesGallery";
import { ServicesNav } from "./ServicesNav";

import "./services.css";

const delay = (s: number) => ({ "--sv-delay": `${s}s` }) as CSSProperties;

function Arrow() {
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
      <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ServicesIndex() {
  return (
    <div className="sv-page">
      <ServicesNav />

      <ServicesGallery
        before={
          <header className="sv-head">
            <p className="sv-in sv-eyebrow">Our services</p>
            <h1 id="services-heading" className="sv-in sv-title" style={delay(0.06)}>
              <span className="sv-line">
                Services <span className="sv-break">that move</span>
              </span>
              <span className="sv-line">your brand</span>
            </h1>
            <p className="sv-in sv-sub" style={delay(0.14)}>
              Digital experiences built to move ambitious brands forward.
            </p>
          </header>
        }
        after={
          <div className="sv-in sv-foot" style={delay(0.9)}>
            <p>
              We design and build digital experiences, products and systems that help ambitious businesses move forward.
            </p>
            <div className="sv-links">
              <Link href="/contact" className="sv-btn sv-btn--solid">
                Start a project <Arrow />
              </Link>
              <Link href="#services-gallery" className="sv-btn">
                View services <Arrow />
              </Link>
            </div>
          </div>
        }
      />
      {/* Without JS the entrance can't run; make sure nothing stays hidden. */}
      <noscript>
        <style>{`.sv-gallery .sv-enter{opacity:1!important;visibility:visible!important}.sv-pin{height:auto!important}.sv-stage{position:static!important;height:auto!important;overflow:visible!important}.sv-gallery{display:grid!important;grid-template-columns:1fr!important;gap:3rem;width:auto!important;padding-inline:1.25rem!important}.sv-item{width:min(78%,20rem);flex:none!important}`}</style>
      </noscript>
    </div>
  );
}
