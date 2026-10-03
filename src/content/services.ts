// PLACEHOLDER CONTENT — replace with real service descriptions.
import type { Service } from "@/types/domain/service";

export const services: Service[] = [
  {
    slug: "brand-identity",
    title: "Brand identity",
    summary: "Strategy, naming and visual systems that give your company a voice worth remembering.",
    body: [
      "We start by finding the idea only you can own, then build the identity around it: logo, typography, colour, motion and the rules that keep it all coherent.",
      "You leave with a system your team can actually use, not a PDF that gathers dust.",
    ],
    deliverables: ["Brand strategy", "Logo and wordmark", "Typography and colour", "Guidelines"],
    seo: { title: "Brand identity", description: "Strategy, naming and visual systems from Ravens." },
  },
  {
    slug: "web-design",
    title: "Web design",
    summary: "Considered, editorial websites that turn attention into trust.",
    body: [
      "Great sites are paced like great films. We design for rhythm: what you see first, what you feel next, and what you do at the end.",
      "Every layout is built mobile-first and tested against real content, not lorem ipsum.",
    ],
    deliverables: ["UX architecture", "Visual design", "Interactive prototypes", "Content design"],
    seo: { title: "Web design", description: "Editorial, conversion-minded website design by Ravens." },
  },
  {
    slug: "development",
    title: "Development",
    summary: "Fast, accessible, maintainable front-ends built on modern foundations.",
    body: [
      "We ship production code: typed, tested and documented. Performance budgets and accessibility are requirements, not afterthoughts.",
      "Where a project calls for it, we add WebGL and motion, carefully, so they enhance the page rather than slow it down.",
    ],
    deliverables: ["Next.js builds", "CMS integration", "WebGL and motion", "Performance tuning"],
    seo: { title: "Development", description: "Production-grade front-end development from Ravens." },
  },
  {
    slug: "product-design",
    title: "Product design",
    summary: "Interfaces for complex products, designed to feel obvious.",
    body: [
      "From first sketch to shipped feature, we work with your team to simplify what's complicated and polish what matters.",
      "Our design systems keep dozens of contributors moving in the same direction.",
    ],
    deliverables: ["User research", "Interface design", "Design systems", "Usability testing"],
    seo: { title: "Product design", description: "Product and design-system work from Ravens." },
  },
  {
    slug: "motion-3d",
    title: "Motion & 3D",
    summary: "Motion language and real-time 3D that bring a brand to life.",
    body: [
      "Motion is how a brand behaves. We define timing, easing and choreography, then carry it through web, video and real-time 3D.",
      "Everything respects reduced-motion preferences and degrades gracefully on lower-powered devices.",
    ],
    deliverables: ["Motion principles", "WebGL experiences", "3D asset pipeline", "Launch films"],
    seo: { title: "Motion & 3D", description: "Motion design and real-time 3D from Ravens." },
  },
];
