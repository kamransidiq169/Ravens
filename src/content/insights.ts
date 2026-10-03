// PLACEHOLDER CONTENT — replace with real articles.
import type { Insight } from "@/types/domain/insight";

const cover = (n: number, alt: string) => ({ src: `/placeholder/insight-${n}.svg`, alt, width: 1600, height: 1000 });

export const insights: Insight[] = [
  {
    slug: "designing-for-restraint",
    title: "Designing for restraint",
    excerpt: "Why the strongest digital brands say less, and how to decide what to leave out.",
    publishedAt: "2026-03-04",
    readingMinutes: 5,
    category: "Design",
    body: [
      "Restraint is not minimalism. It is the discipline of choosing one idea and giving it room to breathe.",
      "In practice that means fewer type sizes, a tighter palette and a layout that lets a single element lead. We use a simple test: if removing something doesn't hurt, it was never needed.",
    ],
    cover: cover(1, "Abstract gradient artwork for the article Designing for restraint"),
    seo: { title: "Designing for restraint", description: "Why the strongest digital brands say less." },
  },
  {
    slug: "performance-is-a-design-decision",
    title: "Performance is a design decision",
    excerpt: "Fast sites are decided in the first design review, not the last sprint.",
    publishedAt: "2026-01-22",
    readingMinutes: 6,
    category: "Engineering",
    body: [
      "Every hero video and web font is a trade. Setting a performance budget before pixels are pushed turns those trades into explicit choices.",
      "We budget JavaScript, imagery and motion per route, then verify each one on a production build before launch.",
    ],
    cover: cover(2, "Abstract gradient artwork for the article Performance is a design decision"),
    seo: { title: "Performance is a design decision", description: "Why fast sites are decided in design review." },
  },
  {
    slug: "motion-with-manners",
    title: "Motion with manners",
    excerpt: "A practical approach to animation that respects attention and accessibility.",
    publishedAt: "2025-11-10",
    readingMinutes: 4,
    category: "Motion",
    body: [
      "Good motion explains; bad motion performs. We reserve movement for moments that need orientation or emphasis.",
      "Every animation ships with a reduced-motion alternative, tested like any other state.",
    ],
    cover: cover(3, "Abstract gradient artwork for the article Motion with manners"),
    seo: { title: "Motion with manners", description: "Animation that respects attention and accessibility." },
  },
];
