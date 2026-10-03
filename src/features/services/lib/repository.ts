import { services } from "@/content/services";

import type { Service } from "@/types/domain/service";

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getService(slug: string): Promise<Service | undefined> {
  return services.find((service) => service.slug === slug);
}
