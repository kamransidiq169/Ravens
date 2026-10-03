import { siteConfig } from "@/config/site";

/** Resolves a site-relative path against the configured origin. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}
