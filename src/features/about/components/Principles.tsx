import "../styles/wormhole.css";

import { aboutConfig } from "../about.config";

import { WormholeStage } from "./WormholeStage";

/**
 * The whole About page: the principles as cards on the walls of a scroll-driven tunnel (see `WormholeStage` /
 * `WormholeScene`). The page heading is kept for assistive tech and search; the tunnel is the visual.
 */
export function Principles() {
  return (
    <section aria-labelledby="about-heading" className="relative z-(--z-content)">
      <h1 id="about-heading" className="sr-only">
        {aboutConfig.title}
      </h1>
      <WormholeStage>
        {aboutConfig.principles.map((principle, i) => (
          <li key={principle.title} className="wormhole__card" data-wh-card>
            <span className="wormhole__tag">{`${String(i + 1).padStart(2, "0")} / Principle`}</span>
            <h2 className="wormhole__title">{principle.title}</h2>
            <p className="wormhole__body">{principle.description}</p>
          </li>
        ))}
      </WormholeStage>
    </section>
  );
}
