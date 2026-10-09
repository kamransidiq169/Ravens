import type { Seo, Slug } from "./common";

export interface Service {
  slug: Slug;
  title: string;
  summary: string;
  body: string[];
  deliverables: string[];
  seo: Seo;
}

/** One photographic panel in the services gallery. */
export interface ServicePanel {
  label: string;
  alt: string;
  src: string;
}
