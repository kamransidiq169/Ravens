import { getClientLogos, getTestimonials } from "../lib/repository";

import { TestimonialsStage } from "./TestimonialsStage";

const HEADING_ID = "testimonials-heading";

/** Server shell: loads the data and renders the section; all motion lives in the client stage. */
export async function TestimonialsSection() {
  const [testimonials, clients] = await Promise.all([getTestimonials(), getClientLogos()]);

  return (
    <section aria-labelledby={HEADING_ID} className="tm-section">
      <TestimonialsStage headingId={HEADING_ID} testimonials={testimonials} clients={clients} />
      {/* Without JS the pinned layout can't run, so fall back to the stacked layout. */}
      <noscript>
        <style>{`.tm{height:auto!important}.tm__stage{position:static!important;height:auto!important}.tm__layers,.tm__layer,.tm__intro{position:static!important;opacity:1!important;transform:none!important}`}</style>
      </noscript>
    </section>
  );
}
