/**
 * CSS-only version of the Phase 3 composition (gold basketball, stepped platform). It is the first
 * paint and the no-WebGL stand-in inside the stage, and the still arrangement under reduced motion / without scripts
 * (see `.journey__static-art`). Static: no animation.
 */
export function OrbArt() {
  return (
    <div className="orb-art" aria-hidden="true">
      <div className="orb-art__platform">
        <div className="orb-art__edge orb-art__edge--1" />
        <div className="orb-art__face orb-art__face--1" />
        <div className="orb-art__edge orb-art__edge--2" />
        <div className="orb-art__face orb-art__face--2" />
        <div className="orb-art__edge orb-art__edge--3" />
        <div className="orb-art__face orb-art__face--3" />
      </div>
      <div className="orb-art__shadow" />
      <div className="orb-art__sphere">
        {/* The basketball channels: equator, the crossing seam, and two curved channels (arcs of great circles). */}
        <svg viewBox="-100 -100 200 200" focusable="false">
          <g fill="none" strokeLinecap="round">
            <g stroke="#6a4713" strokeWidth="5.5" opacity="0.8">
              <path d="M -100 0 A 100 15 0 0 0 100 0" />
              <path d="M 0 -100 L 0 100" />
              <path d="M 0 -100 A 71 100 0 0 1 0 100" />
              <path d="M 0 -100 A 71 100 0 0 0 0 100" />
            </g>
            <g stroke="#fff0b8" strokeWidth="1.6" opacity="0.55" transform="translate(-1.6 -1.6)">
              <path d="M -100 0 A 100 15 0 0 0 100 0" />
              <path d="M 0 -100 L 0 100" />
              <path d="M 0 -100 A 71 100 0 0 1 0 100" />
              <path d="M 0 -100 A 71 100 0 0 0 0 100" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
