import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { aboutConfig } from "../about.config";

export function AboutIntro() {
  return (
    <Section intro>
      <SectionHeader as="h1" eyebrow={aboutConfig.eyebrow} title={aboutConfig.title} />
      <div className="mt-12 max-w-2xl space-y-6 text-lg text-ink-soft">
        {aboutConfig.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
