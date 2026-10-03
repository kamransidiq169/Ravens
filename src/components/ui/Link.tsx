import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export interface LinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href"> {
  href: string;
  /** `inline` underlines; `plain` leaves styling to the caller. */
  variant?: "inline" | "plain";
}

const isExternal = (href: string) =>
  /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

export function Link({ href, variant = "plain", className, children, ...props }: LinkProps) {
  const classes = cn(
    "rounded-sm transition-colors duration-300",
    variant === "inline" && "underline decoration-ink/30 underline-offset-4 hover:decoration-ink",
    className,
  );

  if (isExternal(href)) {
    const opensNewTab = href.startsWith("http") || href.startsWith("//");
    return (
      <a
        href={href}
        className={classes}
        {...(opensNewTab && { target: "_blank", rel: "noopener noreferrer" })}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={classes} {...props}>
      {children}
    </NextLink>
  );
}
