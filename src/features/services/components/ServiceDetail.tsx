import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import type { Service } from "@/types/domain/service";

export function ServiceDetail({ service }: { service: Service }) {
  return (
    <Section intro>
      <SectionHeader as="h1" eyebrow="Service" title={service.title} description={service.summary} />
      <div className="mt-16 grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 text-lg text-ink-soft">
          {service.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div>
          <h2 className="mb-5 font-display text-xs font-medium tracking-label text-ink-soft uppercase">Deliverables</h2>
          <ul className="divide-y divide-ink/15 border-y border-ink/15">
            {service.deliverables.map((item) => (
              <li key={item} className="py-4 text-ink">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-16 flex flex-wrap gap-4">
        <Button href="/contact" arrow>
          Discuss this service
        </Button>
        <Button href="/services" variant="outline">
          All services
        </Button>
      </div>
    </Section>
  );
}
