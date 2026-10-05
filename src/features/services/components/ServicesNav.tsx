"use client";

import { usePathname } from "next/navigation";

import { RavensLogo } from "@/components/brand/RavensLogo";
import { Link } from "@/components/ui/Link";

/** Minimal top controls for the standalone /services route only; when the section is embedded in Home they'd be noise. */
export function ServicesNav() {
  if (usePathname() !== "/services") return null;

  return (
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
  );
}
