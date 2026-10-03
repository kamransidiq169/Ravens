import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

import { Container } from "./Container";

interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  /** Remove vertical padding (e.g. full-bleed hero). */
  flush?: boolean;
  /** First section of a page: clears the fixed header. */
  intro?: boolean;
  containerClassName?: string;
}

export function Section({
  flush = false,
  intro = false,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative z-(--z-content)",
        !flush && "py-section",
        intro && "pt-[calc(var(--header-height)+var(--spacing-section-sm))]",
        className,
      )}
      {...props}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
