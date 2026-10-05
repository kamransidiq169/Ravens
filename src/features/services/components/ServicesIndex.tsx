import type { CSSProperties } from "react";

import { Link } from "@/components/ui/Link";

import { ServicesGallery } from "./ServicesGallery";
import { ServicesNav } from "./ServicesNav";

import "./services.css";

const delay = (s: number) => ({ "--sv-delay": `${s}s` }) as CSSProperties;

export function ServicesIndex() {
  return (
    <div className="sv-page">
      <ServicesNav />

      <header className="sv-head">
        <h1 id="services-heading" className="sv-in sv-title">
          <span>Services</span>
          <span>that move</span>
          <span>your brand</span>
        </h1>
        <p className="sv-in sv-sub" style={delay(0.12)}>
          Digital experiences built to move ambitious brands forward.
        </p>
      </header>

      <ServicesGallery />

      <div className="sv-in sv-foot" style={delay(0.9)}>
        <p>
          We design and build digital experiences, products and systems that help ambitious businesses move forward.
        </p>
        <div className="sv-links">
          <Link href="/contact">Start a project</Link>
          <Link href="#services-gallery">View services</Link>
        </div>
      </div>
      {/* Without JS the entrance can't run; make sure nothing stays hidden. */}
      <noscript>
        <style>{`.sv-gallery .sv-enter{opacity:1!important;visibility:visible!important}.sv-pin{height:auto!important}.sv-stage{position:static!important;height:auto!important;overflow:visible!important}.sv-gallery{display:grid!important;gap:3rem;width:auto!important;padding-inline:1.25rem!important}.sv-item{width:min(78%,20rem);flex:none!important}`}</style>
      </noscript>
    </div>
  );
}
