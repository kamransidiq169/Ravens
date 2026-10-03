import { Magnetic } from "@/components/motion/Magnetic";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ContactCta() {
  return (
    <Section aria-labelledby="contact-cta-heading" className="border-t border-ink/15">
      <SectionHeader
        id="contact-cta-heading"
        eyebrow="Start a project"
        title="Have something worth building? Let's talk."
      />
      <div className="mt-12">
        <Magnetic>
          <Button href="/contact" arrow>
            Get in touch
          </Button>
        </Magnetic>
      </div>
    </Section>
  );
}
