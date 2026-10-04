import { Link } from "@/components/ui/Link";

import type { Project } from "@/types/domain/project";

/** The overlapping editorial panel: a hairline warm frame around a white plate. Moves with its slide. */
export function SelectedWorkInfo({ project }: { project: Project }) {
  const href = `/work/${project.slug}`;

  return (
    <div data-sw="info" className="sw__info">
      <div className="sw__plate">
        <p className="sw__info-eyebrow">{project.disciplines[0] ?? project.client}</p>
        <h3 className="sw__info-title">
          <Link href={href} className="focus-visible:outline-offset-4">
            {project.title}
          </Link>
        </h3>
        <p className="sw__info-copy">{project.summary}</p>
        {/* The title link is the keyboard/AT stop; this one is a pointer affordance. */}
        <Link href={href} tabIndex={-1} aria-hidden="true" className="sw__cta">
          Explore More
        </Link>
      </div>
    </div>
  );
}
