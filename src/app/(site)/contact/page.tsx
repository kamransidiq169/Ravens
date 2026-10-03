import { ContactSection } from "@/features/contact";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Contact",
  description: "Start a project with Ravens. Tell us what you're building and we'll reply within two working days.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactSection />;
}
