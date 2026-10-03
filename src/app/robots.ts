import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/hero-lab"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
