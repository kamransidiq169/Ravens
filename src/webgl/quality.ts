import { MAX_DPR } from "@/lib/constants";

export type QualityTier = "low" | "medium" | "high";

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/** Coarse device-capability estimate used to pick the initial DPR range. */
export function getQualityTier(): QualityTier {
  if (typeof navigator === "undefined") return "medium";
  const { hardwareConcurrency = 4, deviceMemory = 4 } = navigator as NavigatorWithMemory;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  if (deviceMemory <= 2 || hardwareConcurrency <= 2) return "low";
  if (coarsePointer || deviceMemory <= 4 || hardwareConcurrency <= 4) return "medium";
  return "high";
}

/** [min, max] DPR range for a tier, never above MAX_DPR. */
export function dprRangeForTier(tier: QualityTier): [number, number] {
  switch (tier) {
    case "low":
      return [1, 1];
    case "medium":
      return [1, Math.min(1.5, MAX_DPR)];
    case "high":
      return [1, MAX_DPR];
  }
}
