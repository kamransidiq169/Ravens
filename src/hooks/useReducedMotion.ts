import { MEDIA } from "@/lib/constants";

import { useMediaQuery } from "./useMediaQuery";

export function useReducedMotion(): boolean {
  return useMediaQuery(MEDIA.reducedMotion);
}
