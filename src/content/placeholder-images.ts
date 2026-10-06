// TEMPORARY imagery — Unsplash stand-ins for the real project photography.
// To go live: add real `cover` images to the projects in ./projects.ts (anything not under /placeholder/ is used as-is),
// then delete this file and the `withPlaceholderCovers` call in features/work/components/SelectedWork.tsx.
import type { Image } from "@/types/domain/common";
import type { Project } from "@/types/domain/project";

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2400&q=80`;

/** Cover ratio shared with the real project data (1600×1000), so layout is identical once images are swapped. */
const WIDTH = 1600;
const HEIGHT = 1000;

export const placeholderImages: Image[] = [
  {
    src: unsplash("1600585154340-be6161a56a0c"),
    alt: "Contemporary timber-and-glass architecture glowing at dusk",
    width: WIDTH,
    height: HEIGHT,
  },
  {
    src: unsplash("1600607687939-ce8a6c25118c"),
    alt: "Light-filled interior with timber panelling and a stone feature wall",
    width: WIDTH,
    height: HEIGHT,
  },
  {
    src: unsplash("1613490493576-7fde63acd811"),
    alt: "White modernist building with cedar soffits reflected in still water",
    width: WIDTH,
    height: HEIGHT,
  },
  {
    src: unsplash("1486406146926-c627a92ad1ab"),
    alt: "Glass commercial towers rising against a soft sky, seen from below",
    width: WIDTH,
    height: HEIGHT,
  },
  {
    src: unsplash("1511818966892-d7d671e672a2"),
    alt: "Sculptural white-and-glass building with a dramatic cantilevered form",
    width: WIDTH,
    height: HEIGHT,
  },
];

const isPlaceholderCover = (project: Project) => project.cover.src.startsWith("/placeholder/");

/** Swaps in a distinct stand-in image per project, only where the project has no real cover yet. */
export function withPlaceholderCovers(projects: Project[]): Project[] {
  return projects.map((project, index) => {
    const image = placeholderImages[index % placeholderImages.length];
    return image && isPlaceholderCover(project) ? { ...project, cover: image } : project;
  });
}
