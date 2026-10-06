"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";

import type { ClientLogo, Testimonial } from "@/types/domain/testimonial";

import { useTestimonialsScroll } from "../hooks/useTestimonialsScroll";

import { ClientMark } from "./ClientMark";

import "../testimonials.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Words are wrapped (server-rendered) so the scroll driver can reveal the quote line by line. */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  const accentFrom = Math.max(words.length - 3, 0);
  return words.map((word, i) => (
    <Fragment key={i}>
      <span data-w className={i >= accentFrom ? "tm__w tm__w--accent" : "tm__w"}>
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
      {/* The Process atmosphere. */}
      <div aria-hidden="true" className="tm__air" />

      <div data-tm="stage" className="tm__stage">
        <header className="tm__intro" data-tm="intro">
          <p className="tm__eyebrow">Clients</p>
          <h2 id={headingId} className="tm__lede">
            Selected voices from the people we&rsquo;ve helped move forward.
          </h2>
        </header>

        <div className="tm__layers">
          {testimonials.map((item, index) => (
            <div key={item.id} data-tm="layer" data-active={index === 0 ? "" : undefined} className="tm__layer">
              <figure className="tm__item">
                <blockquote className="tm__quote" data-tm="quote">
                  <p>
                    <Words text={`\u201c${item.quote}\u201d`} />
                  </p>
                </blockquote>
                <div className="tm__frame" data-tm="frame">
                  <div className="tm__frame-img" data-tm="img">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 26vw, (min-width: 768px) 34vw, 62vw"
                      priority={index === 0}
                      style={{ objectPosition: item.imagePosition }}
                      className="tm__photo"
                    />
                  </div>
                  <span aria-hidden="true" className="tm__frame-no">
                    {pad(index + 1)} / {pad(total)}
                  </span>
                </div>
                <figcaption className="tm__who" data-tm="who">
                  <span className="tm__name">{item.author}</span>
                  <span className="tm__role">
                    {item.role} <i aria-hidden="true">/</i> {item.company}
                  </span>
                </figcaption>
              </figure>
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

        <ol aria-hidden="true" className="tm__rail">
          {testimonials.map((item, index) => (
            <li key={item.id} data-tm="rail" data-active={index === 0 ? "" : undefined}>
              <span>{pad(index + 1)}</span>
              <span className="tm__rail-name">{item.company}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
