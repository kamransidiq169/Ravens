"use client";

import { Fragment, useRef } from "react";

import type { ClientLogo, Testimonial } from "@/types/domain/testimonial";

import { useTestimonialsScroll } from "../hooks/useTestimonialsScroll";

import { ClientMark } from "./ClientMark";

import "../testimonials.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Words are wrapped (server-rendered) so the scroll driver can reveal the quote line by line. */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <Fragment key={i}>
      <span data-w className="tm__w">
        {word}
      </span>
      {i < words.length - 1 && " "}
    </Fragment>
  ));
}

interface TestimonialsStageProps {
  headingId: string;
  testimonials: Testimonial[];
  clients: ClientLogo[];
}

export function TestimonialsStage({ headingId, testimonials, clients }: TestimonialsStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useTestimonialsScroll(rootRef);
  const total = testimonials.length;

  return (
    <div ref={rootRef} className="tm" style={{ "--tm-count": total } as React.CSSProperties}>
      <div data-tm="stage" className="tm__stage">
        <span aria-hidden="true" className="tm__giant">
          Client Voices
        </span>

        <header className="tm__intro" data-tm="intro">
          <p className="tm__eyebrow">Clients</p>
          <h2 id={headingId} className="tm__heading">
            Selected voices from the people we&rsquo;ve helped move forward.
          </h2>
        </header>

        <div aria-hidden="true" data-tm="progress" className="tm__progress">
          <span data-tm="count">01</span>
          <span className="tm__bar">
            <i data-tm="bar" />
          </span>
          <span>{pad(total)}</span>
        </div>

        <div className="tm__layers">
          {testimonials.map((item, index) => (
            <div key={item.id} data-tm="layer" data-active={index === 0 ? "" : undefined} className="tm__layer">
              <figure className="tm__item">
                <blockquote className="tm__quote" data-tm="quote">
                  <p>
                    <Words text={`“${item.quote}”`} />
                  </p>
                </blockquote>
                <figcaption className="tm__who" data-tm="who">
                  <span className="tm__name">{item.author}</span>
                  <span className="tm__role">{item.role}</span>
                  <span className="tm__role">{item.company}</span>
                </figcaption>
              </figure>
              <p aria-hidden="true" className="tm__idx">
                {pad(index + 1)} / {pad(total)}
              </p>
            </div>
          ))}

          <div data-tm="layer" className="tm__layer tm__layer--trusted">
            <div className="tm__item">
              <ul className="tm__logos">
                {clients.map((client) => (
                  <li key={client.id} className="tm__logo">
                    <ClientMark client={client} />
                  </li>
                ))}
              </ul>
              <h3 className="tm__trusted-title">Trusted by</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
