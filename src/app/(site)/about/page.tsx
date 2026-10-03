import { AboutIntro, Principles } from "@/features/about";
import { ContactCta } from "@/features/contact";
import { ProcessSection } from "@/features/process";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "About",
  description: "Ravens is a small, senior design and development studio focused on considered, lasting digital work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <AboutIntro />
      <Principles />
      <ProcessSection />
      <ContactCta />
    </>
  );
}
