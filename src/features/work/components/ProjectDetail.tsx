import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Image } from "@/components/ui/Image";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Video } from "@/components/ui/Video";

import type { Project } from "@/types/domain/project";

export function ProjectDetail({ project, next }: { project: Project; next?: Project }) {
  return (
    <>
      <Section intro>
        <SectionHeader
          as="h1"
          eyebrow={`${project.client} — ${project.year}`}
          title={project.title}
          description={project.summary}
        />
        <ul className="mt-8 flex flex-wrap gap-3" aria-label="Disciplines">
          {project.disciplines.map((discipline) => (
            <li
              key={discipline}
              className="rounded-pill border border-ink/30 px-4 py-1.5 text-xs tracking-label text-ink-soft uppercase"
            >
              {discipline}
            </li>
          ))}
        </ul>
      </Section>

      <Container className="relative z-(--z-content)">
        {project.video ? (
          <Video
            src={project.video.src}
            poster={project.video.poster}
            label={`${project.title} showreel`}
            className="rounded-lg shadow-lift"
          />
        ) : (
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            priority
            sizes="100vw"
            className="rounded-lg shadow-lift"
          />
        )}
      </Container>

      <Section>
        <div className="max-w-prose space-y-6 text-lg text-ink-soft">
          {project.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {next && (
          <div className="mt-20 border-t border-ink/15 pt-10">
            <p className="mb-6 text-xs tracking-label text-ink-soft uppercase">Next project</p>
            <Button href={`/work/${next.slug}`} arrow>
              {next.title}
            </Button>
          </div>
        )}
      </Section>
    </>
  );
}
