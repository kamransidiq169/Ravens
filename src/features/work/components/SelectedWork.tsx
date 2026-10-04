import { Link } from "@/components/ui/Link";

import { withPlaceholderCovers } from "@/content/placeholder-images";

import type { Project } from "@/types/domain/project";

import { editorialSerif } from "./selected-work/fonts";
import { SelectedWorkGallery } from "./selected-work/SelectedWorkGallery";
import { SelectedWorkHeader } from "./selected-work/SelectedWorkHeader";

const HEADING_ID = "selected-work-heading";

export function SelectedWork({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby={HEADING_ID} className={`sw-section ${editorialSerif.variable} relative z-(--z-content)`}>
      <SelectedWorkGallery projects={withPlaceholderCovers(projects)} labelledBy={HEADING_ID}>
        <SelectedWorkHeader id={HEADING_ID} />
      </SelectedWorkGallery>

      <p className="sw__all">
        <Link href="/work">View all work</Link>
      </p>
    </section>
  );
}
