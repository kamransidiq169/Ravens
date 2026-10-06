export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  /** Portrait shown beside the quote. Fixed per testimonial; swap the URL (or a local /path) to replace it. */
  image: string;
  /** Alt text for the portrait. */
  imageAlt: string;
  /** CSS object-position, to frame each portrait deliberately. Defaults to centre. */
  imagePosition?: string;
}

/** A client shown in the "Trusted by" wall. Without `logo` a neutral placeholder mark is drawn. */
export interface ClientLogo {
  id: string;
  name: string;
  /** Path to a single-colour logo (SVG/PNG); it is rendered monochrome. */
  logo?: string;
}
