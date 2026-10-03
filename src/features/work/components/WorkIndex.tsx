import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import type { Project } from "@/types/domain/project";

import { ProjectCard } from "./ProjectCard";

export function WorkIndex({ projects }: { projects: Project[] }) {
  return (
    <Section intro>
      <SectionHeader
        as="h1"
        eyebrow="Work"
        title="Selected projects"
        description="A cross-section of brands, websites and products we've designed and built with ambitious teams."
      />
      <ul className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {projects.map((project, index) => (
          <li key={project.slug}>
            <ProjectCard project={project} priority={index < 2} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
