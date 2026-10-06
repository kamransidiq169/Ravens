/**
 * The whole hero sequence as a pure function of scroll progress: five phases (hero, Northlight, INTERACTIVE, ENTERPRISE,
 * BESPOKE), then the release into the page.
 *
 * `sequenceAt(p)` is the single source of truth for every moving part. The DOM timeline and the WebGL scenes both call it
 * with the same progress, so the two cannot drift apart, and playing the page backwards is just evaluating the same
 * function at smaller values.
 *
 * One transition language for every phase title (`phaseExit`, extracted from Phase 1): it holds, then scales toward the
 * viewer, drops through the bottom edge of the stage and is gone, and only then does the next phase's title arrive.
 * Each phase's visual (jellyfish, forming field, sphere, tiles; the last phase has none, its title is the visual) keeps its own, separately timed motion.
 *
 * Each later phase gets one "extension" of scroll (`EXT` below, as shares of that extension): the previous title exits
 * while its scene leaves, then the new title and scene arrive, then there is a hold before the next exit begins.
 */

export interface JourneyLayout {
  /** Phone-sized viewport: the jellyfish sits higher so it clears the project meta stack. */
  compact: boolean;
}

export interface JourneyState {
  headline: { scale: number; /** fraction of stage height, positive = down */ y: number; opacity: number };
  details: number;
  visual: { /** fraction of stage height, positive = down */ y: number; scale: number; tilt: number };
  title: { scale: number; y: number; opacity: number };
  /** Phase 2 background: shapes converging into one composed mark. `t` 0 = scattered, 1 = formed. */
  form: { t: number; opacity: number };
  /** Opacity / rise progress of the three meta groups (left, centre, right). */
  meta: [number, number, number];
  /** The third chapter (INTERACTIVE). `scene` drives the 3D composition entering: 0 = absent, 1 = settled. */
  next: { title: { scale: number; y: number; opacity: number }; meta: [number, number, number]; scene: number };
  phase: JourneyPhase;
}

export type JourneyPhase = "hero" | "gap" | "project" | "next" | "last" | "bespoke" | "end";

/*
 * Scroll budget (svh at a 1:1 scale; the wrapper's CSS length is the sum): the hero + Northlight intro, then one
 * extension per later phase, then the final exit that releases the stage. Each composite below replays the previous one
 * over the first share of its own span, so every earlier curve is untouched by the ones added after it.
 */
const INTRO_SVH = 340;
const EXT_SVH = 240;
const END_SVH = 160;
/** Intro as a share of the hero + Northlight + INTERACTIVE span, and so on up the nest. */
export const INTRO_SHARE = INTRO_SVH / (INTRO_SVH + EXT_SVH);
export const CHAPTERS_SHARE = (INTRO_SVH + EXT_SVH) / (INTRO_SVH + 2 * EXT_SVH);
export const FOUR_SHARE = (INTRO_SVH + 2 * EXT_SVH) / (INTRO_SVH + 3 * EXT_SVH);
export const FIVE_SHARE = (INTRO_SVH + 3 * EXT_SVH) / (INTRO_SVH + 3 * EXT_SVH + END_SVH);
/** Total scroll length in svh (keep `--journey-length` in hero.css equal to this). */
export const JOURNEY_SVH = INTRO_SVH + 3 * EXT_SVH + END_SVH;

/** Windows inside each extension (shares of it). The outgoing title leaves before the incoming one arrives. */
const EXT = {
  exit: [0.1, 0.52],
  meta: [0.1, 0.3],
  scene: [0.1, 0.56],
  sceneIn: [0.5, 0.94],
  titleIn: [0.56, 0.94],
  titleFade: [0.56, 0.74],
  metaIn: [
    [0.84, 0.91],
    [0.88, 0.95],
    [0.92, 0.99],
  ],
  phase: 0.66,
} as const;
/**
 * The final extension has no incoming phase: the last title morphs (lib/morph.ts) over `exit`, fades only once it has
 * filled the frame (`fadeFrom`, a share of the morph), and then the stage is released.
 */
