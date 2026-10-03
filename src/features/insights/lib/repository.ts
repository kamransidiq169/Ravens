import { insights } from "@/content/insights";

import type { Insight } from "@/types/domain/insight";

/** Newest first. */
export async function getInsights(): Promise<Insight[]> {
  return [...insights].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getInsight(slug: string): Promise<Insight | undefined> {
  return insights.find((insight) => insight.slug === slug);
}
