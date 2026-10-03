import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Link } from "./Link";

type Variant = "primary" | "outline" | "ghost";

interface CommonProps {
  variant?: Variant;
  /** Appends the → arrow used by the "VIEW PROJECT →" pill. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps & Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps & Omit<ComponentPropsWithoutRef<"a">, keyof CommonProps | "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "group inline-flex min-h-12 items-center justify-center gap-3 rounded-pill px-8 font-display text-xs font-medium uppercase tracking-label whitespace-nowrap transition-[transform,background-color,color,box-shadow] duration-500 ease-out-expo focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-button text-bg-top shadow-button hover:-translate-y-0.5 hover:bg-ink",
  outline: "border border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-bg-top",
  ghost: "px-2 text-ink hover:text-ink-soft",
};

export function Button({ variant = "primary", arrow = false, className, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span aria-hidden="true" className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
          →
        </span>
      )}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorProps } = props as Omit<ButtonAsLink, keyof CommonProps>;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
