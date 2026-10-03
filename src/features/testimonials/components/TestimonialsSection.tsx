import { FadeUp } from "@/components/motion/FadeUp";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { getTestimonials } from "../lib/repository";

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();

  return (
    <Section aria-labelledby="testimonials-heading">
      <SectionHeader id="testimonials-heading" eyebrow="Kind words" title="What our clients say" />
      <ul className="mt-16 grid gap-8 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <li key={item.id}>
            <FadeUp delay={index * 0.08} className="h-full">
              <figure className="flex h-full flex-col justify-between rounded-lg border border-ink/15 bg-bg-top/50 p-8">
                <blockquote className="text-lg font-light text-ink">“{item.quote}”</blockquote>
                <figcaption className="mt-8 text-sm text-ink-soft">
                  <span className="block font-medium text-ink">{item.author}</span>
                  {item.role}, {item.company}
                </figcaption>
              </figure>
            </FadeUp>
          </li>
        ))}
      </ul>
    </Section>
  );
}
