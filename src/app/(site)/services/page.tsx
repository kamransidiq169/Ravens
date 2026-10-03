import { ContactCta } from "@/features/contact";
import { ServicesIndex, getServices } from "@/features/services";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Services",
  description: "Brand identity, web design, development, product design and motion from a single studio.",
  path: "/services",
});

export default async function ServicesPage() {
  return (
    <>
      <ServicesIndex services={await getServices()} />
      <ContactCta />
    </>
  );
}
