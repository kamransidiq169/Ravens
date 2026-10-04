import { clientLogos, testimonials } from "@/content/testimonials";

import type { ClientLogo, Testimonial } from "@/types/domain/testimonial";

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  return clientLogos;
}
