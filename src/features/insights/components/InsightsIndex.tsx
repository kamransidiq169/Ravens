import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import type { Insight } from "@/types/domain/insight";

import { InsightCard } from "./InsightCard";

export function InsightsIndex({ insights }: { insights: Insight[] }) {
  return (
    <Section intro>
      <SectionHeader
        as="h1"
        eyebrow="Insights"
        title="Notes from the studio"
        description="Short, practical writing on design, engineering and motion."
      />
      <ul className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <li key={insight.slug}>
            <InsightCard insight={insight} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
