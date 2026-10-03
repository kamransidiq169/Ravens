import type { Seo, Slug } from "./common";

export interface Service {
  slug: Slug;
  title: string;
  summary: string;
  body: string[];
  deliverables: string[];
  seo: Seo;
}
