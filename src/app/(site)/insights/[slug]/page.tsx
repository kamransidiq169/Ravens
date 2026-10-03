import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InsightArticle, getInsight, getInsights } from "@/features/insights";

import { createMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getInsights()).map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsight(slug);
  if (!insight) return {};
  return createMetadata({
    ...insight.seo,
    image: insight.seo.image ?? insight.cover,
    path: `/insights/${insight.slug}`,
    type: "article",
  });
}

export default async function InsightPage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const insight = await getInsight(slug);
  if (!insight) notFound();

  return <InsightArticle insight={insight} />;
}
