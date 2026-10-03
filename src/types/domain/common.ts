export type Slug = string;

export interface Image {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Seo {
  title: string;
  description: string;
  image?: Image;
}
