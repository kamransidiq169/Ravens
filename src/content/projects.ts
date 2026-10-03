// PLACEHOLDER CONTENT — replace with real case studies (or swap for a CMS client; see ADR 0004).
import type { Project } from "@/types/domain/project";

const cover = (n: number, alt: string) => ({ src: `/placeholder/work-${n}.svg`, alt, width: 1600, height: 1000 });

export const projects: Project[] = [
  {
    slug: "northlight",
    title: "Northlight",
    client: "Northlight Energy",
    year: 2026,
    summary: "A brand and website that makes renewable infrastructure feel human.",
    body: [
      "Northlight builds community-scale solar. Their story was buried in technical language, so we rebuilt the narrative around the people who live next to the panels.",
      "The new identity pairs a calm, luminous palette with a confident editorial layout. The site doubles as a sales tool: every project page carries live generation data.",
    ],
    disciplines: ["Brand identity", "Web design", "Development"],
    cover: cover(1, "Abstract gradient artwork for the Northlight project"),
    seo: {
      title: "Northlight — Case study",
      description: "How Ravens rebuilt Northlight's brand and website around the people behind renewable energy.",
    },
  },
  {
    slug: "halden-atelier",
    title: "Halden Atelier",
    client: "Halden Atelier",
    year: 2025,
    summary: "An e-commerce flagship for a made-to-measure tailoring house.",
    body: [
      "Halden wanted the intimacy of a fitting room online. We designed a storefront that leads with craft: slow, tactile motion, generous imagery and a frictionless appointment flow.",
      "Conversion on appointment requests rose by more than half in the first quarter after launch.",
    ],
    disciplines: ["E-commerce", "Art direction", "Development"],
    cover: cover(2, "Abstract gradient artwork for the Halden Atelier project"),
    seo: {
      title: "Halden Atelier — Case study",
      description: "A made-to-measure e-commerce experience designed and built by Ravens.",
    },
  },
  {
    slug: "meridian-health",
    title: "Meridian Health",
    client: "Meridian Health",
    year: 2025,
    summary: "A patient portal redesigned for clarity under stress.",
    body: [
      "Meridian's portal served thousands of patients but felt like a form factory. We mapped the five moments that matter and rebuilt the product around them.",
      "The result is an accessible, WCAG AA design system now shared across four internal teams.",
    ],
    disciplines: ["Product design", "Design system", "Accessibility"],
    cover: cover(3, "Abstract gradient artwork for the Meridian Health project"),
    seo: {
      title: "Meridian Health — Case study",
      description: "A patient portal and design system created by Ravens for clarity under stress.",
    },
  },
  {
    slug: "common-ground",
    title: "Common Ground",
    client: "Common Ground Collective",
    year: 2024,
    summary: "A living identity for a cultural collective that never stands still.",
    body: [
      "Common Ground hosts hundreds of events a year across a dozen venues. The identity is a system, not a logo: a flexible grid and a motion language any member can use.",
      "We shipped the brand, a programme website, and the toolkit that keeps it consistent.",
    ],
    disciplines: ["Brand identity", "Motion", "Web design"],
    cover: cover(4, "Abstract gradient artwork for the Common Ground project"),
    seo: {
      title: "Common Ground — Case study",
      description: "A flexible brand system and programme site Ravens built for a cultural collective.",
    },
  },
];
