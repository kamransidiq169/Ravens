import type { ProcessStep } from "@/types/domain/process";

/** The four chapters of the journey, in order. The copy comes from the content repository; this only fixes the order. */
export const STAGE_IDS = ["discover", "define", "design", "deliver"] as const;

type StageId = (typeof STAGE_IDS)[number];

export interface ProcessStage extends ProcessStep {
  id: StageId;
  /** "01" … "04" */
  index: string;
}

/** The one quiet line that surfaces at the peak of DISCOVER. */
export const WHISPER = "We look closer.";

/** Maps the repository's steps onto the four chapters. Unknown or missing steps are dropped, extras are ignored. */
export function toStages(steps: ProcessStep[]): ProcessStage[] {
  return STAGE_IDS.flatMap((id, i) => {
    const step = steps.find((s) => s.id === id);
    return step ? [{ ...step, id, index: String(i + 1).padStart(2, "0") }] : [];
  });
}
