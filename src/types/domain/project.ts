import type { Image, Seo, Slug } from "./common";

export interface Project {
  slug: Slug;
  title: string;
  client: string;
  year: number;
  /** One-line positioning shown on cards. */
  summary: string;
  /** Long-form paragraphs for the case-study page. */
  body: string[];
  disciplines: string[];
  cover: Image;
  video?: { src: string; poster: string };
  seo: Seo;
}
