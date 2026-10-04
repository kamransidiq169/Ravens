import type { CSSProperties } from "react";

import { RavensLogo } from "@/components/brand/RavensLogo";
import { Image } from "@/components/ui/Image";
import { Link } from "@/components/ui/Link";

import "./services.css";

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=1200&q=80`;

const panels = [
  { label: "Web Development", alt: "Laptop glowing in a dark room", src: unsplash("1531297484001-80022131f5a1") },
  {
    label: "App Development",
    alt: "Sweeping curved architecture against the sky",
    src: unsplash("1518005020951-eccb494ad742"),
  },
  {
    label: "Digital Experiences",
    alt: "Long minimal corridor with glass partitions",
    src: unsplash("1497366216548-37526070297c"),
  },
  {
    label: "Business Systems",
    alt: "Modern meeting room with a long timber table",
    src: unsplash("1497366811353-6870744d04b2"),
  },
  {
    label: "CRM Development",
    alt: "Designer lounge chairs and a black floor lamp",
    src: unsplash("1524758631624-e2822e304c36"),
  },
];

const delay = (s: number) => ({ "--sv-delay": `${s}s` }) as CSSProperties;

export function ServicesIndex() {
  return (
    <div className="sv-page">
      <nav className="sv-nav" aria-label="Services">
        <Link href="/" className="sv-back" aria-label="Back to home">
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M20 12H4M10 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link href="/" className="sv-mark" aria-label="Ravens — home">
          <RavensLogo className="h-3 w-auto" aria-hidden="true" role="presentation" title="" />
        </Link>
        <Link href="/contact" className="sv-cta">
          Book a meeting
        </Link>
      </nav>

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

      <ul id="services-gallery" className="sv-gallery" aria-label="Our services">
        {panels.map((p, i) => (
          <li key={p.label} className="sv-item" style={{ "--i": i } as CSSProperties}>
            <div className="sv-photo">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 20vw, 72vw" className="h-full" priority />
            </div>
            <p className="sv-caption">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{p.label}</span>
            </p>
          </li>
        ))}
      </ul>

      <div className="sv-in sv-foot" style={delay(0.9)}>
        <p>
          We design and build digital experiences, products and systems that help ambitious businesses move forward.
        </p>
        <div className="sv-links">
          <Link href="/contact">Start a project</Link>
          <Link href="#services-gallery">View services</Link>
        </div>
      </div>
    </div>
  );
}
