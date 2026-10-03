import NextImage, { type ImageProps as NextImageProps } from "next/image";

import { cn } from "@/lib/cn";

export type ImageProps = NextImageProps;

/** Thin wrapper around next/image with studio defaults (responsive sizes, lazy by default). */
export function Image({ className, sizes = "(min-width: 1024px) 50vw, 100vw", alt, ...props }: ImageProps) {
  return <NextImage className={cn("h-auto w-full object-cover", className)} sizes={sizes} alt={alt} {...props} />;
}
