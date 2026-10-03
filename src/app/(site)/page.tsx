import { ContactCta } from "@/features/contact";
import { Hero } from "@/features/hero";
import { ProcessSection } from "@/features/process";
import { ServicesPreview, getServices } from "@/features/services";
import { Showcase } from "@/features/showcase";
import { TestimonialsSection } from "@/features/testimonials";
import { SelectedWork, getProjects } from "@/features/work";

import { JsonLd, organizationJsonLd, webSiteJsonLd } from "@/components/seo/JsonLd";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({ path: "/" });

export default async function HomePage() {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <Hero />
      <Showcase projects={projects} />
      <ServicesPreview services={services} />
      <SelectedWork projects={projects} />
      <ProcessSection />
      <TestimonialsSection />
      <ContactCta />
    </>
  );
}
