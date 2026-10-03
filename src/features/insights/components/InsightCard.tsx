import { Image } from "@/components/ui/Image";
import { Link } from "@/components/ui/Link";

import { formatDate } from "@/lib/format-date";

import type { Insight } from "@/types/domain/insight";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article className="group relative">
      <div className="overflow-hidden rounded-lg shadow-soft">
        <Image
          src={insight.cover.src}
          alt={insight.cover.alt}
          width={insight.cover.width}
          height={insight.cover.height}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="transition-transform duration-1000 ease-out-expo group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-5 text-xs tracking-label text-ink-soft uppercase">
        {insight.category} · <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
      </p>
      <h2 className="mt-2 text-xl font-light text-ink">
        <Link href={`/insights/${insight.slug}`} className="after:absolute after:inset-0">
          {insight.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm text-ink-soft">{insight.excerpt}</p>
    </article>
  );
}
