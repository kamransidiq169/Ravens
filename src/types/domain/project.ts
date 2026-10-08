import type { Image, Seo, Slug } from "./common";

export interface Project {
  slug: Slug;
  title: string;
  client: string;
  year: number;
  /** One-line positioning shown on cards. */
  summary: string;
  /** Long-form paragraphs for the project page, if one is used. */
  body: string[];
  disciplines: string[];
  cover: Image;
  video?: { src: string; poster: string };
  seo: Seo;
  /** External website for the project, when one exists. Shown as the “Explore More” action in SelectedWork. */
  websiteUrl?: string;
}
