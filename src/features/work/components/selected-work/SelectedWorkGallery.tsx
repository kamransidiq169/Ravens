"use client";

import { useRef, type ReactNode } from "react";

import type { Project } from "@/types/domain/project";

import { SelectedWorkSlide } from "./SelectedWorkSlide";
import { useSelectedWorkScroll } from "./useSelectedWorkScroll";

import "./selected-work.css";

interface SelectedWorkGalleryProps {
  projects: Project[];
  labelledBy: string;
  /** Server-rendered header; lives inside the pinned scene so header and gallery read as one composition. */
  children: ReactNode;
}

export function SelectedWorkGallery({ projects, labelledBy, children }: SelectedWorkGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useSelectedWorkScroll(rootRef);

  return (
    <div ref={rootRef} className="sw" style={{ "--sw-count": projects.length } as React.CSSProperties}>
      <div data-sw="stage" className="sw__stage">
        <div className="sw__scene">
          {children}
          <ul data-sw="track" aria-labelledby={labelledBy} className="sw__track">
            {projects.map((project, index) => (
              <SelectedWorkSlide key={project.slug} project={project} index={index} priority={index === 0} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
