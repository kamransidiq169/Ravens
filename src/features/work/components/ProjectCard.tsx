import { Image } from "@/components/ui/Image";
import { Link } from "@/components/ui/Link";

import type { Project } from "@/types/domain/project";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article className="group relative">
      <div className="overflow-hidden rounded-lg shadow-soft">
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          priority={priority}
          className="transition-transform duration-1000 ease-out-expo group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="text-2xl font-light text-ink">
          <Link href={`/work/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>
        <p className="text-xs tracking-label text-ink-soft uppercase">{project.year}</p>
      </div>
      <p className="mt-2 max-w-md text-sm text-ink-soft">{project.summary}</p>
    </article>
  );
}
