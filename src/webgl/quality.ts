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

/** Pixels the canvas may fill on a touch device, about what a 1440 x 900 desktop at MAX_DPR already draws. */
const TOUCH_PIXEL_BUDGET = 2_100_000;
const TOUCH_MAX_DPR = 2.5;
const TOUCH_MIN_DPR = 1.5;

/**
 * Where the shared canvas's DPR may go. Desktops keep the tier range. A phone's screen is 2-3x dense, so capping it at
 * the desktop ceiling renders the scene at roughly half the screen's resolution and the browser upscales it (soft tile
 * edges, soft titles). Touch devices instead get the screen's own density, bounded by a pixel budget (the canvas is
 * the full viewport) so a large or very dense screen cannot cost more than a desktop does. The floor, used when the
 * frame rate drops, stays sharper than the old ceiling. Low-power devices keep their tier.
 */
export function dprRange(tier: QualityTier): [number, number] {
  const base = dprRangeForTier(tier);
  if (tier === "low" || typeof window === "undefined" || !window.matchMedia("(pointer: coarse)").matches) return base;
  const { innerWidth, innerHeight, devicePixelRatio = 1 } = window;
  const budget = Math.sqrt(TOUCH_PIXEL_BUDGET / Math.max(innerWidth * innerHeight, 1));
  const max = Math.max(base[1], Math.min(devicePixelRatio, TOUCH_MAX_DPR, budget));
  return [Math.min(max, Math.max(base[0], TOUCH_MIN_DPR)), max];
}
