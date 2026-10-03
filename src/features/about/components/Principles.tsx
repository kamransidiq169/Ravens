import { FadeUp } from "@/components/motion/FadeUp";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { aboutConfig } from "../about.config";

export function Principles() {
  return (
    <Section aria-labelledby="principles-heading">
      <SectionHeader id="principles-heading" eyebrow="Principles" title={aboutConfig.principlesTitle} />
      <ul className="mt-16 grid gap-px bg-ink/15 md:grid-cols-2">
        {aboutConfig.principles.map((principle) => (
          <li key={principle.title} className="bg-bg p-8 md:p-10">
            <FadeUp>
              <h3 className="text-2xl font-light text-ink">{principle.title}</h3>
              <p className="mt-3 text-ink-soft">{principle.description}</p>
            </FadeUp>
          </li>
        ))}
      </ul>
    </Section>
  );
}
