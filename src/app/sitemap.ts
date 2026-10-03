import type { MetadataRoute } from "next";

import { getInsights } from "@/features/insights";
import { getServices } from "@/features/services";
import { getProjects } from "@/features/work";

import { absoluteUrl } from "@/lib/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, services, insights] = await Promise.all([getProjects(), getServices(), getInsights()]);

  const paths = [
    "/",
    "/about",
    "/services",
    ...services.map((service) => `/services/${service.slug}`),
    "/work",
    ...projects.map((project) => `/work/${project.slug}`),
    "/insights",
    ...insights.map((insight) => `/insights/${insight.slug}`),
    "/contact",
  ];

  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