const END = { exit: [0.1, 0.85], fadeFrom: 0.88, phase: 0.45 } as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const range = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * THE shared title exit, extracted from Phase 1: the title scales toward the viewer, drops through the bottom of the
 * stage, and only fades once it is mostly past the frame (so it stays readable while it is still on screen). `e` is the
 * exit's own 0 → 1 progress, scrubbed by scroll. Results are multipliers/offsets: `scale`, `y` (fraction of stage height,
 * positive = down) and `opacity`.
 */
export const PHASE_EXIT = { scale: 2.9, scalePower: 1.75, y: 0.8, yPower: 1.9, fadeFrom: 0.55 } as const;
export type TitleState = { scale: number; y: number; opacity: number };

export function phaseExit(e: number, config: typeof PHASE_EXIT = PHASE_EXIT): TitleState {
  const h = clamp01(e);
  return {
    scale: 1 + config.scale * h ** config.scalePower,
    y: config.y * h ** config.yPower,
    opacity: 1 - smooth(range(h, config.fadeFrom, 1)),
  };
}

/** Applies the shared exit to a title that is currently at `title` (its arrival state composes with the exit). */
const exiting = (title: TitleState, e: number): TitleState => {
  const x = phaseExit(e);
  return { scale: title.scale * x.scale, y: title.y + x.y, opacity: title.opacity * x.opacity };
};

/** Jellyfish rest offsets (fraction of stage height). */
const REST_Y = -0.02;
const OFFSCREEN_Y = 1.1;

/** Hero + Northlight (the original two chapters) over their own 0 → 1 progress. */
export function introAt(p: number): Omit<JourneyState, "next"> {
  const progress = clamp01(p);

  // Headline: grows toward the camera and falls out of the bottom edge. Opacity only drops once it is mostly gone, so
  // it stays readable for as long as it is on screen.
  const headline = phaseExit(range(progress, 0, 0.5));

  // Jellyfish: a slow drift, then it is drawn down past the bottom edge and stays gone: the Phase 2 background is the
  // forming visual below, not the jellyfish.
  const descend = easeInCubic(range(progress, 0.08, 0.46));
  const visual = {
    y: progress < 0.6 ? lerp(REST_Y, OFFSCREEN_Y, descend) : OFFSCREEN_Y,
    scale: lerp(1, 1.18, descend),
    tilt: lerp(0, -0.18, descend),
  };

  // Chapter: the title arrives from the same depth the headline left to, so the two read as one continuous move.
  const t = easeInOutCubic(range(progress, 0.56, 0.8));
  const title = { scale: lerp(1.35, 1, t), y: lerp(0.07, 0, t), opacity: smooth(range(progress, 0.56, 0.74)) };
  const meta: JourneyState["meta"] = [
    smooth(range(progress, 0.76, 0.88)),
    smooth(range(progress, 0.8, 0.92)),
    smooth(range(progress, 0.84, 0.96)),
  ];

  const phase: JourneyPhase = progress < 0.5 ? "hero" : progress < 0.68 ? "gap" : "project";

  // Forming: shapes begin to arrive as the headline has gone and settle with the title, then dissolve (see journeyAt).
  const form = { t: easeInOutCubic(range(progress, 0.5, 0.84)), opacity: smooth(range(progress, 0.5, 0.66)) };

  return { headline, details: 1 - smooth(range(progress, 0, 0.1)), visual, title, form, meta, phase };
}

/** An extension's incoming title / meta / scene, from its progress `q`. */
function arrival(q: number) {
  const t = easeInOutCubic(range(q, EXT.titleIn[0], EXT.titleIn[1]));
  return {
    title: {
      scale: lerp(1.3, 1, t),
      y: lerp(0.06, 0, t),
      opacity: smooth(range(q, EXT.titleFade[0], EXT.titleFade[1])),
    },
    meta: EXT.metaIn.map(([a, b]) => smooth(range(q, a, b))) as [number, number, number],
    scene: easeInOutCubic(range(q, EXT.sceneIn[0], EXT.sceneIn[1])),
  };
}

/** The outgoing phase's exit state in an extension: its title's exit progress, its meta fade and its scene's leave. */
function departure(q: number) {
  return {
    e: range(q, EXT.exit[0], EXT.exit[1]),
    meta: 1 - smooth(range(q, EXT.meta[0], EXT.meta[1])),
    scene: 1 - easeInOutCubic(range(q, EXT.scene[0], EXT.scene[1])),
  };
}

