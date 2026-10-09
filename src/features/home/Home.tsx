import { ContactCta } from "@/features/contact";
import { ProcessSection } from "@/features/process";
import { ServicesIndex } from "@/features/services";
import { SelectedWork, getProjects } from "@/features/work";

import { JsonLd, organizationJsonLd, webSiteJsonLd } from "@/components/seo/JsonLd";

import { Showcase } from "./sections/Hero/chapters/Showcase";
import { ShowcaseBespoke } from "./sections/Hero/chapters/ShowcaseBespoke";
import { ShowcaseEnterprise } from "./sections/Hero/chapters/ShowcaseEnterprise";
import { ShowcaseInteractive } from "./sections/Hero/chapters/ShowcaseInteractive";
import { Hero } from "./sections/Hero/Hero";
import { TestimonialsSection } from "./sections/Testimonials/Testimonials";

/** The home page: process, services, the hero → project journey, selected work, testimonials and the closing CTA. */
export async function Home() {
  const projects = await getProjects();
  const [flagship] = projects;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <ProcessSection />
      <ServicesIndex />
      <Hero
        chapter={flagship ? <Showcase project={flagship} /> : null}
        next={<ShowcaseInteractive />}
        last={<ShowcaseEnterprise />}
        bespoke={<ShowcaseBespoke />}
      />
      <SelectedWork projects={projects} />
      <TestimonialsSection />
      <ContactCta />
    </>
  );
}
