import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import type { Service } from "@/types/domain/service";

export function ServicesIndex({ services }: { services: Service[] }) {
  return (
    <Section intro>
      <SectionHeader
        as="h1"
        eyebrow="Services"
        title="Design and development, end to end"
        description="Strategy, identity, interface and engineering under one roof, so nothing gets lost between teams."
      />
      <ul className="mt-16 grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <li
            key={service.slug}
            className="group relative rounded-lg border border-ink/15 bg-bg-top/50 p-8 transition-shadow duration-500 hover:shadow-lift"
          >
            <h2 className="text-2xl font-light text-ink">
              <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
                {service.title}
              </Link>
            </h2>
            <p className="mt-4 text-ink-soft">{service.summary}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
