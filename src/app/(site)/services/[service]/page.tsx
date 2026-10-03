import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactCta } from "@/features/contact";
import { ServiceDetail, getService, getServices } from "@/features/services";

import { createMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  return (await getServices()).map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[service]">): Promise<Metadata> {
  const { service: slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return createMetadata({ ...service.seo, path: `/services/${service.slug}` });
}

export default async function ServicePage({ params }: PageProps<"/services/[service]">) {
  const { service: slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <>
      <ServiceDetail service={service} />
      <ContactCta />
    </>
  );
}
