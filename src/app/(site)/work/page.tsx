import { ContactCta } from "@/features/contact";
import { WorkIndex, getProjects } from "@/features/work";

import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Work",
  description: "Selected brand, web and product projects by Ravens.",
  path: "/work",
});

export default async function WorkPage() {
  return (
    <>
      <WorkIndex projects={await getProjects()} />
      <ContactCta />
    </>
  );
}
