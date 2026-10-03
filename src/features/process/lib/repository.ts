import { processSteps } from "@/content/process";

import type { ProcessStep } from "@/types/domain/process";

export async function getProcessSteps(): Promise<ProcessStep[]> {
  return processSteps;
}
