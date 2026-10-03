import type { Image, Seo, Slug } from "./common";

export interface Insight {
  slug: Slug;
  title: string;
  excerpt: string;
  /** ISO 8601 date (YYYY-MM-DD). */
  publishedAt: string;
  readingMinutes: number;
  category: string;
  body: string[];
  cover: Image;
  seo: Seo;
}
