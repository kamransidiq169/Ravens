import { Principles } from "@/features/about";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "About",
  description: "Ravens is a small, senior design and development studio focused on considered, lasting digital work.",
  path: "/about",
});

export default function AboutPage() {
  return <Principles />;
}
