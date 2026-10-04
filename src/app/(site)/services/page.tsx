import { ServicesIndex } from "@/features/services";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Services",
  description: "Brand identity, web design, development, product design and motion from a single studio.",
  path: "/services",
});

export default function ServicesPage() {
  return <ServicesIndex />;
}
