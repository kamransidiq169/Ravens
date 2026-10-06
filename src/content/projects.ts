// DEMO CONTENT: temporary fictional projects. Replace with real case studies (or swap for a CMS client; see ADR 0004).
// `disciplines[0]` is the category shown on the Selected Work panel; the cover is swapped for stand-in imagery until
// real covers are added (see ./placeholder-images.ts).
import type { Project } from "@/types/domain/project";

const cover = (n: number, alt: string) => ({ src: `/placeholder/work-${n}.svg`, alt, width: 1600, height: 1000 });

export const projects: Project[] = [
  {
    slug: "the-heating-store",
    title: "The Heating Store",
    client: "The Heating Store",
    year: 2026,
    summary: "A premium digital commerce experience for a modern heating brand.",
    body: [
      "A storefront that treats heating as design: considered product storytelling, effortless filtering and a checkout without friction.",
      "Demo project: placeholder content to be replaced with the real case study.",
    ],
    disciplines: ["E-Commerce / Website"],
    cover: cover(1, "Warm, modern interior for a heating brand"),
    seo: {
      title: "The Heating Store — Ravens",
      description: "A premium digital commerce experience for a modern heating brand.",
    },
  },
  {
    slug: "northline-architecture",
    title: "Northline Architecture",
    client: "Northline Architecture",
    year: 2026,
    summary: "An editorial digital experience for a contemporary architecture studio.",
    body: [
      "Large-format imagery, quiet typography and a project index that reads like a monograph.",
      "Demo project: placeholder content to be replaced with the real case study.",
    ],
    disciplines: ["Architecture / Website"],
    cover: cover(2, "Contemporary architecture photographed at dusk"),
    seo: {
      title: "Northline Architecture — Ravens",
      description: "An editorial digital experience for a contemporary architecture studio.",
    },
  },
  {
    slug: "aurelia-hotels",
    title: "Aurelia Hotels",
    client: "Aurelia Hotels",
    year: 2026,
    summary: "A cinematic website experience for a luxury hospitality brand.",
    body: [
      "A slow, filmic journey through each property, with booking always one gesture away.",
      "Demo project: placeholder content to be replaced with the real case study.",
    ],
    disciplines: ["Hospitality / Website"],
    cover: cover(3, "Luxury hotel exterior reflected in still water"),
    seo: {
      title: "Aurelia Hotels — Ravens",
      description: "A cinematic website experience for a luxury hospitality brand.",
    },
  },
  {
    slug: "vanta-motors",
    title: "Vanta Motors",
    client: "Vanta Motors",
    year: 2026,
    summary: "A high-end digital presence built for a modern automotive brand.",
    body: [
      "Precision, pace and presence: a site that shows the machine the way it deserves to be seen.",
      "Demo project: placeholder content to be replaced with the real case study.",
    ],
    disciplines: ["Automotive / Website"],
    cover: cover(4, "Glass and steel showroom architecture"),
    seo: {
      title: "Vanta Motors — Ravens",
      description: "A high-end digital presence built for a modern automotive brand.",
    },
  },
  {
    slug: "forma-living",
    title: "Forma Living",
    client: "Forma Living",
    year: 2026,
    summary: "A refined digital showcase for a premium interiors brand.",
    body: [
      "Collections presented as rooms, not catalogues, with material and light carrying the story.",
      "Demo project: placeholder content to be replaced with the real case study.",
    ],
    disciplines: ["Interior / Website"],
    cover: cover(5, "Sculptural interior with a cantilevered form"),
    seo: {
      title: "Forma Living — Ravens",
      description: "A refined digital showcase for a premium interiors brand.",
    },
  },
];
