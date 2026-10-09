import { ContactCta } from "@/features/contact";
import { Hero } from "@/features/hero";
import { ProcessSection } from "@/features/process";
import { ServicesPreview, getServices } from "@/features/services";
import { Showcase, ShowcaseBespoke, ShowcaseEnterprise, ShowcaseInteractive } from "@/features/showcase";
import { TestimonialsSection } from "@/features/testimonials";
import { SelectedWork, getProjects } from "@/features/work";

import { JsonLd, organizationJsonLd, webSiteJsonLd } from "@/components/seo/JsonLd";

import { createMetadata } from "@/lib/metadata";

import ServicesPage from "./services/page";

export const metadata = createMetadata({ path: "/" });

export default async function HomePage() {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  const [flagship] = projects;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <ProcessSection />
      <ServicesPage />
      <Hero
        chapter={flagship ? <Showcase project={flagship} /> : null}
        next={<ShowcaseInteractive />}
        last={<ShowcaseEnterprise />}
        bespoke={<ShowcaseBespoke />}
      />

      {/* <ServicesPreview services={services} /> */}
      <SelectedWork projects={projects} />

      <TestimonialsSection />
      <ContactCta />
    </>
  );
}
