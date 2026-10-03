import { FadeUp } from "@/components/motion/FadeUp";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { getProcessSteps } from "../lib/repository";

export async function ProcessSection() {
  const steps = await getProcessSteps();

  return (
    <Section aria-labelledby="process-heading">
      <SectionHeader id="process-heading" eyebrow="How we work" title="A calm process with no surprises" />
      <ol className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.id}>
            <FadeUp delay={index * 0.08}>
              <p className="text-sm text-ink-soft">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 border-t border-ink/30 pt-4 text-2xl font-light text-ink">{step.title}</h3>
              <p className="mt-3 text-ink-soft">{step.description}</p>
            </FadeUp>
          </li>
        ))}
      </ol>
    </Section>
  );
}
