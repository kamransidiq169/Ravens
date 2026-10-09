import { testimonials } from "@/content/testimonials";

import type { Testimonial } from "@/types/domain/testimonial";

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}
