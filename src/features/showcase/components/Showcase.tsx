import { Magnetic } from "@/components/motion/Magnetic";
import { Parallax } from "@/components/motion/Parallax";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Image } from "@/components/ui/Image";

import type { Project } from "@/types/domain/project";

/** Placeholder project showcase. Its background picks up exactly where the hero's atmosphere ends. */
export function Showcase({ projects }: { projects: Project[] }) {
  const [flagship, ...rest] = projects;
  if (!flagship) return null;

  return (
    <section
      aria-labelledby="showcase-heading"
      className="relative z-(--z-content) bg-bg [background-image:linear-gradient(180deg,var(--color-bg-edge)_0%,var(--color-bg)_35%,var(--color-bg)_100%)] py-section"
    >
      <Container>
        <p className="mb-6 font-display text-xs font-medium tracking-label text-ink-soft uppercase">Featured project</p>
        <h2 id="showcase-heading" className="text-display-md leading-none font-extralight text-ink">
          {flagship.title}
        </h2>

        <Parallax className="mt-12 rounded-lg shadow-lift" speed={6}>
          <Image
            src={flagship.cover.src}
            alt={flagship.cover.alt}
            width={flagship.cover.width}
            height={flagship.cover.height}
            priority={false}
          />
        </Parallax>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-lg text-ink-soft">{flagship.summary}</p>
          <Magnetic>
            <Button href={`/work/${flagship.slug}`} arrow>
              View project
            </Button>
          </Magnetic>
        </div>

        {rest.length > 0 && (
          <ul className="mt-20 grid gap-px border-t border-ink/15 sm:grid-cols-3">
            {rest.slice(0, 3).map((project) => (
              <li key={project.slug} className="border-b border-ink/15 py-6 sm:border-b-0 sm:pr-6">
                <p className="text-xs tracking-label text-ink-soft uppercase">{project.year}</p>
                <p className="mt-2 text-xl font-light text-ink">{project.title}</p>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
