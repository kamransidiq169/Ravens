import "../process.css";

import { toStages } from "../lib/process.data";
import { getProcessSteps } from "../lib/repository";

import { ProcessExperience } from "./ProcessExperience";
import { ProcessIntro } from "./ProcessIntro";

const HEADING_ID = "process-heading";

/** Server shell: loads the steps and renders the intro; the scroll film is isolated in the client stage. */
export async function ProcessSection() {
  const steps = await getProcessSteps();

  return (
    <section aria-labelledby={HEADING_ID} className="proc-section">
      <ProcessExperience stages={toStages(steps)} intro={<ProcessIntro headingId={HEADING_ID} />} />
      {/* Without JS the pinned stage can't run, so fall back to the stacked layout. */}
      <noscript>
        <style>{`.proc{height:auto!important}.proc__stage{position:static!important;height:auto!important;overflow:visible!important}.proc__rig,.proc__guides,.proc__glow,.proc__tint,.proc__index,.proc__whisper,.proc__word--front{display:none!important}.proc__still{display:block!important}.proc__intro,.proc__word,.proc__desc{position:static!important;opacity:1!important;transform:none!important;mix-blend-mode:normal!important}.proc__word,.proc__statement{color:#111!important}`}</style>
      </noscript>
    </section>
  );
}