const scaled = (meta: [number, number, number], k: number) => meta.map((m) => m * k) as [number, number, number];

/**
 * Hero → Northlight → INTERACTIVE. The first `INTRO_SHARE` replays the intro (headline exit, Northlight arrival and
 * hold); the rest is the Northlight exit and the INTERACTIVE arrival.
 */
function journeyAt(p: number): JourneyState {
  const progress = clamp01(p);
  const base = introAt(progress / INTRO_SHARE);
  const q = range(progress, INTRO_SHARE, 1);
  const out = departure(q);
  const incoming = arrival(q);

  return {
    ...base,
    form: { ...base.form, opacity: base.form.opacity * out.scene },
    title: exiting(base.title, out.e),
    meta: scaled(base.meta, out.meta),
    next: incoming,
    phase: q >= EXT.phase ? "next" : base.phase,
  };
}

interface FullState extends JourneyState {
  /** The fourth phase (ENTERPRISE): same anatomy as `next`. */
  last: JourneyState["next"];
}

/** … → ENTERPRISE: INTERACTIVE exits with the shared title exit while its scene leaves, then ENTERPRISE arrives. */
function fullAt(p: number): FullState {
  const progress = clamp01(p);
  const base = journeyAt(progress / CHAPTERS_SHARE);
  const q = range(progress, CHAPTERS_SHARE, 1);
  const out = departure(q);

  return {
    ...base,
    next: {
      title: exiting(base.next.title, out.e),
      meta: scaled(base.next.meta, out.meta),
      scene: base.next.scene * out.scene,
    },
    last: arrival(q),
    phase: q >= EXT.phase ? "last" : base.phase,
  };
}

interface ChaptersState extends FullState {
  /** The fifth phase (BESPOKE): only a title, which leaves by morphing (no meta, no scene). */
  bespoke: {
    title: TitleState;
    /** Morph progress of the title (0 = at rest, 1 = filled the frame), see lib/morph.ts. */
    morph: number;
  };
}

/** … → BESPOKE: ENTERPRISE exits with the shared title exit, then BESPOKE arrives (still, with morph 0). */
function chaptersAt(p: number): ChaptersState {
  const progress = clamp01(p);
  const base = fullAt(progress / FOUR_SHARE);
  const q = range(progress, FOUR_SHARE, 1);
  const out = departure(q);

  return {
    ...base,
    last: {
      title: exiting(base.last.title, out.e),
      meta: scaled(base.last.meta, out.meta),
      scene: base.last.scene * out.scene,
    },
    bespoke: { title: arrival(q).title, morph: 0 },
    phase: q >= EXT.phase ? "bespoke" : base.phase,
  };
}

export type SequenceState = ChaptersState;

/**
 * The complete sequence, including the final exit: BESPOKE's title morphs (growing and deforming from its centre until
 * it fills the frame, then fading), and the stage then releases into the next section of the page.
 */
export function sequenceAt(p: number): SequenceState {
  const progress = clamp01(p);
  const base = chaptersAt(progress / FIVE_SHARE);
  const q = range(progress, FIVE_SHARE, 1);
  const morph = range(q, END.exit[0], END.exit[1]);
  const { title } = base.bespoke;

  return {
    ...base,
    bespoke: {
      // Scale and drop stay at the arrival values: the zoom belongs to the morph, applied with the per-character poses.
      title: { ...title, opacity: title.opacity * (1 - smooth(range(morph, END.fadeFrom, 1))) },
      morph,
    },
    phase: q >= END.phase ? "end" : base.phase,
  };
}

/**
 * How far through the ENTERPRISE phase the scroll is (0 → 1): from the moment its scene starts to arrive to the moment
 * its scene has left. Derived from the same shares and windows as the composites, so it adds no timeline of its own;
 * the scene uses it for slow, scroll-linked parallax, rotation and separation while the phase is on stage.
 */
export function enterpriseProgress(p: number): number {
  const start = FIVE_SHARE * FOUR_SHARE * (CHAPTERS_SHARE + EXT.sceneIn[0] * (1 - CHAPTERS_SHARE));
  const end = FIVE_SHARE * (FOUR_SHARE + EXT.scene[1] * (1 - FOUR_SHARE));
  return clamp01((p - start) / (end - start));
}
