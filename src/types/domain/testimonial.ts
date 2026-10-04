export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

/** A client shown in the "Trusted by" wall. Without `logo` a neutral placeholder mark is drawn. */
export interface ClientLogo {
  id: string;
  name: string;
  /** Path to a single-colour logo (SVG/PNG); it is rendered monochrome. */
  logo?: string;
}
