/**
 * Phase 2 background: a kinetic editorial field of tall, flat, edge-to-edge rectangular modules that keep rearranging
 * behind the (fixed) sentence. Procedural: one table drives every module; CSS does the looping, so there is no React
 * state and no per-frame JS.
 *
 * Each module has its own width, height, vertical offset, drift direction/amplitude/duration/easing and tonal
 * gradient, and carries a second tonal layer that slides inside it on a different clock, so another tone is exposed
 * and covered again. All durations differ and the loops are smooth (every keyframe eases to a stop), so the whole
 * composition never visibly repeats or resets. Desktop shows all eight columns, tablet six, phone four (`tablet` /
 * `phone` hold each layout's column widths, which always sum to 100).
 *
 * The scroll timeline only sets `--form` (0 → 1, how far the modules have slid in), opacity and `data-active` on the
 * container through `data-j="modules"`.
 */

interface Module {
  /** Heights and offsets in svh; amp is the drift amplitude in svh (sign = initial direction). */
  height: number;
  top: number;
  amp: number;
  /** Drift and inner-tone loop lengths (s), start offset into the loop (s, negative = already running), easing. */
  dur: number;
  tdur: number;
  delay: number;
  ease: string;
  tease: string;
  /** Entrance: starts this far off (svh, sign = from above/below) and waits this share of the entrance (0 → 0.4). */
  from: number;
  wait: number;
  /** Base gradient and the second tonal layer that slides through it. */
  base: string;
  tone: string;
  /** Column widths (% of the stage) per layout; 0 hides the module in that layout. */
  desktop: number;
  tablet: number;
  phone: number;
}

// Restrained palette: near-black, charcoal, midnight, desaturated blue, cool grey, muted lavender-blue, soft off-white.
const INK = "#0b0d14";
const CHARCOAL = "#1d202c";
const MIDNIGHT = "#0f1a3d";
const DEEP = "#1d3170";
const DESAT = "#4a6194";
const GREY = "#8d95a8";
const LAV = "#aeb7da";
const PALE = "#cdd6f0";
const WHITE = "#f1f3f9";

