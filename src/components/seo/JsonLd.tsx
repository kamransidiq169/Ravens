import { absoluteUrl } from "@/lib/url";

import { siteConfig } from "@/config/site";

type JsonLdData = Record<string, unknown>;

/** Serialises structured data; `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/icon-512.png"),
    email: siteConfig.email,
    sameAs: siteConfig.socials.map((social) => social.href),
  };
}

export function webSiteJsonLd(): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function creativeWorkJsonLd(input: {
  name: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
}): JsonLdData {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    creator: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    ...(input.image && { image: absoluteUrl(input.image) }),
    ...(input.datePublished && { datePublished: input.datePublished }),
  };
}
