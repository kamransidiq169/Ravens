// PLACEHOLDER CONTENT — every quote, person and company below is fictional. Replace with real client quotes (with
// permission) and real logos before launch; none of these are actual Ravens clients.
import type { ClientLogo, Testimonial } from "@/types/domain/testimonial";

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    quote:
      "Ravens understood our business faster than agencies ten times their size. The site feels like us, only sharper.",
    author: "Amara Okafor",
    role: "Chief Executive",
    company: "Northlight Energy",
  },
  {
    id: "t-2",
    quote: "Calm, precise and genuinely collaborative. They made hard decisions feel easy.",
    author: "Julian Moreau",
    role: "Creative Director",
    company: "Halden Atelier",
  },
  {
    id: "t-3",
    quote: "The design system they built is the reason four teams now ship in step. It paid for itself in a quarter.",
    author: "Priya Raman",
    role: "Head of Product",
    company: "Meridian Health",
  },
  {
    id: "t-4",
    quote: "They saw what we were becoming before we could say it ourselves, and then they built it.",
    author: "Placeholder Name",
    role: "Founder",
    company: "Common Ground",
  },
  {
    id: "t-5",
    quote: "Rare to find a studio this considered about craft and this honest about what matters.",
    author: "Placeholder Name",
    role: "Managing Partner",
    company: "Aster & Vale",
  },
];

/** PLACEHOLDER marks — swap for real, single-colour client logos (`logo: "/clients/name.svg"`). */
export const clientLogos: ClientLogo[] = Array.from({ length: 6 }, (_, i) => ({
  id: `c-${i + 1}`,
  name: `Client ${String(i + 1).padStart(2, "0")}`,
}));