const MODULES: Module[] = [
  {
    height: 150,
    top: -25,
    amp: 22,
    dur: 31,
    tdur: 47,
    delay: -9,
    ease: "cubic-bezier(.65,0,.35,1)",
    tease: "cubic-bezier(.45,0,.55,1)",
    from: -120,
    wait: 0.05,
    base: `linear-gradient(180deg, ${INK} 0%, ${MIDNIGHT} 55%, ${DEEP} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${DESAT} 30%, ${PALE} 52%, transparent 78%)`,
    desktop: 9,
    tablet: 13,
    phone: 0,
  },
  {
    height: 85,
    top: 12,
    amp: -26,
    dur: 24,
    tdur: 37,
    delay: -15,
    ease: "cubic-bezier(.45,0,.2,1)",
    tease: "cubic-bezier(.65,0,.35,1)",
    from: 120,
    wait: 0.2,
    base: `linear-gradient(180deg, ${DESAT} 0%, ${PALE} 62%, ${WHITE} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${MIDNIGHT} 38%, transparent 70%)`,
    desktop: 15,
    tablet: 19,
    phone: 22,
  },
  {
    height: 170,
    top: -45,
    amp: 14,
    dur: 38,
    tdur: 53,
    delay: -22,
    ease: "cubic-bezier(.76,0,.24,1)",
    tease: "cubic-bezier(.45,0,.2,1)",
    from: -140,
    wait: 0.12,
    base: `linear-gradient(180deg, ${GREY} 0%, ${LAV} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${WHITE} 40%, transparent 62%)`,
    desktop: 8,
    tablet: 0,
    phone: 0,
  },
  {
    height: 120,
    top: -10,
    amp: -18,
    dur: 29,
    tdur: 41,
    delay: -4,
    ease: "cubic-bezier(.65,0,.35,1)",
    tease: "cubic-bezier(.76,0,.24,1)",
    from: 130,
    wait: 0.28,
    base: `linear-gradient(180deg, ${CHARCOAL} 0%, ${MIDNIGHT} 45%, ${DESAT} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${LAV} 34%, ${WHITE} 50%, transparent 74%)`,
    desktop: 17,
    tablet: 20,
    phone: 30,
  },
  {
    height: 70,
    top: 30,
    amp: 30,
    dur: 21,
    tdur: 33,
    delay: -12,
    ease: "cubic-bezier(.45,0,.2,1)",
    tease: "cubic-bezier(.65,0,.35,1)",
    from: 110,
    wait: 0.34,
    base: `linear-gradient(180deg, ${WHITE} 0%, ${LAV} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${DESAT} 44%, transparent 66%)`,
    desktop: 11,
    tablet: 14,
    phone: 0,
  },
  {
    height: 160,
    top: -35,
    amp: -24,
    dur: 35,
    tdur: 49,
    delay: -27,
    ease: "cubic-bezier(.76,0,.24,1)",
    tease: "cubic-bezier(.45,0,.55,1)",
    from: -130,
    wait: 0.16,
    base: `linear-gradient(180deg, ${MIDNIGHT} 0%, ${DESAT} 50%, ${PALE} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${INK} 26%, transparent 52%, ${WHITE} 78%, transparent 100%)`,
    desktop: 14,
    tablet: 16,
    phone: 20,
  },
  {
    height: 95,
    top: 5,
    amp: 16,
    dur: 27,
    tdur: 43,
    delay: -18,
    ease: "cubic-bezier(.65,0,.35,1)",
    tease: "cubic-bezier(.45,0,.2,1)",
    from: 125,
    wait: 0.38,
    base: `linear-gradient(180deg, ${PALE} 0%, ${GREY} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${GREY} 36%, transparent 60%)`,
    desktop: 9,
    tablet: 0,
    phone: 0,
  },
  {
    height: 135,
    top: -20,
    amp: -12,
    dur: 41,
    tdur: 59,
    delay: -31,
    ease: "cubic-bezier(.45,0,.2,1)",
    tease: "cubic-bezier(.76,0,.24,1)",
    from: -125,
    wait: 0.08,
    base: `linear-gradient(180deg, ${DEEP} 0%, ${INK} 100%)`,
    tone: `linear-gradient(180deg, transparent 0%, ${DESAT} 30%, ${LAV} 46%, transparent 70%)`,
    desktop: 17,
    tablet: 18,
    phone: 28,
  },
];

type Layout = "desktop" | "tablet" | "phone";

/** Left edge (%) of each module for a layout: columns sit edge to edge in table order. */
function lefts(layout: Layout) {
  let x = 0;
  return MODULES.map((m) => {
    const left = x;
    x += m[layout];
    return left;
  });
}

export function ModuleField() {
  const desktop = lefts("desktop");
  const tablet = lefts("tablet");
  const phone = lefts("phone");

  return (
    <div className="journey__modules" data-j="modules" data-active="false" aria-hidden="true">
      {MODULES.map((m, i) => (
        <div
          key={i}
          className="mod"
          data-t={m.tablet > 0 ? "1" : "0"}
          data-m={m.phone > 0 ? "1" : "0"}
          style={
            {
              "--ld": desktop[i],
              "--wd": m.desktop,
              "--lt": tablet[i],
              "--wt": m.tablet,
              "--lm": phone[i],
              "--wm": m.phone,
              "--h": m.height,
              "--top": m.top,
              "--amp": m.amp,
              "--dur": `${m.dur}s`,
              "--tdur": `${m.tdur}s`,
              "--delay": `${m.delay}s`,
              "--ease": m.ease,
              "--tease": m.tease,
              "--from": m.from,
              "--d": m.wait,
              "--base": m.base,
              "--tone": m.tone,
            } as React.CSSProperties
          }
        >
          <div className="mod__drift">
            <div className="mod__tone" />
          </div>
        </div>
      ))}
    </div>
  );
}
