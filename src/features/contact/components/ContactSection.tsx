import { Link } from "@/components/ui/Link";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { siteConfig } from "@/config/site";

import { ContactForm } from "./ContactForm";

export function ContactSection() {
  return (
    <Section intro>
      <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeader
            as="h1"
            eyebrow="Contact"
            title="Tell us what you're building"
            description="We reply to every enquiry within two working days."
          />
          <p className="mt-10 text-ink-soft">
            Prefer email?{" "}
            <Link href={`mailto:${siteConfig.email}`} variant="inline" className="text-ink">
              {siteConfig.email}
            </Link>
          </p>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
