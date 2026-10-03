import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactCta } from "@/features/contact";
import { ProjectDetail, getNextProject, getProject, getProjects } from "@/features/work";

import { JsonLd, creativeWorkJsonLd } from "@/components/seo/JsonLd";

import { createMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ project: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[project]">): Promise<Metadata> {
  const { project: slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return createMetadata({ ...project.seo, image: project.seo.image ?? project.cover, path: `/work/${project.slug}` });
}

export default async function ProjectPage({ params }: PageProps<"/work/[project]">) {
  const { project: slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const next = await getNextProject(project.slug);

  return (
    <>
      <JsonLd
        data={creativeWorkJsonLd({
          name: project.title,
          description: project.summary,
          path: `/work/${project.slug}`,
          image: project.cover.src,
          datePublished: String(project.year),
        })}
      />
      <ProjectDetail project={project} next={next} />
      <ContactCta />
    </>
  );
}
