import { projects } from "@/content/projects";

import type { Project } from "@/types/domain/project";

// Data access for projects. Swap the bodies for CMS calls without touching any component.
export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return projects.find((project) => project.slug === slug);
}

export async function getNextProject(slug: string): Promise<Project | undefined> {
  const index = projects.findIndex((project) => project.slug === slug);
  return index === -1 ? undefined : projects[(index + 1) % projects.length];
}
