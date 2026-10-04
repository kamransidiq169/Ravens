import { FadeUp } from "@/components/motion/FadeUp";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import type { Service } from "@/types/domain/service";

export function ServicesPreview({ services }: { services: Service[] }) {
  return (
    <Section aria-labelledby="services-preview-heading">
      <SectionHeader
        id="services-preview-heading"
        eyebrow="What we do"
        title="One studio, every layer of your digital presene"
      />
      <ol className="mt-16 border-t border-ink/15">
        {services.map((service, index) => (
          <li key={service.slug} className="border-b border-ink/15">
            <FadeUp>
              <Link
                href={`/services/${service.slug}`}
                className="group grid gap-4 py-8 md:grid-cols-[6rem_1fr_1.2fr] md:items-baseline"
              >
                <span className="text-sm text-ink-soft">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-2xl font-light text-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                  {service.title}
                </span>
                <span className="text-base text-ink-soft">{service.summary}</span>
              </Link>
            </FadeUp>
          </li>
        ))}
      </ol>
      <div className="mt-16">
        <Button href="/services" variant="outline" arrow>
          All services
        </Button>
      </div>
    </Section>
  );
}
