import "../contact-cta.css";

import { RavenAccent } from "@/components/brand/RavenAccent";
import { Link } from "@/components/ui/Link";

import { publicSite } from "@/config/navigation";

import { contactCtaCopy as copy } from "../contactCta.config";

import { ContactCtaStage } from "./ContactCtaStage";
import { CtaFeather } from "./CtaFeather";

const HEADING_ID = "contact-cta-heading";

/** The closing frame of every page that uses it. Markup and styling are static; motion is layered on by the stage. */
export function ContactCta() {
  const year = new Date().getFullYear();

  return (
    <ContactCtaStage headingId={HEADING_ID}>
      <div className="cta__atmosphere" data-cta="atmosphere" aria-hidden="true" />
      <CtaFeather className="cta__feather" />

      <div className="cta__inner">
        <div className="cta__meta" data-cta="meta">
          <p className="cta__micro" data-cta-item>
            {copy.eyebrow}
          </p>
          <p className="cta__micro cta__micro--right" data-cta-item>
            {copy.index}
          </p>
        </div>

        <h2 id={HEADING_ID} className="cta__headline" data-cta="headline">
          {copy.headline.map((line, index) => (
            <span key={line} className={`cta__line cta__line--${index + 1}`}>
              <span className="cta__line-inner" data-cta-line>
                {line}
              </span>
            </span>
          ))}
        </h2>

        <div className="cta__row" data-cta="row">
          <p className="cta__statement" data-cta-item>
            {copy.statement}
          </p>

          <Link href={copy.cta.href} aria-label={copy.cta.ariaLabel} className="cta__link" data-cta-item>
            <span className="cta__disc" aria-hidden="true">
              <span className="cta__arrow cta__arrow--out">→</span>
              <span className="cta__arrow cta__arrow--in">→</span>
            </span>
            <span className="cta__label">
              <span className="cta__label-text">{copy.cta.label}</span>
              <span className="cta__rule" aria-hidden="true" />
            </span>
          </Link>
        </div>

        <div className="cta__foot" data-cta="foot">
          <p className="cta__signature" data-cta-item>
            <RavenAccent className="cta__mark" />
            <span>
              <span className="cta__signature-name">{copy.signature.name}</span>
              <span className="cta__micro">{copy.signature.descriptor}</span>
            </span>
          </p>
          <p className="cta__micro cta__micro--right" data-cta-item>
            <Link href={`mailto:${publicSite.email}`} className="cta__mail">
              {publicSite.email}
            </Link>
            <span aria-hidden="true"> · </span>
            {year}
          </p>
        </div>
      </div>
    </ContactCtaStage>
  );
}
