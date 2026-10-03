import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { formatDate } from "@/lib/format-date";

import type { Insight } from "@/types/domain/insight";

export function InsightArticle({ insight }: { insight: Insight }) {
  return (
    <Section intro>
      <SectionHeader
        as="h1"
        eyebrow={`${insight.category} · ${formatDate(insight.publishedAt)} · ${insight.readingMinutes} min read`}
        title={insight.title}
        description={insight.excerpt}
      />
      <Image
        src={insight.cover.src}
        alt={insight.cover.alt}
        width={insight.cover.width}
        height={insight.cover.height}
        priority
        sizes="100vw"
        className="mt-16 rounded-lg shadow-lift"
      />
      <div className="mt-16 max-w-prose space-y-6 text-lg text-ink-soft">
        {insight.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-16">
        <Button href="/insights" variant="outline">
          All insights
        </Button>
      </div>
    </Section>
  );
}
