import { cn } from "@/lib/cn";

import { WordReveal } from "../motion/WordReveal";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Heading level. Use "h1" once per page. */
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, as = "h2", id, className }: SectionHeaderProps) {
  return (
    <header className={cn("max-w-4xl", className)}>
      {eyebrow && (
        <p className="mb-6 font-display text-xs font-medium tracking-label text-ink-soft uppercase">{eyebrow}</p>
      )}
      <WordReveal as={as} id={id} text={title} className="text-display-md leading-[1.02] font-extralight text-ink" />
      {description && <p className="mt-8 max-w-2xl text-lg text-ink-soft">{description}</p>}
    </header>
  );
}
