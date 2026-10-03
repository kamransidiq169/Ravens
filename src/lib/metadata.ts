import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

import type { Seo } from "@/types/domain/common";

import { absoluteUrl } from "./url";

interface MetadataInput extends Partial<Seo> {
  /** Site-relative path, used for canonical + Open Graph URL. */
  path: string;
  type?: "website" | "article";
}

/** Single place every page's <head> metadata derives from. */
export function createMetadata({ title, description, image, path, type = "website" }: MetadataInput): Metadata {
  const resolvedDescription = description ?? siteConfig.description;
  const images = image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined;

  return {
    ...(title && { title }),
    description: resolvedDescription,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: absoluteUrl(path),
      title: title ?? siteConfig.name,
      description: resolvedDescription,
      ...(images && { images }),
    },
    twitter: { card: "summary_large_image", title: title ?? siteConfig.name, description: resolvedDescription },
  };
}
