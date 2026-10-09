import { Image } from "@/components/ui/Image";
import { Link } from "@/components/ui/Link";

import type { Project } from "@/types/domain/project";

import { SelectedWorkInfo } from "./SelectedWorkInfo";

interface SelectedWorkSlideProps {
  project: Project;
  index: number;
  priority?: boolean;
}

export function SelectedWorkSlide({ project, index, priority = false }: SelectedWorkSlideProps) {
  const { cover } = project;

  return (
    <li data-sw="slide" data-active={index === 0 ? "" : undefined} className="sw__slide">
      <article className="relative">
        <div data-sw="media" className="sw__media">
          <Link
            href={`/work/${project.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 block rounded-none"
          >
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              sizes="(min-width: 768px) 46vw, 84vw"
              className="h-full"
            />
          </Link>
        </div>
        <SelectedWorkInfo project={project} />
      </article>
    </li>
  );
}
