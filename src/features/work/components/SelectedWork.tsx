import { FadeUp } from "@/components/motion/FadeUp";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

import type { Project } from "@/types/domain/project";

import { ProjectCard } from "./ProjectCard";

export function SelectedWork({ projects }: { projects: Project[] }) {
  return (
    <Section aria-labelledby="selected-work-heading">
      <SectionHeader id="selected-work-heading" eyebrow="Selected work" title="Brands and products we're proud of" />
      <ul className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {projects.map((project, index) => (
          <li key={project.slug} className={index % 2 === 1 ? "md:mt-24" : undefined}>
            <FadeUp>
              <ProjectCard project={project} />
            </FadeUp>
          </li>
        ))}
      </ul>
      <div className="mt-20">
        <Button href="/work" variant="outline" arrow>
          All work
        </Button>
      </div>
    </Section>
  );
}
