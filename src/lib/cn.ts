import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Without this, tailwind-merge reads `text-display-*` as a colour and drops it when a colour follows.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["display-md", "display-lg", "display-xl"] }] } },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
