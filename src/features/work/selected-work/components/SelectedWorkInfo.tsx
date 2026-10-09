import type { Project } from "@/types/domain/project";

/** The overlapping editorial panel: a hairline warm frame around a white plate. Moves with its slide. */
export function SelectedWorkInfo({ project }: { project: Project }) {
  const href = `/work/${project.slug}`;
  const websiteUrl = project.websiteUrl;

  return (
    <div data-sw="info" className="sw__info">
      <div className="sw__plate">
        <p className="sw__info-eyebrow">{project.disciplines[0] ?? project.client}</p>
        <h3 className="sw__info-title">
          <a href={href} className="focus-visible:outline-offset-4">
            {project.title}
          </a>
        </h3>
        <p className="sw__info-copy">{project.summary}</p>
        <a
          href={websiteUrl ?? href}
          target={websiteUrl ? "_blank" : undefined}
          rel={websiteUrl ? "noopener noreferrer" : undefined}
          tabIndex={-1}
          aria-hidden="true"
          className="sw__cta"
        >
          Explore More
        </a>
      </div>
    </div>
  );
}
